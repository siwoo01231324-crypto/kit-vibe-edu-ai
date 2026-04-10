import { test, expect } from '@playwright/test';

test('landing page renders heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Kit Vibe/i })).toBeVisible();
});
