export function percentChange(baseline: number, current: number): number {
    if (baseline === 0) return 0;
    return ((current - baseline) / baseline) * 100;
}

export function diffMetrics(current: any, baseline: any) {
    return {
        loadChange: percentChange(
            baseline.timings.load,
            current.timings.load
        ),
        fcpChange:
            baseline.paint?.fcp && current.paint?.fcp
                ? percentChange(baseline.paint.fcp, current.paint.fcp)
                : null,
        requestDelta:
            current.network.requests - baseline.network.requests
    };
}