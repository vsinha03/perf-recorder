import { Page } from '@playwright/test';
import { NetworkStats } from './metrics.types';

/**
 * Attaches network listeners to a page
 * Returns a mutable stats object
 */
export function attachNetworkRecorder(page: Page): NetworkStats {
    const stats: NetworkStats = {
        requests: 0,
        failed: 0
    };

    page.on('request', () => {
        stats.requests++;
    });

    page.on('requestfailed', () => {
        stats.failed++;
    });

    return stats;
}