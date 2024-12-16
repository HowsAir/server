-- DropIndex
DROP INDEX "measurements_timestamp_idx";

-- DropIndex
DROP INDEX "nodes_status_idx";

-- CreateIndex
CREATE INDEX "daily_stats_userId_date_idx" ON "daily_stats"("userId", "date");

-- CreateIndex
CREATE INDEX "nodes_userId_idx" ON "nodes"("userId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
