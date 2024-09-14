/*
  Warnings:

  - Added the required column `apiKeyId` to the `Context` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Context" ADD COLUMN     "apiKeyId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Context" ADD CONSTRAINT "Context_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
