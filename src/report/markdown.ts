export function generateMarkdown(
    current: any,
    baseline: any,
    summary: any
) {
    return `
# Performance Report

## Status
**${summary.status}**

## Changes
- Load time change: ${summary.diff.loadChange.toFixed(2)}%
- FCP change: ${
        summary.diff.fcpChange !== null
            ? summary.diff.fcpChange.toFixed(2) + '%'
            : 'N/A'
    }

## Baseline
\`\`\`json
${JSON.stringify(baseline, null, 2)}
\`\`\`

## Current
\`\`\`json
${JSON.stringify(current, null, 2)}
\`\`\`
`;
}