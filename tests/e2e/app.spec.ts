import { expect, test } from '@playwright/test';

test('layout mockado permite busca, troca de unidade e retry sem API', async ({ page }) => {
  const apiRequests: string[] = [];
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('**/*open-meteo.com/**', (route) => {
    apiRequests.push(route.request().url());
    return route.abort();
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Como está o tempo?' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('Temperatura: 83 °F', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');

  for (const [width, columns] of [
    [360, 2],
    [768, 3],
    [1280, 5],
  ]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(page.getByRole('list')).toHaveCSS(
      'grid-template-columns',
      new RegExp(`^(\\S+\\s+){${columns - 1}}\\S+$`),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }

  await page.getByRole('combobox', { name: 'Estado da demonstração' }).selectOption('error');
  await expect(page.getByRole('alert')).toContainText('Falha simulada');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByText('Temperatura: 83 °F', { exact: true })).toBeVisible();
  expect(apiRequests).toEqual([]);
});
