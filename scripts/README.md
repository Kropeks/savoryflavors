# Test Scripts

This directory contains test scripts for verifying various features of the SavoryFlavors application.

## Available Scripts

### `test-external-import.js`

Tests the external recipe import functionality by:
1. Searching for recipes in TheMealDB
2. Retrieving recipe details
3. Importing a recipe into the database
4. Verifying the recipe was saved correctly

**Prerequisites:**
- Node.js installed
- Application running on `http://localhost:3000`
- Database connection configured

**Installation:**
```bash
npm install axios
```

**Usage:**
```bash
node scripts/test-external-import.js
```

**Expected Output:**
```
Starting external recipe import test...

1. Testing recipe search...
Found 12 recipes

2. Testing recipe details...
Retrieved details for: Spaghetti Carbonara

3. Testing recipe import...
Successfully imported recipe with ID: 123

4. Verifying database entry...
✅ Test completed successfully!
Recipe "Spaghetti Carbonara" was imported with ID: 123
```

**Notes:**
- The test script includes a cleanup section (commented out) that can be enabled to remove test data after the test
- Make sure to have valid admin credentials if authentication is required for the API endpoints
- The script uses the `axios` library for HTTP requests, which needs to be installed separately
