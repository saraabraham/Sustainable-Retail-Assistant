using Azure.AI.TextAnalytics;
using RecommendationService.Models;
using RecommendationService.Repositories;

namespace RecommendationService.Services;

public interface INLPService
{
    Task<QueryIntent> ExtractIntent(string query);
}

public class NLPService : INLPService
{
    private readonly TextAnalyticsClient? _textAnalyticsClient;
    private readonly ILogger<NLPService> _logger;
    private readonly IProductRepository _productRepository;

    public NLPService(
        ILogger<NLPService> logger,
        IServiceProvider serviceProvider,
        IProductRepository productRepository)
    {
        _logger = logger;
        _productRepository = productRepository;
        // Try to get the TextAnalyticsClient if it exists
        _textAnalyticsClient = serviceProvider.GetService<TextAnalyticsClient>();
    }

    public async Task<QueryIntent> ExtractIntent(string query)
    {
        var intent = new QueryIntent { Confidence = 0.8 };

        try
        {
            // 🆕 FEATURE 2: Check for exact product name match first
            var exactProduct = await FindExactProductMatch(query);
            if (exactProduct != null)
            {
                intent.ProductName = exactProduct.Name;
                intent.Categories.Add(exactProduct.Category);
                intent.Confidence = 0.95; // High confidence for exact match
                return intent;
            }

            // Always use keyword extraction as fallback
            ExtractIntentFromKeywords(query, intent);

            // Extract price range
            ExtractPriceRange(query, intent);

            return intent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting intent from query");
            return intent;
        }
    }

