using RecommendationService.Models;
using RecommendationService.Repositories;

namespace RecommendationService;

public static class SampleDataSeeder
{
    public static async Task SeedData(IProductRepository productRepository)
    {
        var existingProducts = await productRepository.SearchAsync(new ProductSearchParams { PageSize = 1 });
        if (existingProducts.Any())
        {
            Console.WriteLine("Database already has products, skipping seed.");
            return;
        }

        var products = new List<Product>
        {
            // FURNITURE - High-end sustainable options
            new Product
            {
                Name = "Eco-Friendly Bamboo Dining Table",
                Description = "Sustainable bamboo dining table with FSC certification. Seats 6-8 people comfortably.",
                Category = "furniture",
                Price = 450.00m,
                ImageUrl = "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
                SustainabilityScore = 92,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 25.5,
                    WaterUsage = 150,
                    RecyclablePercentage = 95,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "FSC", "Fair Trade" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Free repair service for 10 years" },
                    new CircularEconomyOption { Type = "recycle", Description = "100% recyclable materials" }
                },
                Tags = new List<string> { "sustainable", "bamboo", "furniture", "dining", "eco-friendly" }
            },
            
            new Product
            {
                Name = "Recycled Plastic Office Chair",
                Description = "Ergonomic office chair made from 100% recycled ocean plastic with adjustable lumbar support.",
                Category = "furniture",
                Price = 280.00m,
                ImageUrl = "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400",
                SustainabilityScore = 88,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 18.2,
                    WaterUsage = 80,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A+",
                    Certifications = new List<string> { "Ocean Plastic Certified", "Ergonomic Standard" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Lifetime warranty on frame" },
                    new CircularEconomyOption { Type = "buyback", Description = "Trade-in program available", EstimatedValue = 50m }
                },
                Tags = new List<string> { "sustainable", "recycled", "furniture", "office", "chair" }
            },

            new Product
            {
                Name = "Organic Cotton Sofa",
                Description = "Comfortable 3-seater sofa with organic cotton upholstery and sustainably sourced wood frame.",
                Category = "furniture",
                Price = 890.00m,
                ImageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
                SustainabilityScore = 85,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 45.0,
                    WaterUsage = 300,
                    RecyclablePercentage = 80,
                    EnergyEfficiency = "B",
                    Certifications = new List<string> { "GOTS Organic", "OEKO-TEX" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Reupholstering service available" },
                    new CircularEconomyOption { Type = "refurbish", Description = "Professional refurbishment every 5 years" }
                },
                Tags = new List<string> { "sustainable", "organic", "furniture", "sofa", "living room" }
            },

            new Product
            {
                Name = "Reclaimed Wood Bookshelf",
                Description = "Beautiful 5-tier bookshelf crafted from reclaimed barn wood. Each piece is unique.",
                Category = "storage",
                Price = 320.00m,
                ImageUrl = "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400",
                SustainabilityScore = 90,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 15.0,
                    WaterUsage = 50,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "Reclaimed Wood Certified" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Refinishing services available" }
                },
                Tags = new List<string> { "sustainable", "reclaimed", "storage", "wood", "bookshelf" }
            },

            new Product
            {
                Name = "Hemp Fiber Desk",
                Description = "Modern minimalist desk made from hemp fiber composite. Lightweight yet durable.",
                Category = "furniture",
                Price = 395.00m,
                ImageUrl = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
                SustainabilityScore = 87,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 22.0,
                    WaterUsage = 100,
                    RecyclablePercentage = 90,
                    EnergyEfficiency = "A+",
                    Certifications = new List<string> { "Hemp Certified", "Low VOC" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Modular design for easy repairs" },
                    new CircularEconomyOption { Type = "recycle", Description = "Full recycling program" }
                },
                Tags = new List<string> { "sustainable", "hemp", "furniture", "desk", "office" }
            },

            // LIGHTING - Energy efficient options
            new Product
            {
                Name = "Solar-Powered LED Desk Lamp",
                Description = "Energy-efficient LED lamp with solar charging capability and USB backup charging.",
                Category = "lighting",
                Price = 85.00m,
                ImageUrl = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
                SustainabilityScore = 95,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 5.5,
                    WaterUsage = 20,
                    RecyclablePercentage = 85,
                    EnergyEfficiency = "A+++",
                    Certifications = new List<string> { "Energy Star", "LED Standard" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Replaceable LED modules" },
                    new CircularEconomyOption { Type = "recycle", Description = "Battery recycling program" }
                },
                Tags = new List<string> { "sustainable", "solar", "lighting", "energy-efficient", "LED" }
            },

