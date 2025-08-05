-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "traceId" TEXT,
    "spanId" TEXT,
    "userId" TEXT,
    "method" TEXT,
    "path" TEXT,
    "statusCode" INTEGER,
    "duration" INTEGER,
    "userAgent" TEXT,
    "ip" TEXT,
    "errorName" TEXT,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogMetrics" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hour" TIMESTAMP(3) NOT NULL,
    "service" TEXT NOT NULL,
    "path" TEXT,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "avgDuration" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LogMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Log_timestamp_idx" ON "Log"("timestamp");

-- CreateIndex
CREATE INDEX "Log_level_idx" ON "Log"("level");

-- CreateIndex
CREATE INDEX "Log_service_idx" ON "Log"("service");

-- CreateIndex
CREATE INDEX "Log_traceId_idx" ON "Log"("traceId");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "Log_path_idx" ON "Log"("path");

-- CreateIndex
CREATE INDEX "LogMetrics_hour_idx" ON "LogMetrics"("hour");

-- CreateIndex
CREATE UNIQUE INDEX "LogMetrics_hour_service_path_key" ON "LogMetrics"("hour", "service", "path");