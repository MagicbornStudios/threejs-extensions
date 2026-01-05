import path from 'path';
import { expect, test } from '@playwright/test';

const fixturesDir = path.join(__dirname, '..', 'fixtures', 'models');

const getFixturePath = (fileName: string): string => path.join(fixturesDir, fileName);

test.describe('Phase 1 viewer', () => {
  test('renders the default scene and allows toggling post effects', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Phase 1 Viewer' })).toBeVisible();
    await expect(page.getByText('procedural fallback', { exact: false })).toBeVisible();

    const levaPanel = page.getByText('Visual FX', { exact: false }).first();
    await levaPanel.click();

    const bloomToggle = page.getByLabel('Bloom');
    await expect(bloomToggle).toBeVisible();
    const initialChecked = await bloomToggle.isChecked();
    await bloomToggle.click();
    await expect(bloomToggle).not.toBeChecked({ timeout: 2_000 });
    if (initialChecked) {
      await bloomToggle.click();
      await expect(bloomToggle).toBeChecked({ timeout: 2_000 });
    }
  });

  test('uploads a sample GLB and reflects the active model label', async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();

    await fileInput.setInputFiles(getFixturePath('Box.glb'));

    await expect(page.getByText('Custom model loaded successfully.', { exact: false })).toBeVisible();
    await expect(page.getByText('Active model: Box.glb')).toBeVisible();
  });
});
