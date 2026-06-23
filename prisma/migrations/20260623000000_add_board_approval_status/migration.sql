-- CreateEnum
CREATE TYPE "BoardApprovalStatus" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "approvalStatus" "BoardApprovalStatus" NOT NULL DEFAULT 'APPROVED';
