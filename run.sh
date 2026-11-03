#!/bin/bash
set -e

# Start MariaDB service if not running
/etc/init.d/mariadb status >/dev/null 2>&1 || /etc/init.d/mariadb start

# Ensure schema and data exist
mysql -e "USE ev_charging_db; SHOW TABLES;" >/dev/null 2>&1 || {
  mysql < ev-charging-station-availability-system/schema.sql
  mysql < ev-charging-station-availability-system/seed.sql
}

# Compile Java code
cd ev-charging-station-availability-system/java_src
javac -cp ".:mysql-connector-j-26.10.0.jar" ev/charging/system/*.java

# Stop any previous instance on port 3000
fuser -k 3000/tcp 2>/dev/null || true

# Run Java Web Server on port 3000
echo "Starting Java Server on port 3000..."
exec java -cp ".:mysql-connector-j-26.10.0.jar" ev.charging.system.EVWebServer
