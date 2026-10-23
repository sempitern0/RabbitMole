#!/usr/bin/env bash
# RabbitMole local collector. Explicit local execution, read-only, no network connections.
set -Eeuo pipefail
umask 077
OUT="captura.json"
while (($#)); do case "$1" in --output) [[ $# -ge 2 ]] || exit 2; OUT="$2";shift 2;; --help|-h) echo "Usage: bash collect-local.sh --output inventory.json";exit 0;; *) echo "Unsupported argument" >&2;exit 2;; esac;done
[[ "$OUT" == *.json ]] || { echo "La salida debe terminar en .json" >&2; exit 2; }
if command -v python3 >/dev/null 2>&1; then
  echo "[RabbitMole] Python detectado: inventario Linux ampliado."
  exec python3 "$(dirname "$0")/collect-local.py" --output "$OUT"
fi
echo "[RabbitMole] Python no encontrado. Usando herramientas Bash del sistema."
export AW_HOST="$(hostname 2>/dev/null || true)"
export AW_OS="$(uname -s 2>/dev/null || true)"
export AW_ARCH="$(uname -m 2>/dev/null || true)"
export AW_CPU="$(uname -p 2>/dev/null || true)"
export AW_RAM=""
if [[ -r /proc/meminfo ]]; then AW_RAM="$(awk '/^MemTotal:/{printf "%.1f GiB",$2/1048576;exit}' /proc/meminfo)";elif command -v sysctl >/dev/null;then AW_RAM="$(sysctl -n hw.memsize 2>/dev/null | awk '{if($1~/^[0-9]+$/)printf "%.1f GiB",$1/1073741824}')";fi
export AW_RAM
if [[ -r /etc/os-release ]]; then . /etc/os-release; export AW_OS="${PRETTY_NAME:-$AW_OS}";elif [[ "$(uname -s)" == "Darwin" ]] && command -v sw_vers >/dev/null;then AW_OS="macOS $(sw_vers -productVersion)";export AW_OS;fi
export AW_IP=""
if command -v ip >/dev/null;then AW_IP="$(ip -o -4 addr show scope global 2>/dev/null | awk 'NR==1{split($4,a,"/");print a[1]}')";elif command -v ipconfig >/dev/null;then AW_IP="$(ipconfig getifaddr en0 2>/dev/null || true)";fi
export AW_IP
if ! command -v jq >/dev/null 2>&1; then
  echo "[RabbitMole] Para serializar JSON sin Python necesitas jq. Instala Python 3 o jq." >&2
  exit 1
fi
echo "[RabbitMole] Recopilando información básica..."
HOST_NAME="$(hostname 2>/dev/null || echo desconocido)"
SYS_NAME="$(uname -s 2>/dev/null || echo Linux)"
SO_NAME="$(sed -n 's/^PRETTY_NAME=//p' /etc/os-release 2>/dev/null | head -1 | tr -d '"')"
MEMORY="$(awk '/^MemTotal:/{printf "%.1f GiB",$2/1048576;exit}' /proc/meminfo 2>/dev/null)"
IP_ADDRESS="$(ip -o -4 addr show scope global 2>/dev/null | awk 'NR==1{split($4,a,"/");print a[1]}')"
BASE="${OUT%.json}"
TARGET="$OUT"
INDEX=0
while [[ -e "$TARGET" ]]; do INDEX=$((INDEX+1)); TARGET="${BASE}-${INDEX}.json"; done
jq -n --arg host "$HOST_NAME" --arg os "${SO_NAME:-$SYS_NAME}" --arg ram "$MEMORY" --arg ip "$IP_ADDRESS" \
  '{kind:"rabbitmole-discovery-v1",schemaVersion:1,capturedAt:(now|todateiso8601),
    source:{platform:"Linux",collector:"collect-local.sh",scope:"local",mode:"read-only",
      limitations:["Python no disponible: captura Bash básica, revisar software y redes manualmente"]},
    items:{assets:[{name:$host,os:$os,ram:$ram,ip:$ip,notes:"Recopilación limitada por dependencias"}],
      networks:[],software:[]}}' > "$TARGET"
echo "[RabbitMole] Guardado: $TARGET | captura básica sin Python."
exit 0
