const path = require('path');
const fs = require('fs');
const { runTests } = require('@vscode/test-electron');

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, '../..');
  const extensionTestsPath = path.resolve(__dirname, './suite/index.js');
  const testWorkspace = path.resolve(extensionDevelopmentPath, '.vscode-test/workspace');
  const testUserData = path.resolve(extensionDevelopmentPath, '.vscode-test/user-data');
  const testExtensions = path.resolve(extensionDevelopmentPath, '.vscode-test/extensions');
  fs.mkdirSync(testWorkspace, { recursive: true });
  fs.mkdirSync(testUserData, { recursive: true });
  fs.mkdirSync(testExtensions, { recursive: true });
  await runTests({
    version: process.env.VSCODE_VERSION || 'stable',
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [testWorkspace, '--user-data-dir', testUserData, '--extensions-dir', testExtensions, '--disable-workspace-trust', '--headless', '--disable-gpu', '--no-sandbox', '--ozone-platform=headless'],
    reuseMachineInstall: true,
    extensionTestsEnv: { AUDIO_E2E_WORKSPACE: testWorkspace }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
