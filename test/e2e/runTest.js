const path = require('path');
const fs = require('fs');
const { runTests } = require('@vscode/test-electron');

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, '../..');
  const extensionTestsPath = path.resolve(__dirname, './suite/index.js');
  const testWorkspace = path.resolve(__dirname, './workspace');
  fs.mkdirSync(testWorkspace, { recursive: true });
  await runTests({
    version: process.env.VSCODE_VERSION || 'stable',
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [testWorkspace, '--disable-workspace-trust'],
    reuseMachineInstall: true,
    extensionTestsEnv: { AUDIO_E2E_WORKSPACE: testWorkspace }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
