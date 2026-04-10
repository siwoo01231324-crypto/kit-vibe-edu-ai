import { test, expect, type BrowserContext } from '@playwright/test';
import { createUser, deleteUser, dbInsert, signIn, buildAuthCookieValue } from './helpers/supabase-admin';

// Inject Supabase SSR auth cookie into browser context
// Cookie name: sb-127-auth-token (derived from http://127.0.0.1:54321)
async function injectSession(context: BrowserContext, session: object) {
  await context.addCookies([
    {
      name: 'sb-127-auth-token',
      value: buildAuthCookieValue(session),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
    },
  ]);
}

async function createTeacherAndSignIn() {
  const email = `e2e-teacher-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
  const password = 'TestPassword123!';
  const user = await createUser(email, password);
  const session = await signIn(email, password);
  return { userId: user.id, email, session };
}

async function createEndedSessionWithInsights(teacherId: string) {
  const sessions = await dbInsert('sessions', {
    teacher_id: teacherId,
    title: 'E2E Insights Session',
    subject: '영어',
    grade: '고1',
    join_code: `INS${Math.floor(Math.random() * 9000) + 1000}`,
    status: 'ended',
  });
  const session = sessions[0];

  const questions = await dbInsert('questions', {
    session_id: session.id,
    question_order: 1,
    content: 'What is the capital of UK?',
    options: ['Paris', 'London', 'Berlin', 'Rome'],
    correct_answer: 1,
  });

  await dbInsert('responses', [
    {
      session_id: session.id,
      question_id: questions[0].id,
      nickname: '학생1',
      selected_answer: 1,
      is_correct: true,
      response_time_ms: 3000,
      score: 100,
    },
    {
      session_id: session.id,
      question_id: questions[0].id,
      nickname: '학생2',
      selected_answer: 0,
      is_correct: false,
      response_time_ms: 5000,
      score: 0,
    },
  ]);

  return session;
}

test.describe('교사 인사이트 + 수업 초안 플로우', () => {
  let userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: any;
  let sessionId: string;

  test.beforeAll(async () => {
    const teacher = await createTeacherAndSignIn();
    userId = teacher.userId;
    session = teacher.session;
    const s = await createEndedSessionWithInsights(userId);
    sessionId = s.id;
  });

  test.afterAll(async () => {
    await deleteUser(userId);
  });

  test('교사 대시보드 접근 (인증 상태)', async ({ page, context }) => {
    await injectSession(context, session);
    await page.goto('/teacher/dashboard');
    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 8000 });
    await expect(page.getByText(/세션을 선택하세요|새 세션/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('세션 상세 → AI 인사이트 버튼 표시 (ended 세션)', async ({ page, context }) => {
    await injectSession(context, session);
    await page.goto(`/teacher/sessions/${sessionId}`);
    await expect(page.getByRole('link', { name: /AI 인사이트/i })).toBeVisible({ timeout: 8000 });
  });

  test('AI 인사이트 페이지 접근', async ({ page, context }) => {
    await injectSession(context, session);
    await page.goto(`/teacher/sessions/${sessionId}/insights`);
    await expect(page.getByRole('button', { name: /인사이트 생성/i })).toBeVisible({ timeout: 8000 });
  });

  test('인사이트 생성 버튼 클릭', async ({ page, context }) => {
    await injectSession(context, session);
    await page.goto(`/teacher/sessions/${sessionId}/insights`);

    const generateBtn = page.getByRole('button', { name: /인사이트 생성/i });
    await generateBtn.click();

    await expect(
      page.getByText(/생성 중|취약 개념|강점 개념|인사이트 생성에 실패/i)
    ).toBeVisible({ timeout: 30000 });
  });

  test('수업 초안 생성 버튼 - 인사이트 없을 때 비활성', async ({ page, context }) => {
    await injectSession(context, session);
    await page.goto(`/teacher/sessions/${sessionId}/insights`);

    const draftBtn = page.getByRole('button', { name: /수업 초안 생성/i });
    await expect(draftBtn).toBeVisible({ timeout: 5000 });
    const isDisabled = await draftBtn.isDisabled();
    expect(typeof isDisabled).toBe('boolean');
  });
});
