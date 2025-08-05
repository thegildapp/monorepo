-- Add indexes for common query patterns

-- Index for listing queries by status and creation date
CREATE INDEX "listings_status_createdAt_idx" ON "listings"("status", "createdAt" DESC);

-- Index for location-based queries
CREATE INDEX "listings_location_idx" ON "listings"("latitude", "longitude") WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

-- Index for seller's listings
CREATE INDEX "listings_sellerId_createdAt_idx" ON "listings"("sellerId", "createdAt" DESC);

-- Index for listing status
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- Index for user lookups by email (already exists as unique constraint)
-- Index for pending users cleanup
CREATE INDEX "pending_users_expiresAt_idx" ON "pending_users"("expiresAt");