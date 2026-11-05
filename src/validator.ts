/**
 * jira-contracts: JSON Schema Validator Module
 * Provides Ajv-based compiled schema validation and TypeScript type guards
 * for Kafka events and request-reply payloads across the Jira AI polyglot architecture.
 */

import Ajv, { Options as AjvOptions, ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

// ============================================================================
// TypeScript Interfaces & Types for Kafka Contracts
// ============================================================================

export type IssueEventType =
  | 'ISSUE_CREATED'
  | 'ISSUE_UPDATED'
  | 'ISSUE_STATUS_CHANGED'
  | 'ISSUE_SPRINT_ASSIGNED'
  | 'ISSUE_DELETED';

export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueType = 'STORY' | 'TASK' | 'BUG' | 'EPIC';

export interface IssuePayload {
  id: string;
  key: string;
  projectId: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  storyPoints: number;
  sprintId?: string | null;
  assigneeId?: string | null;
  reporterId?: string | null;
  acceptanceCriteria?: string;
  createdAt?: string;
  updatedAt?: string;
  previousStatus?: IssueStatus | null;
  previousSprintId?: string | null;
}

export interface IssueEvent {
  eventId: string;
  eventType: IssueEventType;
  aggregateId?: string;
  timestamp: string;
  version?: number;
  payload: IssuePayload;
}

export type AnalyticsQueryType =
  | 'BURNDOWN'
  | 'VELOCITY'
  | 'SPRINT_HEALTH'
  | 'FULL_DIAGNOSTIC'
  | 'BURNDOWN_SNAPSHOT'
  | 'VELOCITY_FORECAST'
  | 'SPRINT_HEALTH_AUDIT';

export interface AnalyticsQuery {
  queryId: string;
  correlationId: string;
  replyTopic?: string;
  sprintId: string;
  projectId?: string;
  queryType: AnalyticsQueryType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface BurndownPoint {
  date: string;
  dayIndex: number;
  idealRemaining: number;
  actualRemaining: number;
  completedOnDay?: number;
}

export type AnalyticsReplyStatus = 'SUCCESS' | 'FAILED';

export interface AnalyticsReply {
  replyId: string;
  correlationId: string;
  sprintId: string;
  status: AnalyticsReplyStatus;
  errorMessage?: string | null;
  totalPoints?: number;
  completedPoints?: number;
  remainingPoints?: number;
  velocity?: number;
  healthScore?: number;
  burndownData?: BurndownPoint[];
  diagnostics?: string[];
  recommendations?: string[];
  timestamp: string;
}

export type ContractSchemaName =
  | 'issues.events'
  | 'analytics.query'
  | 'analytics.reply'
  | 'IssueEvent'
  | 'AnalyticsQuery'
  | 'AnalyticsReply';

export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  errors?: ErrorObject[] | null;
  formattedErrors?: string[];
}

// ============================================================================
// Custom Validation Error Class
// ============================================================================

export function formatAjvErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors || errors.length === 0) {
    return [];
  }
  return errors.map((err) => {
    const path = err.instancePath && err.instancePath.length > 0 ? err.instancePath : '/';
    const paramsStr = err.params && Object.keys(err.params).length > 0 ? ` (${JSON.stringify(err.params)})` : '';
    return `[${path}] ${err.message || 'validation failed'}${paramsStr}`;
  });
}

export class ContractValidationError extends Error {
  public readonly schemaName: string;
  public readonly errors: ErrorObject[];
  public readonly formattedErrors: string[];

  constructor(schemaName: string, errors: ErrorObject[] | null | undefined, customFormattedErrors?: string[]) {
    const safeErrors = errors ?? [];
    const formatted =
      customFormattedErrors && customFormattedErrors.length > 0
        ? customFormattedErrors
        : formatAjvErrors(safeErrors);
    const message = `Schema validation failed for schema "${schemaName}":\n  - ${
      formatted.length > 0 ? formatted.join('\n  - ') : 'Unknown validation error'
    }`;
    super(message);
    this.name = 'ContractValidationError';
    this.schemaName = schemaName;
    this.errors = safeErrors;
    this.formattedErrors = formatted;
    Object.setPrototypeOf(this, ContractValidationError.prototype);
  }
}

