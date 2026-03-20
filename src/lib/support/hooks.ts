import {
    BeforeAll,
    Before,
    After,
    AfterAll,
    setDefaultTimeout
} from '@cucumber/cucumber';

import * as fs from 'fs';
import * as path from 'path';

import { BrowserHelper } from './browserHelper';
import { CustomWorld } from './world';

import { attachNetworkRecorder } from '../perf/network';
import { recordMetrics } from '../perf/recorder';
import { aggregateMedian } from '../perf/aggregate';
import {
    throughput,
    throughputSamples,
    percentile,
    min,
    max
} from '../../report/stats';

import { buildPerformancePrompt } from '../../llm/prompt';
import { callLocalLlm } from '../../llm/localClient';

import { PerfConfig } from '../../config/perf.config';
import { generateCombinedHtmlReport } from '../../report/combinedHtml';

setDefaultTimeout(120 * 1000);

// ---- paths ----
const ARTIFACTS_DIR = path.resolve('artifacts');
const RUNS_DIR = path.join(ARTIFACTS_DIR, 'runs');

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

/* -------------------- BEFORE ALL -------------------- */
/**
 * One-time setup:
 * - launch browser
 * - login once
 * - persist storageState
 */
BeforeAll(async function () {
    console.log('🔐 BeforeAll: preparing browser & login state');

    const helper = new BrowserHelper();
    await helper.launch();
    await helper.ensureLoginState();

    (global as any).__BROWSER_HELPER__ = helper;
});

/* -------------------- BEFORE (per scenario) -------------------- */
/**
 * Create a lightweight page for step definitions ONLY
 */
Before(async function (this: CustomWorld) {
    const helper: BrowserHelper =
        (global as any).__BROWSER_HELPER__;

    // fresh incognito context, but NOT used for perf
    const context = await helper['browser'].newContext({
        storageState: PerfConfig.storageStatePath
    });

    this.context = context;
    this.page = await context.newPage();
});

/* -------------------- AFTER (per scenario) -------------------- */
/**
 * Run parallel performance loops
 */
After(async function (this: CustomWorld, scenario) {
    if (!this.targetUrl) {
        console.warn(`⚠️ No targetUrl for ${scenario.pickle.name}, skipping perf`);
        return;
    }

    const helper = (global as any).__BROWSER_HELPER__;
    const parallelCount = PerfConfig.runs;
    const scenarioName = scenario.pickle.name.replace(/\s+/g, '_');

    fs.mkdirSync(RUNS_DIR, { recursive: true });

    console.log(`🚀 Running ${parallelCount} parallel perf runs for: ${scenarioName}`);

    try {
        const samples = await helper.runParallel(
            parallelCount,
            async (page) => {
                const network = attachNetworkRecorder(page);

                await helper.navigate(page, this.targetUrl, 'load');
                await page.waitForLoadState('load', { timeout: 120_000 });

                return recordMetrics(page, network);
            }
        );

        const median = aggregateMedian(samples);

        const tpValues = throughputSamples(samples);

        const throughputStats = {
            median: throughput(median),
            p90: percentile(tpValues, 90),
            p95: percentile(tpValues, 95),
            min: min(tpValues),
            max: max(tpValues)
        };

        fs.writeFileSync(
            path.join(RUNS_DIR, `${scenarioName}.json`),
            JSON.stringify(
                {
                    scenario: scenarioName,
                    url: this.targetUrl,
                    parallelCount,
                    median,
                    throughput: throughputStats,
                    samples
                },
                null,
                2
            )
        );

        console.log(`✅ Perf data saved for ${scenarioName}`);
        console.log(`📈 Median throughput: ${throughputStats.median} req/s`);

    } catch (err) {
        console.error(`❌ Perf failed for ${scenarioName}`, err);
        // DO NOT throw — perf must not fail scenarios
    }
});

/* -------------------- AFTER ALL -------------------- */
AfterAll(async function () {
    let allRuns: any[] = [];
    let aiResult: any | null = null;

    try {
        /* ---------- Load combined perf runs ---------- */

        if (!fs.existsSync(RUNS_DIR)) {
            console.warn('⚠️ No perf runs found. Skipping combined report.');
            return;
        }

        const files = fs.readdirSync(RUNS_DIR).filter(f => f.endsWith('.json'));
        if (files.length === 0) {
            console.warn('⚠️ No perf data files found.');
            return;
        }

        allRuns = files.map(file =>
            JSON.parse(fs.readFileSync(path.join(RUNS_DIR, file), 'utf-8'))
        );

        fs.writeFileSync(
            path.join(ARTIFACTS_DIR, 'combined.json'),
            JSON.stringify(allRuns, null, 2)
        );

        /* ---------- AI: baseline vs current + risk ---------- */

        if (PerfConfig.llm.enabled) {
            try {
                const aiInput = allRuns.map(run => {
                    const baseline = run.baselineMedian;

                    return {
                        scenario: run.scenario,
                        url: run.url,
                        baseline: baseline
                            ? {
                                load: baseline.timings.load,
                                throughput: baseline.throughput.median
                            }
                            : undefined,
                        current: {
                            load: run.median.timings.load,
                            throughput: run.throughput.median
                        },
                        deltas: baseline
                            ? {
                                loadPercent:
                                    ((run.median.timings.load - baseline.timings.load) /
                                        baseline.timings.load) *
                                    100,
                                throughputPercent:
                                    ((run.throughput.median - baseline.throughput.median) /
                                        baseline.throughput.median) *
                                    100
                            }
                            : undefined
                    };
                });

                const prompt = buildPerformancePrompt(aiInput);
                aiResult = await callLocalLlm(prompt);

                fs.writeFileSync(
                    path.join(ARTIFACTS_DIR, 'ai-summary.json'),
                    JSON.stringify(aiResult, null, 2)
                );

                console.log(`🧠 AI analysis completed (Risk: ${aiResult.riskScore}/100)`);

            } catch (aiErr) {
                console.warn('⚠️ AI analysis failed. Continuing without AI.');
            }
        }

        /* ---------- Generate combined HTML report ---------- */

        fs.writeFileSync(
            path.join(ARTIFACTS_DIR, 'combined-report.html'),
            generateCombinedHtmlReport(allRuns, aiResult)
        );

        console.log(`✅ Combined performance report generated (${files.length} pages)`);

    } catch (err) {
        console.error('❌ AfterAll failed:', err);
        throw err;

    } finally {
        /* ---------- Guaranteed cleanup ---------- */

        try {
            const helper: BrowserHelper =
                (global as any).__BROWSER_HELPER__;

            if (helper) {
                await helper.closeAll();
                console.log('🧹 Browser cleaned up');
            }
        } catch (cleanupErr) {
            console.warn('⚠️ Browser cleanup failed:', cleanupErr);
        }
    }
});