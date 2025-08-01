-- CreateTable
CREATE TABLE "public"."pending_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passkeyData" JSONB,

    CONSTRAINT "pending_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_users_email_key" ON "public"."pending_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pending_users_token_key" ON "public"."pending_users"("token");
