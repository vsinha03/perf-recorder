export function generateCombinedHtmlReport(
    runs: any[],
    aiResult?: {
        overallSummary: string;
        riskScore: number;
        verdict: string;
        pageInsights: { scenario: string; insight: string }[];
    }
): string {

    const labels = runs.map(r => r.scenario);
    const loadTimes = runs.map(r => r.median.timings.load);
    const throughputs = runs.map(r => r.throughput.median);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Combined Performance Report</title>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 24px;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 16px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background: #333;
  color: white;
}
canvas {
  margin-top: 24px;
}
</style>
</head>

<body>

<h1>📊 Combined Performance Report</h1>

<p>
  <strong>Total Pages:</strong> ${runs.length}<br/>
  <strong>Parallel Runs per Page:</strong> ${runs[0]?.parallelCount ?? '-'}
</p>

${aiResult ? `
<section style="border:2px solid #333;padding:16px;margin-bottom:24px;">
  <h2>🧠 AI Performance Summary</h2>

  <p>
    <strong>Risk Level:</strong>
    <span style="
      color:${aiResult.riskScore >= 60 ? 'red' : aiResult.riskScore >= 40 ? 'orange' : 'green'};
      font-weight:bold;">
      ${aiResult.verdict} (${aiResult.riskScore}/100)
    </span>
  </p>

  <p>${aiResult.overallSummary}</p>

  <ul>
    ${aiResult.pageInsights
        .map(
            p => `<li><strong>${p.scenario}:</strong> ${p.insight}</li>`
        )
        .join('')}
  </ul>
</section>
` : ''}

<!-- 📋 SUMMARY TABLE (MOVED TO TOP) -->
<h2>📋 Summary</h2>
<table>
<thead>
<tr>
  <th>Scenario</th>
  <th>URL</th>
  <th>Load (ms)</th>
  <th>Requests</th>
  <th>Throughput (req/s)</th>
  <th>P90</th>
  <th>P95</th>
</tr>
</thead>
<tbody>
${runs.map(r => `
<tr>
  <td>${r.scenario}</td>
  <td>${r.url}</td>
  <td>${r.median.timings.load}</td>
  <td>${r.median.network.requests}</td>
  <td><strong>${r.throughput.median}</strong></td>
  <td>${r.throughput.p90}</td>
  <td>${r.throughput.p95}</td>
</tr>
`).join('')}
</tbody>
</table>

<!-- 📉 LOAD TIME CHART -->
<h2>⏱ Load Time (ms)</h2>
<canvas id="loadChart"></canvas>

<!-- ⚡ THROUGHPUT CHART -->
<h2>⚡ Throughput (requests / second)</h2>
<canvas id="throughputChart"></canvas>

<script>
const labels = ${JSON.stringify(labels)};
const loadTimes = ${JSON.stringify(loadTimes)};
const throughputs = ${JSON.stringify(throughputs)};

// Load Time Chart
new Chart(document.getElementById('loadChart'), {
    type: 'bar',
    data: {
        labels,
        datasets: [{
            label: 'Load Time (ms)',
            data: loadTimes,
            backgroundColor: '#4e79a7'
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    }
});

// Throughput Chart
new Chart(document.getElementById('throughputChart'), {
    type: 'bar',
    data: {
        labels,
        datasets: [{
            label: 'Throughput (req/s)',
            data: throughputs,
            backgroundColor: '#59a14f'
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    }
});
</script>

<p style="margin-top:16px;font-size:13px;">
⚠️ Throughput is calculated from browser-observed network requests during page load.
</p>

</body>
</html>
`;
}