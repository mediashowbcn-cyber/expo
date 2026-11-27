#!/bin/bash
if ! curl -s -o /dev/null http://localhost:8099/; then
  service mariadb start >/dev/null 2>&1 || (mysqld_safe >/dev/null 2>&1 &)
  sleep 2
  cd /tmp/claude-0/-home-user-expo/3577b188-0fb6-58df-9d1c-b85dcd491ae4/scratchpad/wp && (nohup php -S localhost:8099 > /tmp/claude-0/-home-user-expo/3577b188-0fb6-58df-9d1c-b85dcd491ae4/scratchpad/php.log 2>&1 &)
  sleep 2
fi
curl -s -o /dev/null -w "server %{http_code}\n" http://localhost:8099/
