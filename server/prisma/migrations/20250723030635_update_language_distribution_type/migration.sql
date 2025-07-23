/*
  Warnings:

  - The `language_distribution` column on the `project_statistics` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "project_statistics" DROP COLUMN "language_distribution",
ADD COLUMN     "language_distribution" JSONB;
