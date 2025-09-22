/*
  Warnings:

  - You are about to drop the column `category` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenance` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `EventLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Asset" DROP COLUMN "category",
DROP COLUMN "lastMaintenance",
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "public"."EventLocation" DROP COLUMN "name";

-- CreateTable
CREATE TABLE "public"."AssetCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "AssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "public"."AssetCategory"("name");

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."AssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
