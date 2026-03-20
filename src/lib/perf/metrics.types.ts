export interface NetworkStats {
    requests: number;
    failed: number;
    totalPayloadSize: number;
    avgTtfb: number;
}

export interface PerfMetrics {
    timings: {
        domContentLoaded: number;
        load: number;
    };
    paint: {
        fcp?: number;
        lcp?: number;
        cls?: number;
    };
    network: NetworkStats;
    timestamp: string;
}