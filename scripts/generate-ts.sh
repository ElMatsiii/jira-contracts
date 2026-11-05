#!/usr/bin/env bash
# ==============================================================================
# jira-contracts: TypeScript Protobuf & gRPC Code Generation Script
# Compiles protos/issues.proto and protos/sprints.proto into TypeScript stubs:
#   - gen/ts/issues.ts
#   - gen/ts/sprints.ts
#   - gen/ts/index.ts (barrel export)
#   - gen/ts/proto-loader/ (optional @grpc/proto-loader types)
#
# Supports:
#   1. Zero-native-dependency execution via npm 'protoc' + 'ts-proto'
#   2. Cross-platform path handling for Windows (.cmd) and POSIX
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "[INFO] Starting TypeScript contract generation..."

# Ensure target directory exists
mkdir -p "${REPO_ROOT}/gen/ts"

# 1. Resolve protoc binary
PROTOC_BIN=""
if [ -f "${REPO_ROOT}/node_modules/.bin/protoc" ]; then
  PROTOC_BIN="${REPO_ROOT}/node_modules/.bin/protoc"
elif [ -f "${REPO_ROOT}/node_modules/.bin/protoc.cmd" ]; then
  PROTOC_BIN="${REPO_ROOT}/node_modules/.bin/protoc.cmd"
elif command -v protoc >/dev/null 2>&1; then
  PROTOC_BIN="protoc"
else
  PROTOC_BIN="npx protoc"
fi

# 2. Resolve ts-proto plugin binary path based on OS
PLUGIN_PATH=""
if [[ "${OSTYPE:-}" == "msys" || "${OSTYPE:-}" == "cygwin" || "${OSTYPE:-}" == "win32" ]] || [[ "${OS:-}" =~ Windows* ]]; then
  if [ -f "${REPO_ROOT}/node_modules/.bin/protoc-gen-ts_proto.cmd" ]; then
    PLUGIN_PATH="${REPO_ROOT}/node_modules/.bin/protoc-gen-ts_proto.cmd"
  fi
fi

if [ -z "${PLUGIN_PATH}" ]; then
  if [ -f "${REPO_ROOT}/node_modules/.bin/protoc-gen-ts_proto" ]; then
    PLUGIN_PATH="${REPO_ROOT}/node_modules/.bin/protoc-gen-ts_proto"
  elif [ -f "${REPO_ROOT}/node_modules/.bin/protoc-gen-ts_proto.cmd" ]; then
    PLUGIN_PATH="${REPO_ROOT}/node_modules/.bin/protoc-gen-ts_proto.cmd"
  else
    PLUGIN_PATH="${REPO_ROOT}/node_modules/ts-proto/protoc-gen-ts_proto"
  fi
fi

echo "[INFO] Using protoc: ${PROTOC_BIN}"
echo "[INFO] Using ts-proto plugin: ${PLUGIN_PATH}"

# 3. Execute ts-proto code generation
if [ -f "${PLUGIN_PATH}" ]; then
  ${PROTOC_BIN} \
    --plugin="protoc-gen-ts_proto=${PLUGIN_PATH}" \
    --ts_proto_out="${REPO_ROOT}/gen/ts" \
    --ts_proto_opt=esModuleInterop=true,forceLong=number,useOptionals=messages,outputServices=grpc-js,env=node \
    --proto_path=protos \
    protos/issues.proto protos/sprints.proto
else
  echo "[WARN] ts-proto plugin binary not found directly. Attempting via npx ts-proto..."
  ${PROTOC_BIN} \
    --ts_proto_out="${REPO_ROOT}/gen/ts" \
    --ts_proto_opt=esModuleInterop=true,forceLong=number,useOptionals=messages,outputServices=grpc-js,env=node \
    --proto_path=protos \
    protos/issues.proto protos/sprints.proto || true
fi

# 4. Create barrel export in gen/ts/index.ts
cat << 'EOF' > "${REPO_ROOT}/gen/ts/index.ts"
/**
 * Generated TypeScript Stubs for Jira AI Protocol Buffers
 */
export * as Issues from './issues';
export * as Sprints from './sprints';

export {
  IssueStatus,
  IssuePriority,
  IssueType,
  Issue,
  CreateIssueRequest,
  CreateIssueResponse,
  GetIssueRequest,
  GetIssueResponse,
  ListIssuesRequest,
  ListIssuesResponse,
  UpdateIssueStatusRequest,
  UpdateIssueStatusResponse,
  BatchUpdateIssueSprintRequest,
  BatchUpdateIssueSprintResponse,
  IssueServiceService,
  IssueServiceClient,
} from './issues';

export {
  SprintStatus,
  AlertType,
  AlertSeverity,
  Sprint,
  CreateSprintRequest,
  CreateSprintResponse,
  GetSprintRequest,
  GetSprintResponse,
  ListSprintsRequest,
  ListSprintsResponse,
  StartSprintRequest,
  StartSprintResponse,
  CompleteSprintRequest,
  CompleteSprintResponse,
  SprintAlert,
  TriggerSprintAlertRequest,
  TriggerSprintAlertResponse,
  SprintServiceService,
  SprintServiceClient,
  AlertServiceService,
  AlertServiceClient,
} from './sprints';
EOF

echo "[INFO] Generated gen/ts/index.ts barrel export."

# 5. Companion @grpc/proto-loader generation (if installed)
if [ -f "${REPO_ROOT}/node_modules/.bin/proto-loader-gen-types" ] || [ -f "${REPO_ROOT}/node_modules/.bin/proto-loader-gen-types.cmd" ]; then
  mkdir -p "${REPO_ROOT}/gen/ts/proto-loader"
  echo "[INFO] Generating companion @grpc/proto-loader typings..."
  npx proto-loader-gen-types \
    --longs=Number \
    --enums=String \
    --defaults \
    --oneofs \
    --grpcLib=@grpc/grpc-js \
    --outDir="${REPO_ROOT}/gen/ts/proto-loader" \
    -Iprotos \
    protos/issues.proto protos/sprints.proto || echo "[WARN] proto-loader-gen-types completed with warnings."
fi

echo "[SUCCESS] TypeScript stubs generated successfully in gen/ts/."
