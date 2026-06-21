-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowedTags" "BoardTag"[] DEFAULT ARRAY[]::"BoardTag"[];

