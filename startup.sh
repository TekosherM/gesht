#!/bin/sh
set -eu
cd /workspace
if [ -f /workspace/.env ]; then
  set -a
  # shellcheck disable=SC1091
  . /workspace/.env
  set +a
fi
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8788/api/gesht/health; then
  :
else
  /workspace/backend/.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8788 --log-level warning >>/tmp/gesht-api.log 2>&1 &
fi
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
