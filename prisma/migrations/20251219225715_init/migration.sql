-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('ACADEMIC', 'GENERAL');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Module" AS ENUM ('WRITING', 'SPEAKING', 'READING', 'LISTENING');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TASK1_ACADEMIC', 'TASK1_GENERAL', 'TASK2', 'SPEAKING_PART1', 'SPEAKING_PART2', 'SPEAKING_PART3', 'READING_PASSAGE', 'LISTENING_SECTION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "target_band" DOUBLE PRECISION,
    "test_date" TIMESTAMP(3),
    "test_type" "TestType",
    "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "module" "Module" NOT NULL,
    "type" "ContentType" NOT NULL,
    "test_type" "TestType",
    "difficulty_band" DOUBLE PRECISION,
    "title" TEXT,
    "content_data" JSONB NOT NULL,
    "answers" JSONB,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "module" "Module" NOT NULL,
    "content_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "submission_data" JSONB,

    CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "module" "Module" NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "input_text" TEXT NOT NULL,
    "ai_response" JSONB NOT NULL,
    "band_estimate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokens_used" INTEGER NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_quota" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "writing_evaluations_used" INTEGER NOT NULL DEFAULT 0,
    "speaking_evaluations_used" INTEGER NOT NULL DEFAULT 0,
    "explanations_used" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_quota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explanation_cache" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "explanation" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "explanation_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_session_id_key" ON "evaluations"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_quota_user_id_key" ON "usage_quota"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "explanation_cache_content_id_question_id_key" ON "explanation_cache"("content_id", "question_id");

-- AddForeignKey
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_quota" ADD CONSTRAINT "usage_quota_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
