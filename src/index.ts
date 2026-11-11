/**
 * jira-contracts: Central entry point
 * Re-exports schema definitions, Ajv validator functions, types, and Kafka topic constants.
 */

export * from './validator';
export { createGrpcMetadata, createInsecureGrpcCredentials } from './grpc-credentials';

export {
  DEFAULT_ISSUE_EVENTS_SCHEMA as IssueEventsSchema,
  DEFAULT_ANALYTICS_QUERY_SCHEMA as AnalyticsQuerySchema,
  DEFAULT_ANALYTICS_REPLY_SCHEMA as AnalyticsReplySchema,
} from './validator';

// ============================================================================
// Standardized Kafka Topic Constants
// ============================================================================

export const KAFKA_TOPICS = {
  /** Topic for asynchronous issue domain events emitted by MS1 (Go) */
  ISSUES_EVENTS: 'issues.events',
  /** Topic for analytics request messages sent to MS3 (.NET) */
  ANALYTICS_QUERY: 'analytics.query',
  /** Topic for analytics reply messages published by MS3 (.NET) */
  ANALYTICS_REPLY: 'analytics.reply',
} as const;

export type KafkaTopicName = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

// ============================================================================
// Standardized Kafka Header Constants (Request-Reply Correlation)
// ============================================================================

export const KAFKA_HEADERS = {
  /** Correlation identifier header passed between MS2/BFF and MS3 */
  CORRELATION_ID: 'kafka_correlationId',
  /** Destination topic header for the asynchronous reply message */
  REPLY_TOPIC: 'kafka_replyTopic',
} as const;
