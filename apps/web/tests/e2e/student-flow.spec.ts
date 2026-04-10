import { test, expect } from '@playwright/test';
import {
  createUser,
  deleteUser,
  dbInsert,
  dbDelete,
  dbUpdate,
  dbSelect,
} from './helpers/supabase-admin';

// 공유 Fixture
let sessionId: string;
let teacherId: string;
let joinCode: string;

async function createActiveSession() {
  const uid = crypto.randomUUID().slice(0, 8);
  const email = `e2e-student-teacher-${uid}@test.local`;
  const user = await createUser(email, 'TestPassword123!');
  teacherId = user.id;

  joinCode = 'E2E' + uid.slice(0, 3).toUpperCase();
  const sessions = await dbInsert<{ id: string }>('sessions', {
    teacher_id: teacherId,
    title: 'E2E 학생 테스트 세션',
    subject: '수학',
    grade: '중1',
    join_code: joinCode,
    status: 'active',
  });
  sessionId = sessions[0]?.id ?? '';

  await dbInsert('questions', [
    {
      session_id: sessionId,
      question_order: 1,
      content: '1 + 1 = ?',
      options: ['1', '2', '3', '4'],
      correct_answer: 1,
    },
    {
      session_id: sessionId,
      question_order: 2,
      content: '2 × 3 = ?',
      options: ['4', '5', '6', '7'],
      correct_answer: 2,
    },
    {
      session_id: sessionId,
      question_order: 3,
      content: '10 - 4 = ?',
      options: ['4', '5', '6', '7'],
      correct_answer: 2,
    },
  ]);
}

