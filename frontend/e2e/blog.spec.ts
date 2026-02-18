import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('首页', () => {
  test('标题正确，文章列表渲染', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle('勇的个人博客', { timeout: 10000 });
    await expect(page.locator('a[href*="/article/"]').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/home.png' });
  });
});

test.describe('分类页', () => {
  test('点击侧边栏分类能显示文章', async ({ page }) => {
    await page.goto(BASE);
    const categoryLink = page.locator('a[href*="/category/"]').first();
    await categoryLink.waitFor({ timeout: 10000 });
    const categoryName = await categoryLink.textContent();
    await categoryLink.click();
    await expect(page).toHaveURL(/\/category\//);
    await expect(page).toHaveTitle(/分类.*勇的个人博客/, { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/category.png' });
    console.log(`点击了分类: ${categoryName}`);
  });
});

test.describe('标签页', () => {
  test('点击侧边栏标签能显示文章', async ({ page }) => {
    await page.goto(BASE);
    const tagLink = page.locator('a[href*="/tag/"]').first();
    await tagLink.waitFor({ timeout: 10000 });
    const tagName = await tagLink.textContent();
    await tagLink.click();
    await expect(page).toHaveURL(/\/tag\//);
    await expect(page).toHaveTitle(/标签.*勇的个人博客/, { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/tag.png' });
    console.log(`点击了标签: ${tagName}`);
  });
});

test.describe('文章详情页', () => {
  test('点击文章能打开详情，标题和OG标签正确', async ({ page }) => {
    await page.goto(BASE);
    const articleLink = page.locator('a[href*="/article/"]').first();
    await articleLink.waitFor({ timeout: 10000 });
    await articleLink.click();
    await expect(page).toHaveURL(/\/article\//);
    await expect(page).toHaveTitle(/勇的个人博客/, { timeout: 10000 });
    // 验证 OG 标签存在（React 19 原生 meta hoist）
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/, { timeout: 10000 });
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.*/);
    await page.screenshot({ path: 'e2e/screenshots/article.png' });
  });
});

test.describe('搜索页', () => {
  test('搜索页标题正确', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await expect(page).toHaveTitle(/搜索.*勇的个人博客/, { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/search.png' });
  });
});

test.describe('登录页', () => {
  test('登录页标题正确', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page).toHaveTitle(/登录.*勇的个人博客/, { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/login.png' });
  });
});

test.describe('注册页', () => {
  test('注册页标题正确', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page).toHaveTitle(/注册.*勇的个人博客/, { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/register.png' });
  });
});

test.describe('404页', () => {
  test('不存在的页面标题正确', async ({ page }) => {
    await page.goto(`${BASE}/nonexistent-page`);
    await expect(page.locator('text=页面未找到')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveTitle(/页面未找到.*勇的个人博客/, { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/404.png' });
  });
});
