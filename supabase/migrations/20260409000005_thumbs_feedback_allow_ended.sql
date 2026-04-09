-- Migration: 2026-04-09 thumbs_feedback RLS fix
-- 학생은 세션 종료(ended) 화면에서 피드백을 전송하므로 ended 상태도 허용

DROP POLICY IF EXISTS "thumbs_feedback_anon_insert_active" ON public.thumbs_feedback;

CREATE POLICY "thumbs_feedback_anon_insert"
  ON public.thumbs_feedback FOR INSERT
  TO anon
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE status IN ('active', 'ended')
    )
  );
