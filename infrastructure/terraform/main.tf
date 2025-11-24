terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstate"
    container_name       = "tfstate"
    key                  = "sustainable-retail.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# Variables
variable "location" {
  description = "Azure region"
  default     = "East US"
}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  default     = "sustainable-retail"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${var.project_name}-asp"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "P1v2"
}

# Frontend App Service
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }

    always_on = true
    
    health_check_path = "/api/health"
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "18-lts"
    "NEXT_PUBLIC_API_URL"          = azurerm_linux_web_app.backend.default_hostname
  }

  identity {
    type = "SystemAssigned"
  }
}

# Backend App Service
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      dotnet_version = "8.0"
    }

    always_on = true
    
    health_check_path = "/health"

    cors {
      allowed_origins = [
        "https://${azurerm_linux_web_app.frontend.default_hostname}"
      ]
    }
  }

  app_settings = {
    "ASPNETCORE_ENVIRONMENT"              = var.environment
    "MongoDB__ConnectionString"           = azurerm_cosmosdb_account.main.connection_strings[0]
    "MongoDB__DatabaseName"               = "RetailAssistant"
    "Azure__CognitiveServices__Endpoint"  = azurerm_cognitive_account.main.endpoint
    "Azure__CognitiveServices__Key"       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.cognitive_key.id})"
    "Azure__Search__Endpoint"             = azurerm_search_service.main.primary_key
  }

  identity {
    type = "SystemAssigned"
  }
}

# Cosmos DB (MongoDB API)
resource "azurerm_cosmosdb_account" "main" {
  name                = "${var.project_name}-cosmos"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }
}

# Azure Cognitive Services
resource "azurerm_cognitive_account" "main" {
  name                = "${var.project_name}-cognitive"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "TextAnalytics"
  sku_name            = "S"
}

# Azure Cognitive Search
resource "azurerm_search_service" "main" {
  name                = "${var.project_name}-search"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "standard"
  replica_count       = 1
  partition_count     = 1
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                = "${var.project_name}-kv"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_linux_web_app.backend.identity[0].principal_id

    secret_permissions = [
      "Get",
      "List"
    ]
  }
}

resource "azurerm_key_vault_secret" "cognitive_key" {
  name         = "cognitive-services-key"
  value        = azurerm_cognitive_account.main.primary_access_key
  key_vault_id = azurerm_key_vault.main.id
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${var.project_name}-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
}

# PostgreSQL for user interactions
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.project_name}-postgres"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "14"
  administrator_login    = "pgadmin"
  administrator_password = random_password.postgres_password.result
  storage_mb             = 32768
  sku_name               = "GP_Standard_D2s_v3"
}

resource "random_password" "postgres_password" {
  length  = 32
  special = true
}

# Deployment Slots for Canary Deployments
resource "azurerm_linux_web_app_slot" "canary" {
  name           = "canary"
  app_service_id = azurerm_linux_web_app.frontend.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }
  }
}

# Data sources
data "azurerm_client_config" "current" {}

# Outputs
output "frontend_url" {
  value = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}

output "backend_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "cosmos_db_endpoint" {
  value     = azurerm_cosmosdb_account.main.endpoint
  sensitive = true
}

output "application_insights_key" {
  value     = azurerm_application_insights.main.instrumentation_key
  sensitive = true
}
