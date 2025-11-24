#!/bin/bash

set -e

echo "🚀 Deploying Sustainable Retail Assistant with Terraform..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
command -v az >/dev/null 2>&1 || { echo -e "${RED}Azure CLI not installed${NC}"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}Terraform not installed${NC}"; exit 1; }
command -v dotnet >/dev/null 2>&1 || { echo -e "${RED}.NET SDK not installed${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js not installed${NC}"; exit 1; }

# Login to Azure
echo -e "${BLUE}📝 Logging into Azure...${NC}"
az login

# Initialize Terraform
echo -e "${BLUE}🔧 Initializing Terraform...${NC}"
cd infrastructure/terraform
terraform init

# Plan infrastructure
echo -e "${BLUE}📊 Planning infrastructure...${NC}"
terraform plan -out=tfplan

# Apply infrastructure
echo -e "${BLUE}🏗️  Creating Azure resources...${NC}"
terraform apply tfplan

# Get outputs
echo -e "${GREEN}✅ Infrastructure created!${NC}"
terraform output

# Store outputs for deployment
RESOURCE_GROUP=$(terraform output -raw resource_group_name)
FRONTEND_APP=$(terraform output -json deployment_info | jq -r '.frontend_url' | sed 's/https:\/\///')
BACKEND_APP=$(terraform output -json deployment_info | jq -r '.backend_url' | sed 's/https:\/\///')

cd ../..

# Build and deploy backend
echo -e "${BLUE}🔨 Building backend...${NC}"
cd backend/RecommendationService
dotnet publish -c Release -o ./publish

echo -e "${BLUE}📤 Deploying backend...${NC}"
cd publish
zip -r ../backend-deploy.zip .
az webapp deployment source config-zip \
  --resource-group "$RESOURCE_GROUP" \
  --name "${BACKEND_APP%.azurewebsites.net}" \
  --src ../backend-deploy.zip

cd ../../..

# Build and deploy frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
cd frontend
npm install
npm run build

echo -e "${BLUE}📤 Deploying frontend...${NC}"
zip -r frontend-deploy.zip .next package.json package-lock.json public
az webapp deployment source config-zip \
  --resource-group "$RESOURCE_GROUP" \
  --name "${FRONTEND_APP%.azurewebsites.net}" \
  --src frontend-deploy.zip

cd ..

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Frontend: https://$FRONTEND_APP${NC}"
echo -e "${GREEN}🌐 Backend: https://$BACKEND_APP${NC}"
echo -e "${GREEN}📊 Monitor at: https://portal.azure.com${NC}"
