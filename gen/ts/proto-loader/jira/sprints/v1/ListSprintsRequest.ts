// Original file: protos/sprints.proto

import type { SprintStatus as _jira_sprints_v1_SprintStatus, SprintStatus__Output as _jira_sprints_v1_SprintStatus__Output } from '../../../jira/sprints/v1/SprintStatus';

export interface ListSprintsRequest {
  'projectId'?: (string);
  'status'?: (_jira_sprints_v1_SprintStatus);
}

export interface ListSprintsRequest__Output {
  'projectId': (string);
  'status': (_jira_sprints_v1_SprintStatus__Output);
}
