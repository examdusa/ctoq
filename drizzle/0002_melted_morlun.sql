ALTER TABLE `questionbank` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2024-11-29T03:56:37.776Z"';--> statement-breakpoint
ALTER TABLE `questionbank` ADD `googleQuizLink` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `userprofile` ALTER COLUMN "createdAt" TO "createdAt" integer DEFAULT '"2024-11-29T03:56:37.776Z"';