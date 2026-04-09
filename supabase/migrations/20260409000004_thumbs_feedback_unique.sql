-- Migration: 2026-04-09 thumbs_feedback unique constraint
-- Adds unique(session_id, nickname) to prevent duplicate submissions per student per session

ALTER TABLE public.thumbs_feedback
  ADD CONSTRAINT thumbs_feedback_unique_per_session
  UNIQUE (session_id, nickname);
