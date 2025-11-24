# Project Setup Guide

## Prerequisites

- Node.js 18+ and npm
- .NET 8 SDK
- Docker and Docker Compose
- Azure CLI (for cloud deployment)
- Terraform (for infrastructure)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sustainable-retail-assistant
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 3. Setup Backend

```bash
cd backend/RecommendationService
dotnet restore
dotnet user-secrets set "MongoDB:ConnectionString" "mongodb://localhost:27017"
dotnet user-secrets set "Azure:CognitiveServices:Endpoint" "your-endpoint"
dotnet user-secrets set "Azure:CognitiveServices:Key" "your-key"
dotnet run
```

Backend API will be available at `http://localhost:5000`

### 4. Start Databases

```bash
# MongoDB
docker run -d -p 27017:27017 --name mongo mongo:latest

# PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=password \
  --name postgres postgres:latest
```

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
AZURE_COGNITIVE_ENDPOINT=your-azure-endpoint
AZURE_SEARCH_ENDPOINT=your-azure-search-endpoint
```

### Backend (User Secrets)

```
MongoDB__ConnectionString=mongodb://localhost:27017
MongoDB__DatabaseName=RetailAssistant
Azure__CognitiveServices__Endpoint=your-endpoint
Azure__CognitiveServices__Key=your-key
Azure__Search__Endpoint=your-search-endpoint
```

## Running Tests

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Recommendation accuracy tests
npm run test:recommendations
```

### Backend Tests

```bash
cd backend/RecommendationService.Tests
dotnet test --verbosity normal
```

## Database Seeding

To seed the database with sample products:

```bash
cd backend/RecommendationService
dotnet run --seed-data
```

## Cloud Deployment

### 1. Setup Azure Resources

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

- `AZURE_CREDENTIALS`: Azure service principal credentials
- `AZURE_RESOURCE_GROUP`: Resource group name
- `API_URL`: Backend API URL
- `SLACK_WEBHOOK`: Slack webhook for notifications

### 3. Deploy via GitHub Actions

Push to main branch to trigger the CI/CD pipeline:

```bash
git push origin main
```

## Monitoring and Observability

### Application Insights

Access metrics at: `https://portal.azure.com`

### Health Checks

- Frontend: `http://localhost:3000/api/health`
- Backend: `http://localhost:5000/health`

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker ps | grep mongo

# View MongoDB logs
docker logs mongo
```

### Backend Build Errors

```bash
# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
```

### Frontend Issues

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Development Workflow

1. Create a feature branch
2. Make changes
3. Write tests
4. Run tests locally
5. Commit and push
6. Create pull request
7. CI/CD pipeline runs automatically
8. Merge after approval

## Architecture Overview

```
┌─────────────┐
│   Frontend  │  Next.js + React + TypeScript
│   (Port 3000│
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌─────▼─────┐
│  Backend    │   │  Azure    │
│  .NET API   │   │ Cognitive │
│ (Port 5000) │   │ Services  │
└──────┬──────┘   └───────────┘
       │
       ├──────────┬──────────┬──────────┐
       │          │          │          │
┌──────▼──────┐ ┌▼────────┐ ┌▼────────┐ ┌▼────────┐
│   MongoDB   │ │PostgreSQL│ │ Cosmos  │ │  Azure  │
│  (Products) │ │  (User   │ │   DB    │ │ Search  │
│             │ │Interactions)│ (Profiles)│         │
└─────────────┘ └──────────┘ └─────────┘ └─────────┘
```

## API Documentation

Once the backend is running, access Swagger documentation at:
`http://localhost:5000/swagger`

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in Application Insights
3. Open an issue on GitHub
4. Contact the development team

## License

MIT License - see LICENSE file for details
