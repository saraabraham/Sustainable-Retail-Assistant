using Microsoft.AspNetCore.Mvc;
using RecommendationService.Models;
using RecommendationService.Repositories;

namespace RecommendationService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        IProductRepository productRepository,
        ILogger<ProductsController> logger)
    {
        _productRepository = productRepository;
        _logger = logger;
    }

    [HttpPost("search")]
    public async Task<ActionResult<ApiResponse<ProductSearchResult>>> SearchProducts(
        [FromBody] SearchParams searchParams)
    {
        try
        {
            var products = await _productRepository.SearchAsync(new ProductSearchParams
            {
                Categories = searchParams.Filters?.Categories,
                MinPrice = searchParams.Filters?.PriceRange?.Min,
                MaxPrice = searchParams.Filters?.PriceRange?.Max,
                MinSustainabilityScore = searchParams.Filters?.SustainabilityScore?.Min,
                InStockOnly = searchParams.Filters?.InStockOnly ?? false,
                PageSize = searchParams.PageSize ?? 20,
                PageNumber = searchParams.Page ?? 1
            });

            var sortedProducts = searchParams.SortBy switch
            {
                "price" => products.OrderBy(p => p.Price).ToList(),
                "sustainability" => products.OrderByDescending(p => p.SustainabilityScore).ToList(),
                "popularity" => products.OrderByDescending(p => p.SustainabilityScore).ToList(),
                _ => products
            };

            return Ok(new ApiResponse<ProductSearchResult>
            {
                Success = true,
                Data = new ProductSearchResult
                {
                    Products = sortedProducts,
                    Total = sortedProducts.Count
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products");
            return StatusCode(500, new ApiResponse<ProductSearchResult>
            {
                Success = false,
                Error = new ApiError { Code = "SEARCH_ERROR", Message = ex.Message }
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<Product>>> GetProduct(string id)
    {
        try
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new ApiResponse<Product>
                {
                    Success = false,
                    Error = new ApiError { Code = "NOT_FOUND", Message = "Product not found" }
                });
            }

            return Ok(new ApiResponse<Product>
            {
                Success = true,
                Data = product
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting product");
            return StatusCode(500, new ApiResponse<Product>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }

    [HttpGet("{id}/similar")]
    public async Task<ActionResult<ApiResponse<List<Product>>>> GetSimilarProducts(
        string id,
        [FromQuery] int limit = 5)
    {
        try
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            var similar = await _productRepository.SearchAsync(new ProductSearchParams
            {
                Categories = new List<string> { product.Category },
                MinPrice = product.Price * 0.7m,
                MaxPrice = product.Price * 1.3m
            });

            var filtered = similar.Where(p => p.Id != id).Take(limit).ToList();

            return Ok(new ApiResponse<List<Product>>
            {
                Success = true,
                Data = filtered
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting similar products");
            return StatusCode(500, new ApiResponse<List<Product>>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }

    [HttpPost("compare")]
    public async Task<ActionResult<ApiResponse<List<Product>>>> CompareProducts(
        [FromBody] CompareRequest request)
    {
        try
        {
            var products = new List<Product>();
            foreach (var id in request.ProductIds)
            {
                var product = await _productRepository.GetByIdAsync(id);
                if (product != null)
                {
                    products.Add(product);
                }
            }

            return Ok(new ApiResponse<List<Product>>
            {
                Success = true,
                Data = products
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error comparing products");
            return StatusCode(500, new ApiResponse<List<Product>>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }

    [HttpGet("trending")]
    public async Task<ActionResult<ApiResponse<List<Product>>>> GetTrendingProducts(
        [FromQuery] string? category = null,
        [FromQuery] int limit = 10)
    {
        try
        {
            var searchParams = new ProductSearchParams
            {
                PageSize = limit
            };

            if (!string.IsNullOrEmpty(category))
            {
                searchParams.Categories = new List<string> { category };
            }

            var products = await _productRepository.SearchAsync(searchParams);
            var trending = products.OrderByDescending(p => p.SustainabilityScore).Take(limit).ToList();

            return Ok(new ApiResponse<List<Product>>
            {
                Success = true,
                Data = trending
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trending products");
            return StatusCode(500, new ApiResponse<List<Product>>
            {
                Success = false,
                Error = new ApiError { Code = "ERROR", Message = ex.Message }
            });
        }
    }
}

public class SearchParams
{
    public string? Query { get; set; }
    public ProductFiltersRequest? Filters { get; set; }
    public string? SortBy { get; set; }
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}

public class ProductFiltersRequest
{
    public List<string>? Categories { get; set; }
    public PriceRangeRequest? PriceRange { get; set; }
    public SustainabilityScoreRequest? SustainabilityScore { get; set; }
    public bool? InStockOnly { get; set; }
    public List<string>? Certifications { get; set; }
}

public class PriceRangeRequest
{
    public decimal? Min { get; set; }
    public decimal? Max { get; set; }
}

public class SustainabilityScoreRequest
{
    public int? Min { get; set; }
    public int? Max { get; set; }
}

public class ProductSearchResult
{
    public List<Product> Products { get; set; } = new();
    public int Total { get; set; }
}

public class CompareRequest
{
    public List<string> ProductIds { get; set; } = new();
}
