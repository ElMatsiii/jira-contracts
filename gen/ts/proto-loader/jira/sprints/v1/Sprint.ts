// Original file: protos/sprints.proto

import type { SprintStatus as _jira_sprints_v1_SprintStatus, SprintStatus__Output as _jira_sprints_v1_SprintStatus__Output } from '../../../jira/sprints/v1/SprintStatus';
import type { Long } from '@grpc/proto-loader';

export interface Sprint {
  'id'?: (string);
  'projectId'?: (string);
  'name'?: (string);
  'goal'?: (string);
  'startDate'?: (number | string | Long);
  'endDate'?: (number | string | Long);
  'status'?: (_jira_sprints_v1_SprintStatus);
  'totalStoryPoints'?: (number);
  'completedStoryPoints'?: (number);
  'createdAt'?: (number | string | Long);
  'updatedAt'?: (number | string | Long);
}

export interface Sprint__Output {
  'id': (string);
  'projectId': (string);
  'name': (string);
  'goal': (string);
  'startDate': (number);
  'endDate': (number);
  'status': (_jira_sprints_v1_SprintStatus__Output);
  'totalStoryPoints': (number);
  'completedStoryPoints': (number);
  'createdAt': (number);
  'updatedAt': (number);
}
