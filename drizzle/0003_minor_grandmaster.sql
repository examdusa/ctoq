DROP INDEX IF EXISTS "pendingJob_jobId_unique";--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-05T14:10:25.453Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `pendingJob_jobId_unique` ON `pendingJob` (`jobId`);--> statement-breakpoint
ALTER TABLE `sharedExams` ALTER COLUMN "shareDate" TO "shareDate" integer DEFAULT '"2025-01-05T14:10:25.455Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-05T14:10:25.451Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ADD `language` text DEFAULT 'English';--> statement-breakpoint
ALTER TABLE `userprofile` ADD `instituteName` text DEFAULT 'Content To Quiz';--> statement-breakpoint
ALTER TABLE `userprofile` ADD `userRole` text DEFAULT 'student';