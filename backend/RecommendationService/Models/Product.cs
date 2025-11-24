using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RecommendationService.Models;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int SustainabilityScore { get; set; }
    public EnvironmentalImpact EnvironmentalImpact { get; set; } = new();
    public List<CircularEconomyOption> CircularEconomyOptions { get; set; } = new();
    public Dictionary<string, object> Specifications { get; set; } = new();
    public bool InStock { get; set; }
    public List<string> Tags { get; set; } = new();
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class EnvironmentalImpact
{
    public double CarbonFootprint { get; set; } // kg CO2
    public double WaterUsage { get; set; } // liters
    public int RecyclablePercentage { get; set; }
    public string EnergyEfficiency { get; set; } = string.Empty;
    public List<string> Certifications { get; set; } = new();
}

public class CircularEconomyOption
{
    public string Type { get; set; } = string.Empty; // repair, refurbish, recycle, buyback
    public string Description { get; set; } = string.Empty;
    
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? AvailableUntil { get; set; }
    
    public decimal? EstimatedValue { get; set; }
    public string? Provider { get; set; }
}

public class Recommendation
{
    public Product Product { get; set; } = new();
    public double Score { get; set; }
    public List<RecommendationReason> Reasons { get; set; } = new();
    public List<Product> Alternatives { get; set; } = new();
    public CostAnalysis TotalCostOfOwnership { get; set; } = new();
}

public class RecommendationReason
{
    public string Type { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public double Weight { get; set; }
}

public class CostAnalysis
{
    public decimal InitialCost { get; set; }
    public decimal EnergyCostPerYear { get; set; }
    public decimal MaintenanceCostPerYear { get; set; }
    public int ExpectedLifespan { get; set; }
    public decimal TotalCost { get; set; }
    public double ComparisonToAverage { get; set; }
}

public class UserPreferences
{
    public string SustainabilityPriority { get; set; } = "medium";
    public PriceRange BudgetRange { get; set; } = new();
    public List<string> PreferredCategories { get; set; } = new();
    public string LifestyleType { get; set; } = string.Empty;
    public List<string> EnvironmentalConcerns { get; set; } = new();
}

public class PriceRange
{
    public decimal Min { get; set; }
    public decimal Max { get; set; }
}

public class RecommendationRequest
{
    public string Query { get; set; } = string.Empty;
    public UserPreferences? Preferences { get; set; }
}

public class QueryIntent
{
    public List<string> Categories { get; set; } = new();
    public PriceRange? PriceRange { get; set; }
    public List<string> SustainabilityRequirements { get; set; } = new();
    public List<string> Features { get; set; } = new();
    public double Confidence { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public ApiError? Error { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

public class ApiError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Dictionary<string, object>? Details { get; set; }
}
