# EV Charging Station Availability System

A **Java Swing + MySQL (JDBC)** desktop application for managing EV charging stations, charger bays, and slot bookings.

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Language   | Java (JDK 8+)                 |
| GUI        | Java Swing (JFrame, JTable)   |
| Database   | MySQL / MariaDB (XAMPP)       |
| Connector  | MySQL Connector/J (JDBC)      |

## Database Schema (5 Tables)

| Table              | Purpose                                  |
|--------------------|------------------------------------------|
| `users`            | User accounts with email, password, role |
| `stations`         | Charging station locations & hours       |
| `chargers`         | Individual charger bays per station      |
| `bookings`         | Slot reservations with overlap checking  |
| `charging_sessions`| Completed session records & billing      |

## Project Structure

```
ev-charging-station-availability-system/
├── java_src/
│   └── ev/charging/system/
│       ├── conn.java            -- JDBC Database Connection
│       ├── Splash.java          -- Splash Screen (entry point)
│       ├── Login.java           -- User Authentication
│       ├── SignUp.java          -- New User Registration
│       ├── Main_class.java      -- Main Dashboard (navigation)
│       ├── AddStation.java      -- Add New Charging Station
│       ├── ViewStations.java    -- View Stations & Chargers (JTable)
│       ├── BookSlot.java        -- Reserve Charging Slot (overlap check)
│       ├── UpdateCharger.java   -- Update Charger Status
│       └── RemoveStation.java   -- Delete/Decommission Station
├── schema.sql                   -- Database schema (run first)
├── seed.sql                     -- Sample data (run second)
└── README.md
```

## Setup Instructions

### Step 1: Install Prerequisites

1. Install **XAMPP** (includes MySQL/MariaDB) — https://www.apachefriends.org/
2. Install **JDK 8 or higher** — https://www.oracle.com/java/technologies/downloads/
3. Download **MySQL Connector/J** JAR — https://dev.mysql.com/downloads/connector/j/
   - Download the **Platform Independent** ZIP and extract `mysql-connector-j-X.X.X.jar`

### Step 2: Create the Database

1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**
2. Open **phpMyAdmin** at http://localhost/phpmyadmin
3. Click the **SQL** tab
4. Copy-paste the contents of `schema.sql` and click **Go**
5. Then copy-paste the contents of `seed.sql` and click **Go**

### Step 3: Configure Database Connection

Open `java_src/ev/charging/system/conn.java` and verify:
- **URL**: `jdbc:mysql://localhost:3306/ev_charging_db` (change port if different)
- **Username**: `root` (default XAMPP user)
- **Password**: `""` (empty by default in XAMPP — change if you set one)

### Step 4: Compile & Run

#### Using Command Line:
```bash
cd java_src

# Compile all Java files (adjust path to your mysql-connector JAR)
javac -cp ".;C:\path\to\mysql-connector-j-8.0.33.jar" ev/charging/system/*.java

# Run the Splash Screen (entry point)
java -cp ".;C:\path\to\mysql-connector-j-8.0.33.jar" ev.charging.system.Splash
```

#### Using an IDE (Eclipse / IntelliJ / NetBeans):
1. Create a new Java Project
2. Add the `java_src` folder as source
3. Add `mysql-connector-j-X.X.X.jar` to the project's **Build Path / Libraries**
4. Run `Splash.java` as the main class

## Demo Login Credentials

| Email                    | Password  | Role     |
|--------------------------|-----------|----------|
| admin@evcharge.com       | admin123  | ADMIN    |
| operator1@evcharge.com   | admin123  | OPERATOR |
| elena@example.com        | admin123  | USER     |

## Application Modules

| Module         | DBMS Operation       | Description                                    |
|----------------|----------------------|------------------------------------------------|
| Login          | SELECT (Authentication) | Validates email + password from USERS table |
| Sign Up        | INSERT INTO USERS    | Registers new user with role selection         |
| Add Station    | INSERT INTO STATIONS | Adds new charging station with location data   |
| View Stations  | SELECT with JOIN     | Displays stations & chargers in JTable         |
| Book Slot      | INSERT + SELECT      | Reserves slot with double-booking prevention   |
| Update Charger | UPDATE CHARGERS      | Changes charger status/power/price             |
| Remove Station | DELETE FROM STATIONS | Decommissions station (cascades to chargers)   |

## DBMS Concepts Demonstrated

- **CRUD Operations**: CREATE, READ, UPDATE, DELETE via JDBC
- **JOIN Queries**: Stations JOIN Chargers for combined view
- **Foreign Key Constraints**: Referential integrity across all tables
- **Overlap Detection**: Temporal collision check before booking insertion
- **CASCADE DELETE**: Removing a station auto-removes its chargers
- **ENUM Data Types**: Role-based access (USER/OPERATOR/ADMIN), status fields
- **AUTO_INCREMENT**: Primary key generation for all tables
- **INDEX Optimization**: Indexed columns for faster queries
