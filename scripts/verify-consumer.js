#!/usr/bin/env node
/**
 * scripts/verify-consumer.js
 * End-to-end automated verification of jira-contracts in an isolated external consumer.
 * Tests:
 *  1. Fresh build & npm pack tarball generation
 *  2. Installation in an external isolated temp directory (--omit=dev)
 *  3. Verification that devDependencies are NOT present
 *  4. require('jira-contracts') root CJS export validation
 *  5. require('jira-contracts/gen/ts') Protobuf stubs & binary encode/decode roundtrips
 *  6. require('jira-contracts/validator') subpath export
 *  7. require('jira-contracts/schemas/*.json') direct schema assets
 *  8. ESM native import compatibility
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMP_CONSUMER_DIR = path.join(os.tmpdir(), `jira-consumer-test-${Date.now()}`);

function run(cmd, cwd = ROOT_DIR) {
  console.log(`[EXEC] ${cmd} (cwd: ${cwd})`);
  return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf-8' });
}

try {
  console.log('=== Step 1: Building jira-contracts ===');
  run('npm run build', ROOT_DIR);

  console.log('=== Step 2: Packaging jira-contracts (npm pack) ===');
  const packOutput = run('npm pack', ROOT_DIR).trim();
  const tarballLines = packOutput.split('\n').map((l) => l.trim()).filter((l) => l.endsWith('.tgz'));
  const tarballName = tarballLines.pop() || packOutput.split('\n').pop().trim();
  const tarballPath = path.join(ROOT_DIR, tarballName);
  assert(fs.existsSync(tarballPath), `Tarball not found at ${tarballPath}`);
  console.log(`Generated tarball: ${tarballPath}`);

  console.log('=== Step 3: Setting up isolated consumer directory ===');
  fs.mkdirSync(TEMP_CONSUMER_DIR, { recursive: true });
  console.log(`Consumer dir: ${TEMP_CONSUMER_DIR}`);

  // Create isolated package.json
  const consumerPkg = {
    name: 'isolated-consumer-test',
    version: '1.0.0',
    private: true,
  };
  fs.writeFileSync(path.join(TEMP_CONSUMER_DIR, 'package.json'), JSON.stringify(consumerPkg, null, 2));

  console.log('=== Step 4: Installing tarball in isolated consumer ===');
  // Install with --omit=dev to ensure no devDependencies leak
  run(`npm install "${tarballPath}" --omit=dev --ignore-scripts`, TEMP_CONSUMER_DIR);

  console.log('=== Step 5: Verifying devDependencies isolation ===');
  try {
    require(path.join(TEMP_CONSUMER_DIR, 'node_modules', 'jest'));
    assert.fail('Dev dependency "jest" leaked into production installation!');
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err;
    console.log('PASS: DevDependencies are strictly isolated.');
  }

  console.log('=== Step 6: Executing runtime CJS tests ===');
  const testScriptCjs = `
    const assert = require('assert');
    const jc = require('jira-contracts');
    const gen = require('jira-contracts/gen/ts');
    const val = require('jira-contracts/validator');
    const schema = require('jira-contracts/schemas/issues.events.json');

    // 1. Root exports
    assert.strictEqual(jc.KAFKA_TOPICS.ISSUES_EVENTS, 'issues.events');
    assert.strictEqual(jc.KAFKA_TOPICS.ANALYTICS_QUERY, 'analytics.query');
    assert.strictEqual(jc.KAFKA_TOPICS.ANALYTICS_REPLY, 'analytics.reply');
    assert.strictEqual(jc.KAFKA_HEADERS.CORRELATION_ID, 'kafka_correlationId');
    assert.strictEqual(jc.KAFKA_HEADERS.REPLY_TOPIC, 'kafka_replyTopic');
    assert.strictEqual(typeof jc.validateIssueEvent, 'function');
    assert.strictEqual(typeof jc.createContractValidator, 'function');

    // 2. Validator subpath
    assert.strictEqual(typeof val.validateIssueEvent, 'function');
    assert.strictEqual(typeof val.validateAnalyticsQuery, 'function');

    // 3. Schema JSON subpath
    assert.strictEqual(schema.title, 'IssueEvent');

    // 4. Protobuf stubs & Enums
    assert.strictEqual(gen.IssueStatus.ISSUE_STATUS_TODO, 1);
    assert.strictEqual(gen.IssuePriority.ISSUE_PRIORITY_HIGH, 3);
    assert.strictEqual(gen.SprintStatus.SPRINT_STATUS_ACTIVE, 2);
    assert.strictEqual(gen.AlertType.ALERT_TYPE_SCOPE_CREEP, 1);
    assert.strictEqual(gen.AlertSeverity.ALERT_SEVERITY_CRITICAL, 3);

    // 5. Protobuf encode/decode roundtrip
    const issue = gen.Issue.create({
      id: '00000000-0000-0000-0000-000000000001',
      key: 'TEST-1',
      projectId: '00000000-0000-0000-0000-000000000002',
      title: 'Packaging verification issue',
      status: gen.IssueStatus.ISSUE_STATUS_IN_PROGRESS,
      priority: gen.IssuePriority.ISSUE_PRIORITY_HIGH,
      type: gen.IssueType.ISSUE_TYPE_TASK,
      storyPoints: 5,
    });
    const bytes = gen.Issue.encode(issue).finish();
    assert(bytes instanceof Uint8Array && bytes.length > 0);
    const decoded = gen.Issue.decode(bytes);
    assert.deepStrictEqual(decoded, issue);

    // 6. Protobuf Sprint roundtrip
    const sprint = gen.Sprint.create({
      id: '00000000-0000-0000-0000-000000000003',
      projectId: '00000000-0000-0000-0000-000000000002',
      name: 'Sprint 1',
      status: gen.SprintStatus.SPRINT_STATUS_ACTIVE,
      totalStoryPoints: 30,
      completedStoryPoints: 10,
    });
    const sprintBytes = gen.Sprint.encode(sprint).finish();
    assert.deepStrictEqual(gen.Sprint.decode(sprintBytes), sprint);

    // 7. gRPC Service constructors
    assert.strictEqual(typeof gen.IssueServiceClient, 'function');
    assert.strictEqual(typeof gen.SprintServiceClient, 'function');
    assert.strictEqual(typeof gen.AlertServiceClient, 'function');

    console.log('PASS: All CJS runtime checks succeeded!');
  `;
  fs.writeFileSync(path.join(TEMP_CONSUMER_DIR, 'test-cjs.js'), testScriptCjs);
  run('node test-cjs.js', TEMP_CONSUMER_DIR);

  console.log('=== Step 7: Executing runtime ESM tests ===');
  const testScriptEsm = `
    import assert from 'assert';
    import { KAFKA_TOPICS, validateIssueEvent } from 'jira-contracts';
    import { Issue, IssueStatus, Sprint, SprintStatus } from 'jira-contracts/gen/ts';

    assert.strictEqual(KAFKA_TOPICS.ISSUES_EVENTS, 'issues.events');
    assert.strictEqual(IssueStatus.ISSUE_STATUS_TODO, 1);
    assert.strictEqual(SprintStatus.SPRINT_STATUS_ACTIVE, 2);

    const issue = Issue.create({ id: 'esm-1', title: 'ESM', status: IssueStatus.ISSUE_STATUS_TODO });
    const bytes = Issue.encode(issue).finish();
    assert.strictEqual(Issue.decode(bytes).title, 'ESM');

    console.log('PASS: All ESM runtime checks succeeded!');
  `;
  fs.writeFileSync(path.join(TEMP_CONSUMER_DIR, 'test-esm.mjs'), testScriptEsm);
  run('node test-esm.mjs', TEMP_CONSUMER_DIR);

  console.log('\n======================================================');
  console.log('[SUCCESS] ALL ISOLATED CONSUMER VERIFICATION TESTS PASSED!');
  console.log('======================================================');
} finally {
  console.log('=== Cleaning up temporary artifacts ===');
  try {
    if (fs.existsSync(TEMP_CONSUMER_DIR)) {
      fs.rmSync(TEMP_CONSUMER_DIR, { recursive: true, force: true });
    }
    const tarballs = fs.readdirSync(ROOT_DIR).filter((f) => f.startsWith('jira-contracts-') && f.endsWith('.tgz'));
    tarballs.forEach((t) => fs.rmSync(path.join(ROOT_DIR, t), { force: true }));
  } catch (cleanErr) {
    console.warn('[WARN] Cleanup warning:', cleanErr.message);
  }
}
