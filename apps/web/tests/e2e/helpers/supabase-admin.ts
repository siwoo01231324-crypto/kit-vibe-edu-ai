/**
 * Playwright E2E 테스트용 Supabase Admin 헬퍼
 * fetch 직접 사용 (모듈 호환성 이슈 방지)
 */

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
export const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const headers = (key = SERVICE_KEY) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${key}`,
  apikey: key,
});

export async function createUser(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`createUser failed: ${JSON.stringify(data)}`);
  return data as { id: string; email: string };
}

export async function deleteUser(userId: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: headers(),
  });
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: headers(ANON_KEY),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`signIn failed: ${JSON.stringify(data)}`);
  return data as {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number;
    user: Record<string, unknown>;
  };
}

/**
 * Supabase SSR 쿠키 값 생성 (base64url-encoded session JSON)
 * 쿠키명: sb-127-auth-token
 */
export function buildAuthCookieValue(session: object): string {
  const b64 = Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url');
  return `base64-${b64}`;
}

function buildEqQuery(eq: Record<string, string>): string {
  return Object.entries(eq)
    .map(([k, v]) => `${k}=eq.${v}`)
    .join('&');
}

export async function dbInsert<T = Record<string, unknown>>(
  table: string,
  payload: object | object[]
): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`dbInsert(${table}) failed: ${JSON.stringify(data)}`);
  return Array.isArray(data) ? data : [data];
}

export async function dbDelete(table: string, eq: Record<string, string>) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${buildEqQuery(eq)}`, {
    method: 'DELETE',
    headers: headers(),
  });
}

export async function dbUpdate(table: string, eq: Record<string, string>, payload: object) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?${buildEqQuery(eq)}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(payload),
  });
}

export async function dbSelect<T = Record<string, unknown>>(
  table: string,
  eq: Record<string, string>
): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${buildEqQuery(eq)}&select=*`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`dbSelect(${table}) failed: ${JSON.stringify(data)}`);
  return data;
}
