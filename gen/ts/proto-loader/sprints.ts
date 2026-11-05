import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { AlertServiceClient as _jira_sprints_v1_AlertServiceClient, AlertServiceDefinition as _jira_sprints_v1_AlertServiceDefinition } from './jira/sprints/v1/AlertService';
import type { SprintServiceClient as _jira_sprints_v1_SprintServiceClient, SprintServiceDefinition as _jira_sprints_v1_SprintServiceDefinition } from './jira/sprints/v1/SprintService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  jira: {
    sprints: {
      v1: {
        AlertService: SubtypeConstructor<typeof grpc.Client, _jira_sprints_v1_AlertServiceClient> & { service: _jira_sprints_v1_AlertServiceDefinition }
        AlertSeverity: EnumTypeDefinition
        AlertType: EnumTypeDefinition
        CompleteSprintRequest: MessageTypeDefinition
        CompleteSprintResponse: MessageTypeDefinition
        CreateSprintRequest: MessageTypeDefinition
        CreateSprintResponse: MessageTypeDefinition
        GetSprintRequest: MessageTypeDefinition
        GetSprintResponse: MessageTypeDefinition
        ListSprintsRequest: MessageTypeDefinition
        ListSprintsResponse: MessageTypeDefinition
        Sprint: MessageTypeDefinition
        SprintAlert: MessageTypeDefinition
        SprintService: SubtypeConstructor<typeof grpc.Client, _jira_sprints_v1_SprintServiceClient> & { service: _jira_sprints_v1_SprintServiceDefinition }
        SprintStatus: EnumTypeDefinition
        StartSprintRequest: MessageTypeDefinition
        StartSprintResponse: MessageTypeDefinition
        TriggerSprintAlertRequest: MessageTypeDefinition
        TriggerSprintAlertResponse: MessageTypeDefinition
      }
    }
  }
}

