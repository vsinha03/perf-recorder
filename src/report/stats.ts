import { PerfMetrics } from '../lib/perf/metrics.types';

export function percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

export function min(values: number[]): number {
    return values.length ? Math.min(...values) : 0;
}

export function max(values: number[]): number {
    return values.length ? Math.max(...values) : 0;
}

/**
 * Throughput = requests per second during page load
 */
export function throughput(metrics: PerfMetrics): number {
    const loadMs = metrics.timings.load;
    if (!loadMs || loadMs <= 0) return 0;

    return Number((metrics.network.requests / (loadMs / 1000)).toFixed(2));
}

/**
 * Throughput values for samples
 */
export function throughputSamples(samples: PerfMetrics[]): number[] {
    return samples.map(throughput).filter(v => v > 0);
}