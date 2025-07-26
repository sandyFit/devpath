/*
  Warnings:

  - You are about to drop the column `total_files` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project_statistics" ADD COLUMN     "total_dirs" INTEGER;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "total_files";
