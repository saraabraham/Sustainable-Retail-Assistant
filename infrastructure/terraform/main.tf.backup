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
