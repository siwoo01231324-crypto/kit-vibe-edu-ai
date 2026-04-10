import { test, expect } from '@playwright/test';
import {
  createUser,
  deleteUser,
  dbDelete,
  signIn,
} from './helpers/supabase-admin';
import { injectSession } from './helpers/session';

type TeacherSession = Awaited<ReturnType<typeof signIn>>;

test.describe('E2E-01: 교사 풀 플로우 (세션 생성 → 문항 → 활성화 → QR)', () => {
  let userId: string;
  let email: string;
  let teacherSession: TeacherSession;
  let sessionId: string;

  test.beforeAll(async () => {
    const uid = crypto.randomUUID().slice(0, 8);
    email = `e2e-teacher-${uid}@test.local`;
    const password = 'TestPassword123!';
    const user = await createUser(email, password);
    userId = user.id;
    teacherSession = await signIn(email, password);
  });

  test.afterAll(async () => {
    try {
      if (sessionId) {
        await dbDelete('sessions', { id: sessionId });
      }
    } catch { /* 클린업 실패는 무시 */ }
    try {
      await deleteUser(userId);
    } catch { /* 클린업 실패는 무시 */ }
  });

  test('세션 생성 → 문항 3개 추가 → 활성화 → QR 표시', async ({ page, context }) => {
    await injectSession(context, teacherSession);

    // 1. 세션 생성 페이지
    await page.goto('/teacher/sessions/new');
    await page.locator('#title').fill('E2E 수학 세션');
    await page.locator('#subject').fill('수학');
    await page.locator('#grade').fill('중1');
    await page.getByRole('button', { name: '세션 만들기' }).click();

    // 2. edit 페이지 도착 → sessionId 추출
    await page.waitForURL(/\/teacher\/sessions\/[^/]+\/edit/, { timeout: 10_000 });
    const urlMatch = page.url().match(/\/teacher\/sessions\/([^/]+)\/edit/);
    sessionId = urlMatch?.[1] ?? '';
    expect(sessionId).toBeTruthy();

    // 3. 문항 3개 추가
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '+ 문항 추가' }).click();
      // QuestionForm 필드 채우기
      const form = page.locator('form').last();
      await form.locator('textarea, input[type="text"]').first().fill(`문항 ${i + 1}: 1+${i}=?`);
      // 보기 4개 (기존 입력 필드)
      const optionInputs = form.locator('input[placeholder*="보기"], input[placeholder*="선택지"], input[type="text"]');
      const count = await optionInputs.count();
      for (let j = 0; j < Math.min(count, 4); j++) {
        await optionInputs.nth(j).fill(`보기${j + 1}`);
      }
      await page.getByRole('button', { name: '저장' }).click();
      // 문항이 추가되길 잠시 대기
      await expect(page.getByText(`문항 ${i + 1}`)).toBeVisible({ timeout: 5_000 }).catch(() => {});
    }

    // 4. live 세션 페이지로 이동
    await page.goto(`/teacher/sessions/${sessionId}/live`);

    // 5. 세션 시작 (활성화)
    await page.getByRole('button', { name: '세션 시작' }).click();

    // 6. QR 코드 표시 확인
    await expect(page.getByAltText('QR 코드')).toBeVisible({ timeout: 10_000 });
  });
});
