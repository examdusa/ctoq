DROP INDEX IF EXISTS "pendingJob_jobId_unique";--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-06T17:09:05.921Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `pendingJob_jobId_unique` ON `pendingJob` (`jobId`);--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "googleFormId" TO "googleFormId" text DEFAULT '';--> statement-breakpoint
ALTER TABLE `sharedExams` ALTER COLUMN "shareDate" TO "shareDate" integer DEFAULT '"2025-01-06T17:09:05.923Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-06T17:09:05.919Z"';