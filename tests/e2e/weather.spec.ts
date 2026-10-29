import { expect, type Page, test } from '@playwright/test';

const cityResult = {
  id: 123,
  name: 'Salvador',
  latitude: -12.97,
  longitude: -38.5,
  country: 'Brasil',
  admin1: 'Bahia',
  timezone: 'America/Bahia',
};

function completeForecast() {
  return {
    timezone: 'America/Bahia',
    current: {
      temperature_2m: 0,
      apparent_temperature: 0,
      relative_humidity_2m: 70,
      wind_speed_10m: 10,
      uv_index: 1,
      precipitation: 0,
      surface_pressure: 1013,
      weather_code: 0,
    },
    daily: {
      time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
      temperature_2m_max: [5, 6, 7, 8, 9],
      temperature_2m_min: [-5, -4, -3, -2, -1],
      precipitation_probability_max: [0, 10, 20, 30, 40],
      weather_code: [0, 1, 2, 3, 45],
    },
  };
}

async function mockGeocoding(page: Page) {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: { results: [cityResult] },
    }),
  );
}

test('busca uma cidade, exibe a previsão e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  await mockGeocoding(page);
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: completeForecast() }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('main')).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await page.getByRole('button', { name: 'Graus Fahrenheit' }).click();
  await expect(page.getByText('Temperatura: 32 °F', { exact: true })).toBeVisible();
});

test('não consulta geocoding para busca vazia ou formada só por espaços', async ({ page }) => {
  let geocodingRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    geocodingRequests += 1;
    return route.fulfill({ json: { results: [cityResult] } });
  });

  await page.goto('/');
  const searchbox = page.getByRole('searchbox', { name: 'Cidade' });
  const searchButton = page.getByRole('button', { name: 'Buscar' });

  await searchButton.click();
  await expect(page.getByRole('alert')).toContainText('Digite pelo menos 2 caracteres');
  await expect(searchbox).toHaveAttribute('aria-invalid', 'true');
  expect(geocodingRequests).toBe(0);

  await searchbox.fill('   ');
  await searchButton.click();
  await expect(page.getByRole('alert')).toContainText('Digite pelo menos 2 caracteres');
  expect(geocodingRequests).toBe(0);
});

for (const name of ['São Paulo', 'Baden-Baden', 'D’Oeste']) {
  test(`busca cidade com caracteres especiais: ${name}`, async ({ page }) => {
    const geocodingQueries: string[] = [];
    await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
      geocodingQueries.push(new URL(route.request().url()).searchParams.get('name') ?? '');
      return route.fulfill({
        json: { results: [{ ...cityResult, name }] },
      });
    });
    await page.route('https://api.open-meteo.com/**', (route) =>
      route.fulfill({ json: completeForecast() }),
    );

    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Cidade' }).fill(name);
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('heading', { name: `Clima atual em ${name}` })).toBeVisible();
    expect(geocodingQueries).toEqual([name]);
  });
}

test('exibe estado vazio quando o geocoding não retorna results', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: {} }),
  );
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    return route.fulfill({ json: completeForecast() });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade sem resultado');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(forecastRequests).toBe(0);
});

test('renderiza clima e previsão no viewport mobile de 375 × 812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockGeocoding(page);
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: completeForecast() }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeVisible();
  await expect(page.getByText('Temperatura: 0 °C', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('informa falha da previsão e permite tentar novamente', async ({ page }) => {
  await mockGeocoding(page);
  let forecastRequests = 0;
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    if (forecastRequests === 1) return route.fulfill({ status: 503, json: {} });
    return route.fulfill({ json: completeForecast() });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText(
    'O serviço de clima está indisponível no momento. Tente novamente mais tarde.',
  );
  await expect(page.getByRole('heading', { name: 'Clima atual em Salvador' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  expect(forecastRequests).toBe(2);
});

test('exibe dados parciais como indisponíveis e não inventa dias ausentes', async ({ page }) => {
  await mockGeocoding(page);
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        timezone: 'America/Bahia',
        current: { temperature_2m: 0 },
        daily: {
          time: ['2026-10-29', '2026-10-30'],
          temperature_2m_max: [2],
          temperature_2m_min: [-2, null],
          precipitation_probability_max: [null, 0],
          weather_code: [0, 1],
        },
      },
    }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const weather = page.getByRole('region', { name: 'Clima atual em Salvador' });
  await expect(weather.getByText('Temperatura: 0 °C', { exact: true })).toBeVisible();
  await expect(
    weather.getByText('Precipitação').locator('..').getByText('Indisponível'),
  ).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast.getByRole('article')).toHaveCount(2);
  await expect(forecast.getByRole('status')).toContainText('Previsão incompleta');
  await expect(
    forecast
      .getByRole('article')
      .nth(1)
      .getByText('Máxima')
      .locator('..')
      .getByText('Indisponível'),
  ).toBeVisible();
});
