-- AlterEnum
ALTER TYPE "NodeStatus" ADD VALUE 'UNLINKED';

-- DropForeignKey
ALTER TABLE "nodes" DROP CONSTRAINT "nodes_userId_fkey";

-- AlterTable
ALTER TABLE "nodes" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
