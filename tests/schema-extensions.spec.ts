/**
 * jira-contracts: tests for the schema extensions of the identity/projects/hours release
 * (parentId, healthStatus, nullable actualRemaining, velocitySampleSize, PROJECT_TREND)
 * and for keeping the built-in schemas in sync with schemas/*.json.
 */

import fs from 'fs';
import path from 'path';
import {
  ANALYTICS_QUERY_TYPES,
  DEFAULT_ANALYTICS_QUERY_SCHEMA,
  DEFAULT_ANALYTICS_REPLY_SCHEMA,
  DEFAULT_ISSUE_EVENTS_SCHEMA,
  createContractValidator,
} from '../src/validator';

/** Removes the free-text keys so only the validation rules are compared. */
function rulesOnly(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(rulesOnly);
  if (schema && typeof schema === 'object') {
    return Object.fromEntries(
      Object.entries(schema as Record<string, unknown>)
        .filter(([key]) => key !== 'description')
        .map(([key, value]) => [key, rulesOnly(value)]),
    );
  }
  return schema;
}

function readDiskSchema(fileName: string): unknown {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../schemas', fileName), 'utf-8'));
}

const validator = createContractValidator();

const SPRINT_ID = '77777777-7777-4777-8777-777777777777';
const PROJECT_ID = '88888888-8888-4888-8888-888888888888';

describe('built-in schemas match schemas/*.json', () => {
  it.each([
    ['issues.events.json', DEFAULT_ISSUE_EVENTS_SCHEMA],
    ['analytics.query.json', DEFAULT_ANALYTICS_QUERY_SCHEMA],
    ['analytics.reply.json', DEFAULT_ANALYTICS_REPLY_SCHEMA],
  ])('%s has the same rules as the built-in schema', (fileName, builtIn) => {
    expect(rulesOnly(builtIn)).toEqual(rulesOnly(readDiskSchema(fileName)));
  });
});

describe('issues.events parentId', () => {
  const event = {
    eventId: '11111111-1111-4111-8111-111111111111',
    eventType: 'ISSUE_CREATED',
    timestamp: '2026-11-15T10:00:00.000Z',
    payload: {
      id: '22222222-2222-4222-8222-222222222222',
      key: 'PROJ-2',
      projectId: PROJECT_ID,
      title: 'Story under an epic',
      status: 'TODO',
      priority: 'MEDIUM',
      type: 'STORY',
      storyPoints: 3,
    },
  };

  it.each([
    ['without parentId', undefined],
    ['with a null parentId', null],
    ['with an epic id', '33333333-3333-4333-8333-333333333333'],
  ])('accepts an event %s', (_label, parentId) => {
    const payload = parentId === undefined ? event.payload : { ...event.payload, parentId };
    expect(validator.validateIssueEvent({ ...event, payload }).valid).toBe(true);
  });

  it('rejects a parentId that is not a UUID', () => {
    const result = validator.validateIssueEvent({ ...event, payload: { ...event.payload, parentId: 'PROJ-1' } });
    expect(result.valid).toBe(false);
  });
});

describe('analytics.query PROJECT_TREND', () => {
  const base = {
    queryId: '55555555-5555-4555-8555-555555555555',
    correlationId: '66666666-6666-4666-8666-666666666666',
    timestamp: '2026-11-15T10:05:00.000Z',
  };

  it('lists PROJECT_TREND as a query type', () => {
    expect(ANALYTICS_QUERY_TYPES).toContain('PROJECT_TREND');
  });

  it('accepts PROJECT_TREND with projectId and no sprintId', () => {
    expect(validator.validateAnalyticsQuery({ ...base, queryType: 'PROJECT_TREND', projectId: PROJECT_ID }).valid).toBe(true);
  });

  it('rejects PROJECT_TREND without projectId', () => {
    const result = validator.validateAnalyticsQuery({ ...base, queryType: 'PROJECT_TREND', sprintId: SPRINT_ID });
    expect(result.valid).toBe(false);
    expect(result.formattedErrors?.join(' ')).toContain('projectId');
  });

  it('still requires sprintId for sprint queries', () => {
    const result = validator.validateAnalyticsQuery({ ...base, queryType: 'BURNDOWN', projectId: PROJECT_ID });
    expect(result.valid).toBe(false);
    expect(result.formattedErrors?.join(' ')).toContain('sprintId');
  });

  it('keeps accepting the current sprint queries', () => {
    expect(validator.validateAnalyticsQuery({ ...base, queryType: 'BURNDOWN', sprintId: SPRINT_ID }).valid).toBe(true);
  });
});

