# Sustainable Retail Shopping Assistant - Quick Start

## 📦 What's Inside

A complete, production-ready AI-powered shopping assistant that demonstrates advanced full-stack development skills.

## 🎯 Perfect For Resume

This project showcases:
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: C# .NET 8, Microservices Architecture
- **Databases**: MongoDB, PostgreSQL, Azure Cosmos DB
- **Cloud**: Azure (Cognitive Services, Search, App Services)
- **Testing**: Jest, Playwright, comprehensive test coverage
- **CI/CD**: GitHub Actions with canary deployments
- **IaC**: Terraform for Azure infrastructure

## 🚀 Quick Start (5 minutes)

1. **Extract the project**
   ```bash
   tar -xzf sustainable-retail-assistant.tar.gz
   cd sustainable-retail-assistant
   ```

2. **Start with Docker Compose** (Easiest)
   ```bash
   docker-compose up
   ```
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - API Docs: http://localhost:5000/swagger

3. **OR Manual Setup**
   
   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   **Backend:**
   ```bash
   cd backend/RecommendationService
   dotnet restore
   dotnet run
   ```

## 📁 Project Structure

```
sustainable-retail-assistant/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductCarousel.tsx
│   │   │   ├── ComparisonMatrix.tsx
│   │   │   └── TCOCalculator.tsx
│   │   ├── pages/              # Next.js pages
│   │   ├── services/           # API services
│   │   ├── types/              # TypeScript types
│   │   └── styles/             # CSS styles
│   └── tests/                  # Jest & Playwright tests
│
├── backend/                     # .NET microservices
│   └── RecommendationService/
│       ├── Controllers/        # API endpoints
│       ├── Services/           # Business logic
│       ├── Repositories/       # Data access
│       └── Models/             # Data models
│
├── infrastructure/              # Cloud infrastructure
│   ├── terraform/              # IaC scripts
│   └── github-workflows/       # CI/CD pipelines
│
└── docs/                       # Documentation
    ├── SETUP.md                # Detailed setup guide
    └── FEATURES.md             # Feature documentation
```

## 🎨 Key Features

### 1. Conversational AI Chat
- Natural language product search
- Multi-turn conversations
- Azure Cognitive Services integration

### 2. Smart Recommendations
- ML-powered scoring algorithm
- Sustainability-focused suggestions
- Personalized based on user preferences

### 3. Product Comparison
- Side-by-side comparison matrix
- Sustainability metrics
- Visual best-value indicators

### 4. TCO Calculator
- Total cost of ownership analysis
- Energy cost projections
- Maintenance estimates
- Lifetime value comparison

### 5. Sustainability Focus
- Carbon footprint tracking
- Energy efficiency ratings
- Circular economy options (repair, recycle)
- Eco-certifications display

## 🧪 Running Tests

```bash
# Frontend unit tests
cd frontend && npm test

# E2E tests
npm run test:e2e

# Recommendation accuracy tests
npm run test:recommendations

# Backend tests
cd backend/RecommendationService.Tests
dotnet test
```

## 📊 Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | C# .NET 8, ASP.NET Core, RESTful APIs |
| **Databases** | MongoDB, PostgreSQL, Azure Cosmos DB |
| **Cloud** | Azure App Services, Cognitive Services, Search |
| **Testing** | Jest, Playwright, xUnit |
| **CI/CD** | GitHub Actions, Canary Deployments |
| **IaC** | Terraform |
| **Monitoring** | Application Insights |

## 💼 For Your Resume

**Bullet Points You Can Use:**

- "Developed full-stack AI-powered shopping assistant using React, TypeScript, and .NET 8 microservices"
- "Implemented conversational AI with Azure Cognitive Services for natural language product search"
- "Built ML-based recommendation engine scoring products across sustainability, price, and quality metrics"
- "Architected multi-database solution using MongoDB, PostgreSQL, and Cosmos DB for optimal data storage"
- "Established CI/CD pipeline with canary deployments and automated rollback using GitHub Actions"
- "Created comprehensive testing suite with Jest and Playwright achieving 70%+ code coverage"
- "Deployed scalable infrastructure on Azure using Terraform for infrastructure as code"
- "Designed Total Cost of Ownership calculator with energy cost projections and lifecycle analysis"

## 📖 Documentation

- **SETUP.md**: Complete setup and deployment guide
- **FEATURES.md**: Detailed feature documentation and technical highlights
- **README.md**: Project overview and architecture

## 🌐 Live Demo Features

Try these in the chat interface:
- "Show me sustainable furniture under $500"
- "I need eco-friendly kitchen items"
- "Compare energy-efficient appliances"
- "Find products with repair options"

## 🛠️ Customization

The project is designed to be easily customizable:
- Update branding in `frontend/src/pages/index.tsx`
- Modify recommendation algorithm in `backend/Services/RecommendationEngine.cs`
- Add new product categories in MongoDB
- Extend API endpoints in Controllers

## 📞 Support

For detailed instructions, see:
- `docs/SETUP.md` - Full setup guide
- `docs/FEATURES.md` - Feature documentation
- Backend Swagger docs at `/swagger` when running

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Full-stack architecture design
- ✅ Cloud-native development
- ✅ Microservices patterns
- ✅ RESTful API design
- ✅ Modern React patterns
- ✅ TypeScript best practices
- ✅ Database design (NoSQL & SQL)
- ✅ DevOps & CI/CD
- ✅ Testing strategies
- ✅ Infrastructure as Code

## 🚀 Next Steps

1. Review the code structure
2. Run the application locally
3. Explore the features
4. Customize for your needs
5. Add to your portfolio
6. Deploy to Azure (optional)

## 📝 License

MIT License - Free to use for your portfolio and resume!

---

**Built with ♻️ to showcase modern full-stack development skills**
