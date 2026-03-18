/*
  Warnings:

  - You are about to drop the column `venue` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "venue",
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "public"."Location" ADD COLUMN     "notes" TEXT;
