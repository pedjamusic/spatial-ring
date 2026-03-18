/*
  Warnings:

  - You are about to drop the column `category` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenance` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `serialRequired` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `EventLocation` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Asset" DROP CONSTRAINT "Asset_restingLocationId_fkey";

-- AlterTable
ALTER TABLE "public"."Asset" DROP COLUMN "category",
DROP COLUMN "lastMaintenance",
DROP COLUMN "serialRequired",
ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Stored';

-- AlterTable
ALTER TABLE "public"."EventLocation" DROP COLUMN "city";

-- DropTable
DROP TABLE "public"."Location";

-- CreateTable
CREATE TABLE "public"."Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssetCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "public"."Warehouse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "public"."AssetCategory"("name");

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."AssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_restingLocationId_fkey" FOREIGN KEY ("restingLocationId") REFERENCES "public"."Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
