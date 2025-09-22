/*
  Warnings:

  - You are about to drop the column `city` on the `EventLocation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."EventLocation" DROP COLUMN "city",
ADD COLUMN     "name" TEXT;
