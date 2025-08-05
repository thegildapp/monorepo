# Database Administration Guide

## Overview

This guide explains how to manage the PostgreSQL databases for the Gild application on DigitalOcean.

## Database Architecture

### Physical Databases
- **`defaultdb`** - Default database, used for creating migrations
- **`gild-pool`** - Production database where all application data lives

### Connection Methods
- **Port 25060** - Direct PostgreSQL connection (no pooling)
- **Port 25061** - PgBouncer pooled connection (recommended for production)

### Connection URL Format
```
postgresql://doadmin:PASSWORD@host:PORT/DATABASE?sslmode=require
```

## Connection Pooling Explained

### Direct Connection (Port 25060)
- Each request creates a new database connection
- Required for operations that need full PostgreSQL features:
  - Creating/dropping databases
  - Running `prisma migrate dev`
  - Advisory locks
- Higher overhead, slower for frequent connections

### Pooled Connection (Port 25061 via PgBouncer)
- Reuses connections from a pool
- Much faster for application queries
- Limited PostgreSQL features:
  - Cannot create databases
  - No prepared statements
  - No advisory locks
- Best for production application traffic

## Prisma Migration Workflows

### Creating New Migrations (Development)
```bash
# Use defaultdb with direct connection (port 25060)
DATABASE_URL="postgresql://doadmin:PASSWORD@host:25060/defaultdb?sslmode=require" \
  npx prisma migrate dev --name descriptive_migration_name
```

Why this setup:
- `migrate dev` needs to create a shadow database
- Must use port 25060 (direct connection) for database creation
- Uses `defaultdb` as a workspace

### Applying Migrations to Production
```bash
# Use gild-pool with pooled connection (port 25061)
DATABASE_URL="postgresql://doadmin:PASSWORD@host:25061/gild-pool?sslmode=require" \
  npx prisma migrate deploy
```

Why this setup:
- `migrate deploy` only applies existing migrations
- Can use port 25061 (pooled connection)
- Targets `gild-pool` where production data lives

### Resetting Database (Development/Testing)
```bash
# Use the reset script
./scripts/reset-db.sh

# Or manually:
DATABASE_URL="postgresql://doadmin:PASSWORD@host:25061/gild-pool?sslmode=require" \
  npx prisma migrate reset --force
```

## Database Secrets Management

### Getting Database URL from Kubernetes
```bash
# View the secret
kubectl get secret database-secret -o jsonpath='{.data.DATABASE_URL}' | base64 -d

# Export for local use
export DATABASE_URL=$(kubectl get secret database-secret -o jsonpath='{.data.DATABASE_URL}' | base64 -d)
```

### Important Secrets
- `database-secret` - Main application database (gild-pool, port 25061)
- `database-read-secret` - Read replica if configured
- `logs-database-secret` - Separate database for logs

## Common Operations

### Check Database Status
```bash
# Connect directly to check status
PGPASSWORD="PASSWORD" psql -h host -p 25060 -U doadmin -d gild-pool -c "\dt"
```

### View Current Indexes
```bash
DATABASE_URL="..." npx prisma db pull
# Then check schema.prisma for current state
```

### Analyze Slow Queries
```sql
-- Connect to database and run:
EXPLAIN ANALYZE 
SELECT * FROM inquiries 
WHERE "buyerId" = 'some_id' 
ORDER BY "createdAt" DESC 
LIMIT 20;
```

### Clear Stuck Advisory Locks
```bash
# If migrations are stuck with advisory lock error:
PGPASSWORD="PASSWORD" psql -h host -p 25060 -U doadmin -d defaultdb \
  -c "SELECT pg_advisory_unlock_all();"
```

## Environment Configuration

### Development (.env.local)
```env
# Use pooled connection for app queries
DATABASE_URL="postgresql://...@host:25061/gild-pool?sslmode=require"
```

### Kubernetes Deployment
```yaml
# k8s/database-secret.yaml
stringData:
  DATABASE_URL: "postgresql://...@host:25061/gild-pool?sslmode=require"
```

## Troubleshooting

### "No such database: prisma_migrate_shadow_db"
- **Cause**: Using pooled connection (25061) for `migrate dev`
- **Fix**: Use direct connection (25060) with defaultdb

### "Timed out trying to acquire advisory lock"
- **Cause**: Previous migration didn't release lock
- **Fix**: Clear locks using psql command above

### "Slow query" warnings
- **Cause**: Missing indexes or inefficient queries
- **Fix**: Add appropriate indexes in schema.prisma and migrate

### Connection pool exhausted
- **Cause**: Too many concurrent connections
- **Fix**: Use pooled connection (25061) for application

## Best Practices

1. **Always use pooled connections (25061) for production app**
2. **Use direct connections (25060) only for migrations**
3. **Never commit database URLs to git**
4. **Always test migrations on defaultdb first**
5. **Monitor slow query logs and add indexes as needed**
6. **Use `migrate deploy` in production, never `migrate dev`**

## Migration Checklist

- [ ] Create migration locally using defaultdb
- [ ] Test migration works without errors
- [ ] Apply migration to gild-pool using `migrate deploy`
- [ ] Verify indexes/changes in DigitalOcean dashboard
- [ ] Monitor application for performance improvements