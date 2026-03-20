export function buildSummary(diff: any) {
    const hasRegression =
        diff.loadChange > 20 ||
        (diff.fcpChange !== null && diff.fcpChange > 25);

    return {
        status: hasRegression ? 'regression' : 'ok',
        diff
    };
}