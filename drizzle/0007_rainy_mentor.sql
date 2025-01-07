PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sharedExams` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`userId` text(36) NOT NULL,
	`questionRecord` text(36) NOT NULL,
	`formId` text,
	`firstName` text,
	`lastName` text,
	`email` text NOT NULL,
	`shareDate` integer DEFAULT '"2025-01-07T04:57:57.484Z"',
	FOREIGN KEY (`userId`) REFERENCES `userprofile`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`questionRecord`) REFERENCES `questionbank`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sharedExams`("id", "userId", "questionRecord", "formId", "firstName", "lastName", "email", "shareDate") SELECT "id", "userId", "questionRecord", "formId", "firstName", "lastName", "email", "shareDate" FROM `sharedExams`;--> statement-breakpoint
DROP TABLE `sharedExams`;--> statement-breakpoint
ALTER TABLE `__new_sharedExams` RENAME TO `sharedExams`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS "pendingJob_jobId_unique";--> statement-breakpoint
ALTER TABLE `questionbank` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-07T04:57:57.483Z"';--> statement-breakpoint
CREATE UNIQUE INDEX `pendingJob_jobId_unique` ON `pendingJob` (`jobId`);--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2025-01-07T04:57:57.482Z"';