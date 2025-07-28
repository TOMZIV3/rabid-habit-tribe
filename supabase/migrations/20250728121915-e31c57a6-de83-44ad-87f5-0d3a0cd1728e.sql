-- Clean existing database by truncating all tables and clearing auth users

-- First, truncate tables with foreign key dependencies in correct order
TRUNCATE TABLE public.habit_completions CASCADE;
TRUNCATE TABLE public.habit_memberships CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.nudges CASCADE;
TRUNCATE TABLE public.habits CASCADE;
TRUNCATE TABLE public.room_members CASCADE;
TRUNCATE TABLE public.pending_invites CASCADE;
TRUNCATE TABLE public.email_logs CASCADE;
TRUNCATE TABLE public.rooms CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.notification_settings CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;

-- Clear authentication users (this will cascade to any remaining references)
DELETE FROM auth.users;

-- Reset any sequences that might have been incremented
-- (Note: UUID primary keys don't use sequences, but this is for completeness)
SELECT setval(pg_get_serial_sequence(schemaname||'.'||tablename, columnname), 1, false)
FROM (
  SELECT schemaname, tablename, columnname
  FROM pg_tables t
  JOIN information_schema.columns c ON c.table_name = t.tablename
  WHERE t.schemaname = 'public'
    AND c.column_default LIKE 'nextval%'
) AS reset_sequences;