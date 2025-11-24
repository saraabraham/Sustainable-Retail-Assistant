using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
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

// Configure CORS - MUST be before other services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

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

// Health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS must be called before Authorization and MapControllers
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Seed sample data
using (var scope = app.Services.CreateScope())
{
    var productRepo = scope.ServiceProvider.GetRequiredService<IProductRepository>();
    await RecommendationService.SampleDataSeeder.SeedData(productRepo);
}

Console.WriteLine("✅ Backend is running!");
Console.WriteLine("📍 API: http://localhost:5000");
Console.WriteLine("📚 Swagger: http://localhost:5000/swagger");
Console.WriteLine("🌐 CORS: Enabled for all origins");

app.Run();
