import type { SupabaseClient } from '@supabase/supabase-js';

const CODE_LENGTH = 6;
const MAX_RETRY = 5;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function generateUniqueJoinCode(supabase: SupabaseClient<any>): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    const code = generateJoinCode();
    const { data } = await supabase
      .from('sessions')
      .select('id')
      .eq('join_code', code)
      .eq('status', 'active')
      .maybeSingle();

    if (data === null) {
      return code;
    }
  }
  throw new Error('join_code 생성 실패');
}
