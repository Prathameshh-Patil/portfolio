#!/usr/bin/env bash
# Resets the local stack to a clean demo state: an empty database with only the seeded projects.
# Usage: npm run demo            (asks before deleting)
#        npm run demo -- --yes   (no question)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "No .env file. Run: cp .env.example .env, then fill it in (see README)." >&2
  exit 1
fi

if [ "${1:-}" != "--yes" ]; then
  echo "This deletes the local database: contact messages, view counts and admin edits."
  read -r -p "Continue? [y/N] " answer
  [ "$answer" = "y" ] || [ "$answer" = "Y" ] || { echo "Cancelled."; exit 0; }
fi

# --volumes removes the MySQL data volume. On start, the api container runs the migrations
# and the seed again, so the site comes back with the four resume projects and nothing else.
docker compose down --volumes
# --wait returns once db and api pass their healthchecks and web is running.
docker compose up --build --detach --wait

# Ask Docker which host port the website got (WEB_PORT in .env, default 3000).
web_port=$(docker compose port web 3000 | cut -d: -f2)
echo
echo "Ready:"
echo "  Site   http://localhost:$web_port"
echo "  Admin  http://localhost:$web_port/admin"
echo "  API    http://localhost:4000/health"
