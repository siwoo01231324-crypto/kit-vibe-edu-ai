-- authenticated 역할도 active 세션에 responses INSERT 가능하도록 추가
-- 기존 anon 정책은 유지, authenticated 사용자(교사 로그인 상태의 학생 포함) 대응

CREATE POLICY "responses_auth_insert_active"
  ON public.responses FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE status = 'active'
    )
  );
