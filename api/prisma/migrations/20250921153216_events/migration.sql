/*
  Warnings:

  - You are about to drop the column `locationId` on the `Event` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_locationId_fkey";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "locationId",
ADD COLUMN     "eventLocationId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_eventLocationId_fkey" FOREIGN KEY ("eventLocationId") REFERENCES "public"."EventLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
