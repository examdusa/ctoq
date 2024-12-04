ALTER TABLE `questionbank` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2024-12-03T14:39:57.034Z"';--> statement-breakpoint
ALTER TABLE `questionbank` ADD `instituteName` text DEFAULT 'Content To Quiz';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2024-12-03T14:39:57.034Z"';