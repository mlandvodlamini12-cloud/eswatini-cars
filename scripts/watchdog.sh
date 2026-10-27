#!/bin/bash
# Watchdog: keeps the dev server running forever.
# Checks every 5 seconds; if the server is dead, restarts it.
cd /home/z/my-project

while true; do
  # Check if next-server process is running
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    echo "[$(date)] Dev server is dead. Restarting..."
    # Kill any leftover bun/next processes
    pkill -f "next dev" 2>/dev/null
    pkill -f "bun run dev" 2>/dev/null
    sleep 2
    # Start the dev server in a new detached session
    setsid bash -c 'bun run dev > /home/z/my-project/dev.log 2>&1' < /dev/null &
    echo "[$(date)] Restarted. Waiting 15s for it to be ready..."
    sleep 15
    if pgrep -f "next-server" > /dev/null 2>&1; then
      echo "[$(date)] Server is alive."
    else
      echo "[$(date)] Server failed to start. Will retry in 10s."
    fi
  fi
  sleep 5
done
