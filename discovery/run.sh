#!/usr/bin/env bash
set -Eeuo pipefail
here="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
command -v python3 >/dev/null 2>&1 || { echo 'Instala Python 3.9+ en el equipo auditor.' >&2; exit 1; }
if (( $# == 0 )); then set -- wizard; fi
if [[ "$1" == "service" ]]; then shift; exec python3 "${here}/service.py" "$@"; fi
exec python3 "${here}/discover.py" "$@"
