ALTER TABLE `questionbank` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2024-11-04T09:25:33.785Z"';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2024-11-04T09:25:33.785Z"';--> statement-breakpoint
ALTER TABLE `subscription` ADD `customerId` text;