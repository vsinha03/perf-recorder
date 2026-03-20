import * as fs from 'fs';
import * as path from 'path';
import { generateCombinedHtmlReport } from '../src/report/combinedHtml';

const ARTIFACTS_DIR = path.resolve('artifacts');
const RUNS_DIR = path.join(ARTIFACTS_DIR, 'runs');
const AI_PATH = path.join(ARTIFACTS_DIR, 'ai-summary.json');

if (!fs.existsSync(RUNS_DIR)) {
    throw new Error('No runs directory found');
}

const files = fs.readdirSync(RUNS_DIR).filter(f => f.endsWith('.json'));
const allRuns = files.map(f =>
    JSON.parse(fs.readFileSync(path.join(RUNS_DIR, f), 'utf-8'))
);

const aiResult = fs.existsSync(AI_PATH)
    ? JSON.parse(fs.readFileSync(AI_PATH, 'utf-8'))
    : undefined;

const html = generateCombinedHtmlReport(allRuns, aiResult);

fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'combined-report.html'),
    html
);

console.log('✅ combined-report.html regenerated from artifacts');