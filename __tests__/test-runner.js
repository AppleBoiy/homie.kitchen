const { execSync } = require('child_process');
const path = require('path');

console.log('🍽️  Homie Kitchen - Comprehensive Test Suite');
console.log('=============================================\n');

// Test categories
const testCategories = [
  {
    name: 'Authentication API',
    file: 'api/auth.test.js',
    description: 'User registration and login operations'
  },
  {
    name: 'Menu API',
    file: 'api/menu.test.js',
    description: 'Menu item CRUD operations'
  },
  {
    name: 'Ingredients API',
    file: 'api/ingredients.test.js',
    description: 'Ingredient management operations'
  },
  {
    name: 'Categories API',
    file: 'api/categories.test.js',
    description: 'Category listing operations'
  },
  {
    name: 'Orders API',
    file: 'api/orders.test.js',
    description: 'Order creation and management'
  },
  {
    name: 'Database Integration',
    file: 'integration/database.test.js',
    description: 'Database schema and integrity tests'
  }
];

// Run tests
async function runTests() {
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  console.log('Starting test execution...\n');

  for (const category of testCategories) {
    console.log(`📋 ${category.name}`);
    console.log(`   ${category.description}`);
    console.log('   Running tests...');

    try {
      const testPath = path.join(__dirname, category.file);
      const result = execSync(`npx jest ${testPath} --verbose --silent`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse test results
      const lines = result.split('\n');
      const summaryLine = lines.find(line => line.includes('Tests:') || line.includes('PASS'));
      
      if (summaryLine) {
        console.log(`   ✅ ${summaryLine.trim()}`);
        passedTests += 1;
      } else {
        console.log(`   ✅ All tests passed`);
        passedTests += 1;
      }

    } catch (error) {
      console.log(`   ❌ Tests failed: ${error.message}`);
      failedTests += 1;
    }

    console.log('');
    totalTests += 1;
  }

  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`Total Categories: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests > 0) {
    console.log('\n❌ Some tests failed. Please check the output above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
  }
}

// Run all tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
}); 