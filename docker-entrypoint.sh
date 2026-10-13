#!/bin/sh
set -eu
LOG_DIR=/var/log/manage-ai
mkdir -p "$LOG_DIR"
touch "$LOG_DIR/app.log"
# Keep node as PID 1 for signals; duplicate logs to bind-mounted file and stdout.
FIFO=/tmp/manage-ai.log.fifo
rm -f "$FIFO"
mkfifo "$FIFO"
tee -a "$LOG_DIR/app.log" < "$FIFO" &
exec node .output/server/index.mjs > "$FIFO" 2>&1
