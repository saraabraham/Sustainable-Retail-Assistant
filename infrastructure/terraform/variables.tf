variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "westus2"  # Changed from eastus due to PostgreSQL location restrictions
  
  validation {
    condition     = contains(["westus2", "westeurope", "northeurope", "centralus", "southcentralus", "eastus"], var.location)
    error_message = "Location must be a valid Azure region. Note: eastus may have PostgreSQL restrictions."
  }
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "sustainable-retail"
  
  validation {
    condition     = length(var.project_name) <= 20 && can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must be lowercase alphanumeric with hyphens, max 20 chars."
  }
}

variable "enable_canary_deployment" {
  description = "Enable canary deployment slots (requires Standard tier or higher)"
  type        = bool
  default     = false  # Changed to false since we're using Basic tier by default
}

variable "app_service_sku" {
  description = "App Service Plan SKU"
  type        = string
  default     = "B1"  # Changed from P1v2 to avoid quota issues
  
  validation {
    condition     = contains(["B1", "B2", "B3", "S1", "S2", "S3", "P1v2", "P2v2", "P3v2"], var.app_service_sku)
    error_message = "App Service SKU must be a valid tier. Use B1/B2/B3 for Basic, S1/S2/S3 for Standard, P1v2/P2v2/P3v2 for Premium."
  }
}

variable "postgres_sku" {
  description = "PostgreSQL SKU"
  type        = string
  default     = "B_Standard_B1ms"  # Changed to Burstable tier to avoid location restrictions
  
  validation {
    condition     = can(regex("^(B_Standard_B[1-2]m?s|GP_Standard_D[2-4]s_v3|MO_Standard_E[2-4]s_v3)$", var.postgres_sku))
    error_message = "PostgreSQL SKU must be valid. Use B_Standard_B1ms/B2s for Burstable, GP_Standard_* for General Purpose."
  }
}

variable "enable_multi_region" {
  description = "Enable multi-region deployment for Cosmos DB"
  type        = bool
  default     = false  # Changed to false to simplify initial deployment and reduce costs
}