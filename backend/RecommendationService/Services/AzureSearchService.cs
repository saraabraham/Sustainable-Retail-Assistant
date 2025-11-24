using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Models;
using RecommendationService.Models;

namespace RecommendationService.Services;

public interface IAzureSearchService
{
    Task<List<Product>> SearchProductsAsync(string query, int top = 10);
    Task IndexProductAsync(Product product);
    Task IndexProductsAsync(List<Product> products);
}

public class AzureSearchService : IAzureSearchService
{
    private readonly SearchClient _searchClient;
    private readonly ILogger<AzureSearchService> _logger;

    public AzureSearchService(
        IConfiguration configuration,
        ILogger<AzureSearchService> logger)
    {
        _logger = logger;
        
        var endpoint = configuration["AzureSearch:Endpoint"];
        var apiKey = configuration["AzureSearch:ApiKey"];
        var indexName = configuration["AzureSearch:IndexName"] ?? "products";

        if (!string.IsNullOrEmpty(endpoint) && !string.IsNullOrEmpty(apiKey))
        {
            _searchClient = new SearchClient(
                new Uri(endpoint),
                indexName,
                new AzureKeyCredential(apiKey));
        }
    }

    public async Task<List<Product>> SearchProductsAsync(string query, int top = 10)
    {
        if (_searchClient == null)
        {
            _logger.LogWarning("Azure Search not configured, returning empty results");
            return new List<Product>();
        }

        try
        {
            var searchOptions = new SearchOptions
            {
                Size = top,
                IncludeTotalCount = true,
                OrderBy = { "sustainabilityScore desc" }
            };

            var response = await _searchClient.SearchAsync<Product>(query, searchOptions);
            var results = new List<Product>();

            await foreach (var result in response.Value.GetResultsAsync())
            {
                results.Add(result.Document);
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products in Azure Search");
            return new List<Product>();
        }
    }

    public async Task IndexProductAsync(Product product)
    {
        if (_searchClient == null) return;

        try
        {
            await _searchClient.IndexDocumentsAsync(
                IndexDocumentsBatch.Upload(new[] { product }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error indexing product in Azure Search");
        }
    }

    public async Task IndexProductsAsync(List<Product> products)
    {
        if (_searchClient == null) return;

        try
        {
            await _searchClient.IndexDocumentsAsync(
                IndexDocumentsBatch.Upload(products));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error indexing products in Azure Search");
        }
    }
}
