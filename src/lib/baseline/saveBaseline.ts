import * as fs from 'fs';

export function saveBaseline(path: string, data: unknown) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}