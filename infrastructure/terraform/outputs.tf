output "deployment_info" {
  value = {
    resource_group = azurerm_resource_group.main.name
    location       = azurerm_resource_group.main.location
    environment    = var.environment
    frontend_url   = "https://${azurerm_linux_web_app.frontend.default_hostname}"
    backend_url    = "https://${azurerm_linux_web_app.backend.default_hostname}"
  }
  description = "Main deployment information"
}

output "database_info" {
  value = {
    cosmos_endpoint   = azurerm_cosmosdb_account.main.endpoint
    postgres_host     = azurerm_postgresql_flexible_server.main.fqdn
    postgres_database = azurerm_postgresql_flexible_server_database.main.name
  }
  description = "Database connection information"
  sensitive   = true
}

output "monitoring_info" {
  value = {
    application_insights_connection_string = azurerm_application_insights.main.connection_string
    key_vault_uri                         = azurerm_key_vault.main.vault_uri
  }
  description = "Monitoring and security information"
  sensitive   = true
}

output "next_steps" {
  value = <<-EOT
  
  ✅ Infrastructure deployed successfully!
  
  📝 Next steps:
  1. Deploy frontend: cd frontend && npm run build && az webapp deployment source config-zip
  2. Deploy backend: cd backend/RecommendationService && dotnet publish && az webapp deployment source config-zip
  3. Access frontend: ${azurerm_linux_web_app.frontend.default_hostname}
  4. Access backend API: ${azurerm_linux_web_app.backend.default_hostname}/swagger
  5. Monitor with Application Insights: portal.azure.com
  
  🔐 Secrets are stored in Key Vault: ${azurerm_key_vault.main.name}
  
  EOT
  description = "Deployment instructions"
}
