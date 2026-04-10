UPDATE public.teachers SET school = '서울시 강남구 OO초등학교' WHERE id = 'af8359fa-31a7-44ae-a6c9-1c27716260b8';

INSERT INTO public.sessions (teacher_id, title, subject, grade, join_code, status, started_at)
VALUES ('af8359fa-31a7-44ae-a6c9-1c27716260b8', '분수의 덧셈과 뺄셈 퀴즈', '수학', '4학년', 'DEMO-001', 'active', now())
ON CONFLICT (join_code) DO NOTHING;

DELETE FROM public.questions WHERE session_id = (SELECT id FROM public.sessions WHERE join_code = 'DEMO-001');

INSERT INTO public.questions (session_id, content, options, correct_answer, question_order)
VALUES
((SELECT id FROM public.sessions WHERE join_code='DEMO-001'), '1/2 + 1/4 를 계산하면?', jsonb_build_array('1/6','3/4','2/4','5/6'), 1, 1),
((SELECT id FROM public.sessions WHERE join_code='DEMO-001'), '3/4 - 1/4 를 계산하면?', jsonb_build_array('2/4','4/8','1/2','2/8'), 2, 2),
((SELECT id FROM public.sessions WHERE join_code='DEMO-001'), '2/5 + 2/5 를 계산하면?', jsonb_build_array('4/10','4/5','2/5','1/5'), 1, 3),
((SELECT id FROM public.sessions WHERE join_code='DEMO-001'), '분모가 같은 분수의 덧셈을 할 때 더하는 것은?', jsonb_build_array('분모','분자','분모와 분자 모두','아무것도 더하지 않음'), 1, 4),
((SELECT id FROM public.sessions WHERE join_code='DEMO-001'), '5/6 - 1/6 를 계산하면?', jsonb_build_array('4/0','4/12','4/6','6/6'), 2, 5);

DELETE FROM public.responses WHERE session_id = (SELECT id FROM public.sessions WHERE join_code = 'DEMO-001');

INSERT INTO public.responses (session_id, question_id, nickname, selected_answer, is_correct, response_time_ms, score)
SELECT s.id, q.id, '지민', r.sel, r.sel=q.correct_answer, r.ms, CASE WHEN r.sel=q.correct_answer THEN 100 ELSE 0 END
FROM public.sessions s JOIN public.questions q ON q.session_id=s.id
JOIN (VALUES (1,1,2100),(2,2,1800),(3,1,2400),(4,1,1500),(5,2,2200)) AS r(qo,sel,ms) ON r.qo=q.question_order
WHERE s.join_code='DEMO-001';

INSERT INTO public.responses (session_id, question_id, nickname, selected_answer, is_correct, response_time_ms, score)
SELECT s.id, q.id, '서연', r.sel, r.sel=q.correct_answer, r.ms, CASE WHEN r.sel=q.correct_answer THEN 100 ELSE 0 END
FROM public.sessions s JOIN public.questions q ON q.session_id=s.id
JOIN (VALUES (1,1,3200),(2,2,2900),(3,0,4100),(4,1,2300),(5,2,3500)) AS r(qo,sel,ms) ON r.qo=q.question_order
WHERE s.join_code='DEMO-001';

INSERT INTO public.responses (session_id, question_id, nickname, selected_answer, is_correct, response_time_ms, score)
SELECT s.id, q.id, '민준', r.sel, r.sel=q.correct_answer, r.ms, CASE WHEN r.sel=q.correct_answer THEN 100 ELSE 0 END
FROM public.sessions s JOIN public.questions q ON q.session_id=s.id
JOIN (VALUES (1,1,4500),(2,2,3800),(3,0,5200),(4,0,6100),(5,2,4800)) AS r(qo,sel,ms) ON r.qo=q.question_order
WHERE s.join_code='DEMO-001';

INSERT INTO public.responses (session_id, question_id, nickname, selected_answer, is_correct, response_time_ms, score)
SELECT s.id, q.id, '하윤', r.sel, r.sel=q.correct_answer, r.ms, CASE WHEN r.sel=q.correct_answer THEN 100 ELSE 0 END
FROM public.sessions s JOIN public.questions q ON q.session_id=s.id
JOIN (VALUES (1,2,5800),(2,2,4200),(3,1,3900),(4,1,3100),(5,0,7200)) AS r(qo,sel,ms) ON r.qo=q.question_order
WHERE s.join_code='DEMO-001';

INSERT INTO public.responses (session_id, question_id, nickname, selected_answer, is_correct, response_time_ms, score)
SELECT s.id, q.id, '도현', r.sel, r.sel=q.correct_answer, r.ms, CASE WHEN r.sel=q.correct_answer THEN 100 ELSE 0 END
FROM public.sessions s JOIN public.questions q ON q.session_id=s.id
JOIN (VALUES (1,1,7800),(2,0,8000),(3,1,6500),(4,2,7100),(5,3,7600)) AS r(qo,sel,ms) ON r.qo=q.question_order
WHERE s.join_code='DEMO-001';

SELECT '세션' AS 항목, count(*)::text AS 개수 FROM public.sessions WHERE join_code='DEMO-001'
UNION ALL SELECT '문항', count(*)::text FROM public.questions WHERE session_id=(SELECT id FROM public.sessions WHERE join_code='DEMO-001')
UNION ALL SELECT '응답', count(*)::text FROM public.responses WHERE session_id=(SELECT id FROM public.sessions WHERE join_code='DEMO-001');
