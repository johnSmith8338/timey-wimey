import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const packageJsonPath = path.join(root, 'package.json');
const versionFilePath = path.join(
  root,
  'src/app-info/version.ts'
);

const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, 'utf8')
);

const content = `// GENERATED FILE. DO NOT EDIT.

export const APP_VERSION = '${packageJson.version}';
`;

fs.mkdirSync(path.dirname(versionFilePath), {
  recursive: true
});

fs.writeFileSync(versionFilePath, content);

console.log(
  `[version] generated APP_VERSION = ${packageJson.version}`
);