describe('analytics.reply extensions', () => {
  const sprintReply = {
    replyId: '99999999-9999-4999-8999-999999999999',
    correlationId: '66666666-6666-4666-8666-666666666666',
    sprintId: SPRINT_ID,
    status: 'SUCCESS',
    totalPoints: 20,
    completedPoints: 8,
    remainingPoints: 12,
    velocity: 0,
    velocitySampleSize: 0,
    healthScore: 70,
    healthStatus: 'AT_RISK',
    burndownData: [
      { date: '2026-11-16', dayIndex: 0, idealRemaining: 20, actualRemaining: 20 },
      { date: '2026-11-17', dayIndex: 1, idealRemaining: 10, actualRemaining: null },
    ],
    timestamp: '2026-11-16T10:05:01.200Z',
  };

  it('accepts healthStatus, velocitySampleSize and null actualRemaining for future days', () => {
    expect(validator.validateAnalyticsReply(sprintReply).valid).toBe(true);
  });

  it.each(['HEALTHY', 'AT_RISK', 'CRITICAL', 'NOT_STARTED', 'NO_SCOPE'])('accepts healthStatus %s', (healthStatus) => {
    expect(validator.validateAnalyticsReply({ ...sprintReply, healthStatus }).valid).toBe(true);
  });

  it('rejects an unknown healthStatus and a negative or fractional velocitySampleSize', () => {
    expect(validator.validateAnalyticsReply({ ...sprintReply, healthStatus: 'UNAVAILABLE' }).valid).toBe(false);
    expect(validator.validateAnalyticsReply({ ...sprintReply, velocitySampleSize: -1 }).valid).toBe(false);
    expect(validator.validateAnalyticsReply({ ...sprintReply, velocitySampleSize: 1.5 }).valid).toBe(false);
  });

  it('still requires sprintId when queryType is absent (current MS3 replies)', () => {
    const { sprintId, ...withoutSprint } = sprintReply;
    expect(sprintId).toBeDefined();
    expect(validator.validateAnalyticsReply(withoutSprint).valid).toBe(false);
  });

  const trendReply = {
    replyId: '99999999-9999-4999-8999-999999999999',
    correlationId: '66666666-6666-4666-8666-666666666666',
    queryType: 'PROJECT_TREND',
    projectId: PROJECT_ID,
    status: 'SUCCESS',
    velocity: 9,
    velocitySampleSize: 2,
    velocityHistory: [
      {
        sprintId: '44444444-4444-4444-8444-444444444444',
        sprintName: 'Sprint 1',
        committedStoryPoints: 10,
        completedStoryPoints: 8,
        completedDate: '2026-10-30T18:00:00.000Z',
      },
      {
        sprintId: SPRINT_ID,
        sprintName: 'Sprint 2',
        committedStoryPoints: 12,
        completedStoryPoints: 10,
        completedDate: '2026-11-13T18:00:00.000Z',
      },
    ],
    timestamp: '2026-11-15T10:05:01.200Z',
  };

  it('accepts a PROJECT_TREND reply with projectId and velocityHistory but no sprintId', () => {
    expect(validator.validateAnalyticsReply(trendReply).valid).toBe(true);
  });

  it('rejects a PROJECT_TREND reply without projectId', () => {
    const { projectId, ...withoutProject } = trendReply;
    expect(projectId).toBeDefined();
    expect(validator.validateAnalyticsReply(withoutProject).valid).toBe(false);
  });

  it('rejects velocityHistory entries with missing or invalid fields', () => {
    const [first] = trendReply.velocityHistory;
    const { completedDate, ...withoutDate } = first;
    expect(completedDate).toBeDefined();
    expect(validator.validateAnalyticsReply({ ...trendReply, velocityHistory: [withoutDate] }).valid).toBe(false);
    expect(
      validator.validateAnalyticsReply({ ...trendReply, velocityHistory: [{ ...first, completedStoryPoints: -2 }] }).valid,
    ).toBe(false);
    expect(validator.validateAnalyticsReply({ ...trendReply, velocityHistory: [{ ...first, extra: true }] }).valid).toBe(false);
  });
});
