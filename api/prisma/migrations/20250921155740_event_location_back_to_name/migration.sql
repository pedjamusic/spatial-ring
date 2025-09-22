/*
  Warnings:

  - Made the column `name` on table `EventLocation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."EventLocation" ALTER COLUMN "name" SET NOT NULL;
