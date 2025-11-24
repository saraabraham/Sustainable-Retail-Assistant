using Microsoft.EntityFrameworkCore;
using RecommendationService.Data;
using RecommendationService.Models;

namespace RecommendationService.Repositories;

public interface IUserInteractionRepository
{
    Task<UserInteraction> CreateAsync(UserInteraction interaction);
    Task<List<UserInteraction>> GetByUserIdAsync(string userId, int limit = 100);
    Task<UserProfile?> GetUserProfileAsync(string userId);
    Task<UserProfile> CreateOrUpdateUserProfileAsync(UserProfile profile);
}

public class UserInteractionRepository : IUserInteractionRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<UserInteractionRepository> _logger;

    public UserInteractionRepository(AppDbContext context, ILogger<UserInteractionRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<UserInteraction> CreateAsync(UserInteraction interaction)
    {
        try
        {
            _context.UserInteractions.Add(interaction);
            await _context.SaveChangesAsync();
            return interaction;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user interaction");
            throw;
        }
    }

    public async Task<List<UserInteraction>> GetByUserIdAsync(string userId, int limit = 100)
    {
        try
        {
            return await _context.UserInteractions
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.Timestamp)
                .Take(limit)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user interactions");
            throw;
        }
    }

    public async Task<UserProfile?> GetUserProfileAsync(string userId)
    {
        try
        {
            return await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            throw;
        }
    }

    public async Task<UserProfile> CreateOrUpdateUserProfileAsync(UserProfile profile)
    {
        try
        {
            var existing = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == profile.UserId);

            if (existing == null)
            {
                _context.UserProfiles.Add(profile);
            }
            else
            {
                existing.Email = profile.Email;
                existing.PreferredCategories = profile.PreferredCategories;
                existing.MinBudget = profile.MinBudget;
                existing.MaxBudget = profile.MaxBudget;
                existing.SustainabilityPriority = profile.SustainabilityPriority;
                existing.LastActive = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return existing ?? profile;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating user profile");
            throw;
        }
    }
}
