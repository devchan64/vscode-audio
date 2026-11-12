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
  const capture = process.argv.includes('--screenshots') || process.env.AUDIO_E2E_SCREENSHOTS === '1';
  const debugPort = Number(process.env.AUDIO_E2E_DEBUG_PORT || 9227);
  await runTests({
    version: process.env.VSCODE_VERSION || 'stable',
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [testWorkspace, '--user-data-dir', testUserData, '--extensions-dir', testExtensions, '--disable-workspace-trust', '--headless', '--disable-gpu', '--no-sandbox', '--ozone-platform=headless', '--disable-background-timer-throttling', ...(capture ? [`--remote-debugging-port=${debugPort}`, '--remote-debugging-address=127.0.0.1', '--remote-allow-origins=*', '--window-size=1440,900'] : [])],
    reuseMachineInstall: true,
    extensionTestsEnv: { AUDIO_E2E_WORKSPACE: testWorkspace, AUDIO_E2E_SCREENSHOTS: capture ? '1' : '0', AUDIO_E2E_DEBUG_PORT: String(debugPort), AUDIO_E2E_ROOT: extensionDevelopmentPath }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
