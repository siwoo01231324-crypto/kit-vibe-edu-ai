/**
 * 텍스트를 클립보드에 복사하고 성공/실패 반환
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
