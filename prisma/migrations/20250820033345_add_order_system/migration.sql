/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `preOrderFee` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `items` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceFee` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Order" ALTER COLUMN "status" TYPE "public"."OrderStatus_new" USING ("status"::text::"public"."OrderStatus_new");
ALTER TYPE "public"."OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "public"."OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "public"."Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "preOrderFee",
ADD COLUMN     "items" JSONB NOT NULL,
ADD COLUMN     "serviceFee" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "public"."Reservation" ALTER COLUMN "duration" SET DEFAULT 60;

-- DropTable
DROP TABLE "public"."OrderItem";
