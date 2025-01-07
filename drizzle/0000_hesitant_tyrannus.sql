CREATE TABLE `pendingJob` (
	`jobId` text NOT NULL,
	`userId` text(36) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `userprofile`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pendingJob_jobId_unique` ON `pendingJob` (`jobId`);--> statement-breakpoint
CREATE TABLE `questionbank` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT '"2025-01-05T01:50:15.210Z"',
	`userId` text(36) NOT NULL,
	`jobId` text(255),
	`questions` text,
	`difficultyLevel` text,
	`questionsCount` integer,
	`prompt` text,
	`questionType` text,
	`promptUrl` text,
	`withAnswer` integer,
	`googleQuizLink` text DEFAULT '',
	`instituteName` text DEFAULT 'Content To Quiz',
	`outputType` text DEFAULT 'question',
	`guidance` text DEFAULT '',
	`summary` text DEFAULT '',
	`googleFormId` text DEFAULT '',
	FOREIGN KEY (`userId`) REFERENCES `userprofile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sharedExams` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`userId` text(36) NOT NULL,
	`questionRecord` text(36) NOT NULL,
	`formId` text,
	`firstName` text,
	`lastName` text,
	`email` text NOT NULL,
	`shareDate` integer DEFAULT '"2025-01-05T01:50:15.211Z"',
	FOREIGN KEY (`userId`) REFERENCES `userprofile`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`questionRecord`) REFERENCES `questionbank`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscription` (
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
	FOREIGN KEY (`userId`) REFERENCES `userprofile`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userprofile` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`firstname` text(255),
	`lastname` text(255),
	`email` text(255) NOT NULL,
	`googleid` text(255),
	`appTheme` text(50),
	`createdAt` integer DEFAULT '"2025-01-05T01:50:15.209Z"'
);
