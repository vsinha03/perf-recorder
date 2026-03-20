import * as fs from 'fs';

export function loadBaseline(path: string) {
    if (!fs.existsSync(path)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}