import { Page } from '@playwright/test';
import { PerfMetrics, NetworkStats } from './metrics.types';

/**
 * Collects browser performance metrics
 * Must be called AFTER navigation is complete
 */
export async function recordMetrics(
    page: Page,
    networkStats: NetworkStats
): Promise<PerfMetrics> {
    const browserMetrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');

        return {
            domContentLoaded: nav?.domContentLoadedEventEnd ?? 0,
            load: nav?.loadEventEnd ?? 0,
            fcp: paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime
        };
    });

    return {
        timings: {
            domContentLoaded: browserMetrics.domContentLoaded,
            load: browserMetrics.load
        },
        paint: {
            fcp: browserMetrics.fcp
        },
        network: {
            requests: networkStats.requests,
            failed: networkStats.failed
        },
        timestamp: new Date().toISOString()
    };
}