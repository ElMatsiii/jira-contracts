/**
 * jira-contracts: binary round-trips of the generated TypeScript stubs for the fields and
 * services added with parent_id, capacity_story_points and the identity/projects/hours RPCs.
 */

import {
  CheckProjectAccessResponse,
  CreateIssueRequest,
  IdentityServiceService,
  Issue,
  ProjectServiceService,
  RegisterUserResponse,
  WorkLog,
  WorkLogServiceService,
  WorkspaceRole,
} from '../gen/ts/issues';
import { CreateSprintRequest, Sprint } from '../gen/ts/sprints';

describe('generated stubs', () => {
  it('round-trips parent_id on Issue and CreateIssueRequest', () => {
    const issue = Issue.decode(Issue.encode(Issue.fromPartial({ id: 'i1', parentId: 'epic-1' })).finish());
    const request = CreateIssueRequest.decode(
      CreateIssueRequest.encode(CreateIssueRequest.fromPartial({ title: 'Story', parentId: 'epic-1' })).finish(),
    );

    expect(issue.parentId).toBe('epic-1');
    expect(request.parentId).toBe('epic-1');
    expect(Issue.fromPartial({}).parentId).toBe('');
  });

  it('round-trips capacity_story_points on Sprint and CreateSprintRequest', () => {
    const sprint = Sprint.decode(Sprint.encode(Sprint.fromPartial({ id: 's1', capacityStoryPoints: 21 })).finish());
    const request = CreateSprintRequest.decode(
      CreateSprintRequest.encode(CreateSprintRequest.fromPartial({ name: 'Sprint 1', capacityStoryPoints: 13 })).finish(),
    );

    expect(sprint.capacityStoryPoints).toBe(21);
    expect(request.capacityStoryPoints).toBe(13);
  });

  it('round-trips identity, project access and work log messages', () => {
    const registered = RegisterUserResponse.decode(
      RegisterUserResponse.encode(
        RegisterUserResponse.fromPartial({
          user: { id: 'u1', name: 'Ana', email: 'ana@example.com', createdAt: 1763200000000 },
          workspace: { id: 'w1', name: 'Ana workspace', role: WorkspaceRole.WORKSPACE_ROLE_OWNER },
        }),
      ).finish(),
    );
    const access = CheckProjectAccessResponse.decode(
      CheckProjectAccessResponse.encode(
        CheckProjectAccessResponse.fromPartial({ allowed: true, role: WorkspaceRole.WORKSPACE_ROLE_MEMBER, workspaceId: 'w1' }),
      ).finish(),
    );
    const log = WorkLog.decode(
      WorkLog.encode(WorkLog.fromPartial({ id: 'l1', issueKey: 'PROJ-1', hours: 1.25, loggedAt: 1763200000000 })).finish(),
    );

    expect(registered.user?.createdAt).toBe(1763200000000);
    expect(registered.workspace?.role).toBe(WorkspaceRole.WORKSPACE_ROLE_OWNER);
    expect(access).toEqual({ allowed: true, role: WorkspaceRole.WORKSPACE_ROLE_MEMBER, workspaceId: 'w1' });
    expect(log.hours).toBe(1.25);
    expect(log.issueKey).toBe('PROJ-1');
  });

  it('exposes the new gRPC services under the jira.issues.v1 package', () => {
    expect(Object.values(IdentityServiceService).map((m) => m.path)).toEqual([
      '/jira.issues.v1.IdentityService/RegisterUser',
      '/jira.issues.v1.IdentityService/AuthenticateUser',
      '/jira.issues.v1.IdentityService/GetUser',
      '/jira.issues.v1.IdentityService/ListUserWorkspaces',
      '/jira.issues.v1.IdentityService/AddWorkspaceMember',
      '/jira.issues.v1.IdentityService/GetMemberRole',
    ]);
    expect(Object.values(ProjectServiceService).map((m) => m.path)).toEqual([
      '/jira.issues.v1.ProjectService/CreateProject',
      '/jira.issues.v1.ProjectService/ListProjects',
      '/jira.issues.v1.ProjectService/CheckProjectAccess',
    ]);
    expect(Object.values(WorkLogServiceService).map((m) => m.path)).toEqual([
      '/jira.issues.v1.WorkLogService/LogWork',
      '/jira.issues.v1.WorkLogService/ListWorkLogs',
      '/jira.issues.v1.WorkLogService/SumSprintHours',
    ]);
  });
});
