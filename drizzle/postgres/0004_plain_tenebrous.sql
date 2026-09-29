CREATE TABLE "verifiedCredentials" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"refId" varchar(180) NOT NULL,
	"verifiedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"evidenceHash" varchar(64) NOT NULL,
	"serverScore" jsonb NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	CONSTRAINT "verified_credentials_type_check" CHECK ("verifiedCredentials"."type" in ('skill_cert', 'lab_pass', 'project'))
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "publicHandle" varchar(48);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "proofPageEnabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "verifiedCredentials" ADD CONSTRAINT "verifiedCredentials_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "verified_credentials_user_idx" ON "verifiedCredentials" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "verified_credentials_user_type_ref_idx" ON "verifiedCredentials" USING btree ("userId","type","refId");--> statement-breakpoint
CREATE UNIQUE INDEX "users_public_handle_idx" ON "users" USING btree ("publicHandle");