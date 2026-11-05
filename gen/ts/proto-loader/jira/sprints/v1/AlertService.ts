// Original file: protos/sprints.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { TriggerSprintAlertRequest as _jira_sprints_v1_TriggerSprintAlertRequest, TriggerSprintAlertRequest__Output as _jira_sprints_v1_TriggerSprintAlertRequest__Output } from '../../../jira/sprints/v1/TriggerSprintAlertRequest';
import type { TriggerSprintAlertResponse as _jira_sprints_v1_TriggerSprintAlertResponse, TriggerSprintAlertResponse__Output as _jira_sprints_v1_TriggerSprintAlertResponse__Output } from '../../../jira/sprints/v1/TriggerSprintAlertResponse';

export interface AlertServiceClient extends grpc.Client {
  TriggerSprintAlert(argument: _jira_sprints_v1_TriggerSprintAlertRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_TriggerSprintAlertResponse__Output>): grpc.ClientUnaryCall;
  TriggerSprintAlert(argument: _jira_sprints_v1_TriggerSprintAlertRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_TriggerSprintAlertResponse__Output>): grpc.ClientUnaryCall;
  TriggerSprintAlert(argument: _jira_sprints_v1_TriggerSprintAlertRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_TriggerSprintAlertResponse__Output>): grpc.ClientUnaryCall;
  TriggerSprintAlert(argument: _jira_sprints_v1_TriggerSprintAlertRequest, callback: grpc.requestCallback<_jira_sprints_v1_TriggerSprintAlertResponse__Output>): grpc.ClientUnaryCall;
  triggerSprintAlert(argument: _jira_sprints_v1_TriggerSprintAlertRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_TriggerSprintAlertResponse__Output>): grpc.ClientUnaryCall;
  triggerSprintAlert(argument: _jira_sprints_v1_TriggerSprintAlertRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_TriggerSprintAlertResponse__Output>): grpc.ClientUnaryCall;
  triggerSprintAlert(argument: _jira_sprints_v1_TriggerSprintAlertRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_TriggerSprintAlertResponse__Output>): grpc.ClientUnaryCall;
  triggerSprintAlert(argument: _jira_sprints_v1_TriggerSprintAlertRequest, callback: grpc.requestCallback<_jira_sprints_v1_TriggerSprintAlertResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface AlertServiceHandlers extends grpc.UntypedServiceImplementation {
  TriggerSprintAlert: grpc.handleUnaryCall<_jira_sprints_v1_TriggerSprintAlertRequest__Output, _jira_sprints_v1_TriggerSprintAlertResponse>;
  
}

export interface AlertServiceDefinition extends grpc.ServiceDefinition {
  TriggerSprintAlert: MethodDefinition<_jira_sprints_v1_TriggerSprintAlertRequest, _jira_sprints_v1_TriggerSprintAlertResponse, _jira_sprints_v1_TriggerSprintAlertRequest__Output, _jira_sprints_v1_TriggerSprintAlertResponse__Output>
}
