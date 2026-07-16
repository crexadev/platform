CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username"),
	CONSTRAINT "profiles_username_format_check" CHECK ("profiles"."username" ~ '^[a-z0-9_]{3,30}$'),
	CONSTRAINT "profiles_display_name_length_check" CHECK (char_length("profiles"."display_name") BETWEEN 1 AND 50),
	CONSTRAINT "profiles_bio_length_check" CHECK ("profiles"."bio" IS NULL OR char_length("profiles"."bio") <= 160)
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;