/*
  Warnings:

  - You are about to drop the column `shareEmail` on the `inquiries` table. All the data in the column will be lost.
  - You are about to drop the column `sharePhone` on the `inquiries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."inquiries" DROP COLUMN "shareEmail",
DROP COLUMN "sharePhone";

-- AlterTable
ALTER TABLE "public"."listings" ADD COLUMN     "listingFeePaid" INTEGER,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "listings_status_latitude_longitude_createdAt_idx" ON "public"."listings"("status", "latitude", "longitude", "createdAt" DESC);
