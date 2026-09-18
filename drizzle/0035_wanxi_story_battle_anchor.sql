ALTER TABLE "wanjiedaoyou_wanxi_story_progress"
ADD COLUMN "state" jsonb DEFAULT '{}'::jsonb NOT NULL;
