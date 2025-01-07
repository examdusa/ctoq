DROP INDEX IF EXISTS "pendingJob_jobId_unique";--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-05T01:52:01.924Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `pendingJob_jobId_unique` ON `pendingJob` (`jobId`);--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "guidance" TO "guidance" text DEFAULT 'NA';--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "summary" TO "summary" text DEFAULT 'NA';--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "googleFormId" TO "googleFormId" text DEFAULT 'NA';--> statement-breakpoint
ALTER TABLE `sharedExams` ALTER COLUMN "shareDate" TO "shareDate" integer DEFAULT '"2025-01-05T01:52:01.925Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-05T01:52:01.924Z"';