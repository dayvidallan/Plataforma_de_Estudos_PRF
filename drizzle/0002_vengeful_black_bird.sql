CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missionId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `attachments` ADD `missionId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `attachments` DROP COLUMN `roundId`;