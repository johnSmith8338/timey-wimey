import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const generatedConfigPath = path.join(
    root,
    'ngsw-config.generated.json'
);

function run(command, args) {
    const result = spawnSync(command, args, {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32'
    });

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

try {
    run('node', ['scripts/generate-ngsw-config.mjs']);

    run('npx', [
        'ng',
        'build',
        '--configuration',
        'production'
    ]);
} finally {
    if (fs.existsSync(generatedConfigPath)) {
        fs.unlinkSync(generatedConfigPath);
        console.log('[ngsw] generated config removed');
    }
}