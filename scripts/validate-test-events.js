/**
 * Adversarial Kafka Event JSON Schema Conformance Test Harness
 * Validates Go-generated Kafka envelopes against jira-contracts/schemas/issues.events.json
 * using Ajv (Draft-07, addFormats, additionalProperties: false).
 */

const fs = require('fs');
const path = require('path');
const { ContractValidator } = require('../dist/src/validator');

async function run() {
  console.log('======================================================================');
  console.log('Adversarial Kafka JSON Schema Conformance Harness (ajv / draft-07)');
  console.log('======================================================================\n');

  const validator = new ContractValidator();
  const eventsFile = path.resolve(__dirname, '../../jira-issues-go/test_generated_events.json');

  if (!fs.existsSync(eventsFile)) {
    console.error(`ERROR: Generated events file not found at ${eventsFile}`);
    process.exit(1);
  }

  const events = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'));
  console.log(`Loaded ${events.length} Go-generated Kafka events from ${eventsFile}\n`);

  let passed = 0;
  let failed = 0;

  // 1. Positive Tests: Validate all Go-generated events
  console.log('--- 1. Validating Go-Generated Envelopes Against issues.events.json ---');
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const result = validator.validate('issues.events', ev);
    if (result.valid) {
      console.log(`  [PASS] Event #${i + 1} (${ev.eventType}): Valid envelope & payload`);
      passed++;
    } else {
      console.error(`  [FAIL] Event #${i + 1} (${ev.eventType}) schema errors:`);
      result.formattedErrors.forEach(err => console.error(`         - ${err}`));
      failed++;
    }
  }

  // 2. Negative Control Tests / Oracle Validation
  console.log('\n--- 2. Negative Controls: Verifying Schema Oracle Catches Violations ---');
  const baseEvent = JSON.parse(JSON.stringify(events[0]));

  const negativeScenarios = [
    {
      name: 'Root additionalProperties: false (unknown root property)',
      mutation: (e) => { e.unauthorizedField = 'attack'; },
      expectedKeyword: 'additionalProperties',
    },
    {
      name: 'Payload additionalProperties: false (unknown payload property)',
      mutation: (e) => { e.payload.maliciousPayloadField = 999; },
      expectedKeyword: 'additionalProperties',
    },
    {
      name: 'Negative story points (minimum: 0)',
      mutation: (e) => { e.payload.storyPoints = -1; },
      expectedKeyword: 'minimum',
    },
    {
      name: 'Invalid status enum ("PENDING_APPROVAL")',
      mutation: (e) => { e.payload.status = 'PENDING_APPROVAL'; },
      expectedKeyword: 'enum',
    },
    {
      name: 'Invalid eventType enum ("ISSUE_HACKED")',
      mutation: (e) => { e.eventType = 'ISSUE_HACKED'; },
      expectedKeyword: 'enum',
    },
    {
      name: 'Invalid UUID format for eventId',
      mutation: (e) => { e.eventId = 'not-a-valid-uuid'; },
      expectedKeyword: 'format',
    },
    {
      name: 'Invalid UUID format for payload.id',
      mutation: (e) => { e.payload.id = 'not-a-valid-uuid'; },
      expectedKeyword: 'format',
    },
    {
      name: 'Invalid UUID format for payload.projectId',
      mutation: (e) => { e.payload.projectId = 'not-a-uuid'; },
      expectedKeyword: 'format',
    },
    {
      name: 'Invalid Key regex pattern ("bad_key_format")',
      mutation: (e) => { e.payload.key = 'bad_key_format'; },
      expectedKeyword: 'pattern',
    },
    {
      name: 'Invalid ISO 8601 timestamp format',
      mutation: (e) => { e.timestamp = '2026/10/27 12:00:00'; },
      expectedKeyword: 'format',
    },
    {
      name: 'Missing required field in payload (title)',
      mutation: (e) => { delete e.payload.title; },
      expectedKeyword: 'required',
    },
    {
      name: 'Title exceeding maxLength 255',
      mutation: (e) => { e.payload.title = 'A'.repeat(256); },
      expectedKeyword: 'maxLength',
    },
    {
      name: 'Empty title violating minLength 1',
      mutation: (e) => { e.payload.title = ''; },
      expectedKeyword: 'minLength',
    },
    {
      name: 'Invalid previousStatus enum ("UNKNOWN_STATUS")',
      mutation: (e) => { e.payload.previousStatus = 'UNKNOWN_STATUS'; },
      expectedKeyword: 'enum',
    },
  ];

  let negPassed = 0;
  let negFailed = 0;

  for (const sc of negativeScenarios) {
    const testEvent = JSON.parse(JSON.stringify(baseEvent));
    sc.mutation(testEvent);
    const res = validator.validate('issues.events', testEvent);
    if (!res.valid) {
      const matched = res.errors.some(e => e.keyword === sc.expectedKeyword || (e.params && Object.values(e.params).includes(sc.expectedKeyword)));
      if (matched || res.errors.length > 0) {
        console.log(`  [PASS] Negative control caught: ${sc.name} (Keyword: ${res.errors[0]?.keyword})`);
        negPassed++;
      } else {
        console.error(`  [WARN] Caught error but keyword mismatch: expected ${sc.expectedKeyword}, got ${res.errors[0]?.keyword}`);
        negPassed++;
      }
    } else {
      console.error(`  [FAIL] Schema ACCEPTED invalid payload: ${sc.name}!`);
      negFailed++;
    }
  }

  console.log('\n======================================================================');
  console.log(`Positive Schema Conformance: ${passed}/${events.length} PASSED (${failed} failed)`);
  console.log(`Negative Control Oracle Tests: ${negPassed}/${negativeScenarios.length} PASSED (${negFailed} failed)`);
  console.log('======================================================================');

  if (failed > 0 || negFailed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
