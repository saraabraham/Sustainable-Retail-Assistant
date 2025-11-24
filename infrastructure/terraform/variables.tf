variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
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
  description = "Enable canary deployment slots"
  type        = bool
  default     = true
}

variable "app_service_sku" {
  description = "App Service Plan SKU"
  type        = string
  default     = "P1v2"
}

variable "postgres_sku" {
  description = "PostgreSQL SKU"
  type        = string
  default     = "GP_Standard_D2s_v3"
}

variable "enable_multi_region" {
  description = "Enable multi-region deployment for Cosmos DB"
  type        = bool
  default     = true
}
