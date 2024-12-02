/*
  Warnings:

  - Added the required column `fileName` to the `Attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachments" ADD COLUMN     "fileName" TEXT NOT NULL;
