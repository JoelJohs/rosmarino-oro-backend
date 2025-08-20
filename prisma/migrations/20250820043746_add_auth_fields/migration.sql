/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPERADMIN', 'EMPLOYEE', 'CLIENT');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "phone",
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'CLIENT',
ADD COLUMN     "verificationToken" TEXT;
