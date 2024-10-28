/*
  Warnings:

  - You are about to drop the column `date` on the `measurements` table. All the data in the column will be lost.
  - You are about to drop the column `measurementTypeId` on the `measurements` table. All the data in the column will be lost.
  - You are about to drop the column `registrationDate` on the `nodes` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `measurement_types` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gasId` to the `measurements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `measurements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastStatusUpdate` to the `nodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `nodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surnames` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "measurements" DROP CONSTRAINT "measurements_measurementTypeId_fkey";

-- AlterTable
ALTER TABLE "measurements" DROP COLUMN "date",
DROP COLUMN "measurementTypeId",
ADD COLUMN     "gasId" INTEGER NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "nodes" DROP COLUMN "registrationDate",
ADD COLUMN     "lastStatusUpdate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "NodeStatus" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "roleId" INTEGER NOT NULL,
ADD COLUMN     "surnames" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT;

-- DropTable
DROP TABLE "measurement_types";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "stats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dailyActiveHours" DOUBLE PRECISION NOT NULL,
    "dailyDistance" DOUBLE PRECISION NOT NULL,
    "weeklyDistance" DOUBLE PRECISION NOT NULL,
    "monthlyDistance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gases" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "gases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "measurements_timestamp_idx" ON "measurements"("timestamp");

-- CreateIndex
CREATE INDEX "measurements_nodeId_timestamp_idx" ON "measurements"("nodeId", "timestamp");

-- CreateIndex
CREATE INDEX "nodes_status_idx" ON "nodes"("status");

-- AddForeignKey
ALTER TABLE "stats" ADD CONSTRAINT "stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_gasId_fkey" FOREIGN KEY ("gasId") REFERENCES "gases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
