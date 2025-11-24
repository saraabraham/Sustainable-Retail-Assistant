#!/bin/bash

set -e

echo "⚠️  WARNING: This will destroy ALL Azure resources!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "🗑️  Destroying infrastructure..."

cd infrastructure/terraform
terraform destroy -auto-approve

echo "✅ Infrastructure destroyed"
