/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `nodes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "nodes_userId_key" ON "nodes"("userId");
