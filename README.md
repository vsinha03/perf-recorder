# Playwright Performance Recorder

An automated, behavior-driven performance testing framework built on **Playwright** and **Cucumber JS**. It parallelizes browser iterations to establish statistically accurate performance baselines, computes Core Web Vitals, and integrates with **Local LLMs** to provide automated performance diagnostics.

## Features

- 🚀 **Parallel Execution**: Spin up configurable parallel browser contexts to gather reliable medians and performance percentiles (P90, P95).
- 📊 **Deep Metrics**: Captures granular metrics natively from the browser Performance API and network streams, including:
  - **Core Web Vitals**: Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), First Contentful Paint (FCP).
  - **Network Metrics**: Time To First Byte (TTFB), Response Payload Sizes, Throughput (req/s), Total Requests.
- 🧠 **AI-Powered Diagnostics**: Integrates seamlessly with locally hosted LLMs (via Ollama) to analyze metric aggregations and assign dynamic Performance Risk Scores automatically.
- 🎨 **Beautiful Reporting**: Generates a sleek, modern, glassmorphism HTML report with elegant Chart.js visualizations.

## Prerequisites

- Node.js (v18+)
- Playwright browsers installed (`npx playwright install`)
- A locally running LLM for AI diagnostics (Default expects `Ollama` running `mistral:latest` on port `11434`).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure your environment variables in `.env`:
   ```env
   # Targets
   PERF_TAGS=@google|@preqin|@mmt
   PERF_RUNS=20
   HEADLESS=true
   
   # LLM Integration
   ENABLE_LLM=true
   LLM_MODEL=mistral:latest
   ```

## Running the Tests

To clean the previous artifacts, execute the performance suite, and aggregate the new metrics, simply run:

```bash
npm run perf
```

### Under the Hood
1. Cucumber launches your BDD scenarios defined in `src/test/features/`.
2. The `BeforeAll` hooks handle global state and authentication preparation.
3. The framework launches `PERF_RUNS` isolated parallel browser sessions, executing operations and intercepting timings.
4. An AI engine generates a contextual diagnostic breakdown and Risk formulation into `ai-summary.json`.
5. An interactive HTML visualizer is immediately compiled and exported to `artifacts/combined-report.html`.

## Extending the Framework

- **Test Scenarios**: Add or modify tests in `src/test/features/performance.feature`.
- **Metrics/Engine**: Core aggregators and recorders live in `src/lib/perf/`.
- **Reporting & UI**: Modify the beautiful HTML layout and CSS in `src/report/combinedHtml.ts`.
