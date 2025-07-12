#!/bin/bash

# Script to set up secrets for local development with Kind

echo "Setting up local development secrets..."

# Check if running in Kind context
if ! kubectl config current-context | grep -q "kind"; then
  echo "Warning: Not in Kind context. Current context: $(kubectl config current-context)"
  echo "Continue anyway? (y/n)"
  read -r response
  if [[ "$response" != "y" ]]; then
    exit 1
  fi
fi

# Apply database secret
if [ -f "k8s/database-secret.yaml" ]; then
  echo "Applying database secret..."
  kubectl apply -f k8s/database-secret.yaml
else
  echo "Warning: k8s/database-secret.yaml not found"
  echo "Creating placeholder database secret..."
  kubectl create secret generic database-secret \
    --from-literal=DATABASE_URL="postgresql://user:password@localhost:5432/gild?sslmode=disable" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

# Apply OpenSearch secret
if [ -f "k8s/opensearch-secret.yaml" ]; then
  echo "Applying OpenSearch secret..."
  kubectl apply -f k8s/opensearch-secret.yaml
else
  echo "Warning: k8s/opensearch-secret.yaml not found"
  echo "Creating placeholder OpenSearch secret..."
  kubectl create secret generic opensearch-secret \
    --from-literal=OPENSEARCH_CONNECTION_STRING="https://localhost:9200" \
    --from-literal=OPENSEARCH_USERNAME="admin" \
    --from-literal=OPENSEARCH_PASSWORD="admin" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

echo "✅ Local secrets setup complete!"
kubectl get secrets