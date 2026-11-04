# EV Charging Station Availability System (React + TypeScript)

A modern, high-performance **React SPA** rewritten from the original Java Swing / DBMS application, preserving 100% of the core features, relational ACID transaction logic, and strict Role-Based Access Control (RBAC).

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Framework  | React 19 + TypeScript                         |
| Bundler    | Vite 6                                        |
| Styling    | Tailwind CSS v4                               |
| Engine     | In-Memory Relational Engine + ACID Collision Guard + LocalStorage Persistence |
| Icons      | Lucide React                                  |

## Database Schema (5 Tables Modeled)

| Table              | Purpose                                                      |
|--------------------|--------------------------------------------------------------|
| `users`            | User credentials, contact info, and roles (USER/OPERATOR/ADMIN) |
| `stations`         | Charging station locations, operational hours, operator FK   |
| `chargers`         | Individual charger bays, connector type, power (kW), tariff   |
| `bookings`         | Slot reservations with ACID temporal overlap detection        |
| `charging_sessions`| Completed charging sessions, energy delivered (kWh), billing  |

## Preserved Features & Modules

1. **Strict Role-Based Access Control (RBAC)**:
   - **ADMIN**: Full privileges (Add, View, Book, Update, Decommission with CASCADE DELETE, Direct SQL Console).
   - **OPERATOR**: Station management (Add Station, View, Book, Update Charger Telemetry).
   - **USER**: EV Drivers / Customers (View Stations, Reserve Slot, View Own Bookings).
   - Unauthorized attempts show an explicit `403 Forbidden` policy dialog with 1-click test role switchers.

2. **ACID Slot Reservation Engine (`/book`)**:
   - Temporal collision check: `(start_time < new_end) AND (end_time > new_start)` for confirmed bookings.
   - Prevents double-booking collisions with instant detailed conflict diagnostics.

3. **Stations & Charger Bays Catalog (`/stations`)**:
   - Filter by City (e.g., Chennai, Bangalore, Hyderabad, Delhi, Pune, Kolkata, Mumbai).
   - Live relational join of station locations and individual charger bay statuses.
   - 🖨️ Official Printable Academic Report View with signatures section.
   - 📥 Instant CSV Export (`EV_Stations_Report.csv`).

4. **Direct SQL Query Console (`/dbms`)**:
   - Interactive SQL query executor simulating relational statement execution on `ev_charging_db`.
   - Includes quick presets for GROUP BY queries, table joins, users, and charging sessions.

5. **Desktop Swing Execution Guide (`/swing-guide`)**:
   - Retains full instructions and `javac` commands for running the original Java Swing application with XAMPP MySQL.

## Running the App

```bash
# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev

# Build production bundle
npm run build
```

## Demo Accounts

- **Admin**: `admin@evcharge.com` / `admin123`
- **Operator**: `operator1@evcharge.com` / `admin123`
- **User**: `elena@example.com` / `admin123`
