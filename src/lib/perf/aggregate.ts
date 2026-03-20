import { PerfMetrics } from './metrics.types';
import { median } from './median';

export function aggregateMedian(samples: PerfMetrics[]): PerfMetrics {
    const dcl: number[] = [];
    const load: number[] = [];
    const fcp: number[] = [];
    const lcp: number[] = [];
    const cls: number[] = [];
    const requests: number[] = [];
    const failed: number[] = [];
    const payloadSize: number[] = [];
    const ttfb: number[] = [];

    for (const s of samples) {
        dcl.push(s.timings.domContentLoaded);
        load.push(s.timings.load);
        fcp.push(s.paint.fcp ?? 0);
        lcp.push(s.paint.lcp ?? 0);
        cls.push(s.paint.cls ?? 0);

        requests.push(s.network.requests);
        failed.push(s.network.failed);
        payloadSize.push(s.network.totalPayloadSize);
        ttfb.push(s.network.avgTtfb);
    }

    return {
        timings: {
            domContentLoaded: median(dcl),
            load: median(load)
        },
        paint: {
            fcp: median(fcp),
            lcp: median(lcp),
            cls: median(cls)
        },
        network: {
            requests: median(requests),
            failed: median(failed),
            totalPayloadSize: median(payloadSize),
            avgTtfb: median(ttfb)
        },
        timestamp: new Date().toISOString()
    };
}