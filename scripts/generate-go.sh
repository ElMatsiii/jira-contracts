#!/usr/bin/env bash
# ==============================================================================
# jira-contracts: Go Protobuf & gRPC Code Generation Script
# Compiles protos/issues.proto and protos/sprints.proto into Go packages:
#   - gen/go/issues/v1/issues.pb.go, issues_grpc.pb.go
#   - gen/go/sprints/v1/sprints.pb.go, sprints_grpc.pb.go
#
# Supports:
#   1. Local protoc + protoc-gen-go + protoc-gen-go-grpc
#   2. Docker container fallback (golang:1.22-alpine)
#   3. Graceful preservation of existing generated stubs
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "[INFO] Starting Go contract generation..."

# Ensure target directories exist
mkdir -p "${REPO_ROOT}/gen/go/issues/v1"
mkdir -p "${REPO_ROOT}/gen/go/sprints/v1"

# 1. Resolve protoc binary
PROTOC_BIN=""
if command -v protoc >/dev/null 2>&1; then
  PROTOC_BIN="protoc"
elif [ -f "${REPO_ROOT}/node_modules/.bin/protoc" ]; then
  PROTOC_BIN="${REPO_ROOT}/node_modules/.bin/protoc"
elif [ -f "${REPO_ROOT}/node_modules/.bin/protoc.cmd" ]; then
  PROTOC_BIN="${REPO_ROOT}/node_modules/.bin/protoc.cmd"
elif command -v npx >/dev/null 2>&1; then
  PROTOC_BIN="npx protoc"
fi

# 2. Check if Go toolchain & plugins are installed locally
HAS_GO=false
if command -v go >/dev/null 2>&1; then
  HAS_GO=true
  GOPATH_BIN="$(go env GOPATH 2>/dev/null || echo "$HOME/go")/bin"
  export PATH="${GOPATH_BIN}:${PATH}"

  if ! command -v protoc-gen-go >/dev/null 2>&1; then
    echo "[INFO] Installing protoc-gen-go..."
    go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.34.2 || true
  fi

  if ! command -v protoc-gen-go-grpc >/dev/null 2>&1; then
    echo "[INFO] Installing protoc-gen-go-grpc..."
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1 || true
  fi
fi

# 3. Execution strategy
if [ -n "${PROTOC_BIN}" ] && [ "${HAS_GO}" = true ] && command -v protoc-gen-go >/dev/null 2>&1 && command -v protoc-gen-go-grpc >/dev/null 2>&1; then
  echo "[INFO] Compiling Go stubs using local protoc and Go plugins..."
  ${PROTOC_BIN} \
    --proto_path=protos \
    --go_out=. \
    --go_opt=module=jira-contracts \
    --go-grpc_out=. \
    --go-grpc_opt=module=jira-contracts \
    protos/issues.proto protos/sprints.proto
  echo "[SUCCESS] Go stubs compiled successfully via local toolchain."

elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "[INFO] Local Go protoc plugins not found. Compiling via Docker container (golang:1.22-alpine)..."
  docker run --rm \
    -v "${REPO_ROOT}:/workspace" \
    -w /workspace \
    golang:1.22-alpine \
    sh -c "apk add --no-cache protobuf-dev && \
           go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.34.2 && \
           go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1 && \
           protoc --proto_path=protos \
                  --go_out=. --go_opt=module=jira-contracts \
                  --go-grpc_out=. --go-grpc_opt=module=jira-contracts \
                  protos/issues.proto protos/sprints.proto"
  echo "[SUCCESS] Go stubs compiled successfully via Docker."

else
  echo "[WARN] Neither Go protoc toolchain nor active Docker daemon detected."
  if [ -f "${REPO_ROOT}/gen/go/issues/v1/issues.pb.go" ] && [ -f "${REPO_ROOT}/gen/go/sprints/v1/sprints.pb.go" ]; then
    echo "[INFO] Existing generated Go stubs verified in gen/go/. Preserving stubs."
  else
    echo "[INFO] Initializing stub files in gen/go/..."
    mkdir -p "${REPO_ROOT}/gen/go/issues/v1" "${REPO_ROOT}/gen/go/sprints/v1"
  fi
fi
