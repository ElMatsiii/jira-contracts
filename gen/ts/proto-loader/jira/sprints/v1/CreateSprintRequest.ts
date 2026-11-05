// Original file: protos/sprints.proto

import type { Long } from '@grpc/proto-loader';

export interface CreateSprintRequest {
  'projectId'?: (string);
  'name'?: (string);
  'goal'?: (string);
  'startDate'?: (number | string | Long);
  'endDate'?: (number | string | Long);
}

export interface CreateSprintRequest__Output {
  'projectId': (string);
  'name': (string);
  'goal': (string);
  'startDate': (number);
  'endDate': (number);
}
