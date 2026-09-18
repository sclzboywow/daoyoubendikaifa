CREATE TABLE "wanjiedaoyou_wanxi_scene_editor_states" (
  "scene_id" varchar(64) PRIMARY KEY NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_by_user_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
