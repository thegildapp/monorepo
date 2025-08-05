-- CreateIndex
CREATE INDEX "inquiries_buyerId_createdAt_idx" ON "public"."inquiries"("buyerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "inquiries_sellerId_createdAt_idx" ON "public"."inquiries"("sellerId", "createdAt" DESC);
