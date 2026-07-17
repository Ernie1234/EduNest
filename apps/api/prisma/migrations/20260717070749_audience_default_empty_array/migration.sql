-- AlterTable
ALTER TABLE "Announcement" ALTER COLUMN "audience" SET DEFAULT ARRAY[]::"UserRole"[];

-- AlterTable
ALTER TABLE "CalendarEvent" ALTER COLUMN "audience" SET DEFAULT ARRAY[]::"UserRole"[];

-- Backfill: NULL audience was being written before the default existed,
-- and Prisma's `isEmpty` filter (used for "empty audience = school-wide")
-- does not match SQL NULL, only a real empty array. Without this, every
-- non-admin role saw zero calendar events / announcements.
UPDATE "CalendarEvent" SET "audience" = ARRAY[]::"UserRole"[] WHERE "audience" IS NULL;
UPDATE "Announcement" SET "audience" = ARRAY[]::"UserRole"[] WHERE "audience" IS NULL;
