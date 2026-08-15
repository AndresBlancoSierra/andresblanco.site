import { expect, test } from '@playwright/test';

test('home renders the identity and key CTAs', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Andres Blanco/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Andres Blanco');
  await expect(page.getByText('Turning curiosity into reality.')).toBeVisible();
  await expect(page.getByRole('link', { name: /view projects/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Resume', exact: true }).first()).toBeVisible();
});

test('navigation scrolls to every main section', async ({ page, isMobile }) => {
  await page.goto('/');
  const nav = page.locator('header nav');
  const sections = ['About', 'Projects', 'Security', 'Resume', 'Contact'];

  if (isMobile) {
    await nav.locator('summary').click();
    for (const label of sections) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    return;
  }

  for (const label of sections) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible();
  }
});

test('home lists the six featured projects as case studies', async ({ page }) => {
  await page.goto('/');
  const featured = page.locator('main a[href^="/projects/"]');
  await expect(featured).toHaveCount(6);
});

test('a project case study renders its sections', async ({ page }) => {
  await page.goto('/projects/what');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('WHAT?');
  await expect(page.getByText(/01 \/ Problem/i)).toBeVisible();
  await expect(page.getByText(/07 \/ Lessons Learned/i)).toBeVisible();
});

test('resume section shows education and download link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Resume', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByText('Universidad EAN', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /download pdf/i })).toBeVisible();
});

test('security section is evidence-based, not a tool list', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /evidence in practice/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /active study/i })).toBeVisible();
});

test('contact section exposes real reach-me links', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: /^phone \+57 312 308 7133$/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /^email andresfelipeblancos15@gmail.com$/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /^github github.com\/andresblancosierra$/i }),
  ).toBeVisible();
});

test('page has no fake percentage ratings', async ({ page }) => {
  await page.goto('/');
  const body = await page.locator('main').innerText();
  expect(body).not.toMatch(/\d+%/);
});
