/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('low', 'medium', 'high');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_reports" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "resume" TEXT,
    "selfDescription" TEXT,
    "matchScore" INTEGER,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technical_questions" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "intention" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "interviewReportId" UUID NOT NULL,

    CONSTRAINT "technical_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_questions" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "intention" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "interviewReportId" UUID NOT NULL,

    CONSTRAINT "behavioral_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_gaps" (
    "id" UUID NOT NULL,
    "skill" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "interviewReportId" UUID NOT NULL,

    CONSTRAINT "skill_gaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparation_plans" (
    "id" UUID NOT NULL,
    "day" INTEGER NOT NULL,
    "focus" TEXT NOT NULL,
    "tasks" TEXT[],
    "interviewReportId" UUID NOT NULL,

    CONSTRAINT "preparation_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "interview_reports" ADD CONSTRAINT "interview_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technical_questions" ADD CONSTRAINT "technical_questions_interviewReportId_fkey" FOREIGN KEY ("interviewReportId") REFERENCES "interview_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_questions" ADD CONSTRAINT "behavioral_questions_interviewReportId_fkey" FOREIGN KEY ("interviewReportId") REFERENCES "interview_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_gaps" ADD CONSTRAINT "skill_gaps_interviewReportId_fkey" FOREIGN KEY ("interviewReportId") REFERENCES "interview_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_plans" ADD CONSTRAINT "preparation_plans_interviewReportId_fkey" FOREIGN KEY ("interviewReportId") REFERENCES "interview_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