    private async Task<Product?> FindExactProductMatch(string query)
    {
        try
        {
            var allProducts = await _productRepository.SearchAsync(new ProductSearchParams
            {
                InStockOnly = false
            });

            var queryLower = query.ToLower().Trim();

            // PRIORITY 1: Exact name match
            var exactMatch = allProducts.FirstOrDefault(p =>
                p.Name.Equals(query, StringComparison.OrdinalIgnoreCase));

            if (exactMatch != null)
            {
                _logger.LogInformation($"✅ Exact match: {exactMatch.Name}");
                return exactMatch;
            }

            // PRIORITY 2: Multi-word match (e.g., "Himalayan Salt Lamp")
            var queryWords = queryLower
                .Split(new[] { ' ', '-' }, StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length >= 3)
                .ToList();

            if (queryWords.Count >= 2)
            {
                foreach (var product in allProducts)
                {
                    var productNameLower = product.Name.ToLower();
                    var matchCount = queryWords.Count(word => productNameLower.Contains(word));

                    // Need at least 2 words to match
                    if (matchCount >= 2)
                    {
                        _logger.LogInformation($"✅ Multi-word match: {product.Name} ({matchCount} words)");
                        return product;
                    }
                }
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding exact product match");
            return null;
        }
    }
    private void ExtractIntentFromKeywords(string query, QueryIntent intent)
    {
        var lowerQuery = query.ToLower();

        // 🆕 FEATURE 3: Fuzzy matching for typos
        var categoryKeywords = new Dictionary<string, string>
        {
            // Furniture variations
            { "furniture", "furniture" },
            { "furntoure", "furniture" }, // ✅ Typo support
            { "furnitur", "furniture" },  // ✅ Typo support
            { "furnature", "furniture" }, // ✅ Typo support
            { "chair", "furniture" },
            { "table", "furniture" },
            { "sofa", "furniture" },
            { "desk", "furniture" },
            
            // Storage variations
            { "storage", "storage" },
            { "storag", "storage" },      // ✅ Typo support
            { "bookshelf", "storage" },
            { "shelf", "storage" },
            { "organizer", "storage" },
            
            // Kitchen variations
            { "kitchen", "kitchen" },
            { "kichen", "kitchen" },      // ✅ Typo support
            { "kitchn", "kitchen" },      // ✅ Typo support
            { "utensil", "kitchen" },
            { "cookware", "kitchen" },
            { "sponge", "kitchen" },
            
            // Bedroom variations
            { "bedroom", "bedroom" },
            { "bedrom", "bedroom" },      // ✅ Typo support
            { "bed", "bedroom" },
            { "pillow", "bedroom" },
            { "sheet", "bedroom" },
            
            // Lighting variations
            { "lighting", "lighting" },
            { "lightin", "lighting" },    // ✅ Typo support
            { "lamp", "lighting" },
            { "light", "lighting" },
            { "led", "lighting" },
            
            // Textiles variations
            { "textile", "textiles" },
            { "textil", "textiles" },     // ✅ Typo support
            { "fabric", "textiles" },
            { "blanket", "textiles" },
            { "towel", "textiles" },
            
            // Bathroom variations
            { "bathroom", "bathroom" },
            { "bathrom", "bathroom" },    // ✅ Typo support
            { "bath", "bathroom" },
            { "shower", "bathroom" },
            { "mat", "bathroom" },
            
            // Outdoor variations
            { "outdoor", "outdoor" },
            { "outdor", "outdoor" },      // ✅ Typo support
            { "garden", "outdoor" },
            { "patio", "outdoor" },
            
            // Decoration
            { "decoration", "decoration" },
            { "decoraton", "decoration" }, // ✅ Typo support
            { "decor", "decoration" }
        };

        foreach (var (keyword, category) in categoryKeywords)
        {
            if (lowerQuery.Contains(keyword))
            {
                if (!intent.Categories.Contains(category))
                {
                    intent.Categories.Add(category);
                }
            }
        }

        // 🆕 FEATURE 3: Advanced fuzzy matching using Levenshtein distance
        if (!intent.Categories.Any())
        {
            var possibleCategories = new[]
            {
                "furniture", "storage", "lighting", "kitchen",
                "textiles", "bedroom", "bathroom", "outdoor", "decoration"
            };

            foreach (var category in possibleCategories)
            {
                if (IsFuzzyMatch(lowerQuery, category))
                {
                    intent.Categories.Add(category);
                    _logger.LogInformation($"Fuzzy matched '{query}' to category '{category}'");
                    break; // Only add first fuzzy match
                }
            }
        }

        // If still no category found, don't add default (show all products)

        // Sustainability keywords (with typo tolerance)
        var sustainabilityKeywords = new[]
        {
            "sustainable", "sustainble", "sustanible", // ✅ Typo support
            "eco", "ecofriendly", "eco-friendly",
            "green", "organic", "recycled", "recycle",
            "environmental", "enviromental", "ecological", // ✅ Typo support
            "renewable", "renewble" // ✅ Typo support
        };

        foreach (var keyword in sustainabilityKeywords)
        {
            if (lowerQuery.Contains(keyword))
            {
                if (!intent.SustainabilityRequirements.Contains("sustainable"))
                {
                    intent.SustainabilityRequirements.Add("sustainable");
                }
            }
        }

        // Feature keywords (with typo tolerance)
        var featureKeywords = new[]
        {
            "durable", "durble", // ✅ Typo support
            "compact", "compct",
            "modern", "minimalist", "minimlist",
            "vintage", "vintge",
            "adjustable", "adjustble",
            "foldable", "foldble",
            "stackable", "stackble",
            "repair", "recycle"
        };

        foreach (var keyword in featureKeywords)
        {
            if (lowerQuery.Contains(keyword))
            {
                intent.Features.Add(keyword);
            }
        }
    }

    // 🆕 FEATURE 3: Fuzzy matching using Levenshtein distance
    private bool IsFuzzyMatch(string query, string target, int maxDistance = 2)
    {
        // Check if query contains something close to target
        var words = query.Split(new[] { ' ', ',', '.', '!', '?' },
            StringSplitOptions.RemoveEmptyEntries);

        foreach (var word in words)
        {
            if (word.Length < 3) continue; // Skip very short words

            var distance = LevenshteinDistance(word, target);

            // Allow typos based on word length
            var allowedDistance = word.Length <= 5 ? 1 : maxDistance;

            if (distance <= allowedDistance)
            {
                return true;
            }
        }

        return false;
    }

    // 🆕 FEATURE 3: Calculate Levenshtein distance (edit distance)
    private int LevenshteinDistance(string source, string target)
    {
        if (string.IsNullOrEmpty(source)) return target?.Length ?? 0;
        if (string.IsNullOrEmpty(target)) return source.Length;

        var sourceLength = source.Length;
        var targetLength = target.Length;
        var distance = new int[sourceLength + 1, targetLength + 1];

        for (var i = 0; i <= sourceLength; distance[i, 0] = i++) ;
        for (var j = 0; j <= targetLength; distance[0, j] = j++) ;

        for (var i = 1; i <= sourceLength; i++)
        {
            for (var j = 1; j <= targetLength; j++)
            {
                var cost = (target[j - 1] == source[i - 1]) ? 0 : 1;
                distance[i, j] = Math.Min(
                    Math.Min(distance[i - 1, j] + 1, distance[i, j - 1] + 1),
                    distance[i - 1, j - 1] + cost);
            }
        }

        return distance[sourceLength, targetLength];
    }

    private void ExtractPriceRange(string query, QueryIntent intent)
    {
        // Simple regex patterns for price extraction
        var pricePatterns = new[]
        {
            @"\$(\d+)\s*-\s*\$(\d+)",
            @"under\s*\$(\d+)",
            @"less than\s*\$(\d+)",
            @"below\s*\$(\d+)",
            @"around\s*\$(\d+)",
            @"about\s*\$(\d+)",
            @"\$(\d+)\s*or\s*less"
        };

        foreach (var pattern in pricePatterns)
        {
            var match = System.Text.RegularExpressions.Regex.Match(query, pattern,
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            if (match.Success)
            {
                if (match.Groups.Count == 3) // Range pattern
                {
                    intent.PriceRange = new PriceRange
                    {
                        Min = decimal.Parse(match.Groups[1].Value),
                        Max = decimal.Parse(match.Groups[2].Value)
                    };
                }
                else if (match.Groups.Count == 2) // Single value
                {
                    intent.PriceRange = new PriceRange
                    {
                        Min = 0,
                        Max = decimal.Parse(match.Groups[1].Value)
                    };
                }
                break;
            }
        }
    }
}