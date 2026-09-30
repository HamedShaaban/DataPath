CREATE TABLE "rateLimitBuckets" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limit_expiry_idx" ON "rateLimitBuckets" USING btree ("expiresAt");