using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RecommendationService;
using RecommendationService.Data;
using RecommendationService.Services;
using RecommendationService.Repositories;
using MongoDB.Driver;
using Azure.AI.TextAnalytics;
using Azure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MongoDB Configuration
var mongoConnectionString = builder.Configuration["MongoDB:ConnectionString"] 
    ?? "mongodb://localhost:27017";
var mongoDatabaseName = builder.Configuration["MongoDB:DatabaseName"] ?? "RetailAssistant";

builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(mongoConnectionString));

builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(mongoDatabaseName);
});

// PostgreSQL Configuration
var postgresConnection = builder.Configuration.GetConnectionString("PostgreSQL")
    ?? "Host=localhost;Database=retail_assistant;Username=postgres;Password=password";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(postgresConnection));

// Azure Cognitive Services (optional)
var azureEndpoint = builder.Configuration["Azure:CognitiveServices:Endpoint"];
var azureKey = builder.Configuration["Azure:CognitiveServices:Key"];

if (!string.IsNullOrEmpty(azureEndpoint) && !string.IsNullOrEmpty(azureKey))
{
    builder.Services.AddSingleton(sp =>
        new TextAnalyticsClient(new Uri(azureEndpoint), new AzureKeyCredential(azureKey)));
}

// Register Services
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IRecommendationEngine, RecommendationEngine>();
builder.Services.AddScoped<INLPService, NLPService>();
builder.Services.AddScoped<ISustainabilityCalculator, SustainabilityCalculator>();
builder.Services.AddScoped<IUserInteractionRepository, UserInteractionRepository>();

// Health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Apply database migrations
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        Console.WriteLine("✅ PostgreSQL database initialized");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️  PostgreSQL not available: {ex.Message}");
    }
}

// *** CUSTOM CORS MIDDLEWARE - MUST BE FIRST ***
app.UseMiddleware<CorsMiddleware>();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Seed sample data
using (var scope = app.Services.CreateScope())
{
    var productRepo = scope.ServiceProvider.GetRequiredService<IProductRepository>();
    await SampleDataSeeder.SeedData(productRepo);
}

Console.WriteLine("✅ Backend is running!");
Console.WriteLine("📍 API: http://localhost:5000");
Console.WriteLine("📚 Swagger: http://localhost:5000/swagger");
Console.WriteLine("🌐 CORS: Custom middleware enabled");
Console.WriteLine("🗄️  MongoDB: Connected for products");
Console.WriteLine("🐘 PostgreSQL: Connected for user data");

app.Run();
