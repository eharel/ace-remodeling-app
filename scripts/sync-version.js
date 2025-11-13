#!/usr/bin/env node

/**
 * Syncs version from package.json to app.json
 * Automatically increments iOS buildNumber
 * 
 * Usage: node scripts/sync-version.js
 * Or via npm: npm version patch/minor/major (automatically runs this)
 */

const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '..', 'package.json');
const appJsonPath = path.join(__dirname, '..', 'app.json');

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const newVersion = packageJson.version;

  // Read app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Get current buildNumber and increment
  const currentBuildNumber = parseInt(appJson.expo.ios.buildNumber) || 1;
  const newBuildNumber = currentBuildNumber + 1;

  // Update app.json
  appJson.expo.version = newVersion;
  appJson.expo.runtimeVersion = newVersion;
  appJson.expo.ios.buildNumber = newBuildNumber.toString();

  // Write back to app.json
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

  console.log('✅ Version sync complete!');
  console.log(`   Version: ${newVersion}`);
  console.log(`   iOS buildNumber: ${newBuildNumber}`);
  console.log('\nNext steps:');
  console.log('1. Update CHANGELOG.md');
  console.log('2. Commit: git add . && git commit -m "chore: bump version to ' + newVersion + '"');
  console.log('3. Tag: git tag v' + newVersion);
  console.log('4. Push: git push && git push --tags');
  console.log('5. Build: npm run build:ios:submit');

} catch (error) {
  console.error('❌ Error syncing version:', error.message);
  process.exit(1);
}

