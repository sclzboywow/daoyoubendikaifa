CREATE TABLE "wanjiedaoyou_wanxi_npc_relationships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cultivator_id" uuid NOT NULL,
  "npc_role_key" varchar(64) NOT NULL,
  "familiarity" integer DEFAULT 0 NOT NULL,
  "interaction_count" integer DEFAULT 0 NOT NULL,
  "memory_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "milestones" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "last_interaction_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "wanxi_npc_relationships_cultivator_id_cultivators_id_fk"
    FOREIGN KEY ("cultivator_id") REFERENCES "public"."wanjiedaoyou_cultivators"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "wanxi_npc_relationships_cultivator_role_uidx"
  ON "wanjiedaoyou_wanxi_npc_relationships" USING btree ("cultivator_id", "npc_role_key");
--> statement-breakpoint
CREATE INDEX "wanxi_npc_relationships_cultivator_updated_idx"
  ON "wanjiedaoyou_wanxi_npc_relationships" USING btree ("cultivator_id", "updated_at");
--> statement-breakpoint
CREATE TABLE "wanjiedaoyou_wanxi_daily_event_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cultivator_id" uuid NOT NULL,
  "event_date" varchar(10) NOT NULL,
  "event_id" varchar(120) NOT NULL,
  "completed_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "wanxi_daily_event_progress_cultivator_id_cultivators_id_fk"
    FOREIGN KEY ("cultivator_id") REFERENCES "public"."wanjiedaoyou_cultivators"("id")
    ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "wanxi_daily_event_progress_cultivator_date_event_uidx"
  ON "wanjiedaoyou_wanxi_daily_event_progress" USING btree ("cultivator_id", "event_date", "event_id");
--> statement-breakpoint
CREATE INDEX "wanxi_daily_event_progress_cultivator_date_idx"
  ON "wanjiedaoyou_wanxi_daily_event_progress" USING btree ("cultivator_id", "event_date");
