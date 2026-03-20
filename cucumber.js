require('dotenv/config');
require('ts-node/register');

const { PerfConfig } = require('./src/config/perf.config');

console.log('PERF_TAGS raw:', process.env.PERF_TAGS);
console.log('Resolved cucumber tags:', PerfConfig.cucumberTags);

module.exports = {
    perf: [
        '--require-module ts-node/register',

        './src/test/features/**/*.feature',

        '--require ./src/test/steps/**/*.ts',
        '--require ./src/lib/support/**/*.ts',

        '--parallel 1',

        `--tags "${PerfConfig.cucumberTags}"`,

        '--format progress'
    ].join(' ')
};