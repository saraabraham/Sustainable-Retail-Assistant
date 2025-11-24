using Microsoft.EntityFrameworkCore;
using RecommendationService.Models;

namespace RecommendationService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<UserInteraction> UserInteractions { get; set; } = null!;
    public DbSet<UserProfile> UserProfiles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserInteraction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Timestamp);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Action).IsRequired();
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.Email).IsRequired();
        });
    }
}
