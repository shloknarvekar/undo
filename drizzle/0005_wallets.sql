CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"shopper_key" text NOT NULL,
	"setup_token_id" text NOT NULL,
	"vault_id" text,
	"customer_id" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"return_to" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_setup_token_id_unique" UNIQUE("setup_token_id")
);
--> statement-breakpoint
CREATE INDEX "wallets_shopper_key_idx" ON "wallets" USING btree ("shopper_key");