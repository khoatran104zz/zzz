-- TaskFlow Migration V34: Add workspace association, meeting link, and reminder tracking to calendar events
-- Target Domain: Calendar / Meeting Management

ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(500);
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_calendar_events_workspace'
    ) THEN
        ALTER TABLE calendar_events
            ADD CONSTRAINT fk_calendar_events_workspace
            FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendar_events_workspace_id ON calendar_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_reminder_sent ON calendar_events(reminder_sent, start_time);
