#!/bin/zsh

emulate -L zsh
setopt typesetsilent
set -u
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUNTIME_DIR="$SCRIPT_DIR/runtime"
SERVER_LOG="$RUNTIME_DIR/server.log"
TUNNEL_LOG="$RUNTIME_DIR/tunnel.log"
PUBLIC_BASE_FILE="$RUNTIME_DIR/public_base_url.txt"
PUBLIC_LINKS_FILE="$RUNTIME_DIR/link_condivisi.txt"
SERVER_PID_FILE="$RUNTIME_DIR/server.pid"
TUNNEL_PID_FILE="$RUNTIME_DIR/tunnel.pid"
WATCHDOG_PID_FILE="$RUNTIME_DIR/watchdog.pid"
PORT=8030
LOCAL_HEALTH_URL="http://127.0.0.1:${PORT}/domande.html"

mkdir -p "$RUNTIME_DIR"
print -r -- "$$" > "$WATCHDOG_PID_FILE"

is_pid_running() {
  local pid_file="$1"

  [[ -f "$pid_file" ]] || return 1

  local pid=""
  pid="$(<"$pid_file")"
  [[ -n "$pid" ]] || return 1

  kill -0 "$pid" 2>/dev/null
}

kill_pid_file() {
  local pid_file="$1"

  [[ -f "$pid_file" ]] || return 0

  local pid=""
  pid="$(<"$pid_file")"

  if [[ -n "$pid" ]]; then
    kill "$pid" 2>/dev/null || true
  fi

  rm -f "$pid_file"
}

extract_public_base() {
  if [[ -f "$PUBLIC_BASE_FILE" ]]; then
    local current_base=""
    current_base="$(<"$PUBLIC_BASE_FILE")"

    if [[ -n "$current_base" ]]; then
      print -r -- "$current_base"
      return 0
    fi
  fi

  if [[ -f "$TUNNEL_LOG" ]]; then
    sed -nE 's/.*(https:\/\/[-[:alnum:]]+\.trycloudflare\.com).*/\1/p' "$TUNNEL_LOG" | tail -n 1
  fi
}

write_public_links() {
  local base="$1"

  [[ -n "$base" ]] || return 0

  print -r -- "$base" > "$PUBLIC_BASE_FILE"
  print -r -- "$base/domande.html" > "$PUBLIC_LINKS_FILE"
  print -r -- "$base/statistiche.html" >> "$PUBLIC_LINKS_FILE"
  print -r -- "$base/api/responses" >> "$PUBLIC_LINKS_FILE"
}

local_is_healthy() {
  curl -fsSI --max-time 10 "$LOCAL_HEALTH_URL" >/dev/null 2>&1
}

public_is_healthy() {
  local base=""
  base="$(extract_public_base)"

  [[ -n "$base" ]] || return 1

  write_public_links "$base"
  curl -fsSI --max-time 15 "$base/domande.html" >/dev/null 2>&1
}

start_server() {
  print -r -- "[$(date '+%Y-%m-%d %H:%M:%S')] avvio server" >> "$SERVER_LOG"
  nohup python3 "$SCRIPT_DIR/server.py" --host 0.0.0.0 --port "$PORT" >> "$SERVER_LOG" 2>&1 &
  print -r -- "$!" > "$SERVER_PID_FILE"
  sleep 2
}

start_tunnel() {
  : > "$TUNNEL_LOG"
  rm -f "$PUBLIC_BASE_FILE" "$PUBLIC_LINKS_FILE"
  print -r -- "[$(date '+%Y-%m-%d %H:%M:%S')] avvio tunnel" >> "$TUNNEL_LOG"
  nohup "$SCRIPT_DIR/cloudflared" tunnel --protocol http2 --url "http://127.0.0.1:${PORT}" >> "$TUNNEL_LOG" 2>&1 &
  print -r -- "$!" > "$TUNNEL_PID_FILE"

  local attempt=0
  while (( attempt < 30 )); do
    attempt=$((attempt + 1))

    local base=""
    base="$(extract_public_base)"

    if [[ -n "$base" ]]; then
      write_public_links "$base"
      return 0
    fi

    sleep 1
  done

  return 1
}

cleanup() {
  kill_pid_file "$TUNNEL_PID_FILE"
  kill_pid_file "$SERVER_PID_FILE"
  rm -f "$WATCHDOG_PID_FILE"
  exit 0
}

trap cleanup INT TERM

while true; do
  if ! local_is_healthy; then
    kill_pid_file "$SERVER_PID_FILE"
    start_server
  fi

  if ! public_is_healthy; then
    kill_pid_file "$TUNNEL_PID_FILE"
    start_tunnel || true
  fi

  sleep 20
done
