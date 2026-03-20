export interface NetworkStats {
    requests: number;
    failed: number;
}

export interface PerfMetrics {
    timings: {
        domContentLoaded: number;
        load: number;
    };
    paint: {
        fcp?: number;
    };
    network: NetworkStats;
    timestamp: string;
}