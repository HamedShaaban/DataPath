CREATE TABLE "aiBudgets" (
	"month" varchar(7) PRIMARY KEY NOT NULL,
	"spentMicros" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiRequests" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"month" varchar(7) NOT NULL,
	"model" varchar(200) NOT NULL,
	"reservedMicros" bigint NOT NULL,
	"chargedMicros" bigint,
	"status" varchar(20) DEFAULT 'reserved' NOT NULL,
	"promptTokens" integer,
	"completionTokens" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aiRequests" ADD CONSTRAINT "aiRequests_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_requests_user_time_idx" ON "aiRequests" USING btree ("userId","createdAt");