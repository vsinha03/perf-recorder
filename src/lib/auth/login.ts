import { Browser } from '@playwright/test';
import { PerfConfig } from '../../config/perf.config';
import * as fs from 'fs';

export async function ensureLoginState(browser: Browser) {
    if (fs.existsSync(PerfConfig.storageStatePath)) {
        return;
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(PerfConfig.url);

    // 🔐 Replace selectors with your app’s real ones
    await page.fill("//input[@id='username']", PerfConfig.auth.username);
    await page.fill("//input[@id='password']", PerfConfig.auth.password);
    await page.click("//button[@id='submit-login']");

    await page.waitForSelector("//i[normalize-space()='Logout']");

    await page.waitForLoadState('load');

    await context.storageState({
        path: PerfConfig.storageStatePath
    });

    await context.close();
}