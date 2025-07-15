-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'paused');

-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('not_started', 'in_progress', 'paused', 'reviewing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "AnalysisType" AS ENUM ('CODE_QUALITY', 'SECURITY', 'COMPLEXITY', 'BEST_PRACTICES', 'PERFORMANCE');

-- CreateEnum
CREATE TYPE "ActionOutcome" AS ENUM ('success', 'failed', 'ignored', 'pending');

-- CreateEnum
CREATE TYPE "TriggeredBy" AS ENUM ('system', 'user', 'schedule', 'api');

-- CreateTable
CREATE TABLE "agent_action_types" (
    "action_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AgentActionType_pkey" PRIMARY KEY ("action_type")
);

-- CreateTable
CREATE TABLE "agent_actions" (
    "action_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "path_id" INTEGER NOT NULL,
    "action_type" TEXT NOT NULL,
    "agent_name" TEXT,
    "action_details" TEXT,
    "outcome" "ActionOutcome",
    "confidence_score" DECIMAL(65,30),
    "triggered_by" "TriggeredBy",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("action_id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "analysis_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,
    "analysis_type" "AnalysisType" NOT NULL,
    "analysis_result" TEXT,
    "issues_found" TEXT,
    "issues_count" INTEGER,
    "suggestions" TEXT,
    "quality_score" INTEGER,
    "security_score" INTEGER,
    "complexity_score" INTEGER,
    "best_practices_score" INTEGER,
    "learning_gaps" TEXT,
    "strengths" TEXT,
    "learning_recommendations" TEXT,
    "skill_level_assessments" TEXT,
    "improvement_priority" TEXT,
    "recommended_resources" TEXT,
    "analysis_model" TEXT,
    "processing_time_ms" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("analysis_id")
);

-- CreateTable
CREATE TABLE "code_files" (
    "file_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "file_name" TEXT NOT NULL,
    "programming_lang" TEXT NOT NULL,
    "content" TEXT,
    "file_size" DECIMAL(65,30),
    "file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeFile_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "path_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "recommended_topics" TEXT,
    "difficulty_level" INTEGER,
    "estimated_hours" INTEGER,
    "progress_percentage" INTEGER,
    "learning_status" "LearningStatus",
    "learning_objectives" TEXT,
    "prerequisites" TEXT,
    "resources" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("path_id")
);

-- CreateTable
CREATE TABLE "project_statistics" (
    "stats_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "total_lines_of_code" INTEGER,
    "total_functions" INTEGER,
    "total_classes" INTEGER,
    "total_tests" INTEGER,
    "cyclomatic_complexity" INTEGER,
    "language_distribution" TEXT,
    "average_quality_score" INTEGER,
    "average_complexity_score" INTEGER,
    "average_security_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectStatistic_pkey" PRIMARY KEY ("stats_id")
);

-- CreateTable
CREATE TABLE "project_statuses" (
    "status_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ProjectStatus_pkey" PRIMARY KEY ("status_code")
);

-- CreateTable
CREATE TABLE "projects" (
    "project_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status_code" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "total_files" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "progress_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "path_id" INTEGER NOT NULL,
    "topic_completed" TEXT,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "skill_level" "SkillLevel",
    "streak_days" INTEGER,
    "time_spent_minutes" DECIMAL(65,30),
    "achievement_earned" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "user_status" "UserStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeFile_file_name_key" ON "code_files"("file_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "agent_actions" ADD CONSTRAINT "AgentAction_action_type_fkey" FOREIGN KEY ("action_type") REFERENCES "agent_action_types"("action_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_actions" ADD CONSTRAINT "AgentAction_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("path_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_actions" ADD CONSTRAINT "AgentAction_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_actions" ADD CONSTRAINT "AgentAction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "Analysis_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "code_files"("file_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "Analysis_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_files" ADD CONSTRAINT "CodeFile_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "LearningPath_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "LearningPath_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_statistics" ADD CONSTRAINT "ProjectStatistic_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "Project_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "project_statuses"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "Project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "UserProgress_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("path_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "UserProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