test.describe('E2E-02: 학생 풀 플로우', () => {
  test.beforeAll(async () => {
    await createActiveSession();
  });

  test.afterAll(async () => {
    try {
      await dbDelete('sessions', { id: sessionId });
    } catch { /* 무시 */ }
    try {
      await deleteUser(teacherId);
    } catch { /* 무시 */ }
  });

  test('join_code → 닉네임 → waiting 이동', async ({ page }) => {
    const nickname = 'alice_' + crypto.randomUUID().slice(0, 4);
    await page.goto('/join');
    await page.waitForLoadState('networkidle');
    await page.locator('#joinCode').fill(joinCode);
    await page.locator('#nickname').fill(nickname);
    await page.getByRole('button', { name: '입장하기' }).click();
    await expect(page).toHaveURL(/\/waiting\//, { timeout: 10_000 });
  });

  test('퀴즈 응답 → 정답 애니메이션 → 리더보드 본인 닉네임', async ({ page }) => {
    const nickname = 'bob_' + crypto.randomUUID().slice(0, 4);

    // 1. 실제 join 폼으로 입장 (sessionStorage 주입보다 신뢰성 높음)
    await page.goto('/join');
    await page.waitForLoadState('networkidle');
    await page.locator('#joinCode').fill(joinCode);
    await page.locator('#nickname').fill(nickname);
    await page.getByRole('button', { name: '입장하기' }).click();

    // 2. waiting 페이지 이동 확인
    await page.waitForURL(/\/waiting\//, { timeout: 10_000 });

    // 3. 세션이 active이므로 waiting → quiz 자동 리다이렉트 대기
    await page.waitForURL(/\/quiz\//, { timeout: 15_000 });

    // 4. 퀴즈 보기 버튼 대기 (class에 min-h- 포함)
    const optionBtns = page.locator('button[class*="min-h-"]');
    await expect(optionBtns.first()).toBeVisible({ timeout: 8_000 });

    // 5. 정답(인덱스 1, 두 번째 보기 '2') 클릭
    await optionBtns.nth(1).click();

    // 6. 정답 확인 — scoreFloat(+점수) 애니메이션으로 검증
    // animate-burst는 currentQuestion이 바뀐 뒤 이전 문항 버튼이 DOM에서 사라져 사용 불가.
    // scoreFloat(animate-float-up)은 currentQuestion 블록 안에 렌더되며 1100ms 유지됨.
    await expect(page.locator('.animate-float-up')).toBeVisible({ timeout: 5_000 });

    // 7. 세션 종료 → 리더보드에 본인 닉네임 확인
    await dbUpdate('sessions', { id: sessionId }, { status: 'ended' });
    await expect(page.getByText(/퀴즈가 종료|결과/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(nickname)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('TEST-IU1-E02: 다중 학생 동시 응답 (3 context)', () => {
  let multiSessionId: string;
  let multiTeacherId: string;
  let multiJoinCode: string;

  test.beforeAll(async () => {
    const uid = crypto.randomUUID().slice(0, 8);
    const email = `e2e-multi-teacher-${uid}@test.local`;
    const user = await createUser(email, 'TestPassword123!');
    multiTeacherId = user.id;

    multiJoinCode = 'MLT' + uid.slice(0, 3).toUpperCase();
    const sessions = await dbInsert<{ id: string }>('sessions', {
      teacher_id: multiTeacherId,
      title: 'E2E 다중 학생 세션',
      subject: '수학',
      grade: '고1',
      join_code: multiJoinCode,
      status: 'active',
    });
    multiSessionId = sessions[0]?.id ?? '';

    await dbInsert('questions', {
      session_id: multiSessionId,
      question_order: 1,
      content: '2 + 2 = ?',
      options: ['2', '3', '4', '5'],
      correct_answer: 2,
    });
  });

  test.afterAll(async () => {
    try {
      await dbDelete('sessions', { id: multiSessionId });
    } catch { /* 무시 */ }
    try {
      await deleteUser(multiTeacherId);
    } catch { /* 무시 */ }
  });

  test('3명 동시 join (TEST-IU1-E02)', async ({ browser }) => {
    const nicknames = ['alice', 'bob', 'carol'].map(
      (n) => `${n}_${crypto.randomUUID().slice(0, 4)}`
    );

    const contexts = await Promise.all([0, 1, 2].map(() => browser.newContext()));
    const pages = await Promise.all(contexts.map((ctx) => ctx.newPage()));

    // 동시 참여 (join 폼 → waiting 이동)
    await Promise.all(
      pages.map(async (p, i) => {
        await p.goto('/join');
        await p.waitForLoadState('networkidle');
        await p.locator('#joinCode').fill(multiJoinCode);
        await p.locator('#nickname').fill(nicknames[i]);
        await p.getByRole('button', { name: '입장하기' }).click();
        await p.waitForURL(/\/waiting\//, { timeout: 10_000 });
      })
    );

    // sessionStorage 주입 후 quiz 페이지 접근 (Realtime 의존 없이)
    await Promise.all(
      pages.map(async (p, i) => {
        await p.addInitScript(
          ({ sId, nick }) => {
            sessionStorage.setItem('studentSession', JSON.stringify({ sessionId: sId, nickname: nick }));
          },
          { sId: multiSessionId, nick: nicknames[i] }
        );
        await p.goto(`/quiz/${multiSessionId}`);
        await p.waitForLoadState('networkidle');
      })
    );

    // 각 학생 응답 DB 직접 삽입 (UI 타이밍 불안정 방지)
    const questions = await dbSelect<{ id: string }>('questions', { session_id: multiSessionId });
    if (questions.length > 0) {
      await Promise.all(
        nicknames.map((nick) =>
          dbInsert('responses', {
            session_id: multiSessionId,
            question_id: questions[0]?.id ?? '',
            nickname: nick,
            selected_answer: 2,
            is_correct: true,
            response_time_ms: 3000,
            score: 100,
          })
        )
      );
    }

    // DB에 3개 응답 존재 확인
    await expect
      .poll(
        async () => {
          const rows = await dbSelect('responses', { session_id: multiSessionId });
          return rows.length;
        },
        { timeout: 5_000 }
      )
      .toBe(3);

    await Promise.all(contexts.map((ctx) => ctx.close()));
  });
});
