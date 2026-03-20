import { PerfMetrics } from './metrics.types';
import { median } from './median';

export function aggregateMedian(samples: PerfMetrics[]): PerfMetrics {
    return {
        timings: {
            domContentLoaded: median(samples.map(s => s.timings.domContentLoaded)),
            load: median(samples.map(s => s.timings.load))
        },
        paint: {
            fcp: median(samples.map(s => s.paint.fcp ?? 0))
        },
        network: {
            requests: median(samples.map(s => s.network.requests)),
            failed: median(samples.map(s => s.network.failed))
        },
        timestamp: new Date().toISOString()
    };
}