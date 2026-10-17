CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mandate_id" uuid NOT NULL,
	"status" text NOT NULL,
	"paypal_order_id" text,
	"authorization_id" text,
	"capture_id" text,
	"amount" text NOT NULL,
	"currency" text NOT NULL,
	"quantity" integer NOT NULL,
	"product" jsonb NOT NULL,
	"agent" jsonb NOT NULL,
	"risk" jsonb,
	"window_ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_paypal_order_id_unique" UNIQUE("paypal_order_id")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_mandate_id_mandates_id_fk" FOREIGN KEY ("mandate_id") REFERENCES "public"."mandates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_mandate_idx" ON "orders" USING btree ("mandate_id");--> statement-breakpoint
CREATE INDEX "orders_status_window_idx" ON "orders" USING btree ("status","window_ends_at");