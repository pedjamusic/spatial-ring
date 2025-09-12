/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Asset" DROP CONSTRAINT "Asset_categoryId_fkey";

-- DropIndex
DROP INDEX "public"."Asset_categoryId_idx";

-- AlterTable
ALTER TABLE "public"."Asset" DROP COLUMN "categoryId",
DROP COLUMN "createdById",
DROP COLUMN "updatedById",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "group",
DROP COLUMN "password",
DROP COLUMN "updated_at",
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Category";

-- DropEnum
DROP TYPE "public"."UserGroup";

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "public"."Asset"("status");

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_restingLocationId_fkey" FOREIGN KEY ("restingLocationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
