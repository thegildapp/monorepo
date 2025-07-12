# Gild v2 - Full Stack Application

## Development Workflow

### Local Development (Hot Reloading)
```bash
# Start local development with hot reloading
skaffold dev

# Access your app:
# Frontend: http://localhost:5173
# Backend: http://localhost:4000/graphql
```

### Production Deployment
```bash
# Build and deploy to production (thegild.app)
./deploy-prod.sh

# Or manually:
skaffold run -p production
```

## Architecture

- **Frontend**: React with Vite, TypeScript, CSS Modules, and Apollo GraphQL
- **Backend**: Node.js with GraphQL (Apollo Server)
- **Database**: [Add your database here]
- **Infrastructure**: Kubernetes on DigitalOcean
- **Container Registry**: DigitalOcean Container Registry
- **SSL**: Let's Encrypt certificates via cert-manager

## Key Features

- ✅ Cross-platform Docker builds (Mac → AMD64 servers)
- ✅ Automatic SSL certificate management
- ✅ Production-ready Kubernetes deployment
- ✅ Hot reloading for local development
- ✅ Separate dev and production configurations

## Domains

- **Production Frontend**: https://thegild.app
- **Production API**: https://api.thegild.app/graphql

## Files Structure

```
├── frontend/           # React + Vite frontend with TypeScript
├── backend/            # Node.js GraphQL backend
├── k8s/               # Kubernetes manifests
├── skaffold.yaml      # Skaffold configuration
└── deploy-prod.sh     # Production deployment script
```