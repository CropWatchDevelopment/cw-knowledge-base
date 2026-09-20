import { expect, test } from '@playwright/test';

const GUIDE = '/en/gateways/installing-a-gateway';

test('/ sends the visitor to their language', async ({ browser }) => {
	const japanese = await browser.newContext({ locale: 'ja-JP' });
	const page = await japanese.newPage();
	await page.goto('/');
	await expect(page).toHaveURL('/ja');
	await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
	await japanese.close();
});

test('every section of a guide can be linked to', async ({ page }) => {
	await page.goto(`${GUIDE}#connect`);

	const section = page.locator('section#connect');
	await expect(section.getByRole('heading', { level: 2 })).toHaveText('Connect power and network');
	await expect(section).toBeInViewport();

	for (const id of ['what-you-need', 'mounting-location', 'confirm-online', 'related-links']) {
		await expect(page.locator(`section#${id}`)).toHaveCount(1);
	}
});

test('switching language keeps the reader on the same section', async ({ page }) => {
	await page.goto(`${GUIDE}#connect`);

	await page.getByLabel(/Change language/).click();
	await page.getByRole('link', { name: '日本語' }).click();

	await expect(page).toHaveURL('/ja/gateways/installing-a-gateway#connect');
	await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ゲートウェイの設置');
});

test('a guide with no Japanese yet is shown in English with a notice', async ({ page }) => {
	await page.goto('/ja/concepts/dli-and-ppfd');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('DLI and PPFD');
	await expect(page.getByText('まだ日本語に翻訳されていない')).toBeVisible();
});

test('search finds a guide and opens it', async ({ page }) => {
	await page.goto('/en');

	await page.getByRole('searchbox').fill('antenna');
	await page.getByRole('button', { name: 'Search', exact: true }).click();

	await expect(page).toHaveURL('/en/search?q=antenna');
	await page
		.getByRole('link', { name: /Installing a gateway/ })
		.last()
		.click();
	await expect(page).toHaveURL(GUIDE);
});

test('an unknown guide is a 404 in the reader’s language', async ({ page }) => {
	const response = await page.goto('/ja/gateways/no-such-guide');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ページが見つかりません');
});
