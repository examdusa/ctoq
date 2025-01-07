DROP INDEX IF EXISTS "pendingJob_jobId_unique";--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-06T19:19:32.898Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `pendingJob_jobId_unique` ON `pendingJob` (`jobId`);--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "outputType" TO "outputType" text DEFAULT '';--> statement-breakpoint
ALTER TABLE `sharedExams` ALTER COLUMN "shareDate" TO "shareDate" integer DEFAULT '"2025-01-06T19:19:32.899Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-06T19:19:32.897Z"';