-- Enable pg_cron extension if not already enabled
-- Note: This needs to be run by Supabase admin or enabled in dashboard
-- Go to Database > Extensions > Enable pg_cron

-- Create a scheduled job to sync GitHub repos daily at 6 AM UTC
-- This calls the github-sync edge function automatically

-- First, create a function to call the edge function
CREATE OR REPLACE FUNCTION public.trigger_github_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    response json;
BEGIN
    -- Log the sync attempt
    INSERT INTO sync_logs (sync_type, status, trigger_type, metadata)
    VALUES ('github', 'started', 'scheduled', '{"scheduled": true}'::jsonb);
    
    -- The actual sync will be triggered by calling the edge function
    -- This is done via pg_net extension
    PERFORM net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/github-sync',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
END;
$$;

-- Schedule the job to run daily at 6 AM UTC (11:30 AM IST)
-- Uncomment and run this in Supabase SQL Editor after enabling pg_cron:
-- SELECT cron.schedule(
--     'daily-github-sync',           -- job name
--     '0 6 * * *',                   -- cron expression: 6 AM UTC daily
--     $$SELECT public.trigger_github_sync()$$
-- );

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To remove a scheduled job:
-- SELECT cron.unschedule('daily-github-sync');

-- Alternative: Use Supabase Dashboard
-- 1. Go to Database > Extensions > Enable pg_cron
-- 2. Go to Database > Webhooks/Cron
-- 3. Create new cron job with schedule "0 6 * * *"
-- 4. Point to: /functions/v1/github-sync
