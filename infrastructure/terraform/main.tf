
variable "postgres_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}
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
  features {}
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_resource_group" "main" {
  name     = "sustainable-retail-rg"
  location = "westus"
}

# Container Registry (free tier)
resource "azurerm_container_registry" "main" {
  name                = "sustainableretail${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
}

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "container_registry" {
  value = azurerm_container_registry.main.name
}

output "next_steps" {
  value = <<-EOT
  
  ✅ Container Registry created!
  
  Your subscription has App Service quota restrictions.
  
  Options:
  1. Request quota increase in Azure Portal
  2. Use different Azure subscription
  3. Deploy to different cloud (AWS, GCP, DigitalOcean)
  4. Run locally (already working!)
  
  EOT
}

# Backend Container Instance
resource "azurerm_container_group" "backend" {
  name                = "sustainable-backend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  dns_name_label      = "sustainable-backend-${random_string.suffix.result}"
  ip_address_type     = "Public"

  image_registry_credential {
    server   = azurerm_container_registry.main.login_server
    username = azurerm_container_registry.main.admin_username
    password = azurerm_container_registry.main.admin_password
  }

  container {
    name   = "backend"
    image  = "${azurerm_container_registry.main.login_server}/backend:latest"
    cpu    = "1.0"
    memory = "1.5"

    ports {
      port     = 5000
      protocol = "TCP"
    }

    environment_variables = {
  ASPNETCORE_ENVIRONMENT = "Production"
  ASPNETCORE_URLS = "http://+:5000"
  MongoDB__ConnectionString = azurerm_cosmosdb_account.main.connection_strings[0]
  ConnectionStrings__PostgreSQL = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=retail_assistant;Username=adminuser;Password=${var.postgres_password};SslMode=Require"
}
  }
}

# Frontend Container Instance
resource "azurerm_container_group" "frontend" {
  name                = "sustainable-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  dns_name_label      = "sustainable-frontend-${random_string.suffix.result}"
  ip_address_type     = "Public"

  image_registry_credential {
    server   = azurerm_container_registry.main.login_server
    username = azurerm_container_registry.main.admin_username
    password = azurerm_container_registry.main.admin_password
  }

  container {
    name   = "frontend"
    image  = "${azurerm_container_registry.main.login_server}/frontend:latest"
    cpu    = "1.0"
    memory = "1.5"

    ports {
      port     = 3000
      protocol = "TCP"
    }

    environment_variables = {
      NEXT_PUBLIC_API_URL = "http://${azurerm_container_group.backend.fqdn}:5000/api"
    }
  }
}

output "backend_url" {
  value = "http://${azurerm_container_group.backend.fqdn}:5000"
}

output "frontend_url" {
  value = "http://${azurerm_container_group.frontend.fqdn}:3000"
}

# Cosmos DB with MongoDB API (Serverless - Free tier available)
resource "azurerm_cosmosdb_account" "main" {
  name                = "sustainable-cosmos-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  offer_type          = "Standard"
  kind                = "MongoDB"

  capabilities {
    name = "EnableMongo"
  }

  capabilities {
    name = "EnableServerless"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }
}

# Cosmos DB MongoDB Database
resource "azurerm_cosmosdb_mongo_database" "main" {
  name                = "RetailAssistant"
  resource_group_name = azurerm_cosmosdb_account.main.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
}

# PostgreSQL Flexible Server - Try West US 2 (different from West US)
resource "azurerm_postgresql_flexible_server" "main" {
  name                = "sustainable-postgres-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = "westus2"  # Different region
  version             = "14"
  
  administrator_login    = "adminuser"
  administrator_password = var.postgres_password  
  
  storage_mb = 32768
  sku_name   = "B_Standard_B1ms"  # Burstable tier - cheapest
  
  backup_retention_days = 7
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "retail_assistant"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Firewall rule to allow Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Update backend container with database connections
# Remove the old backend container and add this updated one
# (Don't run yet - I'll show the full updated backend next)

output "cosmos_connection_string" {
  value     = azurerm_cosmosdb_account.main.connection_strings[0]
  sensitive = true
}

output "postgres_connection_string" {
  value     = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=retail_assistant;Username=adminuser;Password=${var.postgres_password};SslMode=Require"
  sensitive = true
}
