CREATE TABLE "wanjiedaoyou_wanxi_story_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cultivator_id" uuid NOT NULL,
  "story_id" varchar(100) NOT NULL,
  "stage" varchar(64) NOT NULL,
  "schema_version" integer DEFAULT 1 NOT NULL,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "wanxi_story_progress_cultivator_id_cultivators_id_fk"
    FOREIGN KEY ("cultivator_id") REFERENCES "public"."wanjiedaoyou_cultivators"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "wanxi_story_progress_cultivator_story_uidx"
  ON "wanjiedaoyou_wanxi_story_progress" USING btree ("cultivator_id", "story_id");
--> statement-breakpoint
CREATE INDEX "wanxi_story_progress_story_stage_idx"
  ON "wanjiedaoyou_wanxi_story_progress" USING btree ("story_id", "stage");
