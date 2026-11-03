#!/bin/bash
set -e
echo "=================================================="
echo "Compiling EV Charging Station System (Java + DBMS)"
echo "=================================================="

# Start MySQL / MariaDB service if not running
/etc/init.d/mariadb status >/dev/null 2>&1 || /etc/init.d/mariadb start

# Ensure ev_charging_db database and tables exist
mysql -e "USE ev_charging_db; SHOW TABLES;" >/dev/null 2>&1 || {
  echo "Bootstrapping database schema and seed records..."
  mysql < ev-charging-station-availability-system/schema.sql
  mysql < ev-charging-station-availability-system/seed.sql
}

# Compile all Java source code
cd ev-charging-station-availability-system/java_src
javac -cp ".:mysql-connector-j-26.10.0.jar" ev/charging/system/*.java
echo "Java compilation successful! All class files ready."
