/**
 * jira-contracts: Index Module Tests
 * Validates that all exports, topic constants, header constants, and re-exported schemas
 * are accessible from the main package entry point.
 */

import {
  KAFKA_TOPICS,
  KAFKA_HEADERS,
  IssueEventsSchema,
  AnalyticsQuerySchema,
  AnalyticsReplySchema,
  validateIssueEvent,
  assertIssueEvent,
  validateAnalyticsQuery,
  assertAnalyticsQuery,
  validateAnalyticsReply,
  assertAnalyticsReply,
  createContractValidator,
  ContractValidator,
  ContractValidationError,
} from '../src/index';

describe('jira-contracts Index Entry Point', () => {
  it('should export standardized Kafka topic constants', () => {
    expect(KAFKA_TOPICS.ISSUES_EVENTS).toBe('issues.events');
    expect(KAFKA_TOPICS.ANALYTICS_QUERY).toBe('analytics.query');
    expect(KAFKA_TOPICS.ANALYTICS_REPLY).toBe('analytics.reply');
  });

  it('should export standardized Kafka header constants', () => {
    expect(KAFKA_HEADERS.CORRELATION_ID).toBe('kafka_correlationId');
    expect(KAFKA_HEADERS.REPLY_TOPIC).toBe('kafka_replyTopic');
  });

  it('should re-export default schemas', () => {
    expect(IssueEventsSchema).toBeDefined();
    expect(IssueEventsSchema.title).toBe('IssueEvent');
    expect(AnalyticsQuerySchema).toBeDefined();
    expect(AnalyticsQuerySchema.title).toBe('AnalyticsQuery');
    expect(AnalyticsReplySchema).toBeDefined();
    expect(AnalyticsReplySchema.title).toBe('AnalyticsReply');
  });

  it('should re-export validator classes and helper functions', () => {
    expect(typeof validateIssueEvent).toBe('function');
    expect(typeof assertIssueEvent).toBe('function');
    expect(typeof validateAnalyticsQuery).toBe('function');
    expect(typeof assertAnalyticsQuery).toBe('function');
    expect(typeof validateAnalyticsReply).toBe('function');
    expect(typeof assertAnalyticsReply).toBe('function');
    expect(typeof createContractValidator).toBe('function');
    expect(ContractValidator).toBeDefined();
    expect(ContractValidationError).toBeDefined();
  });
});
