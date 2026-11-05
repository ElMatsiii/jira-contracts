/**
 * jira-contracts: Validator Module Unit Tests
 * Tests validator functions, assert helpers, error formatting, ContractValidator class,
 * custom schemas, and edge case error handling to guarantee >= 60% coverage.
 */

import {
  validateIssueEvent,
  assertIssueEvent,
  validateAnalyticsQuery,
  assertAnalyticsQuery,
  validateAnalyticsReply,
  assertAnalyticsReply,
  validateContractPayload,
  assertContractPayload,
  createContractValidator,
  ContractValidator,
  ContractValidationError,
  formatAjvErrors,
  IssueEvent,
  AnalyticsQuery,
  AnalyticsReply,
} from '../src/validator';

describe('jira-contracts Validator Suite', () => {
  const sampleValidIssueEvent: IssueEvent = {
    eventId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    eventType: 'ISSUE_CREATED',
    aggregateId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    timestamp: '2026-10-27T08:30:00.000Z',
    version: 1,
    payload: {
      id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
      key: 'KAN-42',
      projectId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
      title: 'Setup Kafka Request-Reply Bridge',
      description: 'Implement consumer/producer with correlation headers',
      status: 'TODO',
      priority: 'HIGH',
      type: 'TASK',
      storyPoints: 8,
      sprintId: null,
      assigneeId: null,
      reporterId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
      acceptanceCriteria: 'Given valid message, When sent, Then validated',
      createdAt: '2026-10-27T08:00:00.000Z',
      updatedAt: '2026-10-27T08:30:00.000Z',
      previousStatus: null,
      previousSprintId: null,
    },
  };

  const sampleValidQuery: AnalyticsQuery = {
    queryId: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    correlationId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    replyTopic: 'analytics.reply',
    sprintId: 'a7b8c9d0-e1f2-4a3b-8c5d-6e7f8a9b0c1d',
    projectId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    queryType: 'BURNDOWN_SNAPSHOT',
    timestamp: '2026-10-27T08:31:00.000Z',
    metadata: { env: 'ci', runId: 101 },
  };

  const sampleValidReply: AnalyticsReply = {
    replyId: 'b8c9d0e1-f2a3-4b4c-9d6e-7f8a9b0c1d2e',
    correlationId: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    sprintId: 'a7b8c9d0-e1f2-4a3b-8c5d-6e7f8a9b0c1d',
    status: 'SUCCESS',
    errorMessage: null,
    totalPoints: 50,
    completedPoints: 30,
    remainingPoints: 20,
    velocity: 32.4,
    healthScore: 92,
    burndownData: [
      {
        date: '2026-10-25',
        dayIndex: 0,
        idealRemaining: 50,
        actualRemaining: 50,
        completedOnDay: 0,
      },
    ],
    diagnostics: ['Sprint on track'],
    recommendations: ['Keep sprint scope unchanged'],
    timestamp: '2026-10-27T08:31:02.000Z',
  };

  describe('IssueEvent Validation Functions', () => {
    it('validateIssueEvent should return valid: true and typed data for valid event', () => {
      const res = validateIssueEvent(sampleValidIssueEvent);
      expect(res.valid).toBe(true);
      expect(res.data).toEqual(sampleValidIssueEvent);
      expect(res.errors).toBeUndefined();
    });

    it('validateIssueEvent should return valid: false and formattedErrors for invalid event', () => {
      const invalid = { ...sampleValidIssueEvent, eventType: 'UNKNOWN_EVENT_TYPE' as any };
      const res = validateIssueEvent(invalid);
      expect(res.valid).toBe(false);
      expect(res.data).toBeUndefined();
      expect(res.errors).toBeDefined();
      expect(res.formattedErrors).toBeDefined();
      expect(res.formattedErrors?.length).toBeGreaterThan(0);
      expect(res.formattedErrors?.[0]).toContain('/eventType');
    });

    it('assertIssueEvent should return payload if valid', () => {
      const result = assertIssueEvent(sampleValidIssueEvent);
      expect(result).toEqual(sampleValidIssueEvent);
    });

    it('assertIssueEvent should throw ContractValidationError if invalid', () => {
      const invalid = { ...sampleValidIssueEvent, eventType: 'INVALID_TYPE' as any };
      expect(() => assertIssueEvent(invalid)).toThrow(ContractValidationError);
      try {
        assertIssueEvent(invalid);
      } catch (err) {
        const error = err as ContractValidationError;
        expect(error.name).toBe('ContractValidationError');
        expect(error.schemaName).toBe('issues.events');
        expect(error.errors.length).toBeGreaterThan(0);
        expect(error.message).toContain('Schema validation failed for schema "issues.events"');
      }
    });
  });

  describe('AnalyticsQuery Validation Functions', () => {
    it('validateAnalyticsQuery should return valid: true for valid query', () => {
      const res = validateAnalyticsQuery(sampleValidQuery);
      expect(res.valid).toBe(true);
      expect(res.data).toEqual(sampleValidQuery);
    });

    it('validateAnalyticsQuery should return valid: false for missing required fields', () => {
      const invalid = { queryId: sampleValidQuery.queryId };
      const res = validateAnalyticsQuery(invalid);
      expect(res.valid).toBe(false);
      expect(res.formattedErrors?.some((e) => e.includes('required'))).toBe(true);
    });

    it('assertAnalyticsQuery should return data if valid and throw if invalid', () => {
      expect(assertAnalyticsQuery(sampleValidQuery)).toEqual(sampleValidQuery);
      expect(() => assertAnalyticsQuery({})).toThrow(ContractValidationError);
    });
  });

  describe('AnalyticsReply Validation Functions', () => {
    it('validateAnalyticsReply should return valid: true for valid reply', () => {
      const res = validateAnalyticsReply(sampleValidReply);
      expect(res.valid).toBe(true);
      expect(res.data).toEqual(sampleValidReply);
    });

    it('validateAnalyticsReply should return valid: false for invalid status', () => {
      const invalid = { ...sampleValidReply, status: 'PENDING' as any };
      const res = validateAnalyticsReply(invalid);
      expect(res.valid).toBe(false);
    });

    it('assertAnalyticsReply should return data if valid and throw if invalid', () => {
      expect(assertAnalyticsReply(sampleValidReply)).toEqual(sampleValidReply);
      expect(() => assertAnalyticsReply({ status: 'INVALID' })).toThrow(ContractValidationError);
    });
  });

  describe('Generic validateContractPayload & assertContractPayload', () => {
    it.each([
      ['issues.events', sampleValidIssueEvent],
      ['IssueEvent', sampleValidIssueEvent],
      ['analytics.query', sampleValidQuery],
      ['AnalyticsQuery', sampleValidQuery],
      ['analytics.reply', sampleValidReply],
      ['AnalyticsReply', sampleValidReply],
    ])('should validate schema alias %s successfully', (schemaName, payload) => {
      const res = validateContractPayload(schemaName, payload);
      expect(res.valid).toBe(true);
      expect(res.data).toBeDefined();

      const asserted = assertContractPayload(schemaName, payload);
      expect(asserted).toBeDefined();
    });

    it('should return valid: false with descriptive message when schemaName is unknown', () => {
      const res = validateContractPayload('non.existent.schema', {});
      expect(res.valid).toBe(false);
      expect(res.formattedErrors?.[0]).toContain('Unknown schema name: "non.existent.schema"');
    });

    it('assertContractPayload should throw ContractValidationError when schemaName is unknown', () => {
      expect(() => assertContractPayload('non.existent.schema', {})).toThrow(ContractValidationError);
    });
  });

  describe('ContractValidator Custom Instances & Extensibility', () => {
    it('should allow creating isolated instance via createContractValidator', () => {
      const customValidator = createContractValidator();
      expect(customValidator).toBeInstanceOf(ContractValidator);
      expect(customValidator.getAjv()).toBeDefined();

      const res = customValidator.validateIssueEvent(sampleValidIssueEvent);
      expect(res.valid).toBe(true);
    });

    it('should allow registering a custom additional schema', () => {
      const customValidator = new ContractValidator();
      const testSchema = {
        type: 'object',
        required: ['ping'],
        properties: { ping: { type: 'string' } },
        additionalProperties: false,
      };

      customValidator.registerSchema('test.ping', testSchema);

      const validRes = customValidator.validate('test.ping', { ping: 'pong' });
      expect(validRes.valid).toBe(true);

      const invalidRes = customValidator.validate('test.ping', { ping: 123 });
      expect(invalidRes.valid).toBe(false);
    });

    it('should allow passing custom constructor schema overrides', () => {
      const customValidator = new ContractValidator({
        schemas: {
          issueEvents: { type: 'object', required: ['customField'] },
        },
      });

      expect(customValidator.validateIssueEvent({ customField: 'hello' }).valid).toBe(true);
      expect(customValidator.validateIssueEvent({}).valid).toBe(false);
    });
  });

  describe('formatAjvErrors & ContractValidationError Details', () => {
    it('formatAjvErrors should return empty array for null/undefined/empty input', () => {
      expect(formatAjvErrors(null)).toEqual([]);
      expect(formatAjvErrors(undefined)).toEqual([]);
      expect(formatAjvErrors([])).toEqual([]);
    });

    it('formatAjvErrors should handle errors with root instancePath and params', () => {
      const mockErrors = [
        {
          keyword: 'required',
          instancePath: '',
          schemaPath: '#/required',
          params: { missingProperty: 'eventId' },
          message: "must have required property 'eventId'",
        },
      ];
      const formatted = formatAjvErrors(mockErrors);
      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toBe('[/] must have required property \'eventId\' ({"missingProperty":"eventId"})');
    });

    it('formatAjvErrors should fallback message when err.message is undefined and params is empty', () => {
      const mockErrors = [
        {
          keyword: 'custom',
          instancePath: '/field',
          schemaPath: '#/properties/field',
          params: {},
          message: undefined,
        } as any,
      ];
      const formatted = formatAjvErrors(mockErrors);
      expect(formatted[0]).toBe('[/field] validation failed');
    });

    it('validate should handle compiled validator with null errors', () => {
      const validator = new ContractValidator();
      const mockValidateFn: any = () => false;
      mockValidateFn.errors = null;
      (validator as any).validators.set('mock.schema', mockValidateFn);
      const res = validator.validate('mock.schema', {});
      expect(res.valid).toBe(false);
      expect(res.errors).toEqual([]);
    });

    it('ContractValidationError should fallback gracefully if errors is null or empty', () => {
      const err = new ContractValidationError('custom.schema', null);
      expect(err.name).toBe('ContractValidationError');
      expect(err.schemaName).toBe('custom.schema');
      expect(err.errors).toEqual([]);
      expect(err.formattedErrors).toEqual([]);
      expect(err.message).toContain('Unknown validation error');
      expect(err instanceof Error).toBe(true);
    });
  });

  describe('Edge Cases and Malformed Payloads', () => {
    it.each([null, undefined, 42, 'string', true, [], {}])(
      'should handle non-conforming primitive or empty input safely: %p',
      (input) => {
        const issueRes = validateIssueEvent(input);
        expect(issueRes.valid).toBe(false);
        expect(issueRes.data).toBeUndefined();

        const queryRes = validateAnalyticsQuery(input);
        expect(queryRes.valid).toBe(false);

        const replyRes = validateAnalyticsReply(input);
        expect(replyRes.valid).toBe(false);
      },
    );
  });

  describe('IssueEvent Edge Case Validations', () => {
    it.each([Infinity, -Infinity, NaN])(
      'validateIssueEvent should reject non-finite storyPoints: %s',
      (storyPoints) => {
        const invalid = {
          ...sampleValidIssueEvent,
          payload: { ...sampleValidIssueEvent.payload, storyPoints },
        };
        const res = validateIssueEvent(invalid);
        expect(res.valid).toBe(false);
        expect(res.formattedErrors?.some((e) => e.includes('storyPoints') || e.includes('type'))).toBe(true);
      },
    );

    it.each([Infinity, -Infinity, NaN])(
      'assertIssueEvent should throw ContractValidationError for non-finite storyPoints: %s',
      (storyPoints) => {
        const invalid = {
          ...sampleValidIssueEvent,
          payload: { ...sampleValidIssueEvent.payload, storyPoints },
        };
        expect(() => assertIssueEvent(invalid)).toThrow(ContractValidationError);
      },
    );

    it.each(['', 'not-a-uuid'])(
      'validateIssueEvent should reject blank or non-UUID eventId: "%s"',
      (eventId) => {
        const res = validateIssueEvent({ ...sampleValidIssueEvent, eventId });
        expect(res.valid).toBe(false);
      },
    );

    it.each(['', 'not-a-uuid'])(
      'validateIssueEvent should reject blank or non-UUID payload.id: "%s"',
      (id) => {
        const res = validateIssueEvent({
          ...sampleValidIssueEvent,
          payload: { ...sampleValidIssueEvent.payload, id },
        });
        expect(res.valid).toBe(false);
      },
    );

    it.each(['', 'not-a-uuid'])(
      'validateIssueEvent should reject blank or non-UUID payload.projectId: "%s"',
      (projectId) => {
        const res = validateIssueEvent({
          ...sampleValidIssueEvent,
          payload: { ...sampleValidIssueEvent.payload, projectId },
        });
        expect(res.valid).toBe(false);
      },
    );

    it('assertIssueEvent should throw ContractValidationError when eventId is invalid UUID', () => {
      expect(() =>
        assertIssueEvent({ ...sampleValidIssueEvent, eventId: 'not-a-uuid' }),
      ).toThrow(ContractValidationError);
    });
  });

  describe('AnalyticsQuery and AnalyticsReply Edge Cases', () => {
    it.each(['', 'not-a-uuid'])(
      'validateAnalyticsQuery should reject blank or non-UUID queryId: "%s"',
      (queryId) => {
        expect(validateAnalyticsQuery({ ...sampleValidQuery, queryId }).valid).toBe(false);
      },
    );

    it.each(['', 'not-a-uuid'])(
      'validateAnalyticsQuery should reject blank or non-UUID correlationId: "%s"',
      (correlationId) => {
        expect(validateAnalyticsQuery({ ...sampleValidQuery, correlationId }).valid).toBe(false);
      },
    );

    it('assertAnalyticsQuery should throw ContractValidationError for blank queryId', () => {
      expect(() =>
        assertAnalyticsQuery({ ...sampleValidQuery, queryId: '' }),
      ).toThrow(ContractValidationError);
    });

    it.each([Infinity, -Infinity, NaN])(
      'validateAnalyticsReply should reject non-finite totalPoints: %s',
      (totalPoints) => {
        expect(validateAnalyticsReply({ ...sampleValidReply, totalPoints }).valid).toBe(false);
      },
    );

    it('assertAnalyticsReply should throw ContractValidationError for totalPoints: Infinity', () => {
      expect(() =>
        assertAnalyticsReply({ ...sampleValidReply, totalPoints: Infinity }),
      ).toThrow(ContractValidationError);
    });

    it.each(['', 'not-a-uuid'])(
      'validateAnalyticsReply should reject blank or non-UUID replyId: "%s"',
      (replyId) => {
        expect(validateAnalyticsReply({ ...sampleValidReply, replyId }).valid).toBe(false);
      },
    );
  });

  describe('Unknown Schema Error Preservation', () => {
    it('assertContractPayload should preserve available schema names in thrown ContractValidationError', () => {
      expect(() => assertContractPayload('non.existent.schema', {})).toThrow(ContractValidationError);
      try {
        assertContractPayload('non.existent.schema', {});
      } catch (err) {
        const error = err as ContractValidationError;
        expect(error.name).toBe('ContractValidationError');
        expect(error.schemaName).toBe('non.existent.schema');
        expect(error.message).toContain('Unknown schema name: "non.existent.schema"');
        expect(error.message).toContain('Available schemas:');
        expect(error.formattedErrors.length).toBeGreaterThan(0);
        expect(error.formattedErrors[0]).toContain('Unknown schema name: "non.existent.schema"');
      }
    });

    it('ContractValidator.assert should fallback to Unknown validation error when formattedErrors is empty on failed validation', () => {
      const validator = new ContractValidator();
      jest.spyOn(validator, 'validate').mockReturnValue({ valid: false, formattedErrors: [] });
      expect(() => validator.assert('mock.schema', {})).toThrow(ContractValidationError);
      try {
        validator.assert('mock.schema', {});
      } catch (err) {
        const error = err as ContractValidationError;
        expect(error.message).toContain('Unknown validation error');
      }
    });
  });
});
