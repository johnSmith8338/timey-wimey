import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const generatedConfigPath = path.join(
    root,
    'ngsw-config.generated.json'
);

if (fs.existsSync(generatedConfigPath)) {
    fs.unlinkSync(generatedConfigPath);
    console.log('[ngsw] generated config removed');
}