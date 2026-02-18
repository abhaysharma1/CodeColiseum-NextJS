-- CreateEnum
CREATE TYPE "AiProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "aiStatus" "AiProcessingStatus" NOT NULL DEFAULT 'PENDING';
