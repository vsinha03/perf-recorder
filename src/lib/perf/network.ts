import { Page, Response } from '@playwright/test';
import { NetworkStats } from './metrics.types';

/**
 * Attaches network listeners to a page
 * Returns a mutable stats object
 */
export function attachNetworkRecorder(page: Page): NetworkStats {
    const stats: NetworkStats = {
        requests: 0,
        failed: 0,
        totalPayloadSize: 0,
        avgTtfb: 0
    };

    const ttfbs: number[] = [];

    page.on('request', () => {
        stats.requests++;
    });

    page.on('requestfailed', () => {
        stats.failed++;
    });

    page.on('response', async (response: Response) => {
        try {
            const request = response.request();
            const timing = request.timing();
            
            // Calculate TTFB
            if (timing && timing.responseStart > -1 && timing.requestStart > -1) {
                const ttfb = timing.responseStart - timing.requestStart;
                if (ttfb > 0) ttfbs.push(ttfb);
            }

            const sizes = await request.sizes();
            if (sizes && sizes.responseBodySize) {
                stats.totalPayloadSize += sizes.responseBodySize;
            }
        } catch (e) {
            // Ignore errors (e.g. navigation before sizes can be computed)
        }
    });

    Object.defineProperty(stats, 'avgTtfb', {
        get: () => ttfbs.length ? ttfbs.reduce((a, b) => a + b, 0) / ttfbs.length : 0,
        enumerable: true
    });

    return stats;
}