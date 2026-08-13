import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const packageJsonPath = path.join(root, 'package.json');
const sourceConfigPath = path.join(root, 'ngsw-config.json');
const generatedConfigPath = path.join(root, 'ngsw-config.generated.json');

const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf8')
);

const config = JSON.parse(
    fs.readFileSync(sourceConfigPath, 'utf8')
);

config.appData = {
    ...(config.appData ?? {}),
    version: packageJson.version
};

fs.writeFileSync(
    generatedConfigPath,
    JSON.stringify(config, null, 2) + '\n'
);

console.log(
    `[ngsw] generated config for version ${packageJson.version}`
);