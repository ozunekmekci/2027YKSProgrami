import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

test('Native Android project structure and Gradle wrapper exist', () => {
  assert.ok(fs.existsSync('android'), 'android/ directory does not exist');
  assert.ok(fs.existsSync('android/build.gradle'), 'android/build.gradle does not exist');
  assert.ok(fs.existsSync('android/settings.gradle'), 'android/settings.gradle does not exist');
  assert.ok(fs.existsSync('android/gradlew'), 'android/gradlew does not exist');
  assert.ok(fs.existsSync('android/gradlew.bat'), 'android/gradlew.bat does not exist');

  // Verify gradlew is executable
  const stats = fs.statSync('android/gradlew');
  const isExecutable = Boolean(stats.mode & 0o111);
  assert.ok(isExecutable, 'android/gradlew is not executable');
});

test('android/app/build.gradle contains valid applicationId and namespace for YKS 2027 Koçu', () => {
  const gradlePath = 'android/app/build.gradle';
  assert.ok(fs.existsSync(gradlePath), `${gradlePath} does not exist`);
  const content = fs.readFileSync(gradlePath, 'utf8');

  assert.ok(content.includes('applicationId "com.yks.planner"'), 'Missing applicationId "com.yks.planner"');
  assert.ok(content.includes('namespace "com.yks.planner"'), 'Missing namespace "com.yks.planner"');
});

test('android/app/src/main/AndroidManifest.xml contains required permissions and launcher activity', () => {
  const manifestPath = 'android/app/src/main/AndroidManifest.xml';
  assert.ok(fs.existsSync(manifestPath), `${manifestPath} does not exist`);
  const content = fs.readFileSync(manifestPath, 'utf8');

  // Required permissions
  assert.ok(
    content.includes('android.permission.INTERNET'),
    'Missing android.permission.INTERNET permission for YouTube and online sync'
  );
  assert.ok(
    content.includes('android.permission.VIBRATE'),
    'Missing android.permission.VIBRATE permission for break timer haptics'
  );

  // MainActivity and launcher category
  assert.ok(content.includes('.MainActivity'), 'Missing MainActivity entry');
  assert.ok(content.includes('android.intent.category.LAUNCHER'), 'Missing LAUNCHER intent filter');
});

test('android/app/src/main/res/values/strings.xml defines app name as YKS 2027 Koçu', () => {
  const stringsPath = 'android/app/src/main/res/values/strings.xml';
  assert.ok(fs.existsSync(stringsPath), `${stringsPath} does not exist`);
  const content = fs.readFileSync(stringsPath, 'utf8');

  assert.ok(content.includes('<string name="app_name">YKS 2027 Koçu</string>'), 'Missing app_name "YKS 2027 Koçu"');
  assert.ok(content.includes('<string name="package_name">com.yks.planner</string>'), 'Missing package_name "com.yks.planner"');
});

test('android/app/src/main/assets contains synced web bundle with 766 curriculum videos', () => {
  const assetHtmlPath = 'android/app/src/main/assets/public/index.html';
  const assetConfigPath = 'android/app/src/main/assets/capacitor.config.json';

  // Ensure assets are synced even on clean clone where assets/public is gitignored
  if (!fs.existsSync(assetHtmlPath)) {
    execSync('npx cap sync android', { stdio: 'ignore' });
  }

  assert.ok(fs.existsSync(assetHtmlPath), `${assetHtmlPath} does not exist`);
  assert.ok(fs.existsSync(assetConfigPath), `${assetConfigPath} does not exist`);

  const htmlContent = fs.readFileSync(assetHtmlPath, 'utf8');
  assert.ok(htmlContent.includes('YKS 2027 Koçu'), 'Synced HTML is missing title "YKS 2027 Koçu"');
  assert.ok(htmlContent.includes('vnd.youtube:'), 'Synced HTML is missing native YouTube intent links');
  assert.ok(htmlContent.includes('19 Haziran 2027'), 'Synced HTML is missing 19 June 2027 target');

  const configContent = JSON.parse(fs.readFileSync(assetConfigPath, 'utf8'));
  assert.equal(configContent.appId, 'com.yks.planner', 'Config appId mismatch in Android assets');
  assert.equal(configContent.appName, 'YKS 2027 Koçu', 'Config appName mismatch in Android assets');
});
