CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
