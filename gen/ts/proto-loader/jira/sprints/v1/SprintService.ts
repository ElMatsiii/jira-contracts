// Original file: protos/sprints.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CompleteSprintRequest as _jira_sprints_v1_CompleteSprintRequest, CompleteSprintRequest__Output as _jira_sprints_v1_CompleteSprintRequest__Output } from '../../../jira/sprints/v1/CompleteSprintRequest';
import type { CompleteSprintResponse as _jira_sprints_v1_CompleteSprintResponse, CompleteSprintResponse__Output as _jira_sprints_v1_CompleteSprintResponse__Output } from '../../../jira/sprints/v1/CompleteSprintResponse';
import type { CreateSprintRequest as _jira_sprints_v1_CreateSprintRequest, CreateSprintRequest__Output as _jira_sprints_v1_CreateSprintRequest__Output } from '../../../jira/sprints/v1/CreateSprintRequest';
import type { CreateSprintResponse as _jira_sprints_v1_CreateSprintResponse, CreateSprintResponse__Output as _jira_sprints_v1_CreateSprintResponse__Output } from '../../../jira/sprints/v1/CreateSprintResponse';
import type { GetSprintRequest as _jira_sprints_v1_GetSprintRequest, GetSprintRequest__Output as _jira_sprints_v1_GetSprintRequest__Output } from '../../../jira/sprints/v1/GetSprintRequest';
import type { GetSprintResponse as _jira_sprints_v1_GetSprintResponse, GetSprintResponse__Output as _jira_sprints_v1_GetSprintResponse__Output } from '../../../jira/sprints/v1/GetSprintResponse';
import type { ListSprintsRequest as _jira_sprints_v1_ListSprintsRequest, ListSprintsRequest__Output as _jira_sprints_v1_ListSprintsRequest__Output } from '../../../jira/sprints/v1/ListSprintsRequest';
import type { ListSprintsResponse as _jira_sprints_v1_ListSprintsResponse, ListSprintsResponse__Output as _jira_sprints_v1_ListSprintsResponse__Output } from '../../../jira/sprints/v1/ListSprintsResponse';
import type { StartSprintRequest as _jira_sprints_v1_StartSprintRequest, StartSprintRequest__Output as _jira_sprints_v1_StartSprintRequest__Output } from '../../../jira/sprints/v1/StartSprintRequest';
import type { StartSprintResponse as _jira_sprints_v1_StartSprintResponse, StartSprintResponse__Output as _jira_sprints_v1_StartSprintResponse__Output } from '../../../jira/sprints/v1/StartSprintResponse';

export interface SprintServiceClient extends grpc.Client {
  CompleteSprint(argument: _jira_sprints_v1_CompleteSprintRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_CompleteSprintResponse__Output>): grpc.ClientUnaryCall;
  CompleteSprint(argument: _jira_sprints_v1_CompleteSprintRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_CompleteSprintResponse__Output>): grpc.ClientUnaryCall;
  CompleteSprint(argument: _jira_sprints_v1_CompleteSprintRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_CompleteSprintResponse__Output>): grpc.ClientUnaryCall;
  CompleteSprint(argument: _jira_sprints_v1_CompleteSprintRequest, callback: grpc.requestCallback<_jira_sprints_v1_CompleteSprintResponse__Output>): grpc.ClientUnaryCall;
  completeSprint(argument: _jira_sprints_v1_CompleteSprintRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_CompleteSprintResponse__Output>): grpc.ClientUnaryCall;
  completeSprint(argument: _jira_sprints_v1_CompleteSprintRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_CompleteSprintResponse__Output>): grpc.ClientUnaryCall;
  completeSprint(argument: _jira_sprints_v1_CompleteSprintRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_CompleteSprintResponse__Output>): grpc.ClientUnaryCall;
  completeSprint(argument: _jira_sprints_v1_CompleteSprintRequest, callback: grpc.requestCallback<_jira_sprints_v1_CompleteSprintResponse__Output>): grpc.ClientUnaryCall;
  
  CreateSprint(argument: _jira_sprints_v1_CreateSprintRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_CreateSprintResponse__Output>): grpc.ClientUnaryCall;
  CreateSprint(argument: _jira_sprints_v1_CreateSprintRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_CreateSprintResponse__Output>): grpc.ClientUnaryCall;
  CreateSprint(argument: _jira_sprints_v1_CreateSprintRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_CreateSprintResponse__Output>): grpc.ClientUnaryCall;
  CreateSprint(argument: _jira_sprints_v1_CreateSprintRequest, callback: grpc.requestCallback<_jira_sprints_v1_CreateSprintResponse__Output>): grpc.ClientUnaryCall;
  createSprint(argument: _jira_sprints_v1_CreateSprintRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_CreateSprintResponse__Output>): grpc.ClientUnaryCall;
  createSprint(argument: _jira_sprints_v1_CreateSprintRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_CreateSprintResponse__Output>): grpc.ClientUnaryCall;
  createSprint(argument: _jira_sprints_v1_CreateSprintRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_CreateSprintResponse__Output>): grpc.ClientUnaryCall;
  createSprint(argument: _jira_sprints_v1_CreateSprintRequest, callback: grpc.requestCallback<_jira_sprints_v1_CreateSprintResponse__Output>): grpc.ClientUnaryCall;
  
