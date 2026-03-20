import { AiPageInput } from './types';

export function buildPerformancePrompt(pages: AiPageInput[]): string {
    return `
You are a performance engineering assistant.

You will receive JSON describing:
- baseline vs current performance
- load times (ms)
- throughput (requests/sec)

Your tasks:
1. Compare baseline vs current
2. Identify regressions
3. Assign a RISK SCORE from 0 to 100
4. Provide a short overall summary
5. Provide 1 short insight per page

Rules:
- Be concise
- No speculation
- No code
- Return STRICT JSON ONLY
- Risk scale:
  0–20 SAFE
  21–40 MONITOR
  41–60 WARNING
  61–100 HIGH RISK

INPUT:
${JSON.stringify(pages, null, 2)}

OUTPUT FORMAT:
{
  "overallSummary": "...",
  "riskScore": number,
  "verdict": "SAFE | MONITOR | WARNING | HIGH RISK",
  "pageInsights": [
    { "scenario": "...", "insight": "..." }
  ]
}
`;
}