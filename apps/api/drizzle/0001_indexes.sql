CREATE INDEX `messages_inbox_idx` ON `messages` (`is_read`,`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `messages_created_idx` ON `messages` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `projects_public_list_idx` ON `projects` (`published`,`featured`,`sort_order`,`created_at`);