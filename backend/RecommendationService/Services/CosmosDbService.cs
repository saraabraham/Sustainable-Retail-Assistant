using Microsoft.Azure.Cosmos;
using RecommendationService.Models;

namespace RecommendationService.Services;

public interface ICosmosDbService
{
    Task<UserProfile?> GetUserProfileAsync(string userId);
    Task<UserProfile> UpsertUserProfileAsync(UserProfile profile);
    Task<List<UserInteraction>> GetUserInteractionsAsync(string userId, int limit = 100);
    Task<UserInteraction> CreateInteractionAsync(UserInteraction interaction);
}

public class CosmosDbService : ICosmosDbService
{
    private readonly Container _profileContainer;
    private readonly Container _interactionContainer;
    private readonly ILogger<CosmosDbService> _logger;

    public CosmosDbService(
        CosmosClient cosmosClient,
        IConfiguration configuration,
        ILogger<CosmosDbService> logger)
    {
        _logger = logger;
        var databaseName = configuration["CosmosDb:DatabaseName"] ?? "RetailAssistant";
        var database = cosmosClient.GetDatabase(databaseName);
        
        _profileContainer = database.GetContainer("UserProfiles");
        _interactionContainer = database.GetContainer("UserInteractions");
    }

    public async Task<UserProfile?> GetUserProfileAsync(string userId)
    {
        try
        {
            var response = await _profileContainer.ReadItemAsync<UserProfile>(
                userId,
                new PartitionKey(userId));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile from Cosmos DB");
            throw;
        }
    }

    public async Task<UserProfile> UpsertUserProfileAsync(UserProfile profile)
    {
        try
        {
            profile.LastActive = DateTime.UtcNow;
            var response = await _profileContainer.UpsertItemAsync(
                profile,
                new PartitionKey(profile.UserId));
            return response.Resource;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting user profile to Cosmos DB");
            throw;
        }
    }

    public async Task<List<UserInteraction>> GetUserInteractionsAsync(string userId, int limit = 100)
    {
        try
        {
            var query = new QueryDefinition(
                "SELECT TOP @limit * FROM c WHERE c.userId = @userId ORDER BY c.timestamp DESC")
                .WithParameter("@limit", limit)
                .WithParameter("@userId", userId);

            var iterator = _interactionContainer.GetItemQueryIterator<UserInteraction>(query);
            var results = new List<UserInteraction>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user interactions from Cosmos DB");
            throw;
        }
    }

    public async Task<UserInteraction> CreateInteractionAsync(UserInteraction interaction)
    {
        try
        {
            interaction.Timestamp = DateTime.UtcNow;
            var response = await _interactionContainer.CreateItemAsync(
                interaction,
                new PartitionKey(interaction.UserId));
            return response.Resource;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating interaction in Cosmos DB");
            throw;
        }
    }
}
