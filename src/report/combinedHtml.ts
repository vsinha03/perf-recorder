export function generateCombinedHtmlReport(
    runs: any[],
    aiResult?: {
        overallSummary: string;
        riskScore: number;
        verdict: string;
        pageInsights: { scenario: string; insight: string }[];
    }
): string {

    const labels = runs.map(r => r.scenario.replace(/_/g, ' '));
    const loadTimes = runs.map(r => r.median.timings.load);
    const throughputs = runs.map(r => r.throughput.median);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Analytics</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        :root {
            --bg: #0f172a;
            --panel: rgba(30, 41, 59, 0.7);
            --border: rgba(255, 255, 255, 0.1);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent: #38bdf8;
            --safe: #22c55e;
            --warning: #f59e0b;
            --danger: #ef4444;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
            color: var(--text-main);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
        }

        h1, h2 { font-weight: 700; margin-top: 0; }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header-title {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 8px;
            background: -webkit-linear-gradient(45deg, var(--accent), #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
            text-align: center;
            color: var(--text-muted);
            margin-bottom: 40px;
        }

        .glass-panel {
            background: var(--panel);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .glass-panel:hover {
            box-shadow: 0 15px 40px -10px rgba(0,0,0,0.6);
        }

        .risk-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 9999px;
            font-weight: 800;
            font-size: 1.1rem;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .risk-badge.safe { background: rgba(34, 197, 94, 0.2); color: var(--safe); border: 1px solid var(--safe); }
        .risk-badge.monitor { background: rgba(245, 158, 11, 0.2); color: var(--warning); border: 1px solid var(--warning); }
        .risk-badge.danger { background: rgba(239, 68, 68, 0.2); color: var(--danger); border: 1px solid var(--danger); }

        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th {
            padding: 16px;
            color: var(--text-muted);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid var(--border);
        }
        td {
            padding: 16px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-weight: 500;
        }
        tr { transition: background 0.2s ease; }
        tr:hover td { background: rgba(255, 255, 255, 0.05); }
        .highlight { color: var(--accent); font-weight: 700; }

        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }

        @media (max-width: 768px) {
            .charts-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>

<body>
<div class="container">
    <h1 class="header-title">Performance Analytics</h1>
    <p class="header-subtitle">${runs.length} Pages Scanned • ${runs[0]?.parallelCount ?? '-'} Iterations</p>

    ${aiResult ? `
    <div class="glass-panel">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <h2>✨ AI Diagnostics</h2>
            <div class="risk-badge ${aiResult.riskScore >= 60 ? 'danger' : aiResult.riskScore >= 40 ? 'monitor' : 'safe'}">
                ${aiResult.verdict} (${aiResult.riskScore}/100)
            </div>
        </div>
        <p style="color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; margin-bottom: 24px;">
            ${aiResult.overallSummary}
        </p>
        <div>
            ${aiResult.pageInsights.map(p => `
                <div style="margin-bottom: 12px; padding-left: 16px; border-left: 2px solid var(--border);">
                    <strong style="color: var(--text-main);">${p.scenario.replace(/_/g, ' ')}:</strong> 
                    <span style="color: var(--text-muted);">${p.insight}</span>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="glass-panel">
        <h2>Detailed Metrics</h2>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Scenario</th>
                        <th>Load (ms)</th>
                        <th>LCP (ms)</th>
                        <th>CLS</th>
                        <th>TTFB (ms)</th>
                        <th>Payload (KB)</th>
                        <th>TP (req/s)</th>
                        <th>TP P95</th>
                    </tr>
                </thead>
                <tbody>
                ${runs.map(r => `
                    <tr>
                        <td>${r.scenario.replace(/_/g, ' ')}</td>
                        <td class="highlight">${r.median.timings?.load?.toFixed(0) || '-'}</td>
                        <td>${r.median.paint?.lcp ? r.median.paint.lcp.toFixed(0) : '-'}</td>
                        <td>${r.median.paint?.cls ? r.median.paint.cls.toFixed(3) : '-'}</td>
                        <td>${r.median.network?.avgTtfb ? r.median.network.avgTtfb.toFixed(0) : '-'}</td>
                        <td>${r.median.network?.totalPayloadSize ? (r.median.network.totalPayloadSize / 1024).toFixed(1) : '-'}</td>
                        <td class="highlight">${r.throughput?.median?.toFixed(1) || '-'}</td>
                        <td>${r.throughput?.p95?.toFixed(1) || '-'}</td>
                    </tr>
                `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <div class="charts-grid">
        <div class="glass-panel">
            <h2 style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 16px;">Average Load Times</h2>
            <canvas id="loadChart"></canvas>
        </div>
        <div class="glass-panel">
            <h2 style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 16px;">Throughput Operations</h2>
            <canvas id="throughputChart"></canvas>
        </div>
    </div>
</div>

<script>
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    const labels = ${JSON.stringify(labels)};
    const loadTimes = ${JSON.stringify(loadTimes)};
    const throughputs = ${JSON.stringify(throughputs)};

    new Chart(document.getElementById('loadChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Load Time (ms)',
                data: loadTimes,
                backgroundColor: 'rgba(56, 189, 248, 0.8)',
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });

    new Chart(document.getElementById('throughputChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Requests/sec',
                data: throughputs,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
</script>
</body>
</html>
    `;
}