  GetSprint(argument: _jira_sprints_v1_GetSprintRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_GetSprintResponse__Output>): grpc.ClientUnaryCall;
  GetSprint(argument: _jira_sprints_v1_GetSprintRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_GetSprintResponse__Output>): grpc.ClientUnaryCall;
  GetSprint(argument: _jira_sprints_v1_GetSprintRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_GetSprintResponse__Output>): grpc.ClientUnaryCall;
  GetSprint(argument: _jira_sprints_v1_GetSprintRequest, callback: grpc.requestCallback<_jira_sprints_v1_GetSprintResponse__Output>): grpc.ClientUnaryCall;
  getSprint(argument: _jira_sprints_v1_GetSprintRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_GetSprintResponse__Output>): grpc.ClientUnaryCall;
  getSprint(argument: _jira_sprints_v1_GetSprintRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_GetSprintResponse__Output>): grpc.ClientUnaryCall;
  getSprint(argument: _jira_sprints_v1_GetSprintRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_GetSprintResponse__Output>): grpc.ClientUnaryCall;
  getSprint(argument: _jira_sprints_v1_GetSprintRequest, callback: grpc.requestCallback<_jira_sprints_v1_GetSprintResponse__Output>): grpc.ClientUnaryCall;
  
  ListSprints(argument: _jira_sprints_v1_ListSprintsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_ListSprintsResponse__Output>): grpc.ClientUnaryCall;
  ListSprints(argument: _jira_sprints_v1_ListSprintsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_ListSprintsResponse__Output>): grpc.ClientUnaryCall;
  ListSprints(argument: _jira_sprints_v1_ListSprintsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_ListSprintsResponse__Output>): grpc.ClientUnaryCall;
  ListSprints(argument: _jira_sprints_v1_ListSprintsRequest, callback: grpc.requestCallback<_jira_sprints_v1_ListSprintsResponse__Output>): grpc.ClientUnaryCall;
  listSprints(argument: _jira_sprints_v1_ListSprintsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_ListSprintsResponse__Output>): grpc.ClientUnaryCall;
  listSprints(argument: _jira_sprints_v1_ListSprintsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_ListSprintsResponse__Output>): grpc.ClientUnaryCall;
  listSprints(argument: _jira_sprints_v1_ListSprintsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_ListSprintsResponse__Output>): grpc.ClientUnaryCall;
  listSprints(argument: _jira_sprints_v1_ListSprintsRequest, callback: grpc.requestCallback<_jira_sprints_v1_ListSprintsResponse__Output>): grpc.ClientUnaryCall;
  
  StartSprint(argument: _jira_sprints_v1_StartSprintRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_StartSprintResponse__Output>): grpc.ClientUnaryCall;
  StartSprint(argument: _jira_sprints_v1_StartSprintRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_StartSprintResponse__Output>): grpc.ClientUnaryCall;
  StartSprint(argument: _jira_sprints_v1_StartSprintRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_StartSprintResponse__Output>): grpc.ClientUnaryCall;
  StartSprint(argument: _jira_sprints_v1_StartSprintRequest, callback: grpc.requestCallback<_jira_sprints_v1_StartSprintResponse__Output>): grpc.ClientUnaryCall;
  startSprint(argument: _jira_sprints_v1_StartSprintRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_StartSprintResponse__Output>): grpc.ClientUnaryCall;
  startSprint(argument: _jira_sprints_v1_StartSprintRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_jira_sprints_v1_StartSprintResponse__Output>): grpc.ClientUnaryCall;
  startSprint(argument: _jira_sprints_v1_StartSprintRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_jira_sprints_v1_StartSprintResponse__Output>): grpc.ClientUnaryCall;
  startSprint(argument: _jira_sprints_v1_StartSprintRequest, callback: grpc.requestCallback<_jira_sprints_v1_StartSprintResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface SprintServiceHandlers extends grpc.UntypedServiceImplementation {
  CompleteSprint: grpc.handleUnaryCall<_jira_sprints_v1_CompleteSprintRequest__Output, _jira_sprints_v1_CompleteSprintResponse>;
  
  CreateSprint: grpc.handleUnaryCall<_jira_sprints_v1_CreateSprintRequest__Output, _jira_sprints_v1_CreateSprintResponse>;
  
  GetSprint: grpc.handleUnaryCall<_jira_sprints_v1_GetSprintRequest__Output, _jira_sprints_v1_GetSprintResponse>;
  
  ListSprints: grpc.handleUnaryCall<_jira_sprints_v1_ListSprintsRequest__Output, _jira_sprints_v1_ListSprintsResponse>;
  
  StartSprint: grpc.handleUnaryCall<_jira_sprints_v1_StartSprintRequest__Output, _jira_sprints_v1_StartSprintResponse>;
  
}

export interface SprintServiceDefinition extends grpc.ServiceDefinition {
  CompleteSprint: MethodDefinition<_jira_sprints_v1_CompleteSprintRequest, _jira_sprints_v1_CompleteSprintResponse, _jira_sprints_v1_CompleteSprintRequest__Output, _jira_sprints_v1_CompleteSprintResponse__Output>
  CreateSprint: MethodDefinition<_jira_sprints_v1_CreateSprintRequest, _jira_sprints_v1_CreateSprintResponse, _jira_sprints_v1_CreateSprintRequest__Output, _jira_sprints_v1_CreateSprintResponse__Output>
  GetSprint: MethodDefinition<_jira_sprints_v1_GetSprintRequest, _jira_sprints_v1_GetSprintResponse, _jira_sprints_v1_GetSprintRequest__Output, _jira_sprints_v1_GetSprintResponse__Output>
  ListSprints: MethodDefinition<_jira_sprints_v1_ListSprintsRequest, _jira_sprints_v1_ListSprintsResponse, _jira_sprints_v1_ListSprintsRequest__Output, _jira_sprints_v1_ListSprintsResponse__Output>
  StartSprint: MethodDefinition<_jira_sprints_v1_StartSprintRequest, _jira_sprints_v1_StartSprintResponse, _jira_sprints_v1_StartSprintRequest__Output, _jira_sprints_v1_StartSprintResponse__Output>
}
