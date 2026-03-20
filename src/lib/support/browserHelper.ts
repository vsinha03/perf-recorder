import {
    Browser,
    BrowserContext,
    Page,
    chromium,
    Response
} from '@playwright/test';

import * as fs from 'fs';
import { PerfConfig } from '../../config/perf.config';

export class BrowserHelper {
    private browser!: Browser;

    /* -------------------- browser lifecycle -------------------- */

    async launch(): Promise<Browser> {
        this.browser = await chromium.launch({
            headless: PerfConfig.headless
        });
        return this.browser;
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
        }
    }

    /* -------------------- context / page -------------------- */

    private async createContext(): Promise<BrowserContext> {
        return this.browser.newContext({
            storageState: PerfConfig.storageStatePath
        });
    }

    async navigate(
        page: Page,
        url: string,
        waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'load'
    ): Promise<Response | null> {
        console.log(`➡️ Navigating to: ${url}`);
        return page.goto(url, {
            timeout: PerfConfig.launchTimeout ?? 30000,
            waitUntil
        });
    }

    /* -------------------- login -------------------- */

    async ensureLoginState(): Promise<void> {
        if (fs.existsSync(PerfConfig.storageStatePath)) return;

        const context = await this.browser.newContext();
        const page = await context.newPage();

        await page.goto(PerfConfig.url);
        await page.fill("//input[@id='username']", PerfConfig.auth.username);
        await page.fill("//input[@id='password']", PerfConfig.auth.password);
        await page.click("//button[@id='submit-login']");
        await page.waitForLoadState('load');

        await context.storageState({
            path: PerfConfig.storageStatePath
        });

        await context.close();
    }

    /* -------------------- PARALLEL EXECUTION -------------------- */

    /**
     * Runs N parallel browser contexts safely.
     * The caller defines what happens inside each page.
     */
    async runParallel<T>(
        runs: number,
        task: (page: Page, index: number) => Promise<T>
    ): Promise<T[]> {

        const tasks = Array.from({ length: runs }).map(async (_, index) => {
            const context = await this.createContext();
            const page = await context.newPage();

            try {
                console.log(`🚀 Parallel run ${index + 1} started`);
                return await task(page, index);
            } finally {
                await context.close();
            }
        });

        return Promise.all(tasks);
    }

    async closeAll(): Promise<void> {
        try {
            if (this.browser?.isConnected()) {
                await this.browser.close();
            }
        } catch {}
    }

    async ensureReady(): Promise<void> {
        if (!this.browser) {
            await this.launch();
        }

        await this.ensureLoginState();
    }
}

export const browserHelper = new BrowserHelper();