import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

async function loginAndGoToArticle(page: import('@playwright/test').Page) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'admin@blog.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  const articleLink = page.locator('a[href*="/article/"]').first();
  await articleLink.waitFor({ timeout: 15000 });
  await articleLink.click();
  await page.waitForURL(/\/article\//, { timeout: 10000, waitUntil: 'commit' });
  await expect(page.getByRole('heading', { name: /评论/ })).toBeVisible({ timeout: 10000 });
}

test.describe('评论系统', () => {
  test('文章详情页显示评论区', async ({ page }) => {
    await loginAndGoToArticle(page);

    await expect(page.getByRole('heading', { name: /评论/ })).toBeVisible();
    await expect(page.locator('textarea[placeholder="写下你的评论..."]')).toBeVisible();
    await expect(page.getByRole('button', { name: '发表评论' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/comment-section.png' });
  });

  test('发表评论并显示', async ({ page }) => {
    await loginAndGoToArticle(page);

    const testContent = 'E2E测试评论 ' + Date.now();
    await page.fill('textarea[placeholder="写下你的评论..."]', testContent);
    await page.getByRole('button', { name: '发表评论' }).click();

    await expect(page.locator(`text=${testContent}`)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=admin').first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/comment-posted.png' });
  });

  test('回复评论', async ({ page }) => {
    await loginAndGoToArticle(page);

    // 先发一条评论
    const parentContent = '待回复评论 ' + Date.now();
    await page.fill('textarea[placeholder="写下你的评论..."]', parentContent);
    await page.getByRole('button', { name: '发表评论' }).click();
    await expect(page.locator(`text=${parentContent}`)).toBeVisible({ timeout: 10000 });

    // 找到包含评论内容的 .py-3 div，里面有回复按钮
    const commentBlock = page.locator('.py-3').filter({ hasText: parentContent });
    await commentBlock.locator('button', { hasText: '回复' }).click();

    // 等待回复输入框出现
    const replyTextarea = page.locator('textarea[placeholder="写下你的回复..."]');
    await expect(replyTextarea).toBeVisible({ timeout: 5000 });

    const replyContent = 'E2E回复 ' + Date.now();
    await replyTextarea.fill(replyContent);

    // 点击回复表单里的提交按钮（紧跟在 textarea 后面的 div 里）
    await replyTextarea.locator('xpath=following-sibling::div[1]').locator('button', { hasText: '回复' }).click();

    await expect(page.locator(`text=${replyContent}`)).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/comment-reply.png' });
  });

  test('删除评论', async ({ page }) => {
    await loginAndGoToArticle(page);

    // 发一条待删除的评论
    const deleteContent = '待删除评论 ' + Date.now();
    await page.fill('textarea[placeholder="写下你的评论..."]', deleteContent);
    await page.getByRole('button', { name: '发表评论' }).click();
    await expect(page.locator(`text=${deleteContent}`)).toBeVisible({ timeout: 10000 });

    // 找到评论文本旁边的删除按钮
    const commentText = page.locator(`p:has-text("${deleteContent}")`);
    const actionsDiv = commentText.locator('xpath=following-sibling::div[1]');
    await actionsDiv.locator('button:has-text("删除")').click();

    // 确认弹窗 — 弹窗在 fixed overlay 里，确认按钮文本是"删除"
    // 定位弹窗中的红色删除按钮（bg-red-600）
    const modal = page.locator('.fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await modal.locator('button.bg-red-600').click();

    // 评论应该消失
    await expect(page.locator(`text=${deleteContent}`)).not.toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/comment-deleted.png' });
  });

  test('未登录用户看到登录提示', async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE);

    const articleLink = page.locator('a[href*="/article/"]').first();
    await articleLink.waitFor({ timeout: 15000 });
    await articleLink.click();
    await page.waitForURL(/\/article\//, { timeout: 10000, waitUntil: 'commit' });

    await expect(page.getByRole('heading', { name: /评论/ })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=登录后即可评论')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('textarea[placeholder="写下你的评论..."]')).not.toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/comment-not-logged-in.png' });
  });
});
