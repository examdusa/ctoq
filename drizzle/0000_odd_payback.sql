CREATE TABLE `questionbank` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT '"2024-11-03T17:23:13.895Z"',
	`userId` text(36) NOT NULL,
	`jobId` text(255),
	`questions` text,
	`difficultyLevel` text,
	`questionsCount` integer,
	`prompt` text,
	`questionType` text,
	`promptUrl` text,
	`withAnswer` integer,
	FOREIGN KEY (`userId`) REFERENCES `userprofile`(`id`) ON UPDATE no action ON DELETE no action
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
	`createdAt` integer DEFAULT '"2024-11-03T17:23:13.895Z"'
);
