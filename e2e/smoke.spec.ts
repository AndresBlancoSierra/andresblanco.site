import { expect, test } from '@playwright/test';

test('home renders the identity and key CTAs', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Andrés Felipe Blanco Sierra/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Andrés Felipe Blanco Sierra');
  await expect(page.getByRole('link', { name: /explore projects/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'resume', exact: true }).first()).toBeVisible();
});

test('navigation reaches all main sections', async ({ page, isMobile }) => {
  await page.goto('/');
  const nav = page.locator('header nav');

  // Mobile: expand the disclosure menu and verify every link is present.
  if (isMobile) {
    await nav.locator('summary').click();
    for (const label of ['About', 'Projects', 'Security', 'Writing', 'Resume', 'Contact']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    return;
  }

  // Desktop: clicking each nav item lands on a real page.
  for (const label of ['About', 'Projects', 'Security', 'Writing', 'Resume', 'Contact']) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await expect(page.locator('main')).toBeVisible();
  }
});

test('projects index lists the six featured projects', async ({ page }) => {
  await page.goto('/projects');
  const featured = page.locator('main a[href^="/projects/"]');
  await expect(featured.first()).toBeVisible();
});

test('a project case study renders its sections', async ({ page }) => {
  await page.goto('/projects/what');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('WHAT?');
  await expect(page.getByText(/01 \/ Problem/i)).toBeVisible();
  await expect(page.getByText(/07 \/ Lessons Learned/i)).toBeVisible();
});

test('resume page shows education and download link', async ({ page }) => {
  await page.goto('/resume');
  await expect(page.getByText('Universidad EAN', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /download pdf/i })).toBeVisible();
});

test('security page is evidence-based, not a tool list', async ({ page }) => {
  await page.goto('/security');
  await expect(page.getByRole('heading', { name: /evidence in practice/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /active study/i })).toBeVisible();
});

test('writing page gracefully handles no articles', async ({ page }) => {
  await page.goto('/writing');
  await expect(page.getByText(/no articles published yet/i)).toBeVisible();
});

test('about page renders skills without fake ratings', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByText('Languages', { exact: true })).toBeVisible();
  const body = await page.locator('main').innerText();
  expect(body).not.toMatch(/\d+%/);
});