using Azure.AI.TextAnalytics;
using RecommendationService.Models;

namespace RecommendationService.Services;

public interface INLPService
{
    Task<QueryIntent> ExtractIntent(string query);
}

public class NLPService : INLPService
{
    private readonly TextAnalyticsClient? _textAnalyticsClient;
    private readonly ILogger<NLPService> _logger;

    public NLPService(
        ILogger<NLPService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        // Try to get the TextAnalyticsClient if it exists
        _textAnalyticsClient = serviceProvider.GetService<TextAnalyticsClient>();
    }

    public async Task<QueryIntent> ExtractIntent(string query)
    {
        var intent = new QueryIntent { Confidence = 0.8 };

        try
        {
            // Always use keyword extraction as fallback
            ExtractIntentFromKeywords(query, intent);

            // Extract price range
            ExtractPriceRange(query, intent);

            return await Task.FromResult(intent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting intent from query");
            return intent;
        }
    }

    private void ExtractIntentFromKeywords(string query, QueryIntent intent)
    {
        var lowerQuery = query.ToLower();

        // Category detection
        var categoryKeywords = new Dictionary<string, string>
        {
            { "furniture", "furniture" },
            { "chair", "furniture" },
            { "table", "furniture" },
            { "sofa", "furniture" },
            { "desk", "furniture" },
            { "bookshelf", "storage" },
            { "kitchen", "kitchen" },
            { "bedroom", "bedroom" },
            { "storage", "storage" },
            { "lighting", "lighting" },
            { "lamp", "lighting" },
            { "light", "lighting" },
            { "textile", "textiles" },
            { "decoration", "decoration" }
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

        // If no category found, default to furniture
        if (!intent.Categories.Any())
        {
            intent.Categories.Add("furniture");
        }

        // Sustainability keywords
        var sustainabilityKeywords = new[]
        {
            "sustainable", "eco", "green", "organic", "recycled",
            "environmental", "ecological", "renewable"
        };

        foreach (var keyword in sustainabilityKeywords)
        {
            if (lowerQuery.Contains(keyword))
            {
                intent.SustainabilityRequirements.Add(keyword);
            }
        }

        // Feature keywords
        var featureKeywords = new[]
        {
            "durable", "compact", "modern", "minimalist", "vintage",
            "adjustable", "foldable", "stackable", "repair", "recycle"
        };

        foreach (var keyword in featureKeywords)
        {
            if (lowerQuery.Contains(keyword))
            {
                intent.Features.Add(keyword);
            }
        }
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
            @"around\s*\$(\d+)"
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
