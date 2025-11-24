using Microsoft.AspNetCore.Mvc;
using RecommendationService.Models;
using RecommendationService.Services;

namespace RecommendationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationEngine _recommendationEngine;
    private readonly ISustainabilityCalculator _sustainabilityCalculator;
    private readonly INLPService _nlpService;
    private readonly ILogger<RecommendationsController> _logger;

    public RecommendationsController(
        IRecommendationEngine recommendationEngine,
        ISustainabilityCalculator sustainabilityCalculator,
        INLPService nlpService,
        ILogger<RecommendationsController> logger)
    {
        _recommendationEngine = recommendationEngine;
        _sustainabilityCalculator = sustainabilityCalculator;
        _nlpService = nlpService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<List<Recommendation>>>> GetRecommendations(
        [FromBody] RecommendationRequest request)
    {
        try
        {
            _logger.LogInformation("Processing recommendation request: {Query}", request.Query);

            var intent = await _nlpService.ExtractIntent(request.Query);
            var recommendations = await _recommendationEngine.GetRecommendations(
                request.Query,
                intent,
                request.Preferences);

            return Ok(new ApiResponse<List<Recommendation>>
            {
                Success = true,
                Data = recommendations
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing recommendation request");
            return StatusCode(500, new ApiResponse<List<Recommendation>>
            {
                Success = false,
                Error = new ApiError
                {
                    Code = "RECOMMENDATION_ERROR",
                    Message = "Failed to generate recommendations"
                }
            });
        }
    }

    [HttpGet("{productId}/sustainable-alternative")]
    public async Task<ActionResult<ApiResponse<Recommendation>>> GetSustainableAlternative(
        string productId)
    {
        try
        {
            var alternative = await _recommendationEngine.GetSustainableAlternative(productId);
            
            if (alternative == null)
            {
                return NotFound(new ApiResponse<Recommendation>
                {
                    Success = false,
                    Error = new ApiError
                    {
                        Code = "NOT_FOUND",
                        Message = "No sustainable alternative found"
                    }
                });
            }

            return Ok(new ApiResponse<Recommendation>
            {
                Success = true,
                Data = alternative
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding sustainable alternative");
            return StatusCode(500, new ApiResponse<Recommendation>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }

    [HttpGet("{productId}/tco")]
    public async Task<ActionResult<ApiResponse<CostAnalysis>>> CalculateTCO(
        string productId,
        [FromQuery] int years = 5)
    {
        try
        {
            var tco = await _sustainabilityCalculator.CalculateTotalCostOfOwnership(
                productId,
                years);

            return Ok(new ApiResponse<CostAnalysis>
            {
                Success = true,
                Data = tco
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating TCO");
            return StatusCode(500, new ApiResponse<CostAnalysis>
            {
                Success = false,
                Error = new ApiError { Code = "TCO_ERROR", Message = ex.Message }
            });
        }
    }
}
