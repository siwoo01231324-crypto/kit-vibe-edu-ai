import type { BrowserContext } from '@playwright/test';
import { buildAuthCookieValue } from './supabase-admin';

/**
 * 테스트 브라우저 컨텍스트에 Supabase SSR 세션 쿠키를 주입한다.
 */
export async function injectSession(context: BrowserContext, session: object): Promise<void> {
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
