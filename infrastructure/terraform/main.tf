terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
}

# Random suffix for unique resource names
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  resource_suffix = random_string.suffix.result
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location
  tags     = local.common_tags
}

# Storage Account for Terraform State
resource "azurerm_storage_account" "tfstate" {
  name                     = "tfstate${local.resource_suffix}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = local.common_tags
}

resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${var.project_name}-asp-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku
  tags                = local.common_tags
}

# Frontend App Service (Next.js)
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  tags                = local.common_tags

  site_config {
    application_stack {
      node_version = "18-lts"
    }
    # always_on requires Standard tier or higher
    always_on        = can(regex("^(S|P)", var.app_service_sku)) ? true : false
    health_check_path = "/"
    
    cors {
      allowed_origins = ["*"]
    }
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "18-lts"
    "NEXT_PUBLIC_API_URL"          = "https://${var.project_name}-backend-${local.resource_suffix}.azurewebsites.net/api"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
  }

  identity {
    type = "SystemAssigned"
  }
}

# Backend App Service (.NET)
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  tags                = local.common_tags

  site_config {
    application_stack {
      dotnet_version = "8.0"
    }
    # always_on requires Standard tier or higher
    always_on         = can(regex("^(S|P)", var.app_service_sku)) ? true : false
    health_check_path = "/health"
    
    cors {
      allowed_origins = [
        "https://${var.project_name}-frontend-${local.resource_suffix}.azurewebsites.net"
      ]
    }
  }

  app_settings = {
    "ASPNETCORE_ENVIRONMENT"              = var.environment
    "MongoDB__ConnectionString"           = azurerm_cosmosdb_account.main.connection_strings[0]
    "MongoDB__DatabaseName"               = "RetailAssistant"
    "CosmosDb__ConnectionString"          = azurerm_cosmosdb_account.main.connection_strings[0]
    "CosmosDb__DatabaseName"              = "RetailAssistant"
    "ConnectionStrings__PostgreSQL"       = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Port=5432;Database=retail_assistant;Username=${azurerm_postgresql_flexible_server.main.administrator_login};Password=${random_password.postgres_password.result};SslMode=Require"
    "Azure__CognitiveServices__Endpoint"  = azurerm_cognitive_account.main.endpoint
    "Azure__CognitiveServices__Key"       = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.cognitive_key.id})"
    "AzureSearch__Endpoint"               = "https://${azurerm_search_service.main.name}.search.windows.net"
    "AzureSearch__ApiKey"                 = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.search_key.id})"
    "AzureSearch__IndexName"              = "products"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
  }

  identity {
    type = "SystemAssigned"
  }
}

# Cosmos DB (MongoDB API)
resource "azurerm_cosmosdb_account" "main" {
  name                = "${var.project_name}-cosmos-${local.resource_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "MongoDB"
  tags                = local.common_tags

  capabilities {
    name = "EnableMongo"
  }

  capabilities {
    name = "EnableServerless"
  }

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  # Optional multi-region deployment
  dynamic "geo_location" {
    for_each = var.enable_multi_region ? [1] : []
    content {
      location          = "westus2"
      failover_priority = 1
    }
  }
}

# Note: MongoDB kind doesn't support SQL API containers
# If you need SQL API, create a separate Cosmos DB account with GlobalDocumentDB kind
# Commenting out SQL-specific resources for now

# Uncomment and create separate account if you need both APIs:
# resource "azurerm_cosmosdb_account" "sql" {
#   name                = "${var.project_name}-cosmos-sql-${local.resource_suffix}"
#   location            = azurerm_resource_group.main.location
#   resource_group_name = azurerm_resource_group.main.name
#   offer_type          = "Standard"
#   kind                = "GlobalDocumentDB"
#   ...
# }

# Azure Cognitive Services
resource "azurerm_cognitive_account" "main" {
  name                = "${var.project_name}-cognitive-${local.resource_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "TextAnalytics"
  sku_name            = "S"
  tags                = local.common_tags
}

# Azure Cognitive Search
resource "azurerm_search_service" "main" {
  name                = "${var.project_name}-search-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "standard"
  replica_count       = 1
  partition_count     = 1
  tags                = local.common_tags
}

# Key Vault - Fixed: Shortened name to meet 3-24 character requirement
resource "azurerm_key_vault" "main" {
  name                = "sr-kv-${local.resource_suffix}"  # Shortened from full project name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
  tags                = local.common_tags

  # Enable soft delete
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
}

# Key Vault Access Policy for Backend App
resource "azurerm_key_vault_access_policy" "backend" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.backend.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

# Key Vault Access Policy for Current User/Service Principal
resource "azurerm_key_vault_access_policy" "current" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete",
    "Purge"
  ]
}

# Store secrets in Key Vault
resource "azurerm_key_vault_secret" "cognitive_key" {
  name         = "cognitive-services-key"
  value        = azurerm_cognitive_account.main.primary_access_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.current]
}

resource "azurerm_key_vault_secret" "search_key" {
  name         = "search-service-key"
  value        = azurerm_search_service.main.primary_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.current]
}

resource "azurerm_key_vault_secret" "postgres_password" {
  name         = "postgres-password"
  value        = random_password.postgres_password.result
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.current]
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${var.project_name}-insights-${local.resource_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  tags                = local.common_tags
}

# PostgreSQL Flexible Server
resource "random_password" "postgres_password" {
  length  = 32
  special = true
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.project_name}-postgres-${local.resource_suffix}"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "14"
  administrator_login    = "pgadmin"
  administrator_password = random_password.postgres_password.result
  storage_mb             = 32768
  sku_name               = var.postgres_sku
  tags                   = local.common_tags

  # Zone is only supported for General Purpose and Memory Optimized tiers
  # Commenting out for Burstable tier
  # zone = "1"
}

# PostgreSQL Firewall Rule - Allow Azure Services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "retail_assistant"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Deployment Slots for Canary Deployments (requires Standard tier or higher)
resource "azurerm_linux_web_app_slot" "frontend_canary" {
  count          = var.enable_canary_deployment ? 1 : 0
  name           = "canary"
  app_service_id = azurerm_linux_web_app.frontend.id

  site_config {
    application_stack {
      node_version = "18-lts"
    }
    always_on = true
  }
}

resource "azurerm_linux_web_app_slot" "backend_canary" {
  count          = var.enable_canary_deployment ? 1 : 0
  name           = "canary"
  app_service_id = azurerm_linux_web_app.backend.id

  site_config {
    application_stack {
      dotnet_version = "8.0"
    }
    always_on = true
  }
}

# Data sources
data "azurerm_client_config" "current" {}

# Outputs
output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Resource group name"
}

output "frontend_url" {
  value       = "https://${azurerm_linux_web_app.frontend.default_hostname}"
  description = "Frontend application URL"
}

output "backend_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
  description = "Backend API URL"
}

output "cosmos_db_endpoint" {
  value       = azurerm_cosmosdb_account.main.endpoint
  description = "Cosmos DB endpoint"
  sensitive   = true
}

output "postgres_fqdn" {
  value       = azurerm_postgresql_flexible_server.main.fqdn
  description = "PostgreSQL server FQDN"
}

output "application_insights_key" {
  value       = azurerm_application_insights.main.instrumentation_key
  description = "Application Insights instrumentation key"
  sensitive   = true
}

output "key_vault_uri" {
  value       = azurerm_key_vault.main.vault_uri
  description = "Key Vault URI"
}

output "search_service_endpoint" {
  value       = "https://${azurerm_search_service.main.name}.search.windows.net"
  description = "Azure Cognitive Search endpoint"
}