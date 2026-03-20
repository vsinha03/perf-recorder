import { setWorldConstructor } from '@cucumber/cucumber';
import {Browser, BrowserContext, Page} from '@playwright/test';
import { PerfMetrics } from '../perf/metrics.types';
import { BrowserHelper } from './browserHelper';

export class CustomWorld {
    // Playwright
    browser!: Browser;
    page?: Page;
    context?: BrowserContext;
    browserHelper!: BrowserHelper;

    targetUrl?: string;

    // Performance data
    perfMetrics?: PerfMetrics;
    perfSamples?: PerfMetrics[];
}

setWorldConstructor(CustomWorld);