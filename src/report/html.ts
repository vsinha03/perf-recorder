export function generateHtmlReport(
    current: any,
    baseline: any,
    summary: any,
    samples: any[],
    aiAnalysis: string
): string {

    const tp = current.throughput;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Performance Report</title>
<style>
body {
  font-family: Arial, sans-serif;
  margin: 24px;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 12px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background: #f4f4f4;
}
.metric {
  font-size: 18px;
  margin: 8px 0;
}
.good { color: green; }
.warn { color: orange; }
.bad { color: red; }
</style>
</head>

<body>
<h1>📊 Performance Report</h1>

<p>
  <strong>URL:</strong> ${current.url}<br/>
  <strong>Parallel Runs:</strong> ${current.parallelCount}
</p>

<h2>⏱ Load Performance</h2>
<div class="metric">Median Load Time: <strong>${current.median.timings.load} ms</strong></div>
<div class="metric">DOM Content Loaded: ${current.median.timings.domContentLoaded} ms</div>

<h2>🌐 Network</h2>
<div class="metric">Total Requests: ${current.median.network.requests}</div>
<div class="metric">Failed Requests: ${current.median.network.failed}</div>

<!-- 🔥 NEW: THROUGHPUT SECTION -->
<h2>⚡ Throughput (requests / second)</h2>
<table>
  <tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Median</td><td>${tp.median}</td></tr>
  <tr><td>P90</td><td>${tp.p90}</td></tr>
  <tr><td>P95</td><td>${tp.p95}</td></tr>
  <tr><td>Min</td><td>${tp.min}</td></tr>
  <tr><td>Max</td><td>${tp.max}</td></tr>
</table>

<h2>🧠 AI Analysis</h2>
<pre>${aiAnalysis || 'LLM disabled / no analysis available'}</pre>

</body>
</html>
`;
}