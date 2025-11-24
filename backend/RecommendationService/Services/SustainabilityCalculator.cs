using RecommendationService.Models;
using RecommendationService.Repositories;

namespace RecommendationService.Services;

public interface ISustainabilityCalculator
{
    Task<CostAnalysis> CalculateTotalCostOfOwnership(string productId, int years);
    Task<double> CalculateEnvironmentalImpactScore(Product product);
}

public class SustainabilityCalculator : ISustainabilityCalculator
{
    private readonly IProductRepository _productRepository;
    private readonly ILogger<SustainabilityCalculator> _logger;

    // Average energy costs per kWh
    private const decimal AverageEnergyCost = 0.13m;

    // Category-specific data
    private readonly Dictionary<string, CategoryData> _categoryData = new()
    {
        { "furniture", new CategoryData { AverageLifespan = 10, MaintenanceCostPerYear = 20 } },
        { "kitchen", new CategoryData { AverageLifespan = 8, MaintenanceCostPerYear = 50 } },
        { "lighting", new CategoryData { AverageLifespan = 5, MaintenanceCostPerYear = 10 } },
        { "appliances", new CategoryData { AverageLifespan = 12, MaintenanceCostPerYear = 75 } },
        { "textiles", new CategoryData { AverageLifespan = 3, MaintenanceCostPerYear = 15 } }
    };

    public SustainabilityCalculator(
        IProductRepository productRepository,
        ILogger<SustainabilityCalculator> logger)
    {
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<CostAnalysis> CalculateTotalCostOfOwnership(string productId, int years)
    {
        var product = await _productRepository.GetByIdAsync(productId);
        if (product == null)
        {
            throw new ArgumentException($"Product {productId} not found");
        }

        var categoryData = GetCategoryData(product.Category);
        var energyCostPerYear = CalculateEnergyCost(product);
        var maintenanceCostPerYear = categoryData.MaintenanceCostPerYear;

        var totalCost = product.Price +
                       (energyCostPerYear * years) +
                       (maintenanceCostPerYear * years);

        // Calculate comparison to category average
        var categoryAverage = await GetCategoryAverageTCO(product.Category, years);
        var comparisonToAverage = categoryAverage > 0
            ? ((double)totalCost - categoryAverage) / categoryAverage * 100
            : 0;

        return new CostAnalysis
        {
            InitialCost = product.Price,
            EnergyCostPerYear = energyCostPerYear,
            MaintenanceCostPerYear = maintenanceCostPerYear,
            ExpectedLifespan = categoryData.AverageLifespan,
            TotalCost = totalCost,
            ComparisonToAverage = comparisonToAverage
        };
    }

    public Task<double> CalculateEnvironmentalImpactScore(Product product)
    {
        double score = 0;

        // Base sustainability score (0-50 points)
        score += product.SustainabilityScore / 2.0;

        // Carbon footprint (0-20 points, lower is better)
        var carbonScore = Math.Max(0, 20 - (product.EnvironmentalImpact.CarbonFootprint / 10));
        score += carbonScore;

        // Recyclability (0-15 points)
        score += (product.EnvironmentalImpact.RecyclablePercentage / 100.0) * 15;

        // Energy efficiency (0-10 points)
        score += GetEnergyEfficiencyScore(product.EnvironmentalImpact.EnergyEfficiency);

        // Certifications (0-5 points)
        score += Math.Min(product.EnvironmentalImpact.Certifications.Count * 1.5, 5);

        return Task.FromResult(Math.Min(score, 100));
    }

    private CategoryData GetCategoryData(string category)
    {
        var categoryLower = category.ToLower();
        return _categoryData.TryGetValue(categoryLower, out var data)
            ? data
            : new CategoryData { AverageLifespan = 7, MaintenanceCostPerYear = 30 };
    }

    private decimal CalculateEnergyCost(Product product)
    {
        // Energy efficiency to kWh/year mapping
        var energyConsumption = product.EnvironmentalImpact.EnergyEfficiency.ToUpper() switch
        {
            "A+++" => 100m,
            "A++" => 150m,
            "A+" => 200m,
            "A" => 250m,
            "B" => 350m,
            "C" => 500m,
            "D" => 700m,
            _ => 0m
        };

        return energyConsumption * AverageEnergyCost;
    }

    private double GetEnergyEfficiencyScore(string efficiency)
    {
        return efficiency.ToUpper() switch
        {
            "A+++" => 10,
            "A++" => 8,
            "A+" => 6,
            "A" => 4,
            "B" => 2,
            _ => 0
        };
    }

    private async Task<double> GetCategoryAverageTCO(string category, int years)
    {
        try
        {
            var products = await _productRepository.SearchAsync(new ProductSearchParams
            {
                Categories = new List<string> { category }
            });

            if (!products.Any())
                return 0;

            var categoryData = GetCategoryData(category);
            var averages = products.Select(p =>
            {
                var energyCost = CalculateEnergyCost(p);
                return (double)(p.Price + (energyCost * years) + 
                       (categoryData.MaintenanceCostPerYear * years));
            });

            return averages.Average();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating category average TCO");
            return 0;
        }
    }

    private class CategoryData
    {
        public int AverageLifespan { get; set; }
        public decimal MaintenanceCostPerYear { get; set; }
    }
}
