PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pendingJob` (
	`jobId` text NOT NULL,
	`userId` text(36) NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `userprofile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_pendingJob`("jobId", "userId", "status") SELECT "jobId", "userId", "status" FROM `pendingJob`;--> statement-breakpoint
DROP TABLE `pendingJob`;--> statement-breakpoint
ALTER TABLE `__new_pendingJob` RENAME TO `pendingJob`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `pendingJob_jobId_unique` ON `pendingJob` (`jobId`);--> statement-breakpoint
CREATE TABLE `__new_subscription` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`userId` text(36) NOT NULL,
	`status` text(255),
	`startDate` text(36),
	`endDate` text(36),
	`amountPaid` real,
	`amountDue` real,
	`planId` text(36),
	`planName` text(36),
	`queries` integer DEFAULT 0,
	`invoiceId` text(255),
	`invoiceUrl` text,
	`invoicePdfUrl` text,
	`currency` text(36),
	`customerId` text,
	FOREIGN KEY (`userId`) REFERENCES `userprofile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_subscription`("id", "userId", "status", "startDate", "endDate", "amountPaid", "amountDue", "planId", "planName", "queries", "invoiceId", "invoiceUrl", "invoicePdfUrl", "currency", "customerId") SELECT "id", "userId", "status", "startDate", "endDate", "amountPaid", "amountDue", "planId", "planName", "queries", "invoiceId", "invoiceUrl", "invoicePdfUrl", "currency", "customerId" FROM `subscription`;--> statement-breakpoint
DROP TABLE `subscription`;--> statement-breakpoint
ALTER TABLE `__new_subscription` RENAME TO `subscription`;--> statement-breakpoint
DROP INDEX IF EXISTS "pendingJob_jobId_unique";--> statement-breakpoint
ALTER TABLE `sharedExams` ALTER COLUMN "shareDate" TO "shareDate" integer DEFAULT '"2025-01-08T17:34:04.440Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer NOT NULL DEFAULT '"2025-01-08T17:34:04.439Z"';