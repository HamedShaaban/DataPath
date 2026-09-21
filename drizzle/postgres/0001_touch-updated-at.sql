-- Preserve MySQL ON UPDATE timestamps, including updates outside Drizzle.
-- Explicit timestamps remain intact for historical data imports.
CREATE FUNCTION datapath_touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW IS DISTINCT FROM OLD AND NEW."updatedAt" IS NOT DISTINCT FROM OLD."updatedAt" THEN
    NEW."updatedAt" = clock_timestamp();
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER users_touch_updated_at BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION datapath_touch_updated_at();
--> statement-breakpoint
CREATE TRIGGER workspaces_touch_updated_at BEFORE UPDATE ON "workspaces"
FOR EACH ROW EXECUTE FUNCTION datapath_touch_updated_at();
--> statement-breakpoint
CREATE TRIGGER interview_questions_touch_updated_at BEFORE UPDATE ON "interviewQuestions"
FOR EACH ROW EXECUTE FUNCTION datapath_touch_updated_at();
--> statement-breakpoint
CREATE TRIGGER learning_states_touch_updated_at BEFORE UPDATE ON "learningStates"
FOR EACH ROW EXECUTE FUNCTION datapath_touch_updated_at();
