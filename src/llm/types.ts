export interface AiPageInput {
    scenario: string;
    url: string;
    baseline?: {
        load: number;
        throughput: number;
    };
    current: {
        load: number;
        throughput: number;
    };
    deltas?: {
        loadPercent: number;
        throughputPercent: number;
    };
}

export interface AiAnalysisResult {
    overallSummary: string;
    riskScore: number; // 0–100
    verdict: 'SAFE' | 'MONITOR' | 'WARNING' | 'HIGH RISK';
    pageInsights: {
        scenario: string;
        insight: string;
    }[];
}