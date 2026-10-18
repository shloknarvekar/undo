CREATE TABLE "mandate_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"request" text NOT NULL,
	"draft" jsonb NOT NULL,
	"agent" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"mandate_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mandate_requests" ADD CONSTRAINT "mandate_requests_mandate_id_mandates_id_fk" FOREIGN KEY ("mandate_id") REFERENCES "public"."mandates"("id") ON DELETE no action ON UPDATE no action;