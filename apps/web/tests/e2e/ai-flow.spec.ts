import { test, expect } from '@playwright/test';
import {
  createUser,
  deleteUser,
  dbInsert,
  dbDelete,
  signIn,
} from './helpers/supabase-admin';
import { injectSession } from './helpers/session';

type TeacherSession = Awaited<ReturnType<typeof signIn>>;

test.describe('E2E-03: AI 플로우 (MOCK_CLAUDE=1)', () => {
  let userId: string;
  let teacherSession: TeacherSession;
  let sessionId: string;

  test.beforeAll(async () => {
    const uid = crypto.randomUUID().slice(0, 8);
    const email = `e2e-ai-teacher-${uid}@test.local`;
    const user = await createUser(email, 'TestPassword123!');
    userId = user.id;
    teacherSession = await signIn(email, 'TestPassword123!');

    // 종료된 세션 + 문항 + 오답 응답 seed
    const sessions = await dbInsert<{ id: string }>('sessions', {
      teacher_id: userId,
      title: 'AI 플로우 E2E 세션',
      subject: '수학',
      grade: '중2',
      join_code: 'AI' + uid.slice(0, 4).toUpperCase(),
      status: 'ended',
    });
    sessionId = sessions[0]?.id ?? '';

    const questions = await dbInsert<{ id: string }>('questions', {
      session_id: sessionId,
      question_order: 1,
      content: '분수 연산: 1/2 + 1/3 = ?',
      options: ['1/5', '5/6', '2/5', '2/6'],
      correct_answer: 1,
    });

    const questionId = questions[0]?.id ?? '';
    // 오답 응답 2개 (취약 개념 필요)
    await dbInsert('responses', [
      {
        session_id: sessionId,
        question_id: questionId,
        nickname: '학생A',
        selected_answer: 0,
        is_correct: false,
        response_time_ms: 5000,
        score: 0,
      },
      {
        session_id: sessionId,
        question_id: questionId,
        nickname: '학생B',
        selected_answer: 2,
        is_correct: false,
        response_time_ms: 4000,
        score: 0,
      },
    ]);
  });

  test.afterAll(async () => {
    try {
      await dbDelete('sessions', { id: sessionId });
    } catch { /* 무시 */ }
    try {
      await deleteUser(userId);
    } catch { /* 무시 */ }
  });

  test('인사이트 생성 → 취약 개념 카드 렌더링', async ({ page, context }) => {
    await injectSession(context, teacherSession);
    await page.goto(`/teacher/sessions/${sessionId}/insights`);

    // 인사이트 생성 버튼 클릭
    await page.getByRole('button', { name: /인사이트 생성/i }).click();

    // API 응답 대기
    await page.waitForResponse(
      (res) => res.url().includes('/api/insights/generate') && res.status() === 200,
      { timeout: 15_000 }
    );

    // 취약 개념 heading 확인
    await expect(page.getByRole('heading', { name: '취약 개념' })).toBeVisible({ timeout: 8_000 });

    // mock fixture 고정값 확인 (분수 연산 — exact match로 strict mode 오류 방지)
    await expect(page.getByText('분수 연산', { exact: true })).toBeVisible({ timeout: 5_000 });
  });

  test('수업 초안 생성 → 마크다운 표시', async ({ page, context }) => {
    await injectSession(context, teacherSession);
    await page.goto(`/teacher/sessions/${sessionId}/insights`);

    // 인사이트 먼저 생성 (초안 버튼 활성화를 위해)
    await page.getByRole('button', { name: /인사이트 생성/i }).click();
    await page.waitForResponse(
      (res) => res.url().includes('/api/insights/generate') && res.status() === 200,
      { timeout: 15_000 }
    );
    await expect(page.getByRole('heading', { name: '취약 개념' })).toBeVisible({ timeout: 8_000 });

    // 수업 초안 생성 버튼 클릭
    const draftBtn = page.getByRole('button', { name: /수업 초안 생성/i });
    await expect(draftBtn).toBeEnabled({ timeout: 5_000 });
    await draftBtn.click();

    // 초안 API 응답 대기
    await page.waitForResponse(
      (res) => res.url().includes('/api/class-draft') && res.status() === 200,
      { timeout: 15_000 }
    );

    // 마크다운 렌더 확인 — heading role로 strict mode 오류 방지
    await expect(page.getByRole('heading', { name: '수업 초안' })).toBeVisible({ timeout: 8_000 });
  });
});
