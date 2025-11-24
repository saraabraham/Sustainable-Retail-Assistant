using Microsoft.AspNetCore.Mvc;
using RecommendationService.Models;
using RecommendationService.Services;

namespace RecommendationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NLPController : ControllerBase
{
    private readonly INLPService _nlpService;
    private readonly ILogger<NLPController> _logger;

    public NLPController(INLPService nlpService, ILogger<NLPController> logger)
    {
        _nlpService = nlpService;
        _logger = logger;
    }

    [HttpPost("analyze")]
    public async Task<ActionResult<ApiResponse<QueryIntent>>> AnalyzeQuery(
        [FromBody] QueryRequest request)
    {
        try
        {
            var intent = await _nlpService.ExtractIntent(request.Query);
            
            return Ok(new ApiResponse<QueryIntent>
            {
                Success = true,
                Data = intent
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing query");
            return StatusCode(500, new ApiResponse<QueryIntent>
            {
                Success = false,
                Error = new ApiError
                {
                    Code = "NLP_ERROR",
                    Message = "Failed to analyze query"
                }
            });
        }
    }
}

public class QueryRequest
{
    public string Query { get; set; } = string.Empty;
}
