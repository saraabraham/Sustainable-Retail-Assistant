namespace RecommendationService.Models;

public class UserInteraction
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? ProductId { get; set; }
    public string? Query { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Metadata { get; set; }
}

public class UserProfile
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PreferredCategories { get; set; }
    public int? MinBudget { get; set; }
    public int? MaxBudget { get; set; }
    public string? SustainabilityPriority { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActive { get; set; } = DateTime.UtcNow;
}
