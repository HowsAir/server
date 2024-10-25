/*
  Warnings:

  - You are about to drop the column `gasId` on the `measurements` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `measurements` table. All the data in the column will be lost.
  - You are about to drop the `gases` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `coValue` to the `measurements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no2Value` to the `measurements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o3Value` to the `measurements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "measurements" DROP CONSTRAINT "measurements_gasId_fkey";

-- AlterTable
ALTER TABLE "measurements" DROP COLUMN "gasId",
DROP COLUMN "value",
ADD COLUMN     "coValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "no2Value" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o3Value" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "gases";
