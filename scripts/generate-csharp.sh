#!/usr/bin/env bash
# ==============================================================================
# jira-contracts: C# Protobuf & gRPC Code Generation Script
# Compiles protos/issues.proto and protos/sprints.proto into C# classes:
#   - gen/csharp/Issues.cs       (messages)
#   - gen/csharp/IssuesGrpc.cs   (IssueService client + base)
#   - gen/csharp/Sprints.cs      (messages)
#   - gen/csharp/SprintsGrpc.cs  (SprintService and AlertService clients + bases)
#
# Namespaces:
#   - JiraAi.Contracts.Issues.V1
#   - JiraAi.Contracts.Sprints.V1
#
# Uses protoc and grpc_csharp_plugin from the Grpc.Tools NuGet package, so messages and
# services come from the same compiler. The version matches MS3's Grpc.Core.Api (2.66.0).
# To get the tools once:  dotnet restore of any project referencing Grpc.Tools 2.66.0, or set
# GRPC_TOOLS_DIR to a folder containing protoc and grpc_csharp_plugin.
#
# MS3 (jira-analytics-dotnet) keeps its own copy of gen/csharp in
# src/JiraAi.Analytics.Contracts/Gen; copy the files there after regenerating.
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

GRPC_TOOLS_VERSION="${GRPC_TOOLS_VERSION:-2.66.0}"

echo "[INFO] Starting C# contract generation..."
mkdir -p "${REPO_ROOT}/gen/csharp"

# 1. Resolve the Grpc.Tools binaries for this platform
case "$(uname -s)" in
  Linux*) PLATFORM_DIR="linux_x64"; EXE="" ;;
  Darwin*) PLATFORM_DIR="macosx_x64"; EXE="" ;;
  MINGW*|MSYS*|CYGWIN*) PLATFORM_DIR="windows_x64"; EXE=".exe" ;;
  *) echo "[ERROR] Unsupported platform: $(uname -s)"; exit 1 ;;
esac

TOOLS_DIR="${GRPC_TOOLS_DIR:-${HOME}/.nuget/packages/grpc.tools/${GRPC_TOOLS_VERSION}/tools/${PLATFORM_DIR}}"
PROTOC_BIN="${TOOLS_DIR}/protoc${EXE}"
GRPC_PLUGIN="${TOOLS_DIR}/grpc_csharp_plugin${EXE}"

if [ ! -f "${PROTOC_BIN}" ] || [ ! -f "${GRPC_PLUGIN}" ]; then
  echo "[ERROR] Grpc.Tools ${GRPC_TOOLS_VERSION} not found in ${TOOLS_DIR}."
  echo "        Restore a project that references Grpc.Tools ${GRPC_TOOLS_VERSION} (dotnet restore),"
  echo "        or set GRPC_TOOLS_DIR to a folder with protoc and grpc_csharp_plugin."
  echo "        Aborting instead of writing incomplete service stubs."
  exit 1
fi
[ -n "${EXE}" ] || chmod +x "${PROTOC_BIN}" "${GRPC_PLUGIN}" 2>/dev/null || true

# protoc.exe on Windows needs a native path for the plugin
PLUGIN_ARG="${GRPC_PLUGIN}"
if [ -n "${EXE}" ] && command -v cygpath >/dev/null 2>&1; then
  PLUGIN_ARG="$(cygpath -w "${GRPC_PLUGIN}")"
fi

# 2. Generate messages and gRPC services in one pass
echo "[INFO] Compiling C# messages and gRPC services with $("${PROTOC_BIN}" --version)..."
"${PROTOC_BIN}" \
  --proto_path=protos \
  --csharp_out="${REPO_ROOT}/gen/csharp" \
  --grpc_out="${REPO_ROOT}/gen/csharp" \
  --plugin=protoc-gen-grpc="${PLUGIN_ARG}" \
  protos/issues.proto protos/sprints.proto

# 3. Fail loudly if a service is missing (an earlier fallback wrote AlertService only)
for service in "IssueService" "SprintService" "AlertService"; do
  if ! grep -q "public static partial class ${service}\b" "${REPO_ROOT}"/gen/csharp/*Grpc.cs; then
    echo "[ERROR] Generated C# code does not contain ${service}."
    exit 1
  fi
done

echo "[SUCCESS] C# messages and gRPC stubs generated in gen/csharp/."
