/*
  Warnings:

  - You are about to drop the column `usersId` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `usersId` on the `Participants` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_usersId_fkey";

-- DropForeignKey
ALTER TABLE "Participants" DROP CONSTRAINT "Participants_usersId_fkey";

-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "usersId";

-- AlterTable
ALTER TABLE "Participants" DROP COLUMN "usersId";

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
