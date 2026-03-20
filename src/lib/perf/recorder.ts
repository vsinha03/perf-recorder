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

        // Extract LCP
        let lcp = 0;
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
            lcp = lcpEntries[lcpEntries.length - 1].startTime;
        }

        // Calculate CLS manually using Layout Instability API
        let cls = 0;
        const layoutShifts = performance.getEntriesByType('layout-shift');
        for (const entry of layoutShifts) {
            if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
            }
        }

        return {
            domContentLoaded: nav?.domContentLoadedEventEnd ?? 0,
            load: nav?.loadEventEnd ?? 0,
            fcp: paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime,
            lcp,
            cls
        };
    });

    return {
        timings: {
            domContentLoaded: browserMetrics.domContentLoaded,
            load: browserMetrics.load
        },
        paint: {
            fcp: browserMetrics.fcp,
            lcp: browserMetrics.lcp,
            cls: browserMetrics.cls
        },
        network: {
            requests: networkStats.requests,
            failed: networkStats.failed,
            totalPayloadSize: networkStats.totalPayloadSize,
            avgTtfb: networkStats.avgTtfb
        },
        timestamp: new Date().toISOString()
    };
}