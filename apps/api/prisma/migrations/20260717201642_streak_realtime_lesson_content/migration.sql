-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "publishAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN     "lastAccessedAt" TIMESTAMP(3),
ADD COLUMN     "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StudyActivity" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "minutesSpent" INTEGER NOT NULL DEFAULT 0,
    "lessonsEngaged" INTEGER NOT NULL DEFAULT 0,
    "meetsThreshold" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakFreezeUse" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "forDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakFreezeUse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyActivity_studentId_activityDate_key" ON "StudyActivity"("studentId", "activityDate");

-- CreateIndex
CREATE UNIQUE INDEX "StreakFreezeUse_studentId_forDate_key" ON "StreakFreezeUse"("studentId", "forDate");

-- AddForeignKey
ALTER TABLE "StudyActivity" ADD CONSTRAINT "StudyActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakFreezeUse" ADD CONSTRAINT "StreakFreezeUse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
