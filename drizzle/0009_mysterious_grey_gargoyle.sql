DROP INDEX IF EXISTS "pendingJob_jobId_unique";--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "jobId" TO "jobId" text(255) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `pendingJob_jobId_unique` ON `pendingJob` (`jobId`);--> statement-breakpoint
ALTER TABLE `sharedExams` ALTER COLUMN "shareDate" TO "shareDate" integer DEFAULT '"2025-01-08T16:35:47.251Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT '"2025-01-08T16:35:47.250Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "userRole" TO "userRole" text DEFAULT 'instructor';