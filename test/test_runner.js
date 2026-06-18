const { runTests } = require('./mandell.test.js');

(async function main() {
  try {
    const summary = await runTests();
    console.log('\nTest Runner Summary');
    console.log('====================');
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);

    if (summary.failedTests > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test Runner failed:', error.message || error);
    process.exit(1);
  }
})();
