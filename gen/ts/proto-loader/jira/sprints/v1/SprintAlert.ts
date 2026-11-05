// Original file: protos/sprints.proto

import type { AlertType as _jira_sprints_v1_AlertType, AlertType__Output as _jira_sprints_v1_AlertType__Output } from '../../../jira/sprints/v1/AlertType';
import type { AlertSeverity as _jira_sprints_v1_AlertSeverity, AlertSeverity__Output as _jira_sprints_v1_AlertSeverity__Output } from '../../../jira/sprints/v1/AlertSeverity';
import type { Long } from '@grpc/proto-loader';

export interface SprintAlert {
  'id'?: (string);
  'sprintId'?: (string);
  'type'?: (_jira_sprints_v1_AlertType);
  'severity'?: (_jira_sprints_v1_AlertSeverity);
  'message'?: (string);
  'recommendation'?: (string);
  'timestamp'?: (number | string | Long);
}

export interface SprintAlert__Output {
  'id': (string);
  'sprintId': (string);
  'type': (_jira_sprints_v1_AlertType__Output);
  'severity': (_jira_sprints_v1_AlertSeverity__Output);
  'message': (string);
  'recommendation': (string);
  'timestamp': (number);
}
