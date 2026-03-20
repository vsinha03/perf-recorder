import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Convert:
 *   @home|@product|@cart
 * To:
 *   @home or @product or @cart
 */
function normalizePerfTags(raw?: string): string {
    if (!raw || raw.trim() === '') {
        return '@perf'; // safe default
    }

    return raw
        .split('|')
        .map(tag => tag.trim())
        .filter(Boolean)
        .join(' or ');
}

export const PerfConfig = {
    // ---------- App ----------
    url: process.env.APP_URL!,
    headless: process.env.HEADLESS !== 'false',
    launchTimeout: Number(process.env.LAUNCH_TIMEOUT ?? 30000),

    // ---------- Performance ----------
    runs: Number(process.env.PERF_RUNS ?? 1),

    // 👉 NEW: cucumber tag expression
    cucumberTags: normalizePerfTags(process.env.PERF_TAGS),

    // ---------- Auth ----------
    auth: {
        username: process.env.USERNAME!,
        password: process.env.PASSWORD!
    },

    storageStatePath: process.env.STORAGE_STATE_PATH ?? 'artifacts/storageState.json',

    // ---------- LLM ----------
    llm: {
        enabled: process.env.ENABLE_LLM === 'true',
        model: process.env.LLM_MODEL ?? ''
    }
};