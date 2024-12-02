/*
  Warnings:

  - You are about to drop the column `conversationsId` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `conversationsId` on the `Participants` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_conversationsId_fkey";

-- DropForeignKey
ALTER TABLE "Participants" DROP CONSTRAINT "Participants_conversationsId_fkey";

-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "conversationsId",
ADD COLUMN     "conversationId" INTEGER;

-- AlterTable
ALTER TABLE "Participants" DROP COLUMN "conversationsId",
ADD COLUMN     "conversationId" INTEGER;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
