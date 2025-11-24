using RecommendationService.Models;
using RecommendationService.Repositories;

namespace RecommendationService.Services;

public interface IRecommendationEngine
{
    Task<List<Recommendation>> GetRecommendations(
        string query,
        QueryIntent intent,
        UserPreferences? preferences);
    
    Task<Recommendation?> GetSustainableAlternative(string productId);
}

public class RecommendationEngine : IRecommendationEngine
{
    private readonly IProductRepository _productRepository;
    private readonly ISustainabilityCalculator _sustainabilityCalculator;
    private readonly ILogger<RecommendationEngine> _logger;

    public RecommendationEngine(
        IProductRepository productRepository,
        ISustainabilityCalculator sustainabilityCalculator,
        ILogger<RecommendationEngine> logger)
    {
        _productRepository = productRepository;
        _sustainabilityCalculator = sustainabilityCalculator;
        _logger = logger;
    }

    public async Task<List<Recommendation>> GetRecommendations(
        string query,
        QueryIntent intent,
        UserPreferences? preferences)
    {
        try
        {
            // Get candidate products based on intent
            var products = await GetCandidateProducts(intent, preferences);

            // Score each product
            var scoredProducts = products.Select(p => new
            {
                Product = p,
                Score = CalculateRecommendationScore(p, intent, preferences)
            })
            .OrderByDescending(x => x.Score)
            .Take(10)
            .ToList();

            // Build recommendations
            var recommendations = new List<Recommendation>();

            foreach (var scoredProduct in scoredProducts)
            {
                var tco = await _sustainabilityCalculator.CalculateTotalCostOfOwnership(
                    scoredProduct.Product.Id, 5);

                var alternatives = await GetSimilarProducts(scoredProduct.Product.Id);

                recommendations.Add(new Recommendation
                {
                    Product = scoredProduct.Product,
                    Score = scoredProduct.Score,
                    Reasons = GenerateReasons(scoredProduct.Product, intent, preferences),
                    Alternatives = alternatives.Take(3).ToList(),
                    TotalCostOfOwnership = tco
                });
            }

            return recommendations;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendations");
            throw;
        }
    }

    public async Task<Recommendation?> GetSustainableAlternative(string productId)
    {
        var originalProduct = await _productRepository.GetByIdAsync(productId);
        if (originalProduct == null) return null;

        var alternatives = await _productRepository.SearchAsync(new ProductSearchParams
        {
            Categories = new List<string> { originalProduct.Category },
            MinSustainabilityScore = originalProduct.SustainabilityScore + 10,
            MaxPrice = originalProduct.Price * 1.2m
        });

        var bestAlternative = alternatives
            .OrderByDescending(p => p.SustainabilityScore)
            .FirstOrDefault();

        if (bestAlternative == null) return null;

        var tco = await _sustainabilityCalculator.CalculateTotalCostOfOwnership(
            bestAlternative.Id, 5);

        return new Recommendation
        {
            Product = bestAlternative,
            Score = CalculateSustainabilityScore(bestAlternative),
            Reasons = new List<RecommendationReason>
            {
                new RecommendationReason
                {
                    Type = "sustainability",
                    Explanation = $"This alternative has a {bestAlternative.SustainabilityScore - originalProduct.SustainabilityScore} point higher sustainability score",
                    Weight = 1.0
                }
            },
            Alternatives = new List<Product>(),
            TotalCostOfOwnership = tco
        };
    }

    private async Task<List<Product>> GetCandidateProducts(
        QueryIntent intent,
        UserPreferences? preferences)
    {
        var searchParams = new ProductSearchParams
        {
            Categories = intent.Categories,
            MinPrice = intent.PriceRange?.Min ?? preferences?.BudgetRange?.Min,
            MaxPrice = intent.PriceRange?.Max ?? preferences?.BudgetRange?.Max,
            InStockOnly = true
        };

        if (preferences?.SustainabilityPriority == "high")
        {
            searchParams.MinSustainabilityScore = 70;
        }

        return await _productRepository.SearchAsync(searchParams);
    }

    private double CalculateRecommendationScore(
        Product product,
        QueryIntent intent,
        UserPreferences? preferences)
    {
        double score = 0;

        // Sustainability score (0-40 points)
        score += (product.SustainabilityScore / 100.0) * 40;

        // Price competitiveness (0-20 points)
        if (preferences?.BudgetRange != null)
        {
            var priceRange = preferences.BudgetRange.Max - preferences.BudgetRange.Min;
            if (priceRange > 0)
            {
                var pricePosition = (double)(product.Price - preferences.BudgetRange.Min) / (double)priceRange;
                score += (1 - pricePosition) * 20;
            }
        }

        // Category match (0-20 points)
        if (intent.Categories.Any(c => c.Equals(product.Category, StringComparison.OrdinalIgnoreCase)))
        {
            score += 20;
        }

        // Circular economy options (0-10 points)
        score += Math.Min(product.CircularEconomyOptions.Count * 3, 10);

        // Certifications (0-10 points)
        score += Math.Min(product.EnvironmentalImpact.Certifications.Count * 2, 10);

        return score;
    }

    private double CalculateSustainabilityScore(Product product)
    {
        return product.SustainabilityScore +
               (product.CircularEconomyOptions.Count * 5) +
               (product.EnvironmentalImpact.Certifications.Count * 3);
    }

    private List<RecommendationReason> GenerateReasons(
        Product product,
        QueryIntent intent,
        UserPreferences? preferences)
    {
        var reasons = new List<RecommendationReason>();

        if (product.SustainabilityScore >= 80)
        {
            reasons.Add(new RecommendationReason
            {
                Type = "sustainability",
                Explanation = "Excellent sustainability rating with low environmental impact",
                Weight = 0.9
            });
        }

        if (product.CircularEconomyOptions.Any())
        {
            reasons.Add(new RecommendationReason
            {
                Type = "sustainability",
                Explanation = $"Offers {product.CircularEconomyOptions.Count} circular economy options",
                Weight = 0.8
            });
        }

        if (preferences?.BudgetRange != null && 
            product.Price <= preferences.BudgetRange.Max)
        {
            reasons.Add(new RecommendationReason
            {
                Type = "price",
                Explanation = "Within your budget range",
                Weight = 0.7
            });
        }

        return reasons;
    }

    private async Task<List<Product>> GetSimilarProducts(string productId)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null) return new List<Product>();

        return await _productRepository.SearchAsync(new ProductSearchParams
        {
            Categories = new List<string> { product.Category },
            MinPrice = product.Price * 0.8m,
            MaxPrice = product.Price * 1.2m
        });
    }
}
