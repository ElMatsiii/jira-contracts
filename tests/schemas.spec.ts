/**
 * jira-contracts: JSON Schema Specification Tests
 * Validates the draft-07 schemas directly against meta-schemas and positive/negative fixtures.
 */

import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  DEFAULT_ISSUE_EVENTS_SCHEMA,
  DEFAULT_ANALYTICS_QUERY_SCHEMA,
  DEFAULT_ANALYTICS_REPLY_SCHEMA,
} from '../src/validator';

describe('Kafka JSON Schemas (Draft-07 Validation)', () => {
  let ajv: Ajv;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true, strict: false, strictNumbers: true, validateFormats: true });
    addFormats(ajv);
  });

  describe('Disk JSON Files Integrity', () => {
    it('should read and parse schemas/issues.events.json from disk', () => {
      const filePath = path.resolve(__dirname, '../schemas/issues.events.json');
      expect(fs.existsSync(filePath)).toBe(true);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(ajv.validateSchema(parsed)).toBe(true);
    });

    it('should read and parse schemas/analytics.query.json from disk', () => {
      const filePath = path.resolve(__dirname, '../schemas/analytics.query.json');
      expect(fs.existsSync(filePath)).toBe(true);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(ajv.validateSchema(parsed)).toBe(true);
    });

    it('should read and parse schemas/analytics.reply.json from disk', () => {
      const filePath = path.resolve(__dirname, '../schemas/analytics.reply.json');
      expect(fs.existsSync(filePath)).toBe(true);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(parsed.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(ajv.validateSchema(parsed)).toBe(true);
    });
  });

  describe('Draft-07 Schema Conformity', () => {
    it('should validate that DEFAULT_ISSUE_EVENTS_SCHEMA is a valid JSON schema', () => {
      const isValidSchema = ajv.validateSchema(DEFAULT_ISSUE_EVENTS_SCHEMA);
      expect(isValidSchema).toBe(true);
      expect(DEFAULT_ISSUE_EVENTS_SCHEMA.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(DEFAULT_ISSUE_EVENTS_SCHEMA.title).toBe('IssueEvent');
    });

    it('should validate that DEFAULT_ANALYTICS_QUERY_SCHEMA is a valid JSON schema', () => {
      const isValidSchema = ajv.validateSchema(DEFAULT_ANALYTICS_QUERY_SCHEMA);
      expect(isValidSchema).toBe(true);
      expect(DEFAULT_ANALYTICS_QUERY_SCHEMA.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(DEFAULT_ANALYTICS_QUERY_SCHEMA.title).toBe('AnalyticsQuery');
    });

    it('should validate that DEFAULT_ANALYTICS_REPLY_SCHEMA is a valid JSON schema', () => {
      const isValidSchema = ajv.validateSchema(DEFAULT_ANALYTICS_REPLY_SCHEMA);
      expect(isValidSchema).toBe(true);
      expect(DEFAULT_ANALYTICS_REPLY_SCHEMA.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(DEFAULT_ANALYTICS_REPLY_SCHEMA.title).toBe('AnalyticsReply');
    });
  });

  describe('issues.events.json Schema Validation', () => {
    let validateIssueEvent: ReturnType<typeof ajv.compile>;

    beforeAll(() => {
      validateIssueEvent = ajv.compile(DEFAULT_ISSUE_EVENTS_SCHEMA);
    });

    const validPayload = {
      eventId: '11111111-1111-4111-8111-111111111111',
      eventType: 'ISSUE_CREATED',
      aggregateId: '22222222-2222-4222-8222-222222222222',
      timestamp: '2026-10-27T10:00:00.000Z',
      version: 1,
      payload: {
        id: '22222222-2222-4222-8222-222222222222',
        key: 'PROJ-101',
        projectId: '33333333-3333-4333-8333-333333333333',
        title: 'Implement OAuth Authentication',
        description: 'Provide secure token exchange',
        status: 'TODO',
        priority: 'HIGH',
        type: 'STORY',
        storyPoints: 5,
        sprintId: null,
        assigneeId: null,
        reporterId: '44444444-4444-4444-8444-444444444444',
        acceptanceCriteria: 'Scenario: Token is issued',
        createdAt: '2026-10-27T10:00:00.000Z',
        updatedAt: '2026-10-27T10:00:00.000Z',
        previousStatus: null,
        previousSprintId: null,
      },
    };

    it('should accept valid ISSUE_CREATED event', () => {
      const isValid = validateIssueEvent(validPayload);
      expect(isValid).toBe(true);
      expect(validateIssueEvent.errors).toBeNull();
    });

    it.each([
      'ISSUE_CREATED',
      'ISSUE_UPDATED',
      'ISSUE_STATUS_CHANGED',
      'ISSUE_SPRINT_ASSIGNED',
      'ISSUE_DELETED',
    ])('should accept all valid event types: %s', (eventType) => {
      const payload = { ...validPayload, eventType };
      expect(validateIssueEvent(payload)).toBe(true);
    });

    it.each(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])('should accept valid issue status: %s', (status) => {
      const payload = {
        ...validPayload,
        payload: { ...validPayload.payload, status },
      };
      expect(validateIssueEvent(payload)).toBe(true);
    });

    it.each(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])('should accept valid issue priority: %s', (priority) => {
      const payload = {
        ...validPayload,
        payload: { ...validPayload.payload, priority },
      };
      expect(validateIssueEvent(payload)).toBe(true);
    });

    it.each(['STORY', 'TASK', 'BUG', 'EPIC'])('should accept valid issue type: %s', (type) => {
      const payload = {
        ...validPayload,
        payload: { ...validPayload.payload, type },
      };
      expect(validateIssueEvent(payload)).toBe(true);
    });

    it('should reject invalid eventType enum', () => {
      const invalid = { ...validPayload, eventType: 'INVALID_TYPE' };
      expect(validateIssueEvent(invalid)).toBe(false);
      expect(validateIssueEvent.errors?.[0].keyword).toBe('enum');
    });

    it('should reject invalid timestamp format', () => {
      const invalid = { ...validPayload, timestamp: '2026-99-99 25:99' };
      expect(validateIssueEvent(invalid)).toBe(false);
    });

    it('should reject version less than 1', () => {
      const invalid = { ...validPayload, version: 0 };
      expect(validateIssueEvent(invalid)).toBe(false);
      expect(validateIssueEvent.errors?.[0].keyword).toBe('minimum');
    });

    it('should reject payload missing required properties', () => {
      const invalid = {
        ...validPayload,
        payload: { id: '22222222-2222-4222-8222-222222222222' },
      };
      expect(validateIssueEvent(invalid)).toBe(false);
      expect(validateIssueEvent.errors?.some((e) => e.keyword === 'required')).toBe(true);
    });

    it('should reject payload with negative story points', () => {
      const invalid = {
        ...validPayload,
        payload: { ...validPayload.payload, storyPoints: -1 },
      };
      expect(validateIssueEvent(invalid)).toBe(false);
    });

    it('should reject invalid issue key pattern', () => {
      const invalid = {
        ...validPayload,
        payload: { ...validPayload.payload, key: 'invalid_key_format' },
      };
      expect(validateIssueEvent(invalid)).toBe(false);
    });

    it('should reject unexpected additional properties', () => {
      const invalid = { ...validPayload, unknownField: 'malicious-data' };
      expect(validateIssueEvent(invalid)).toBe(false);
      expect(validateIssueEvent.errors?.[0].keyword).toBe('additionalProperties');
    });

    it.each([Infinity, -Infinity, NaN])('should reject non-finite storyPoints: %s', (storyPoints) => {
      const payload = {
        ...validPayload,
        payload: { ...validPayload.payload, storyPoints },
      };
      expect(validateIssueEvent(payload)).toBe(false);
      expect(validateIssueEvent.errors?.some((e) => e.keyword === 'type')).toBe(true);
    });

    it.each([3.5, -1, '5'])('should reject non-integer or negative storyPoints: %s', (storyPoints) => {
      const payload = {
        ...validPayload,
        payload: { ...validPayload.payload, storyPoints: storyPoints as any },
      };
      expect(validateIssueEvent(payload)).toBe(false);
    });

    it.each([Infinity, -Infinity, NaN, 0, -1, 1.5])('should reject invalid version numbers: %s', (version) => {
      const payload = { ...validPayload, version };
      expect(validateIssueEvent(payload)).toBe(false);
    });

    it.each(['', '   ', 'not-a-uuid', '12345', '11111111-2222-3333-4444'])(
      'should reject invalid UUID for eventId: "%s"',
      (eventId) => {
        const payload = { ...validPayload, eventId };
        expect(validateIssueEvent(payload)).toBe(false);
        expect(
          validateIssueEvent.errors?.some(
            (e) => e.keyword === 'format' || e.keyword === 'minLength',
          ),
        ).toBe(true);
      },
    );

    it.each(['', 'not-a-uuid'])('should reject invalid UUID for payload.id: "%s"', (id) => {
      const payload = {
        ...validPayload,
        payload: { ...validPayload.payload, id },
      };
      expect(validateIssueEvent(payload)).toBe(false);
    });

    it.each(['', 'not-a-uuid'])('should reject invalid UUID for payload.projectId: "%s"', (projectId) => {
      const payload = {
        ...validPayload,
        payload: { ...validPayload.payload, projectId },
      };
      expect(validateIssueEvent(payload)).toBe(false);
    });

    it.each(['', 'not-a-uuid'])('should reject non-null invalid UUID for payload.sprintId: "%s"', (sprintId) => {
      const payload = {
        ...validPayload,
        payload: { ...validPayload.payload, sprintId },
      };
      expect(validateIssueEvent(payload)).toBe(false);
    });

    it('should accept null for nullable fields: sprintId, assigneeId, previousStatus, previousSprintId', () => {
      const payload = {
        ...validPayload,
        payload: {
          ...validPayload.payload,
          sprintId: null,
          assigneeId: null,
          previousStatus: null,
          previousSprintId: null,
        },
      };
      expect(validateIssueEvent(payload)).toBe(true);
    });
  });

  describe('analytics.query.json Schema Validation', () => {
    let validateAnalyticsQuery: ReturnType<typeof ajv.compile>;

    beforeAll(() => {
      validateAnalyticsQuery = ajv.compile(DEFAULT_ANALYTICS_QUERY_SCHEMA);
    });

    const validQuery = {
      queryId: '55555555-5555-4555-8555-555555555555',
      correlationId: '66666666-6666-4666-8666-666666666666',
      replyTopic: 'analytics.reply',
      sprintId: '77777777-7777-4777-8777-777777777777',
      projectId: '88888888-8888-4888-8888-888888888888',
      queryType: 'BURNDOWN_SNAPSHOT',
      timestamp: '2026-10-27T10:05:00.000Z',
    };

    it('should accept valid AnalyticsQuery payload', () => {
      expect(validateAnalyticsQuery(validQuery)).toBe(true);
    });

    it.each([
      'BURNDOWN',
      'VELOCITY',
      'SPRINT_HEALTH',
      'FULL_DIAGNOSTIC',
      'BURNDOWN_SNAPSHOT',
      'VELOCITY_FORECAST',
      'SPRINT_HEALTH_AUDIT',
    ])('should accept valid queryType: %s', (queryType) => {
      expect(validateAnalyticsQuery({ ...validQuery, queryType })).toBe(true);
    });

    it('should accept query without optional projectId', () => {
      const { projectId, ...queryWithoutProject } = validQuery;
      expect(validateAnalyticsQuery(queryWithoutProject)).toBe(true);
    });

    it('should accept query with optional metadata object', () => {
      const queryWithMeta = {
        ...validQuery,
        metadata: { requester: 'jira-bff', clientIp: '10.0.0.1' },
      };
      expect(validateAnalyticsQuery(queryWithMeta)).toBe(true);
    });

    it('should reject query missing correlationId', () => {
      const { correlationId, ...invalid } = validQuery;
      expect(validateAnalyticsQuery(invalid)).toBe(false);
      expect(validateAnalyticsQuery.errors?.some((e) => e.keyword === 'required')).toBe(true);
    });

    it('should reject invalid queryType enum', () => {
      const invalid = { ...validQuery, queryType: 'INVALID_QUERY' };
      expect(validateAnalyticsQuery(invalid)).toBe(false);
    });

    it.each(['', '   ', 'not-a-uuid'])('should reject invalid UUID for queryId: "%s"', (queryId) => {
      expect(validateAnalyticsQuery({ ...validQuery, queryId })).toBe(false);
    });

    it.each(['', 'not-a-uuid'])('should reject invalid UUID for correlationId: "%s"', (correlationId) => {
      expect(validateAnalyticsQuery({ ...validQuery, correlationId })).toBe(false);
    });

    it.each(['', 'not-a-uuid'])('should reject invalid UUID for sprintId: "%s"', (sprintId) => {
      expect(validateAnalyticsQuery({ ...validQuery, sprintId })).toBe(false);
    });

    it.each(['', 'not-a-uuid'])('should reject invalid UUID for optional projectId: "%s"', (projectId) => {
      expect(validateAnalyticsQuery({ ...validQuery, projectId })).toBe(false);
    });
  });

  describe('analytics.reply.json Schema Validation', () => {
    let validateAnalyticsReply: ReturnType<typeof ajv.compile>;

    beforeAll(() => {
      validateAnalyticsReply = ajv.compile(DEFAULT_ANALYTICS_REPLY_SCHEMA);
    });

    const validSuccessReply = {
      replyId: '99999999-9999-4999-8999-999999999999',
      correlationId: '66666666-6666-4666-8666-666666666666',
      sprintId: '77777777-7777-4777-8777-777777777777',
      status: 'SUCCESS',
      errorMessage: null,
      totalPoints: 40,
      completedPoints: 25,
      remainingPoints: 15,
      velocity: 28.5,
      healthScore: 88,
      burndownData: [
        {
          date: '2026-10-20',
          dayIndex: 0,
          idealRemaining: 40,
          actualRemaining: 40,
          completedOnDay: 0,
        },
        {
          date: '2026-10-21',
          dayIndex: 1,
          idealRemaining: 36,
          actualRemaining: 32,
          completedOnDay: 8,
        },
      ],
      diagnostics: ['Scope stable', 'Velocity meets 2-week target'],
      recommendations: ['Maintain current cadence'],
      timestamp: '2026-10-27T10:05:01.200Z',
    };

    it('should accept valid SUCCESS AnalyticsReply payload', () => {
      expect(validateAnalyticsReply(validSuccessReply)).toBe(true);
    });

    it('should accept valid FAILED AnalyticsReply payload with errorMessage', () => {
      const failedReply = {
        replyId: '99999999-9999-4999-8999-999999999999',
        correlationId: '66666666-6666-4666-8666-666666666666',
        sprintId: '77777777-7777-4777-8777-777777777777',
        status: 'FAILED',
        errorMessage: 'Sprint not found in analytics database',
        timestamp: '2026-10-27T10:05:01.200Z',
      };
      expect(validateAnalyticsReply(failedReply)).toBe(true);
    });

    it('should reject healthScore out of range (> 100 or < 0)', () => {
      expect(validateAnalyticsReply({ ...validSuccessReply, healthScore: 101 })).toBe(false);
      expect(validateAnalyticsReply({ ...validSuccessReply, healthScore: -1 })).toBe(false);
    });

    it('should reject burndown item missing required fields', () => {
      const invalid = {
        ...validSuccessReply,
        burndownData: [
          {
            date: '2026-10-20',
          },
        ],
      };
      expect(validateAnalyticsReply(invalid)).toBe(false);
    });

    it('should reject reply missing required correlationId', () => {
      const { correlationId, ...invalid } = validSuccessReply;
      expect(validateAnalyticsReply(invalid)).toBe(false);
    });

    it.each(['', 'not-a-uuid'])('should reject invalid UUID for replyId: "%s"', (replyId) => {
      expect(validateAnalyticsReply({ ...validSuccessReply, replyId })).toBe(false);
    });

    it.each(['', 'not-a-uuid'])('should reject invalid UUID for correlationId: "%s"', (correlationId) => {
      expect(validateAnalyticsReply({ ...validSuccessReply, correlationId })).toBe(false);
    });

    it.each(['', 'not-a-uuid'])('should reject invalid UUID for sprintId: "%s"', (sprintId) => {
      expect(validateAnalyticsReply({ ...validSuccessReply, sprintId })).toBe(false);
    });

    it.each([Infinity, -Infinity, NaN, -1, 40.5])('should reject non-finite or invalid totalPoints: %s', (totalPoints) => {
      expect(validateAnalyticsReply({ ...validSuccessReply, totalPoints })).toBe(false);
    });

    it.each([Infinity, -Infinity, NaN, -1])('should reject non-finite completedPoints: %s', (completedPoints) => {
      expect(validateAnalyticsReply({ ...validSuccessReply, completedPoints })).toBe(false);
    });

    it.each([Infinity, -Infinity, NaN, -1])('should reject non-finite remainingPoints: %s', (remainingPoints) => {
      expect(validateAnalyticsReply({ ...validSuccessReply, remainingPoints })).toBe(false);
    });

    it.each([Infinity, -Infinity, NaN])('should reject non-finite velocity: %s', (velocity) => {
      expect(validateAnalyticsReply({ ...validSuccessReply, velocity })).toBe(false);
    });

    it.each([Infinity, -Infinity, NaN])('should reject non-finite healthScore: %s', (healthScore) => {
      expect(validateAnalyticsReply({ ...validSuccessReply, healthScore })).toBe(false);
    });

    it.each([Infinity, -Infinity, NaN, -1, 1.5])('should reject non-finite or invalid dayIndex: %s', (dayIndex) => {
      const reply = JSON.parse(JSON.stringify(validSuccessReply));
      reply.burndownData[0].dayIndex = dayIndex;
      expect(validateAnalyticsReply(reply)).toBe(false);
    });
  });
});
