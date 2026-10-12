CREATE TYPE "public"."publication_status" AS ENUM('published', 'accepted', 'under_review', 'preprint');--> statement-breakpoint
CREATE TABLE "publications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(300) NOT NULL,
	"authors" text NOT NULL,
	"venue" varchar(200),
	"year" integer,
	"status" "publication_status" NOT NULL,
	"url" text,
	"summary" text NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