// ============================================================================
// Canonical Draft-07 JSON Schemas (Built-in Definitions & Runtime Fallbacks)
// ============================================================================

export const DEFAULT_ISSUE_EVENTS_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'IssueEvent',
  description: 'Kafka event schema for issue lifecycle events emitted by MS1 (jira-issues-go) to topic issues.events',
  type: 'object',
  required: ['eventId', 'eventType', 'timestamp', 'payload'],
  properties: {
    eventId: { type: 'string', format: 'uuid', minLength: 1, description: 'Unique UUID v4 identifying this domain event' },
    eventType: {
      type: 'string',
      enum: ['ISSUE_CREATED', 'ISSUE_UPDATED', 'ISSUE_STATUS_CHANGED', 'ISSUE_SPRINT_ASSIGNED', 'ISSUE_DELETED'],
      description: 'Lifecycle transition or mutation operation type',
    },
    aggregateId: { type: 'string', format: 'uuid', minLength: 1, description: 'Identifier of the aggregate root (issue ID)' },
    timestamp: { type: 'string', format: 'date-time', description: 'ISO 8601 UTC timestamp' },
    version: { type: 'integer', minimum: 1, description: 'Monotonically increasing version number' },
    payload: {
      type: 'object',
      required: ['id', 'key', 'projectId', 'title', 'status', 'priority', 'type', 'storyPoints'],
      properties: {
        id: { type: 'string', format: 'uuid', minLength: 1, description: 'Unique identifier of the issue' },
        key: { type: 'string', pattern: '^[A-Z0-9]+-[0-9]+$', minLength: 1, description: 'Human-readable issue key' },
        projectId: { type: 'string', format: 'uuid', minLength: 1, description: 'ID of the parent project' },
        sprintId: { type: ['string', 'null'], format: 'uuid', minLength: 1, description: 'Assigned sprint ID, null if in backlog' },
        title: { type: 'string', minLength: 1, maxLength: 255, description: 'Short summary/title' },
        description: { type: 'string', description: 'Detailed description of the issue' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        type: { type: 'string', enum: ['STORY', 'TASK', 'BUG', 'EPIC'] },
        storyPoints: { type: 'integer', minimum: 0, description: 'Story point estimation' },
        assigneeId: { type: ['string', 'null'], minLength: 1, description: 'User identifier of assignee' },
        reporterId: { type: ['string', 'null'], minLength: 1, description: 'User identifier of reporter' },
        acceptanceCriteria: { type: 'string', description: 'Gherkin formatted acceptance criteria' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        previousStatus: { type: ['string', 'null'], enum: [null, 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] },
        previousSprintId: { type: ['string', 'null'], format: 'uuid', minLength: 1 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

export const DEFAULT_ANALYTICS_QUERY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'AnalyticsQuery',
  description: 'Kafka Request-Reply query schema dispatched to topic analytics.query for MS3 (jira-analytics-dotnet)',
  type: 'object',
  required: ['queryId', 'correlationId', 'sprintId', 'queryType', 'timestamp'],
  properties: {
    queryId: { type: 'string', format: 'uuid', minLength: 1, description: 'Unique UUID identifying this request' },
    correlationId: { type: 'string', format: 'uuid', minLength: 1, description: 'Correlation identifier matching kafka_correlationId' },
    replyTopic: { type: 'string', minLength: 1, default: 'analytics.reply', description: 'Destination reply topic' },
    sprintId: { type: 'string', format: 'uuid', minLength: 1, description: 'Target sprint identifier' },
    projectId: { type: 'string', format: 'uuid', minLength: 1, description: 'Optional parent project identifier' },
    queryType: {
      type: 'string',
      enum: [
        'BURNDOWN',
        'VELOCITY',
        'SPRINT_HEALTH',
        'FULL_DIAGNOSTIC',
        'BURNDOWN_SNAPSHOT',
        'VELOCITY_FORECAST',
        'SPRINT_HEALTH_AUDIT',
      ],
      description: 'Analysis scope requested by caller',
    },
    timestamp: { type: 'string', format: 'date-time', description: 'ISO 8601 UTC timestamp' },
    metadata: {
      type: 'object',
      description: 'Optional caller context',
      additionalProperties: true,
    },
  },
  additionalProperties: false,
};

export const DEFAULT_ANALYTICS_REPLY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'AnalyticsReply',
  description: 'Kafka Request-Reply response schema published by MS3 to topic analytics.reply',
  type: 'object',
  required: ['replyId', 'correlationId', 'sprintId', 'status', 'timestamp'],
  properties: {
    replyId: { type: 'string', format: 'uuid', minLength: 1, description: 'Unique UUID identifying this reply message' },
    correlationId: { type: 'string', format: 'uuid', minLength: 1, description: 'Correlation identifier matching query correlationId' },
    sprintId: { type: 'string', format: 'uuid', minLength: 1, description: 'Target sprint identifier' },
    status: { type: 'string', enum: ['SUCCESS', 'FAILED'], description: 'Execution status' },
    errorMessage: { type: ['string', 'null'], minLength: 1, description: 'Error details if status is FAILED' },
    totalPoints: { type: 'integer', minimum: 0, description: 'Total committed story points' },
    completedPoints: { type: 'integer', minimum: 0, description: 'Total completed story points' },
    remainingPoints: { type: 'integer', minimum: 0, description: 'Total remaining story points' },
    velocity: { type: 'number', description: 'Calculated velocity metric' },
    healthScore: { type: 'number', minimum: 0, maximum: 100, description: 'Composite health score 0-100' },
    burndownData: {
      type: 'array',
      description: 'Timeline of daily burndown trajectory data points',
      items: {
        type: 'object',
        required: ['date', 'dayIndex', 'idealRemaining', 'actualRemaining'],
        properties: {
          date: { type: 'string', format: 'date', minLength: 1, description: 'Date string or ISO date' },
          dayIndex: { type: 'integer', minimum: 0, description: '0-based day index' },
          idealRemaining: { type: 'number', description: 'Ideal remaining story points' },
          actualRemaining: { type: 'number', description: 'Actual remaining story points' },
          completedOnDay: { type: 'number', description: 'Story points burned on this day' },
        },
        additionalProperties: false,
      },
    },
    diagnostics: {
      type: 'array',
      description: 'List of diagnostic observations',
      items: { type: 'string', minLength: 1 },
    },
    recommendations: {
      type: 'array',
      description: 'Actionable recommendations for sprint rebalancing',
      items: { type: 'string', minLength: 1 },
    },
    timestamp: { type: 'string', format: 'date-time', description: 'ISO 8601 UTC timestamp' },
  },
  additionalProperties: false,
};

// ============================================================================
// ContractValidator Class & Engine
// ============================================================================

export interface ContractValidatorOptions {
  ajvOptions?: AjvOptions;
  schemas?: {
    issueEvents?: object;
    analyticsQuery?: object;
    analyticsReply?: object;
  };
}

export class ContractValidator {
  private readonly ajv: Ajv;
  private readonly validators: Map<string, ValidateFunction> = new Map();

  constructor(options?: ContractValidatorOptions) {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      strictNumbers: true,
      validateFormats: true,
      ...(options?.ajvOptions || {}),
    });

    addFormats(this.ajv);

    const issueSchema = options?.schemas?.issueEvents ?? DEFAULT_ISSUE_EVENTS_SCHEMA;
    const querySchema = options?.schemas?.analyticsQuery ?? DEFAULT_ANALYTICS_QUERY_SCHEMA;
    const replySchema = options?.schemas?.analyticsReply ?? DEFAULT_ANALYTICS_REPLY_SCHEMA;

    this.registerSchema('issues.events', issueSchema);
    this.registerSchema('IssueEvent', issueSchema);

    this.registerSchema('analytics.query', querySchema);
    this.registerSchema('AnalyticsQuery', querySchema);

    this.registerSchema('analytics.reply', replySchema);
    this.registerSchema('AnalyticsReply', replySchema);
  }

  public registerSchema(key: string, schema: object): void {
    const validate = this.ajv.compile(schema);
    this.validators.set(key, validate);
  }

  public getAjv(): Ajv {
    return this.ajv;
  }

  public validate<T = unknown>(schemaName: ContractSchemaName | string, payload: unknown): ValidationResult<T> {
    const validator = this.validators.get(schemaName);
    if (!validator) {
      return {
        valid: false,
        formattedErrors: [
          `Unknown schema name: "${schemaName}". Available schemas: ${Array.from(this.validators.keys()).join(', ')}`,
        ],
      };
    }

    const valid = validator(payload) as boolean;
    if (valid) {
      return {
        valid: true,
        data: payload as T,
      };
    }

    const errors = validator.errors ? [...validator.errors] : [];
    return {
      valid: false,
      data: undefined,
      errors,
      formattedErrors: formatAjvErrors(errors),
    };
  }

  public assert<T = unknown>(schemaName: ContractSchemaName | string, payload: unknown): T {
    const result = this.validate<T>(schemaName, payload);
    if (!result.valid) {
      const errors =
        result.errors && result.errors.length > 0
          ? result.errors
          : [{
              instancePath: '',
              schemaPath: '#/schemaName',
              keyword: 'schemaName',
              params: { schemaName },
              message: result.formattedErrors?.[0] || 'Unknown validation error',
            } as ErrorObject];
      throw new ContractValidationError(schemaName, errors, result.formattedErrors);
    }
    return result.data as T;
  }

  public validateIssueEvent(payload: unknown): ValidationResult<IssueEvent> {
    return this.validate<IssueEvent>('issues.events', payload);
  }

  public assertIssueEvent(payload: unknown): IssueEvent {
    return this.assert<IssueEvent>('issues.events', payload);
  }

  public validateAnalyticsQuery(payload: unknown): ValidationResult<AnalyticsQuery> {
    return this.validate<AnalyticsQuery>('analytics.query', payload);
  }

  public assertAnalyticsQuery(payload: unknown): AnalyticsQuery {
    return this.assert<AnalyticsQuery>('analytics.query', payload);
  }

  public validateAnalyticsReply(payload: unknown): ValidationResult<AnalyticsReply> {
    return this.validate<AnalyticsReply>('analytics.reply', payload);
  }

  public assertAnalyticsReply(payload: unknown): AnalyticsReply {
    return this.assert<AnalyticsReply>('analytics.reply', payload);
  }
}

// ============================================================================
// Singleton Default Instance & Convenience Function Exports
// ============================================================================

const defaultValidator = new ContractValidator();

export const validateIssueEvent = (payload: unknown): ValidationResult<IssueEvent> =>
  defaultValidator.validateIssueEvent(payload);

export const assertIssueEvent = (payload: unknown): IssueEvent =>
  defaultValidator.assertIssueEvent(payload);

export const validateAnalyticsQuery = (payload: unknown): ValidationResult<AnalyticsQuery> =>
  defaultValidator.validateAnalyticsQuery(payload);

export const assertAnalyticsQuery = (payload: unknown): AnalyticsQuery =>
  defaultValidator.assertAnalyticsQuery(payload);

export const validateAnalyticsReply = (payload: unknown): ValidationResult<AnalyticsReply> =>
  defaultValidator.validateAnalyticsReply(payload);

export const assertAnalyticsReply = (payload: unknown): AnalyticsReply =>
  defaultValidator.assertAnalyticsReply(payload);

export const validateContractPayload = <T = unknown>(
  schemaName: ContractSchemaName | string,
  payload: unknown,
): ValidationResult<T> => defaultValidator.validate<T>(schemaName, payload);

export const assertContractPayload = <T = unknown>(
  schemaName: ContractSchemaName | string,
  payload: unknown,
): T => defaultValidator.assert<T>(schemaName, payload);

export function createContractValidator(options?: ContractValidatorOptions): ContractValidator {
  return new ContractValidator(options);
}