            new Product
            {
                Name = "Bamboo Floor Lamp",
                Description = "Elegant floor lamp with bamboo stand and energy-efficient LED bulb included.",
                Category = "lighting",
                Price = 125.00m,
                ImageUrl = "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400",
                SustainabilityScore = 91,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 8.0,
                    WaterUsage = 35,
                    RecyclablePercentage = 88,
                    EnergyEfficiency = "A++",
                    Certifications = new List<string> { "FSC Bamboo", "Energy Star" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Replaceable parts available" }
                },
                Tags = new List<string> { "sustainable", "bamboo", "lighting", "floor lamp", "LED" }
            },

            new Product
            {
                Name = "Recycled Glass Pendant Light",
                Description = "Handcrafted pendant light made from 100% recycled glass. Available in multiple colors.",
                Category = "lighting",
                Price = 95.00m,
                ImageUrl = "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400",
                SustainabilityScore = 89,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 6.5,
                    WaterUsage = 25,
                    RecyclablePercentage = 95,
                    EnergyEfficiency = "A++",
                    Certifications = new List<string> { "Recycled Glass Certified", "Handmade" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "recycle", Description = "Glass recycling program" }
                },
                Tags = new List<string> { "sustainable", "recycled", "lighting", "pendant", "glass" }
            },

            // STORAGE - Sustainable organization
            new Product
            {
                Name = "Cork Storage Boxes Set",
                Description = "Set of 3 sustainable cork storage boxes. Water-resistant and naturally antimicrobial.",
                Category = "storage",
                Price = 55.00m,
                ImageUrl = "https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=400",
                SustainabilityScore = 93,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 3.0,
                    WaterUsage = 15,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "Cork Forest Certified", "Biodegradable" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "recycle", Description = "Fully biodegradable" }
                },
                Tags = new List<string> { "sustainable", "cork", "storage", "boxes", "organization" }
            },

            new Product
            {
                Name = "Recycled Plastic Storage Cabinet",
                Description = "Durable storage cabinet made from post-consumer recycled plastic. Weather-resistant.",
                Category = "storage",
                Price = 180.00m,
                ImageUrl = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400",
                SustainabilityScore = 86,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 12.0,
                    WaterUsage = 45,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A+",
                    Certifications = new List<string> { "Recycled Plastic Certified" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Modular design for repairs" },
                    new CircularEconomyOption { Type = "recycle", Description = "Full recycling available" }
                },
                Tags = new List<string> { "sustainable", "recycled", "storage", "cabinet", "plastic" }
            },

            // TEXTILES - Organic and sustainable fabrics
            new Product
            {
                Name = "Organic Cotton Throw Blanket",
                Description = "Cozy throw blanket made from 100% GOTS certified organic cotton. Machine washable.",
                Category = "textiles",
                Price = 65.00m,
                ImageUrl = "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=400",
                SustainabilityScore = 94,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 4.0,
                    WaterUsage = 100,
                    RecyclablePercentage = 75,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "GOTS", "Fair Trade", "OEKO-TEX" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "recycle", Description = "Textile recycling program" }
                },
                Tags = new List<string> { "sustainable", "organic", "textiles", "blanket", "cotton" }
            },

            new Product
            {
                Name = "Hemp Linen Pillowcase Set",
                Description = "Luxurious pillowcase set made from hemp linen blend. Naturally hypoallergenic.",
                Category = "textiles",
                Price = 45.00m,
                ImageUrl = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400",
                SustainabilityScore = 91,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 3.5,
                    WaterUsage = 60,
                    RecyclablePercentage = 80,
                    EnergyEfficiency = "A+",
                    Certifications = new List<string> { "Hemp Certified", "OEKO-TEX" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "recycle", Description = "Textile recycling available" }
                },
                Tags = new List<string> { "sustainable", "hemp", "textiles", "pillowcase", "bedding" }
            },

            // KITCHEN - Sustainable kitchenware
            new Product
            {
                Name = "Bamboo Kitchen Utensil Set",
                Description = "Complete 12-piece bamboo kitchen utensil set. Heat resistant and naturally antibacterial.",
                Category = "kitchen",
                Price = 35.00m,
                ImageUrl = "https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=400",
                SustainabilityScore = 96,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 2.0,
                    WaterUsage = 20,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "FSC Bamboo", "Food Safe" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "recycle", Description = "Fully compostable" }
                },
                Tags = new List<string> { "sustainable", "bamboo", "kitchen", "utensils", "eco-friendly" }
            },

            new Product
            {
                Name = "Recycled Stainless Steel Cookware Set",
                Description = "Professional 10-piece cookware set made from recycled stainless steel. Induction compatible.",
                Category = "kitchen",
                Price = 425.00m,
                ImageUrl = "https://images.unsplash.com/photo-1584990347449-6f762cc05aa0?w=400",
                SustainabilityScore = 87,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 35.0,
                    WaterUsage = 200,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A++",
                    Certifications = new List<string> { "Recycled Steel", "Food Grade" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Lifetime warranty" },
                    new CircularEconomyOption { Type = "recycle", Description = "Full steel recycling" }
                },
                Tags = new List<string> { "sustainable", "recycled", "kitchen", "cookware", "steel" }
            },

            // BEDROOM - Sustainable bedroom furniture
            new Product
            {
                Name = "Natural Latex Mattress",
                Description = "Queen size mattress made from 100% natural latex. Hypoallergenic and breathable.",
                Category = "bedroom",
                Price = 1200.00m,
                ImageUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400",
                SustainabilityScore = 90,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 55.0,
                    WaterUsage = 300,
                    RecyclablePercentage = 85,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "GOLS", "OEKO-TEX", "GOTS" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "recycle", Description = "Latex recycling program" },
                    new CircularEconomyOption { Type = "buyback", Description = "Trade-in available", EstimatedValue = 200m }
                },
                Tags = new List<string> { "sustainable", "organic", "bedroom", "mattress", "latex" }
            },

            new Product
            {
                Name = "Reclaimed Pine Nightstand",
                Description = "Rustic nightstand crafted from reclaimed pine wood. Features one drawer and open shelf.",
                Category = "bedroom",
                Price = 175.00m,
                ImageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
                SustainabilityScore = 92,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 10.0,
                    WaterUsage = 40,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "Reclaimed Wood" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Refinishing available" }
                },
                Tags = new List<string> { "sustainable", "reclaimed", "bedroom", "nightstand", "wood" }
            },

            // OFFICE - Budget-friendly sustainable options
            new Product
            {
                Name = "Cardboard Desk Organizer",
                Description = "Modular desk organizer made from recycled cardboard. Surprisingly sturdy!",
                Category = "storage",
                Price = 25.00m,
                ImageUrl = "https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=400",
                SustainabilityScore = 97,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 1.5,
                    WaterUsage = 10,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A+++",
                    Certifications = new List<string> { "Recycled Paper", "FSC" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "recycle", Description = "Fully recyclable" }
                },
                Tags = new List<string> { "sustainable", "recycled", "storage", "office", "budget" }
            },

            new Product
            {
                Name = "Cork Bulletin Board",
                Description = "Large cork bulletin board with bamboo frame. Perfect for home office organization.",
                Category = "storage",
                Price = 42.00m,
                ImageUrl = "https://images.unsplash.com/photo-1565689157206-0fddef7589a2?w=400",
                SustainabilityScore = 94,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 3.0,
                    WaterUsage = 15,
                    RecyclablePercentage = 95,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "Cork Certified", "FSC Bamboo" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "recycle", Description = "Fully recyclable materials" }
                },
                Tags = new List<string> { "sustainable", "cork", "storage", "office", "organization" }
            },

            // More affordable options
            new Product
            {
                Name = "Recycled Plastic Desk Chair",
                Description = "Ergonomic desk chair made from recycled plastic bottles. Adjustable height and back support.",
                Category = "furniture",
                Price = 145.00m,
                ImageUrl = "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400",
                SustainabilityScore = 84,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 15.0,
                    WaterUsage = 70,
                    RecyclablePercentage = 100,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "Recycled Plastic" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "5-year warranty" },
                    new CircularEconomyOption { Type = "recycle", Description = "Recycling program available" }
                },
                Tags = new List<string> { "sustainable", "recycled", "furniture", "chair", "office", "budget" }
            },

            new Product
            {
                Name = "Sustainable Wood Coffee Table",
                Description = "Modern coffee table made from FSC-certified sustainable wood with natural finish.",
                Category = "furniture",
                Price = 275.00m,
                ImageUrl = "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400",
                SustainabilityScore = 88,
                InStock = true,
                EnvironmentalImpact = new EnvironmentalImpact
                {
                    CarbonFootprint = 20.0,
                    WaterUsage = 100,
                    RecyclablePercentage = 90,
                    EnergyEfficiency = "A",
                    Certifications = new List<string> { "FSC", "Low VOC" }
                },
                CircularEconomyOptions = new List<CircularEconomyOption>
                {
                    new CircularEconomyOption { Type = "repair", Description = "Refinishing service available" }
                },
                Tags = new List<string> { "sustainable", "wood", "furniture", "coffee table", "living room" }
            }
        };

        foreach (var product in products)
        {
            await productRepository.CreateAsync(product);
        }

        Console.WriteLine($"✅ Successfully seeded {products.Count} sample products!");
    }
}
