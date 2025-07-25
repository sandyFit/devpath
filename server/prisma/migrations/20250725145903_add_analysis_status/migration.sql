/*
  Warnings:

  - You are about to alter the column `processing_time_ms` on the `analyses` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `file_size` on the `code_files` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to drop the `agent_action_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `agent_actions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[project_id,file_name]` on the table `code_files` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('analysis_started', 'file_analyzed', 'project_completed', 'analysis_failed');

-- CreateEnum
CREATE TYPE "stack_type" AS ENUM ('language', 'framework', 'tool');

-- DropForeignKey
ALTER TABLE "agent_actions" DROP CONSTRAINT "AgentAction_action_type_fkey";

-- DropForeignKey
ALTER TABLE "agent_actions" DROP CONSTRAINT "AgentAction_path_id_fkey";

-- DropForeignKey
ALTER TABLE "agent_actions" DROP CONSTRAINT "AgentAction_project_id_fkey";

-- DropForeignKey
ALTER TABLE "agent_actions" DROP CONSTRAINT "AgentAction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "analyses" DROP CONSTRAINT "Analysis_file_id_fkey";

-- DropForeignKey
ALTER TABLE "analyses" DROP CONSTRAINT "Analysis_project_id_fkey";

-- DropForeignKey
ALTER TABLE "code_files" DROP CONSTRAINT "CodeFile_project_id_fkey";

-- DropIndex
DROP INDEX "CodeFile_file_name_key";

-- AlterTable
ALTER TABLE "analyses" RENAME CONSTRAINT "Analysis_pkey" TO "analyses_pkey";

ALTER TABLE "analyses"
ADD COLUMN     "analysis_status" "AnalysisStatus" DEFAULT 'pending',
ADD COLUMN     "analyzer_version" TEXT,
ADD COLUMN     "confidence_level" DOUBLE PRECISION,
ADD COLUMN     "error_message" TEXT,
ALTER COLUMN "issues_count" SET DEFAULT 0,
ALTER COLUMN "quality_score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "security_score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "complexity_score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "best_practices_score" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "processing_time_ms" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "code_files" RENAME CONSTRAINT "CodeFile_pkey" TO "code_files_pkey";

ALTER TABLE "code_files"
ALTER COLUMN "file_size" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "project_statistics" ADD COLUMN     "cyclomatic_complexity" DOUBLE PRECISION;

-- DropTable
DROP TABLE "agent_action_types";

-- DropTable
DROP TABLE "agent_actions";

-- DropEnum
DROP TYPE "ActionOutcome";

-- DropEnum
DROP TYPE "TriggeredBy";

-- CreateTable
CREATE TABLE "analysis_events" (
    "event_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "event_type" "EventType" NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "project_stack_items" (
    "stack_item_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "stack_type" NOT NULL,

    CONSTRAINT "project_stack_items_pkey" PRIMARY KEY ("stack_item_id")
);

-- CreateIndex
CREATE INDEX "analysis_events_project_id_idx" ON "analysis_events"("project_id");

-- CreateIndex
CREATE INDEX "analyses_project_id_idx" ON "analyses"("project_id");

-- CreateIndex
CREATE INDEX "analyses_file_id_idx" ON "analyses"("file_id");

-- CreateIndex
CREATE INDEX "analyses_analysis_type_idx" ON "analyses"("analysis_type");

-- CreateIndex
CREATE INDEX "analyses_project_id_analysis_type_idx" ON "analyses"("project_id", "analysis_type");

-- CreateIndex
CREATE INDEX "code_files_project_id_idx" ON "code_files"("project_id");

-- CreateIndex
CREATE INDEX "code_files_programming_lang_idx" ON "code_files"("programming_lang");

-- CreateIndex
CREATE UNIQUE INDEX "code_files_project_id_file_name_key" ON "code_files"("project_id", "file_name");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "code_files"("file_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_events" ADD CONSTRAINT "analysis_events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_files" ADD CONSTRAINT "code_files_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_stack_items" ADD CONSTRAINT "project_stack_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;
