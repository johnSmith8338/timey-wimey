import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8')
);

const configPath = path.join(root, 'ngsw-config.json');

const config = JSON.parse(
  fs.readFileSync(configPath, 'utf8')
);

config.appData = {
  ...(config.appData ?? {}),
  version: packageJson.version
};

fs.writeFileSync(
  configPath,
  JSON.stringify(config, null, 2) + '\n'
);

console.log(`[ngsw] app version: ${packageJson.version}`);