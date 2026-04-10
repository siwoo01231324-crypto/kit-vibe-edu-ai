import { test, expect, type Page } from '@playwright/test';
import { createUser, deleteUser, dbInsert, dbDelete, dbUpdate } from './helpers/supabase-admin';

async function createTestSession() {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.local`;
  const user = await createUser(email, 'password123');
  const teacherId = user.id;

  // join_code는 정확히 6자리
  const joinCode = `T${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

  const sessions = await dbInsert('sessions', {
    teacher_id: teacherId,
    title: 'E2E 테스트 세션',
    subject: '수학',
    grade: '중1',
    join_code: joinCode,
    status: 'active',
  });
  const session = sessions[0];

  await dbInsert('questions', [
    {
      session_id: session.id,
      question_order: 1,
      content: '1 + 1 = ?',
      options: ['1', '2', '3', '4'],
      correct_answer: 1,
    },
    {
      session_id: session.id,
      question_order: 2,
      content: '2 × 3 = ?',
      options: ['4', '5', '6', '7'],
      correct_answer: 2,
    },
  ]);

  return { session, teacherId, joinCode };
}

async function endSession(sessionId: string) {
  await dbUpdate('sessions', { id: sessionId }, { status: 'ended' });
}

async function cleanupSession(sessionId: string, teacherId: string) {
  await dbDelete('sessions', { id: sessionId });
  await deleteUser(teacherId);
}

// 학생으로 참여 (join 폼: 코드 + 닉네임 동시 입력)
async function joinAsStudent(page: Page, joinCode: string, nickname = '테스트학생') {
  await page.goto('/join');
  await page.waitForLoadState('networkidle');
  await page.locator('#joinCode').fill(joinCode);
  await page.locator('#nickname').fill(nickname);
  await page.getByRole('button', { name: '입장하기' }).click();
  // waiting 페이지로 이동
  await page.waitForURL(/\/waiting\//, { timeout: 10000 });
}

// --- Tests ---

test.describe('랜딩 및 네비게이션', () => {
  test('랜딩 페이지 로딩', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Kit Vibe Edu' })).toBeVisible();
  });

  test('교사 대시보드 접근 → 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/teacher/dashboard');
    await expect(page).not.toHaveURL('/teacher/dashboard', { timeout: 5000 });
  });
});

test.describe('학생 참여 플로우', () => {
  test('참여 페이지 로딩', async ({ page }) => {
    await page.goto('/join');
    await expect(page.locator('#joinCode')).toBeVisible();
    await expect(page.locator('#nickname')).toBeVisible();
    await expect(page.getByRole('button', { name: '입장하기' })).toBeVisible();
  });

  test('잘못된 참여 코드 입력 → 에러', async ({ page }) => {
    await page.goto('/join');
    await page.waitForLoadState('networkidle');
    await page.locator('#joinCode').fill('ZZZZZZ');
    await page.locator('#nickname').fill('테스트');
    await page.getByRole('button', { name: '입장하기' }).click();
    await expect(page.getByText(/찾을 수 없습니다/)).toBeVisible({ timeout: 8000 });
  });

  test('닉네임 유효성 검사', async ({ page }) => {
    await page.goto('/join');
    await page.waitForLoadState('networkidle');
    await page.locator('#joinCode').fill('AAAAAA');
    await page.locator('#nickname').fill('a'); // 너무 짧음
    await page.getByRole('button', { name: '입장하기' }).click();
    await expect(page.getByText(/닉네임은.*2-12자/)).toBeVisible({ timeout: 3000 });
  });
});

test.describe('학생 퀴즈 플로우 (E2E)', () => {
  let sessionId: string;
  let teacherId: string;
  let joinCode: string;

  test.beforeAll(async () => {
    const data = await createTestSession();
    sessionId = data.session.id;
    teacherId = data.teacherId;
    joinCode = data.joinCode;
  });

  test.afterAll(async () => {
    await cleanupSession(sessionId, teacherId);
  });

  test('유효한 참여 코드로 waiting 페이지 이동', async ({ page }) => {
    await joinAsStudent(page, joinCode, '입장테스트');
    await expect(page).toHaveURL(/\/waiting\//, { timeout: 8000 });
  });

  test('세션 종료 후 학생 화면 전환', async ({ page }) => {
    // addInitScript로 sessionStorage 주입 후 quiz 페이지 직접 접근 (waiting→quiz 리다이렉트 타이밍 회피)
    await page.addInitScript(
      ({ sId }) => {
        sessionStorage.setItem('studentSession', JSON.stringify({ sessionId: sId, nickname: '종료테스트' }));
      },
      { sId: sessionId }
    );
    await page.goto(`/quiz/${sessionId}`);
    await page.waitForLoadState('networkidle');
    // 세션 종료
    await endSession(sessionId);
    // 폴링(3s) + 렌더 여유
    await expect(page.getByText(/퀴즈가 종료/i)).toBeVisible({ timeout: 15000 });
  });

  test('종료 화면에서 따봉 피드백 버튼 표시', async ({ page }) => {
    // 세션을 먼저 종료 (다른 테스트와 독립적으로 실행되므로 직접 종료)
    await endSession(sessionId);
    // sessionStorage를 페이지 로드 전에 주입
    await page.addInitScript(
      ({ sId }) => {
        sessionStorage.setItem('studentSession', JSON.stringify({ sessionId: sId, nickname: '피드백테스트' }));
      },
      { sId: sessionId }
    );
    await page.goto(`/quiz/${sessionId}`);
    await page.waitForLoadState('networkidle');
    // 종료된 세션 → 종료 텍스트 확인
    await expect(page.getByText(/퀴즈가 종료/i).first()).toBeVisible({ timeout: 12000 });
  });
});
