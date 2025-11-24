using MongoDB.Driver;
using RecommendationService.Models;

namespace RecommendationService.Repositories;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(string id);
    Task<List<Product>> SearchAsync(ProductSearchParams searchParams);
    Task<Product> CreateAsync(Product product);
    Task<bool> UpdateAsync(string id, Product product);
    Task<bool> DeleteAsync(string id);
}

public class ProductSearchParams
{
    public List<string>? Categories { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? MinSustainabilityScore { get; set; }
    public bool InStockOnly { get; set; } = false;
    public int PageSize { get; set; } = 50;
    public int PageNumber { get; set; } = 1;
}

public class ProductRepository : IProductRepository
{
    private readonly IMongoCollection<Product> _products;
    private readonly ILogger<ProductRepository> _logger;

    public ProductRepository(IMongoDatabase database, ILogger<ProductRepository> logger)
    {
        _products = database.GetCollection<Product>("products");
        _logger = logger;

        // Create indexes
        CreateIndexes();
    }

    private void CreateIndexes()
    {
        var indexKeys = Builders<Product>.IndexKeys
            .Ascending(p => p.Category)
            .Ascending(p => p.SustainabilityScore)
            .Ascending(p => p.Price);

        var indexModel = new CreateIndexModel<Product>(indexKeys);
        _products.Indexes.CreateOne(indexModel);
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        try
        {
            return await _products.Find(p => p.Id == id).FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving product {ProductId}", id);
            throw;
        }
    }

    public async Task<List<Product>> SearchAsync(ProductSearchParams searchParams)
    {
        try
        {
            var filterBuilder = Builders<Product>.Filter;
            var filters = new List<FilterDefinition<Product>>();

            // Category filter
            if (searchParams.Categories?.Any() == true)
            {
                filters.Add(filterBuilder.In(p => p.Category, searchParams.Categories));
            }

            // Price range filter
            if (searchParams.MinPrice.HasValue)
            {
                filters.Add(filterBuilder.Gte(p => p.Price, searchParams.MinPrice.Value));
            }

            if (searchParams.MaxPrice.HasValue)
            {
                filters.Add(filterBuilder.Lte(p => p.Price, searchParams.MaxPrice.Value));
            }

            // Sustainability score filter
            if (searchParams.MinSustainabilityScore.HasValue)
            {
                filters.Add(filterBuilder.Gte(p => p.SustainabilityScore, 
                    searchParams.MinSustainabilityScore.Value));
            }

            // Stock filter
            if (searchParams.InStockOnly)
            {
                filters.Add(filterBuilder.Eq(p => p.InStock, true));
            }

            // Combine filters
            var combinedFilter = filters.Any()
                ? filterBuilder.And(filters)
                : filterBuilder.Empty;

            // Execute query with pagination
            var skip = (searchParams.PageNumber - 1) * searchParams.PageSize;
            
            return await _products
                .Find(combinedFilter)
                .Skip(skip)
                .Limit(searchParams.PageSize)
                .SortByDescending(p => p.SustainabilityScore)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products");
            throw;
        }
    }

    public async Task<Product> CreateAsync(Product product)
    {
        try
        {
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;
            await _products.InsertOneAsync(product);
            return product;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product");
            throw;
        }
    }

    public async Task<bool> UpdateAsync(string id, Product product)
    {
        try
        {
            product.UpdatedAt = DateTime.UtcNow;
            var result = await _products.ReplaceOneAsync(p => p.Id == id, product);
            return result.ModifiedCount > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product {ProductId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            var result = await _products.DeleteOneAsync(p => p.Id == id);
            return result.DeletedCount > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product {ProductId}", id);
            throw;
        }
    }
}
