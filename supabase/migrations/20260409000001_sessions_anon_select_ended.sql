-- 학생(anon)이 ended 세션도 SELECT 가능하도록 정책 수정
-- draft는 여전히 비공개, active/ended만 허용
-- 이유: Realtime UPDATE 이벤트는 새 row가 anon에게 보여야 전달됨
--       ended로 바뀐 세션이 anon에게 안 보이면 종료 이벤트 미수신

DROP POLICY IF EXISTS "sessions_anon_select_active" ON public.sessions;

CREATE POLICY "sessions_anon_select_active_or_ended"
  ON public.sessions FOR SELECT
  TO anon
  USING (status IN ('active', 'ended'));
