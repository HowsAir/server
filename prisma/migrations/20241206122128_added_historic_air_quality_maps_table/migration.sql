-- CreateTable
CREATE TABLE "historic_air_quality_maps" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "historic_air_quality_maps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "historic_air_quality_maps_timestamp_key" ON "historic_air_quality_maps"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "historic_air_quality_maps_url_key" ON "historic_air_quality_maps"("url");

-- CreateIndex
CREATE INDEX "historic_air_quality_maps_timestamp_idx" ON "historic_air_quality_maps"("timestamp");
