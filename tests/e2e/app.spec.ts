import { expect, test } from '@playwright/test';
import { MOCK_WEATHER } from '../../src/mocks/weather';

test('consulta clima, troca unidade e refaz busca após erro com API interceptada', async ({
  page,
}) => {
  const apiRequests: string[] = [];
  let failSearch = false;
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    apiRequests.push(route.request().url());
    if (failSearch) {
      failSearch = false;
      return route.fulfill({ status: 500, json: {} });
    }
    return route.fulfill({
      json: { results: [{ ...MOCK_WEATHER.city, id: Number(MOCK_WEATHER.city.id) }] },
    });
  });
  await page.route('https://api.open-meteo.com/**', (route) => {
    apiRequests.push(route.request().url());
    const { current, forecast, timezone } = MOCK_WEATHER;
    return route.fulfill({
      json: {
        timezone,
        current: {
          temperature_2m: current.temperatureC,
          apparent_temperature: current.apparentTemperatureC,
          relative_humidity_2m: current.humidityPercent,
          wind_speed_10m: current.windSpeedKmh,
          uv_index: current.uvIndex,
          precipitation: current.precipitationMm,
          surface_pressure: current.pressureHpa,
          weather_code: current.weatherCode,
        },
        daily: {
          time: forecast.map((day) => day.date),
          temperature_2m_max: forecast.map((day) => day.temperatureMaxC),
          temperature_2m_min: forecast.map((day) => day.temperatureMinC),
          precipitation_probability_max: forecast.map((day) => day.precipitationProbability),
          weather_code: forecast.map((day) => day.weatherCode),
        },
      },
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Como está o tempo?' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: 'Graus Fahrenheit' }).click();
  await expect(page.getByText('Temperatura: 83 °F', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Graus Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  for (const [width, columns] of [
    [360, 2],
    [768, 3],
    [1280, 5],
  ]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('list')).toHaveCSS(
      'grid-template-columns',
      new RegExp(`^(\\S+\\s+){${columns - 1}}\\S+$`),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }

  failSearch = true;
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'O serviço de clima está indisponível no momento. Tente novamente mais tarde.',
  );
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByText('Temperatura: 83 °F', { exact: true })).toBeVisible();
  expect(
    apiRequests.filter((url) => new URL(url).hostname === 'geocoding-api.open-meteo.com'),
  ).toHaveLength(3);
  expect(
    apiRequests.filter((url) => new URL(url).hostname === 'api.open-meteo.com'),
  ).toHaveLength(1);
});
