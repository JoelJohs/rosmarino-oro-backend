-- AlterTable
ALTER TABLE "public"."MenuItem" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Table" ADD COLUMN     "deletedAt" TIMESTAMP(3);
