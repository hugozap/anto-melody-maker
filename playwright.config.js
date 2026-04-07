const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'test.spec.js',
  timeout: 15000,
  use: {
    headless: true,
  },
  webServer: {
    command: 'npx serve . -l 3335 --no-clipboard',
    port: 3335,
    reuseExistingServer: true,
  },
});
