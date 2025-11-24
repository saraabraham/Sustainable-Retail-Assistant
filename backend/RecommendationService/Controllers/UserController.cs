using Microsoft.AspNetCore.Mvc;
using RecommendationService.Models;
using RecommendationService.Repositories;

namespace RecommendationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserInteractionRepository _userInteractionRepository;
    private readonly ILogger<UserController> _logger;

    public UserController(
        IUserInteractionRepository userInteractionRepository,
        ILogger<UserController> logger)
    {
        _userInteractionRepository = userInteractionRepository;
        _logger = logger;
    }

    [HttpPost("interactions")]
    public async Task<ActionResult<ApiResponse<UserInteraction>>> TrackInteraction(
        [FromBody] UserInteractionRequest request)
    {
        try
        {
            var interaction = new UserInteraction
            {
                UserId = request.UserId ?? "anonymous",
                Action = request.Action,
                ProductId = request.ProductId,
                Query = request.Query,
                Metadata = request.Metadata != null 
                    ? System.Text.Json.JsonSerializer.Serialize(request.Metadata) 
                    : null,
                Timestamp = DateTime.UtcNow
            };

            var created = await _userInteractionRepository.CreateAsync(interaction);

            return Ok(new ApiResponse<UserInteraction>
            {
                Success = true,
                Data = created
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking interaction");
            return StatusCode(500, new ApiResponse<UserInteraction>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }

    [HttpGet("{userId}/interactions")]
    public async Task<ActionResult<ApiResponse<List<UserInteraction>>>> GetUserInteractions(
        string userId,
        [FromQuery] int limit = 100)
    {
        try
        {
            var interactions = await _userInteractionRepository.GetByUserIdAsync(userId, limit);
            return Ok(new ApiResponse<List<UserInteraction>>
            {
                Success = true,
                Data = interactions
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user interactions");
            return StatusCode(500, new ApiResponse<List<UserInteraction>>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }

    [HttpGet("{userId}/profile")]
    public async Task<ActionResult<ApiResponse<UserProfile>>> GetUserProfile(string userId)
    {
        try
        {
            var profile = await _userInteractionRepository.GetUserProfileAsync(userId);
            if (profile == null)
            {
                return NotFound(new ApiResponse<UserProfile>
                {
                    Success = false,
                    Error = new ApiError { Code = "NOT_FOUND", Message = "Profile not found" }
                });
            }

            return Ok(new ApiResponse<UserProfile>
            {
                Success = true,
                Data = profile
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            return StatusCode(500, new ApiResponse<UserProfile>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }

    [HttpPost("{userId}/profile")]
    public async Task<ActionResult<ApiResponse<UserProfile>>> UpdateUserProfile(
        string userId,
        [FromBody] UserProfileRequest request)
    {
        try
        {
            var profile = new UserProfile
            {
                UserId = userId,
                Email = request.Email ?? "",
                PreferredCategories = request.PreferredCategories != null 
                    ? string.Join(",", request.PreferredCategories) 
                    : null,
                MinBudget = request.BudgetRange?.Min,
                MaxBudget = request.BudgetRange?.Max,
                SustainabilityPriority = request.SustainabilityPriority
            };

            var updated = await _userInteractionRepository.CreateOrUpdateUserProfileAsync(profile);

            return Ok(new ApiResponse<UserProfile>
            {
                Success = true,
                Data = updated
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            return StatusCode(500, new ApiResponse<UserProfile>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }
}

public class UserInteractionRequest
{
    public string? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? ProductId { get; set; }
    public string? Query { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

public class UserProfileRequest
{
    public string? Email { get; set; }
    public List<string>? PreferredCategories { get; set; }
    public BudgetRangeRequest? BudgetRange { get; set; }
    public string? SustainabilityPriority { get; set; }
}

public class BudgetRangeRequest
{
    public int? Min { get; set; }
    public int? Max { get; set; }
}
