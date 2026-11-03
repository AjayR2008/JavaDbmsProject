package ev.charging.system;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.*;

/**
 * Pure Java Web Server & DBMS Telemetry Console with Full RBAC
 * -------------------------------------------------------------
 * Framework-free, 100% Java standard library (com.sun.net.httpserver)
 * and MySQL/MariaDB Relational Database Management System (JDBC).
 * 
 * Enforces Role-Based Access Control (RBAC):
 * - ADMIN: Full access (Add, View, Book, Update, Remove, SQL Console)
 * - OPERATOR: Station management (Add Station, View, Book, Update Charger)
 * - USER: Customer operations (View Stations & Available Bays, Book Slot)
 */
public class EVWebServer {

    public static final int PORT = 3000;

    // Active session state (synced with UserSession)
    static int activeUserId = 1;
    static String activeUserName = "Alex Vance";
    static String activeUserEmail = "admin@evcharge.com";
    static String activeUserRole = "ADMIN";

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new AppHandler());
        server.setExecutor(null);
        System.out.println("=================================================================");
        System.out.println("  EV Charging Station System with Strict RBAC (Java + MySQL)");
        System.out.println("  Server listening on http://0.0.0.0:" + PORT);
        System.out.println("  Default Session: " + activeUserName + " [" + activeUserRole + "]");
        System.out.println("=================================================================");
        server.start();
    }

    static class AppHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            Map<String, String> params = new HashMap<>();

            if ("POST".equalsIgnoreCase(method)) {
                InputStream is = exchange.getRequestBody();
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, len);
                }
                String body = baos.toString(StandardCharsets.UTF_8.name());
                parseQueryParams(body, params);
            } else {
                String query = exchange.getRequestURI().getQuery();
                if (query != null) {
                    parseQueryParams(query, params);
                }
            }

            // Role Switcher Handler
            if ("/switch-user".equals(path) || params.containsKey("switch_user_id")) {
                int switchId = 1;
                try {
                    switchId = Integer.parseInt(params.getOrDefault("switch_user_id", params.getOrDefault("user_id", "1")));
                    loadUserSession(switchId);
                } catch (Exception ignored) {}
                String redirectTarget = params.getOrDefault("redirect", "/");
                redirect(exchange, redirectTarget);
                return;
            }

            String html = "";
            String flashMessage = "";
            String flashType = "info";

            try {
                if ("/add-station-action".equals(path) && "POST".equalsIgnoreCase(method)) {
                    // RBAC Server-Side Validation
                    if (!canAddStation()) {
                        flashMessage = "ACCESS DENIED (403 Forbidden): Role '" + activeUserRole + "' is not permitted to add charging stations. Only ADMIN or OPERATOR roles have infrastructure creation privileges.";
                        flashType = "error";
                        path = "/add-station";
                    } else {
                        flashMessage = handleAddStation(params);
                        flashType = "success";
                        path = "/stations";
                    }
                } else if ("/book-slot-action".equals(path) && "POST".equalsIgnoreCase(method)) {
                    Map<String, String> res = handleBookSlot(params);
                    flashMessage = res.get("message");
                    flashType = res.get("type");
                    path = "/book";
                } else if ("/update-charger-action".equals(path) && "POST".equalsIgnoreCase(method)) {
                    // RBAC Server-Side Validation
                    if (!canUpdateCharger()) {
                        flashMessage = "ACCESS DENIED (403 Forbidden): Role '" + activeUserRole + "' is not permitted to update charger telemetry. Only OPERATOR or ADMIN roles can modify chargers.";
                        flashType = "error";
                        path = "/update-charger";
                    } else {
                        flashMessage = handleUpdateCharger(params);
                        flashType = "success";
                        path = "/stations";
                    }
                } else if ("/remove-station-action".equals(path) && "POST".equalsIgnoreCase(method)) {
                    // RBAC Server-Side Validation
                    if (!canRemoveStation()) {
                        flashMessage = "ACCESS DENIED (403 Forbidden): Station decommissioning requires 'ADMIN' privilege. Your role: '" + activeUserRole + "'.";
                        flashType = "error";
                        path = "/remove-station";
                    } else {
                        flashMessage = handleRemoveStation(params);
                        flashType = "success";
                        path = "/stations";
                    }
                }
            } catch (Exception ex) {
                flashMessage = "Database Error: " + ex.getMessage();
                flashType = "error";
            }

            if ("/export-stations-csv".equals(path)) {
                handleExportCsv(exchange, params);
                return;
            } else if ("/print-report".equals(path)) {
                html = renderPrintReport(params);
            } else if ("/stations".equals(path)) {
                html = renderStations(params, flashMessage, flashType);
            } else if ("/book".equals(path)) {
                html = renderBookSlot(params, flashMessage, flashType);
            } else if ("/add-station".equals(path)) {
                html = renderAddStation(flashMessage, flashType);
            } else if ("/update-charger".equals(path)) {
                html = renderUpdateCharger(flashMessage, flashType);
            } else if ("/remove-station".equals(path)) {
                html = renderRemoveStation(flashMessage, flashType);
            } else if ("/dbms".equals(path) || "/dbms-query".equals(path)) {
                html = renderDBMS(params, flashMessage, flashType);
            } else if ("/roles".equals(path)) {
                html = renderRoleVerificationMatrix(flashMessage, flashType);
            } else if ("/swing-guide".equals(path)) {
                html = renderSwingGuide();
            } else {
                html = renderDashboard(flashMessage, flashType);
            }

            byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }

        private static void redirect(HttpExchange exchange, String target) throws IOException {
            exchange.getResponseHeaders().set("Location", target);
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        }

        private static void loadUserSession(int userId) {
            try {
                conn c = new conn();
                PreparedStatement ps = c.connection.prepareStatement("SELECT user_id, name, email, role FROM users WHERE user_id = ?");
                ps.setInt(1, userId);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    activeUserId = rs.getInt("user_id");
                    activeUserName = rs.getString("name");
                    activeUserEmail = rs.getString("email");
                    activeUserRole = rs.getString("role");
                    UserSession.setSession(activeUserId, activeUserName, activeUserEmail, activeUserRole);
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }

        private static boolean isAdmin() {
            return "ADMIN".equalsIgnoreCase(activeUserRole);
        }

        private static boolean isOperator() {
            return "OPERATOR".equalsIgnoreCase(activeUserRole);
        }

        private static boolean isUser() {
            return "USER".equalsIgnoreCase(activeUserRole);
        }

        private static boolean canAddStation() {
            return isAdmin() || isOperator();
        }

        private static boolean canUpdateCharger() {
            return isAdmin() || isOperator();
        }

        private static boolean canRemoveStation() {
            return isAdmin();
        }

        private static boolean canAccessDbmsConsole() {
            return isAdmin();
        }

        private static void parseQueryParams(String query, Map<String, String> params) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                try {
                    if (idx > 0) {
                        String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8.name());
                        String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8.name());
                        params.put(key, value);
                    }
                } catch (Exception ignored) {
                }
            }
        }

        // =====================================================================
        // DATABASE ACTIONS (JDBC SQL EXECUTION)
        // =====================================================================
        private String handleAddStation(Map<String, String> p) throws SQLException {
            String name = p.getOrDefault("station_name", "").trim();
            String city = p.getOrDefault("city", "").trim();
            String address = p.getOrDefault("address", "").trim();
            String open = p.getOrDefault("opening_time", "06:00").trim();
            String close = p.getOrDefault("closing_time", "23:00").trim();
            double lat = Double.parseDouble(p.getOrDefault("latitude", "13.0827").trim());
            double lng = Double.parseDouble(p.getOrDefault("longitude", "80.2707").trim());
            
            // If operator is adding, operator_id is their own id; if admin, can select operator
            int opId = isOperator() ? activeUserId : Integer.parseInt(p.getOrDefault("operator_id", String.valueOf(activeUserId)).trim());

            conn c = new conn();
            String sql = "INSERT INTO stations (station_name, address, city, latitude, longitude, opening_time, closing_time, operator_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')";
            try (PreparedStatement ps = c.connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, name);
                ps.setString(2, address);
                ps.setString(3, city);
                ps.setDouble(4, lat);
                ps.setDouble(5, lng);
                ps.setString(6, open);
                ps.setString(7, close);
                ps.setInt(8, opId);
                ps.executeUpdate();
                ResultSet rs = ps.getGeneratedKeys();
                int newId = rs.next() ? rs.getInt(1) : 0;

                // Add 2 initial chargers for newly added station
                String addChargerSql = "INSERT INTO chargers (station_id, connector_type, power_kw, price_per_kwh, status) VALUES (?, ?, ?, ?, 'AVAILABLE')";
                try (PreparedStatement psC = c.connection.prepareStatement(addChargerSql)) {
                    psC.setInt(1, newId);
                    psC.setString(2, "CCS2");
                    psC.setDouble(3, 60.0);
                    psC.setDouble(4, 18.50);
                    psC.executeUpdate();

                    psC.setInt(1, newId);
                    psC.setString(2, "Type 2");
                    psC.setDouble(3, 22.0);
                    psC.setDouble(4, 14.00);
                    psC.executeUpdate();
                }
                return "Station '" + name + "' (ID #" + newId + ") registered by " + activeUserName + " [" + activeUserRole + "] into MySQL table 'stations'!";
            }
        }

        private Map<String, String> handleBookSlot(Map<String, String> p) throws SQLException {
            Map<String, String> result = new HashMap<>();
            // Users book under their own ID; Admin/Operator can book for others or themselves
            int userId = isUser() ? activeUserId : Integer.parseInt(p.getOrDefault("user_id", String.valueOf(activeUserId)).trim());
            int chargerId = Integer.parseInt(p.getOrDefault("charger_id", "1").trim());
            String date = p.getOrDefault("date", "2026-11-03").trim();
            String start = date + " " + p.getOrDefault("start_time", "10:00:00").trim();
            String end = date + " " + p.getOrDefault("end_time", "11:30:00").trim();
            String notes = p.getOrDefault("notes", "EV Reservation").trim();

            conn c = new conn();
            // Core ACID Overlap Collision Check Query from BookSlot.java
            String collisionCheck = "SELECT booking_id, start_time, end_time FROM bookings " +
                    "WHERE charger_id = ? AND booking_status = 'CONFIRMED' " +
                    "AND (start_time < ? AND end_time > ?) LIMIT 1";

            try (PreparedStatement ps = c.connection.prepareStatement(collisionCheck)) {
                ps.setInt(1, chargerId);
                ps.setString(2, end);
                ps.setString(3, start);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    int conflictId = rs.getInt("booking_id");
                    String cStart = rs.getString("start_time");
                    String cEnd = rs.getString("end_time");
                    result.put("type", "error");
                    result.put("message", "DOUBLE-BOOKING REJECTED (ACID Guard): Bay #" + chargerId +
                            " is already reserved by Booking #" + conflictId + " from " + cStart + " to " + cEnd + ". Please pick another time.");
                    return result;
                }
            }

            // Safe to insert
            String insertSql = "INSERT INTO bookings (user_id, charger_id, start_time, end_time, booking_status, notes) VALUES (?, ?, ?, ?, 'CONFIRMED', ?)";
            try (PreparedStatement ps = c.connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, userId);
                ps.setInt(2, chargerId);
                ps.setString(3, start);
                ps.setString(4, end);
                ps.setString(5, notes);
                ps.executeUpdate();
                ResultSet rs = ps.getGeneratedKeys();
                int newBookingId = rs.next() ? rs.getInt(1) : 0;
                result.put("type", "success");
                result.put("message", "SLOT RESERVATION CONFIRMED: Booking #" + newBookingId + " successfully registered in MySQL table 'bookings' for Bay #" + chargerId + " (" + start + " to " + end + ")!");
                return result;
            }
        }

        private String handleUpdateCharger(Map<String, String> p) throws SQLException {
            int chargerId = Integer.parseInt(p.getOrDefault("charger_id", "1").trim());
            String status = p.getOrDefault("status", "AVAILABLE").trim();
            double power = Double.parseDouble(p.getOrDefault("power_kw", "50").trim());
            double price = Double.parseDouble(p.getOrDefault("price_per_kwh", "18.50").trim());

            conn c = new conn();
            String sql = "UPDATE chargers SET status = ?, power_kw = ?, price_per_kwh = ? WHERE charger_id = ?";
            try (PreparedStatement ps = c.connection.prepareStatement(sql)) {
                ps.setString(1, status);
                ps.setDouble(2, power);
                ps.setDouble(3, price);
                ps.setInt(4, chargerId);
                int count = ps.executeUpdate();
                return "Charger Bay #" + chargerId + " telemetry updated by " + activeUserName + " [" + activeUserRole + "]: Status=" + status + ", Power=" + power + "kW, Tariff=Rs." + price + "/kWh (Rows updated: " + count + ").";
            }
        }

        private String handleRemoveStation(Map<String, String> p) throws SQLException {
            int stationId = Integer.parseInt(p.getOrDefault("station_id", "0").trim());
            conn c = new conn();
            String nameQuery = "SELECT station_name FROM stations WHERE station_id = ?";
            String stationName = "Station #" + stationId;
            try (PreparedStatement ps = c.connection.prepareStatement(nameQuery)) {
                ps.setInt(1, stationId);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) stationName = rs.getString("station_name");
            }

            String deleteSql = "DELETE FROM stations WHERE station_id = ?";
            try (PreparedStatement ps = c.connection.prepareStatement(deleteSql)) {
                ps.setInt(1, stationId);
                int rows = ps.executeUpdate();
                return "Station '" + stationName + "' (ID #" + stationId + ") decommissioned by " + activeUserName + " [ADMIN]. Foreign key CASCADE deleted dependent chargers from database (Rows: " + rows + ").";
            }
        }

        // =====================================================================
        // HTML VIEW RENDERING
        // =====================================================================
        private String getHeader(String activeTab) {
            String roleBadgeColor = isAdmin() ? "#ef4444" : (isOperator() ? "#f59e0b" : "#10b981");
            String roleBg = isAdmin() ? "rgba(239, 68, 68, 0.2)" : (isOperator() ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)");

            StringBuilder sb = new StringBuilder();
            sb.append("<!DOCTYPE html>\n")
              .append("<html lang=\"en\">\n")
              .append("<head>\n")
              .append("  <meta charset=\"UTF-8\" />\n")
              .append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n")
              .append("  <title>EV Charging Station Availability System (Java & DBMS)</title>\n")
              .append("  <style>\n")
              .append("    :root {\n")
              .append("      --forest: #062817;\n")
              .append("      --emerald: #059669;\n")
              .append("      --lime: #a3e635;\n")
              .append("      --mint: #bbf7d0;\n")
              .append("      --slate-dark: #0f172a;\n")
              .append("      --slate-light: #f1f5f9;\n")
              .append("      --border: #cbd5e1;\n")
              .append("    }\n")
              .append("    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Raleway', Arial, sans-serif; }\n")
              .append("    body { background-color: #f8fafc; color: #1e293b; min-height: 100vh; display: flex; flex-direction: column; }\n")
              .append("    .topbar { background: var(--forest); color: white; padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--lime); flex-wrap: wrap; gap: 12px; }\n")
              .append("    .topbar h1 { font-size: 19px; font-weight: 700; color: var(--lime); letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; }\n")
              .append("    .topbar .badge { background: rgba(163, 230, 53, 0.2); color: var(--lime); border: 1px solid var(--lime); padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; text-transform: uppercase; }\n")
              .append("    .topbar .dept { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }\n")
              .append("    .role-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; border: 1px solid ").append(roleBadgeColor).append("; color: ").append(roleBadgeColor).append("; background: ").append(roleBg).append("; }\n")
              .append("    .session-switcher { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.08); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); }\n")
              .append("    .session-switcher select { background: #0f172a; color: white; border: 1px solid #334155; padding: 4px 8px; border-radius: 4px; font-size: 12px; outline: none; cursor: pointer; }\n")
              .append("    .nav { background: #0b3d22; display: flex; overflow-x: auto; padding: 0 28px; border-bottom: 1px solid #14532d; }\n")
              .append("    .nav a { color: #d1fae5; text-decoration: none; padding: 12px 16px; font-size: 13.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border-bottom: 3px solid transparent; transition: all 0.2s; white-space: nowrap; }\n")
              .append("    .nav a:hover { color: white; background: rgba(255,255,255,0.06); }\n")
              .append("    .nav a.active { color: var(--lime); border-bottom-color: var(--lime); background: rgba(163,230,53,0.1); }\n")
              .append("    .nav a.disabled { color: #64748b; cursor: not-allowed; opacity: 0.7; }\n")
              .append("    .container { max-width: 1200px; width: 100%; margin: 24px auto; padding: 0 20px; flex: 1; }\n")
              .append("    .alert { padding: 14px 18px; margin-bottom: 20px; border-radius: 6px; font-size: 14px; line-height: 1.5; }\n")
              .append("    .alert-success { background: #dcfce7; color: #166534; border-left: 4px solid #22c55e; }\n")
              .append("    .alert-error { background: #fee2e2; color: #991b1b; border-left: 4px solid #ef4444; font-weight: 600; }\n")
              .append("    .alert-info { background: #e0f2fe; color: #075985; border-left: 4px solid #0284c7; }\n")
              .append("    .card { background: white; border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 24px; overflow: hidden; }\n")
              .append("    .card-header { padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }\n")
              .append("    .card-header h2 { font-size: 16.5px; font-weight: 700; color: var(--forest); }\n")
              .append("    .card-body { padding: 20px; }\n")
              .append("    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }\n")
              .append("    .kpi { background: white; border: 1px solid var(--border); border-left: 4px solid var(--emerald); padding: 18px; border-radius: 6px; }\n")
              .append("    .kpi .num { font-size: 26px; font-weight: 800; color: var(--forest); }\n")
              .append("    .kpi .lbl { font-size: 12.5px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px; }\n")
              .append("    table { width: 100%; border-collapse: collapse; font-size: 13.5px; }\n")
              .append("    th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }\n")
              .append("    th { background: #f1f5f9; color: #334155; font-weight: 700; text-transform: uppercase; font-size: 11.5px; letter-spacing: 0.5px; }\n")
              .append("    tr:hover { background: #f8fafc; }\n")
              .append("    .badge-status { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }\n")
              .append("    .status-AVAILABLE { background: #dcfce7; color: #15803d; }\n")
              .append("    .status-OCCUPIED { background: #fee2e2; color: #b91c1c; }\n")
              .append("    .status-MAINTENANCE { background: #fef3c7; color: #b45309; }\n")
              .append("    .status-CONFIRMED { background: #e0e7ff; color: #3730a3; }\n")
              .append("    .form-group { margin-bottom: 16px; }\n")
              .append("    .form-group label { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px; }\n")
              .append("    .form-control { width: 100%; padding: 10px 12px; font-size: 14px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #fff; }\n")
              .append("    .form-control:focus { border-color: var(--emerald); box-shadow: 0 0 0 3px rgba(5,150,105,0.15); }\n")
              .append("    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\n")
              .append("    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; font-size: 13.5px; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; transition: background 0.2s; gap: 8px; }\n")
              .append("    .btn-primary { background: var(--emerald); color: white; }\n")
              .append("    .btn-primary:hover { background: #047857; }\n")
              .append("    .btn-dark { background: var(--forest); color: white; }\n")
              .append("    .btn-dark:hover { background: #031b0f; }\n")
              .append("    .btn-danger { background: #dc2626; color: white; }\n")
              .append("    .btn-danger:hover { background: #b91c1c; }\n")
              .append("    .btn-secondary { background: #e2e8f0; color: #334155; }\n")
              .append("    .btn-secondary:hover { background: #cbd5e1; }\n")
              .append("    .btn-disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; opacity: 0.6; pointer-events: none; }\n")
              .append("    .code-box { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 6px; font-family: 'Courier New', Courier, monospace; font-size: 13px; overflow-x: auto; line-height: 1.6; }\n")
              .append("    .footer { background: #062817; color: #94a3b8; padding: 18px 28px; text-align: center; font-size: 12px; border-top: 1px solid #14532d; margin-top: auto; }\n")
              .append("    .footer span { color: var(--lime); font-weight: 600; }\n")
              .append("  </style>\n")
              .append("</head>\n")
              .append("<body>\n")
              .append("<header class=\"topbar\">\n")
              .append("  <div>\n")
              .append("    <h1>⚡ EV Charging Station System <span class=\"badge\">Java + MySQL DBMS</span></h1>\n")
              .append("    <div class=\"dept\">Role-Based Access Control (RBAC) &bull; Anna University / REC Dept of IT</div>\n")
              .append("  </div>\n")
              .append("  <div class=\"session-switcher\">\n")
              .append("    <span class=\"role-badge\">").append(activeUserRole).append("</span>\n")
              .append("    <form method=\"GET\" action=\"/switch-user\" style=\"display: inline-flex; align-items: center; gap: 6px;\">\n")
              .append("      <input type=\"hidden\" name=\"redirect\" value=\"").append(activeTab).append("\" />\n")
              .append("      <select name=\"switch_user_id\" onchange=\"this.form.submit()\">\n")
              .append("        <option value=\"1\" ").append(activeUserId == 1 ? "selected" : "").append(">🛡️ Alex Vance (ADMIN)</option>\n")
              .append("        <option value=\"2\" ").append(activeUserId == 2 ? "selected" : "").append(">🔧 Maya Lin (OPERATOR)</option>\n")
              .append("        <option value=\"3\" ").append(activeUserId == 3 ? "selected" : "").append(">🔧 David Chen (OPERATOR)</option>\n")
              .append("        <option value=\"4\" ").append(activeUserId == 4 ? "selected" : "").append(">👤 Elena Rostova (USER)</option>\n")
              .append("        <option value=\"5\" ").append(activeUserId == 5 ? "selected" : "").append(">👤 Marcus Brody (USER)</option>\n")
              .append("      </select>\n")
              .append("    </form>\n")
              .append("  </div>\n")
              .append("</header>\n")
              .append("<nav class=\"nav\">\n")
              .append("  <a href=\"/\" class=\"").append("/".equals(activeTab) ? "active" : "").append("\">📊 Dashboard</a>\n")
              .append("  <a href=\"/stations\" class=\"").append("/stations".equals(activeTab) ? "active" : "").append("\">📍 View Stations (All)</a>\n")
              .append("  <a href=\"/book\" class=\"").append("/book".equals(activeTab) ? "active" : "").append("\">📅 Reserve Slot (All)</a>\n")
              .append("  <a href=\"/add-station\" class=\"").append("/add-station".equals(activeTab) ? "active" : "").append(canAddStation() ? "" : " disabled").append("\">").append(canAddStation() ? "➕ Add Station" : "🔒 Add Station (Admin/Op)").append("</a>\n")
              .append("  <a href=\"/update-charger\" class=\"").append("/update-charger".equals(activeTab) ? "active" : "").append(canUpdateCharger() ? "" : " disabled").append("\">").append(canUpdateCharger() ? "⚙️ Update Charger" : "🔒 Update Charger (Admin/Op)").append("</a>\n")
              .append("  <a href=\"/remove-station\" class=\"").append("/remove-station".equals(activeTab) ? "active" : "").append(canRemoveStation() ? "" : " disabled").append("\">").append(canRemoveStation() ? "🗑️ Decommission" : "🔒 Decommission (Admin)").append("</a>\n")
              .append("  <a href=\"/roles\" class=\"").append("/roles".equals(activeTab) ? "active" : "").append("\">🛡️ RBAC Verification Matrix</a>\n")
              .append("  <a href=\"/dbms\" class=\"").append("/dbms".equals(activeTab) ? "active" : "").append(canAccessDbmsConsole() ? "" : " disabled").append("\">").append(canAccessDbmsConsole() ? "💾 SQL Console" : "🔒 SQL Console (Admin)").append("</a>\n")
              .append("  <a href=\"/swing-guide\" class=\"").append("/swing-guide".equals(activeTab) ? "active" : "").append("\">🖥️ Swing Execution Guide</a>\n")
              .append("</nav>\n")
              .append("<main class=\"container\">\n");
            return sb.toString();
        }

        private String getFooter() {
            return "</main>\n" +
                    "<footer class=\"footer\">\n" +
                    "  <div>EV Charging Station Availability System &bull; Enforcing <span>Strict Role-Based Access Control (RBAC)</span> in Java & MySQL DBMS.</div>\n" +
                    "  <div style=\"margin-top: 4px; color: #64748b;\">Logged in as: <strong>" + activeUserName + " (" + activeUserRole + ")</strong> &bull; Database: ev_charging_db on port 3306</div>\n" +
                    "</footer>\n" +
                    "</body>\n" +
                    "</html>";
        }

        // =====================================================================
        // VIEW 1: DASHBOARD (WITH ROLE BANNER & CONDITIONAL ACTIONS)
        // =====================================================================
        private String renderDashboard(String flashMsg, String flashType) {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/"));

            if (!flashMsg.isEmpty()) {
                sb.append("<div class=\"alert alert-").append(flashType).append("\">").append(flashMsg).append("</div>");
            }

            // Role Status Banner
            sb.append("<div class=\"card\" style=\"border-left: 5px solid ").append(isAdmin() ? "#ef4444" : (isOperator() ? "#f59e0b" : "#10b981")).append(";\">\n");
            sb.append("  <div class=\"card-body\" style=\"display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;\">\n");
            sb.append("    <div>\n");
            sb.append("      <h2 style=\"font-size: 18px; color: var(--forest); display: flex; align-items: center; gap: 8px;\">\n");
            sb.append("        👤 Active Authenticated Account: <strong>").append(activeUserName).append("</strong>\n");
            sb.append("        <span class=\"role-badge\">").append(activeUserRole).append("</span>\n");
            sb.append("      </h2>\n");
            sb.append("      <p style=\"font-size: 13.5px; color: #475569; margin-top: 4px;\">\n");
            sb.append("        ").append(UserSession.getRoleDescription(activeUserRole)).append("\n");
            sb.append("      </p>\n");
            sb.append("    </div>\n");
            sb.append("    <div>\n");
            sb.append("      <a href=\"/roles\" class=\"btn btn-primary\" style=\"font-size: 13px;\">🛡️ Verify All Roles & Permissions</a>\n");
            sb.append("    </div>\n");
            sb.append("  </div>\n");
            sb.append("</div>\n");

            // Telemetry KPIs
            int stationCount = 0;
            int chargerCount = 0;
            int availableChargers = 0;
            int bookingCount = 0;
            try {
                conn c = new conn();
                ResultSet rs1 = c.statement.executeQuery("SELECT COUNT(*) FROM stations");
                if (rs1.next()) stationCount = rs1.getInt(1);

                ResultSet rs2 = c.statement.executeQuery("SELECT COUNT(*), SUM(CASE WHEN status='AVAILABLE' THEN 1 ELSE 0 END) FROM chargers");
                if (rs2.next()) {
                    chargerCount = rs2.getInt(1);
                    availableChargers = rs2.getInt(2);
                }

                ResultSet rs3 = c.statement.executeQuery("SELECT COUNT(*) FROM bookings WHERE booking_status = 'CONFIRMED'");
                if (rs3.next()) bookingCount = rs3.getInt(1);
            } catch (Exception ignored) {}

            sb.append("<div class=\"kpi-grid\">\n");
            sb.append("  <div class=\"kpi\"><div class=\"num\">").append(stationCount).append("</div><div class=\"lbl\">Total Stations</div></div>\n");
            sb.append("  <div class=\"kpi\" style=\"border-left-color: #10b981;\"><div class=\"num\">").append(availableChargers).append(" / ").append(chargerCount).append("</div><div class=\"lbl\">Available Charger Bays</div></div>\n");
            sb.append("  <div class=\"kpi\" style=\"border-left-color: #6366f1;\"><div class=\"num\">").append(bookingCount).append("</div><div class=\"lbl\">Active Slot Bookings</div></div>\n");
            sb.append("  <div class=\"kpi\" style=\"border-left-color: #f59e0b;\"><div class=\"num\">").append(activeUserRole).append("</div><div class=\"lbl\">Your Security Privilege</div></div>\n");
            sb.append("</div>\n");

            // RBAC Controlled Action Grid
            sb.append("<div class=\"card\">\n");
            sb.append("  <div class=\"card-header\"><h2>🚀 RBAC Operations for [").append(activeUserRole).append("]</h2></div>\n");
            sb.append("  <div class=\"card-body\" style=\"display: flex; gap: 12px; flex-wrap: wrap;\">\n");
            sb.append("    <a href=\"/stations\" class=\"btn btn-primary\">📍 View Stations Catalog</a>\n");
            sb.append("    <a href=\"/book\" class=\"btn btn-dark\">📅 Reserve Charging Slot</a>\n");

            if (canAddStation()) {
                sb.append("    <a href=\"/add-station\" class=\"btn btn-secondary\">➕ Add Station</a>\n");
            } else {
                sb.append("    <span class=\"btn btn-disabled\" title=\"Regular users cannot add charging stations\">🔒 Add Station (Admin/Operator)</span>\n");
            }

            if (canUpdateCharger()) {
                sb.append("    <a href=\"/update-charger\" class=\"btn btn-secondary\">⚙️ Update Charger Status</a>\n");
            } else {
                sb.append("    <span class=\"btn btn-disabled\" title=\"Regular users cannot modify charger telemetry\">🔒 Update Charger (Admin/Operator)</span>\n");
            }

            if (canRemoveStation()) {
                sb.append("    <a href=\"/remove-station\" class=\"btn btn-danger\">🗑️ Decommission Station</a>\n");
            } else {
                sb.append("    <span class=\"btn btn-disabled\" title=\"Decommissioning requires ADMIN role\">🔒 Decommission Station (Admin Only)</span>\n");
            }

            if (canAccessDbmsConsole()) {
                sb.append("    <a href=\"/dbms\" class=\"btn btn-secondary\">💾 Direct SQL Console</a>\n");
            } else {
                sb.append("    <span class=\"btn btn-disabled\" title=\"SQL Console requires ADMIN role\">🔒 Direct SQL Console (Admin Only)</span>\n");
            }

            sb.append("  </div>\n");
            sb.append("</div>\n");

            // Recent Bookings (filtered if USER role)
            sb.append("<div class=\"card\">\n");
            sb.append("  <div class=\"card-header\"><h2>📋 Bookings in MySQL (");
            if (isUser()) {
                sb.append("Filtered for You: ").append(activeUserName);
            } else {
                sb.append("System Wide View: ").append(activeUserRole);
            }
            sb.append(")</h2></div>\n");
            sb.append("  <div class=\"card-body\" style=\"padding: 0; overflow-x: auto;\">\n");
            sb.append("    <table>\n");
            sb.append("      <thead><tr><th>Booking ID</th><th>User</th><th>Station</th><th>Bay #</th><th>Start Window</th><th>End Window</th><th>Status</th><th>Notes</th></tr></thead>\n");
            sb.append("      <tbody>\n");

            try {
                conn c = new conn();
                String q = "SELECT b.booking_id, u.name, s.station_name, c.charger_id, b.start_time, b.end_time, b.booking_status, b.notes " +
                        "FROM bookings b " +
                        "JOIN users u ON b.user_id = u.user_id " +
                        "JOIN chargers c ON b.charger_id = c.charger_id " +
                        "JOIN stations s ON c.station_id = s.station_id ";

                if (isUser()) {
                    q += "WHERE b.user_id = " + activeUserId + " ";
                }
                q += "ORDER BY b.booking_id DESC LIMIT 8";

                ResultSet rs = c.statement.executeQuery(q);
                boolean hasData = false;
                while (rs.next()) {
                    hasData = true;
                    sb.append("<tr>");
                    sb.append("<td><strong>#").append(rs.getInt("booking_id")).append("</strong></td>");
                    sb.append("<td>").append(rs.getString("name")).append("</td>");
                    sb.append("<td>").append(rs.getString("station_name")).append("</td>");
                    sb.append("<td>Bay ").append(rs.getInt("charger_id")).append("</td>");
                    sb.append("<td>").append(rs.getString("start_time")).append("</td>");
                    sb.append("<td>").append(rs.getString("end_time")).append("</td>");
                    sb.append("<td><span class=\"badge-status status-").append(rs.getString("booking_status")).append("\">").append(rs.getString("booking_status")).append("</span></td>");
                    sb.append("<td style=\"color: #64748b;\">").append(rs.getString("notes") == null ? "-" : rs.getString("notes")).append("</td>");
                    sb.append("</tr>");
                }
                if (!hasData) {
                    sb.append("<tr><td colspan=\"8\" style=\"text-align: center; color: #94a3b8; padding: 20px;\">No reservations found.</td></tr>");
                }
            } catch (Exception ex) {
                sb.append("<tr><td colspan=\"8\" style=\"color: red;\">Query Error: ").append(ex.getMessage()).append("</td></tr>");
            }

            sb.append("      </tbody>\n");
            sb.append("    </table>\n");
            sb.append("  </div>\n");
            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 2: VIEW STATIONS
        // =====================================================================
        private String renderStations(Map<String, String> params, String flashMsg, String flashType) {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/stations"));

            if (!flashMsg.isEmpty()) {
                sb.append("<div class=\"alert alert-").append(flashType).append("\">").append(flashMsg).append("</div>");
            }

            String searchCity = params.getOrDefault("city", "").trim();

            sb.append("<div class=\"card\">\n");
            sb.append("  <div class=\"card-header\">\n");
            sb.append("    <h2>📍 Stations & Charger Bays Catalog (SQL JOIN View)</h2>\n");
            sb.append("    <form method=\"GET\" action=\"/stations\" style=\"display: flex; gap: 8px; align-items: center;\">\n");
            sb.append("      <input type=\"text\" name=\"city\" value=\"").append(searchCity).append("\" placeholder=\"Filter by City\" class=\"form-control\" style=\"width: 200px; padding: 6px 10px; font-size: 13px;\" />\n");
            sb.append("      <button type=\"submit\" class=\"btn btn-primary\" style=\"padding: 6px 14px; font-size: 13px;\">Search</button>\n");
            if (!searchCity.isEmpty()) {
                sb.append("      <a href=\"/stations\" class=\"btn btn-secondary\" style=\"padding: 6px 12px; font-size: 13px;\">Clear</a>\n");
            }
            sb.append("      <a href=\"/print-report").append(!searchCity.isEmpty() ? "?city=" + searchCity : "").append("\" class=\"btn btn-dark\" style=\"padding: 6px 14px; font-size: 13px;\">🖨️ Print / Official Report</a>\n");
            sb.append("      <a href=\"/export-stations-csv").append(!searchCity.isEmpty() ? "?city=" + searchCity : "").append("\" class=\"btn btn-secondary\" style=\"padding: 6px 14px; font-size: 13px;\">📥 Export CSV</a>\n");
            sb.append("    </form>\n");
            sb.append("  </div>\n");

            sb.append("  <div class=\"card-body\" style=\"padding: 0; overflow-x: auto;\">\n");
            sb.append("    <table>\n");
            sb.append("      <thead><tr><th>Station ID</th><th>Station Name</th><th>City</th><th>Hours</th><th>Bay ID</th><th>Connector</th><th>Power</th><th>Tariff</th><th>Status</th><th>Actions</th></tr></thead>\n");
            sb.append("      <tbody>\n");

            try {
                conn c = new conn();
                String query = "SELECT s.station_id, s.station_name, s.city, s.opening_time, s.closing_time, " +
                        "c.charger_id, c.connector_type, c.power_kw, c.price_per_kwh, c.status " +
                        "FROM stations s " +
                        "LEFT JOIN chargers c ON s.station_id = c.station_id ";

                if (!searchCity.isEmpty()) {
                    query += "WHERE s.city LIKE '%" + searchCity.replace("'", "''") + "%' ";
                }
                query += "ORDER BY s.station_id ASC, c.charger_id ASC";

                ResultSet rs = c.statement.executeQuery(query);
                boolean found = false;
                while (rs.next()) {
                    found = true;
                    int stId = rs.getInt("station_id");
                    int chId = rs.getInt("charger_id");
                    String status = rs.getString("status");
                    if (status == null) status = "N/A";

                    sb.append("<tr>");
                    sb.append("<td><strong>#").append(stId).append("</strong></td>");
                    sb.append("<td><strong>").append(rs.getString("station_name")).append("</strong></td>");
                    sb.append("<td>").append(rs.getString("city")).append("</td>");
                    sb.append("<td>").append(rs.getString("opening_time")).append(" - ").append(rs.getString("closing_time")).append("</td>");
                    sb.append("<td>").append(chId > 0 ? "Bay " + chId : "-").append("</td>");
                    sb.append("<td>").append(rs.getString("connector_type") == null ? "-" : rs.getString("connector_type")).append("</td>");
                    sb.append("<td>").append(rs.getDouble("power_kw") > 0 ? rs.getDouble("power_kw") + " kW" : "-").append("</td>");
                    sb.append("<td>").append(rs.getDouble("price_per_kwh") > 0 ? "Rs." + rs.getDouble("price_per_kwh") + "/kWh" : "-").append("</td>");
                    sb.append("<td><span class=\"badge-status status-").append(status).append("\">").append(status).append("</span></td>");
                    sb.append("<td>");
                    if (chId > 0) {
                        sb.append("<a href=\"/book?charger_id=").append(chId).append("\" class=\"btn btn-primary\" style=\"padding: 4px 8px; font-size: 11px;\">Book</a> ");
                        if (canUpdateCharger()) {
                            sb.append("<a href=\"/update-charger?charger_id=").append(chId).append("\" class=\"btn btn-secondary\" style=\"padding: 4px 8px; font-size: 11px;\">Edit</a>");
                        }
                    }
                    sb.append("</td>");
                    sb.append("</tr>");
                }
                if (!found) {
                    sb.append("<tr><td colspan=\"10\" style=\"text-align: center; padding: 24px; color: #94a3b8;\">No station records matched search query.</td></tr>");
                }
            } catch (Exception ex) {
                sb.append("<tr><td colspan=\"10\" style=\"color: red;\">SQL Error: ").append(ex.getMessage()).append("</td></tr>");
            }

            sb.append("      </tbody>\n");
            sb.append("    </table>\n");
            sb.append("  </div>\n");
            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 3: RESERVE CHARGING SLOT
        // =====================================================================
        private String renderBookSlot(Map<String, String> params, String flashMsg, String flashType) {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/book"));

            if (!flashMsg.isEmpty()) {
                sb.append("<div class=\"alert alert-").append(flashType).append("\">").append(flashMsg).append("</div>");
            }

            int preselectedCharger = 0;
            try {
                preselectedCharger = Integer.parseInt(params.getOrDefault("charger_id", "0"));
            } catch (Exception ignored) {}

            sb.append("<div style=\"display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;\">\n");

            // Left: Booking Form
            sb.append("  <div class=\"card\">\n");
            sb.append("    <div class=\"card-header\"><h2>📅 Reserve EV Charging Slot (ACID Double-Booking Guard)</h2></div>\n");
            sb.append("    <div class=\"card-body\">\n");
            sb.append("      <form method=\"POST\" action=\"/book-slot-action\">\n");

            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>Booking User Account:</label>\n");
            if (isUser()) {
                sb.append("          <input type=\"text\" class=\"form-control\" value=\"").append(activeUserName).append(" (User #").append(activeUserId).append(" - ").append(activeUserEmail).append(")\" disabled />\n");
                sb.append("          <input type=\"hidden\" name=\"user_id\" value=\"").append(activeUserId).append("\" />\n");
            } else {
                sb.append("          <select name=\"user_id\" class=\"form-control\">\n");
                try {
                    conn c = new conn();
                    ResultSet rs = c.statement.executeQuery("SELECT user_id, name, email, role FROM users ORDER BY user_id ASC");
                    while (rs.next()) {
                        int uid = rs.getInt("user_id");
                        String sel = (uid == activeUserId) ? "selected" : "";
                        sb.append("<option value=\"").append(uid).append("\" ").append(sel).append(">")
                                .append(uid).append(" - ")
                                .append(rs.getString("name")).append(" (")
                                .append(rs.getString("role")).append(" - ")
                                .append(rs.getString("email")).append(")</option>\n");
                    }
                } catch (Exception ignored) {}
                sb.append("          </select>\n");
            }
            sb.append("        </div>\n");

            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>Select Available Charger Bay:</label>\n");
            sb.append("          <select name=\"charger_id\" class=\"form-control\">\n");
            try {
                conn c = new conn();
                ResultSet rs = c.statement.executeQuery("SELECT c.charger_id, s.station_name, s.city, c.connector_type, c.power_kw, c.price_per_kwh, c.status " +
                        "FROM chargers c JOIN stations s ON c.station_id = s.station_id " +
                        "ORDER BY c.charger_id ASC");
                while (rs.next()) {
                    int id = rs.getInt("charger_id");
                    String sel = (id == preselectedCharger) ? "selected" : "";
                    sb.append("<option value=\"").append(id).append("\" ").append(sel).append(">")
                            .append("Bay #").append(id).append(" &bull; ")
                            .append(rs.getString("station_name")).append(" (").append(rs.getString("city")).append(") - ")
                            .append(rs.getString("connector_type")).append(" [").append(rs.getDouble("power_kw")).append(" kW] (")
                            .append(rs.getString("status")).append(")</option>\n");
                }
            } catch (Exception ignored) {}
            sb.append("          </select>\n");
            sb.append("        </div>\n");

            sb.append("        <div class=\"form-row\">\n");
            sb.append("          <div class=\"form-group\">\n");
            sb.append("            <label>Reservation Date:</label>\n");
            sb.append("            <input type=\"date\" name=\"date\" value=\"2026-11-04\" class=\"form-control\" required />\n");
            sb.append("          </div>\n");
            sb.append("          <div class=\"form-group\">\n");
            sb.append("            <label>Start Time (HH:mm:ss):</label>\n");
            sb.append("            <input type=\"text\" name=\"start_time\" value=\"14:00:00\" class=\"form-control\" required />\n");
            sb.append("          </div>\n");
            sb.append("        </div>\n");

            sb.append("        <div class=\"form-row\">\n");
            sb.append("          <div class=\"form-group\">\n");
            sb.append("            <label>End Time (HH:mm:ss):</label>\n");
            sb.append("            <input type=\"text\" name=\"end_time\" value=\"15:30:00\" class=\"form-control\" required />\n");
            sb.append("          </div>\n");
            sb.append("          <div class=\"form-group\">\n");
            sb.append("            <label>Vehicle Notes / Target SoC:</label>\n");
            sb.append("            <input type=\"text\" name=\"notes\" value=\"Tata Nexon EV &bull; Target 80% SoC\" class=\"form-control\" />\n");
            sb.append("          </div>\n");
            sb.append("        </div>\n");

            sb.append("        <div style=\"margin-top: 10px; display: flex; gap: 10px;\">\n");
            sb.append("          <button type=\"submit\" class=\"btn btn-primary\">Confirm Reservation (ACID Guard)</button>\n");
            sb.append("          <a href=\"/\" class=\"btn btn-secondary\">Cancel</a>\n");
            sb.append("        </div>\n");
            sb.append("      </form>\n");
            sb.append("    </div>\n");
            sb.append("  </div>\n");

            // Right: Explanation
            sb.append("  <div>\n");
            sb.append("    <div class=\"card\">\n");
            sb.append("      <div class=\"card-header\"><h2>🔒 ACID Overlap Guard Query</h2></div>\n");
            sb.append("      <div class=\"card-body\">\n");
            sb.append("        <p style=\"font-size: 13.5px; line-height: 1.6; color: #475569; margin-bottom: 12px;\">\n");
            sb.append("          Executed by all authenticated roles (USER, OPERATOR, ADMIN). Before inserting, checks if the bay is already occupied:\n");
            sb.append("        </p>\n");
            sb.append("        <div class=\"code-box\">\n");
            sb.append("SELECT booking_id, start_time, end_time<br/>\n");
            sb.append("FROM bookings<br/>\n");
            sb.append("WHERE charger_id = ?<br/>\n");
            sb.append("&nbsp;&nbsp;AND booking_status = 'CONFIRMED'<br/>\n");
            sb.append("&nbsp;&nbsp;AND (start_time &lt; ? AND end_time &gt; ?)<br/>\n");
            sb.append("LIMIT 1;\n");
            sb.append("        </div>\n");
            sb.append("      </div>\n");
            sb.append("    </div>\n");
            sb.append("  </div>\n");

            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 4: ADD CHARGING STATION (RBAC GUARDED)
        // =====================================================================
        private String renderAddStation(String flashMsg, String flashType) {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/add-station"));

            if (!flashMsg.isEmpty()) {
                sb.append("<div class=\"alert alert-").append(flashType).append("\">").append(flashMsg).append("</div>");
            }

            // If user is regular USER, show rejection card
            if (!canAddStation()) {
                sb.append("<div class=\"card\" style=\"max-width: 700px; margin: 40px auto; border-left: 5px solid #ef4444;\">\n");
                sb.append("  <div class=\"card-header\"><h2 style=\"color: #b91c1c;\">🚫 Access Denied - 403 Forbidden</h2></div>\n");
                sb.append("  <div class=\"card-body\">\n");
                sb.append("    <p style=\"font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 8px;\">\n");
                sb.append("      Role [").append(activeUserRole).append("] is not authorized to add charging stations.\n");
                sb.append("    </p>\n");
                sb.append("    <p style=\"font-size: 13.5px; color: #475569; line-height: 1.6; margin-bottom: 20px;\">\n");
                sb.append("      In the relational database schema, infrastructure creation (<code>INSERT INTO stations</code>) is restricted to <strong>ADMIN</strong> and <strong>OPERATOR</strong> roles. Regular customers (USER) only hold consumer privileges (viewing stations and booking slots).\n");
                sb.append("    </p>\n");
                sb.append("    <div style=\"display: flex; gap: 12px; align-items: center;\">\n");
                sb.append("      <a href=\"/switch-user?switch_user_id=1&redirect=/add-station\" class=\"btn btn-primary\">Switch to Admin (Alex Vance)</a>\n");
                sb.append("      <a href=\"/switch-user?switch_user_id=2&redirect=/add-station\" class=\"btn btn-secondary\">Switch to Operator (Maya Lin)</a>\n");
                sb.append("      <a href=\"/\" class=\"btn btn-dark\">Back to Dashboard</a>\n");
                sb.append("    </div>\n");
                sb.append("  </div>\n");
                sb.append("</div>\n");
                sb.append(getFooter());
                return sb.toString();
            }

            // Permitted for ADMIN and OPERATOR
            sb.append("<div class=\"card\" style=\"max-width: 800px; margin: 0 auto;\">\n");
            sb.append("  <div class=\"card-header\">\n");
            sb.append("    <h2>➕ Add New Charging Station (INSERT INTO STATIONS)</h2>\n");
            sb.append("    <span class=\"role-badge\">Authorized as ").append(activeUserRole).append("</span>\n");
            sb.append("  </div>\n");
            sb.append("  <div class=\"card-body\">\n");
            sb.append("    <form method=\"POST\" action=\"/add-station-action\">\n");

            sb.append("      <div class=\"form-row\">\n");
            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>Station Name:</label>\n");
            sb.append("          <input type=\"text\" name=\"station_name\" value=\"Ozone EV PowerHub\" class=\"form-control\" required />\n");
            sb.append("        </div>\n");
            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>City:</label>\n");
            sb.append("          <input type=\"text\" name=\"city\" value=\"Coimbatore\" class=\"form-control\" required />\n");
            sb.append("        </div>\n");
            sb.append("      </div>\n");

            sb.append("      <div class=\"form-group\">\n");
            sb.append("        <label>Full Address / Location:</label>\n");
            sb.append("        <input type=\"text\" name=\"address\" value=\"Avinashi Road, Near Tech Park, Peelamedu\" class=\"form-control\" required />\n");
            sb.append("      </div>\n");

            sb.append("      <div class=\"form-row\">\n");
            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>Opening Time:</label>\n");
            sb.append("          <input type=\"text\" name=\"opening_time\" value=\"05:00\" class=\"form-control\" required />\n");
            sb.append("        </div>\n");
            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>Closing Time:</label>\n");
            sb.append("          <input type=\"text\" name=\"closing_time\" value=\"23:59\" class=\"form-control\" required />\n");
            sb.append("        </div>\n");
            sb.append("      </div>\n");

            sb.append("      <div class=\"form-row\">\n");
            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>GPS Latitude:</label>\n");
            sb.append("          <input type=\"text\" name=\"latitude\" value=\"11.0168\" class=\"form-control\" required />\n");
            sb.append("        </div>\n");
            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>GPS Longitude:</label>\n");
            sb.append("          <input type=\"text\" name=\"longitude\" value=\"76.9558\" class=\"form-control\" required />\n");
            sb.append("        </div>\n");
            sb.append("      </div>\n");

            sb.append("      <div class=\"form-group\">\n");
            sb.append("        <label>Assigned Operator (Foreign Key: users.user_id):</label>\n");
            if (isOperator()) {
                sb.append("        <input type=\"text\" class=\"form-control\" value=\"").append(activeUserName).append(" (Operator ID #").append(activeUserId).append(" - Locked to your account)\" disabled />\n");
                sb.append("        <input type=\"hidden\" name=\"operator_id\" value=\"").append(activeUserId).append("\" />\n");
            } else {
                sb.append("        <select name=\"operator_id\" class=\"form-control\">\n");
                try {
                    conn c = new conn();
                    ResultSet rs = c.statement.executeQuery("SELECT user_id, name, email, role FROM users WHERE role IN ('OPERATOR', 'ADMIN')");
                    while (rs.next()) {
                        sb.append("<option value=\"").append(rs.getInt("user_id")).append("\">")
                                .append(rs.getInt("user_id")).append(" - ")
                                .append(rs.getString("name")).append(" (")
                                .append(rs.getString("role")).append(" - ")
                                .append(rs.getString("email")).append(")</option>\n");
                    }
                } catch (Exception ignored) {}
                sb.append("        </select>\n");
            }
            sb.append("      </div>\n");

            sb.append("      <div style=\"margin-top: 14px; display: flex; gap: 10px;\">\n");
            sb.append("        <button type=\"submit\" class=\"btn btn-primary\">Save Station to Database</button>\n");
            sb.append("        <a href=\"/stations\" class=\"btn btn-secondary\">Cancel</a>\n");
            sb.append("      </div>\n");

            sb.append("    </form>\n");
            sb.append("  </div>\n");
            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 5: UPDATE CHARGER TELEMETRY (RBAC GUARDED)
        // =====================================================================
        private String renderUpdateCharger(String flashMsg, String flashType) {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/update-charger"));

            if (!flashMsg.isEmpty()) {
                sb.append("<div class=\"alert alert-").append(flashType).append("\">").append(flashMsg).append("</div>");
            }

            if (!canUpdateCharger()) {
                sb.append("<div class=\"card\" style=\"max-width: 700px; margin: 40px auto; border-left: 5px solid #ef4444;\">\n");
                sb.append("  <div class=\"card-header\"><h2 style=\"color: #b91c1c;\">🚫 Access Denied - 403 Forbidden</h2></div>\n");
                sb.append("  <div class=\"card-body\">\n");
                sb.append("    <p style=\"font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 8px;\">\n");
                sb.append("      Role [").append(activeUserRole).append("] is not authorized to update charger telemetry.\n");
                sb.append("    </p>\n");
                sb.append("    <p style=\"font-size: 13.5px; color: #475569; line-height: 1.6; margin-bottom: 20px;\">\n");
                sb.append("      Hardware operational states (<code>AVAILABLE</code>, <code>OCCUPIED</code>, <code>MAINTENANCE</code>), power outputs, and billing tariffs can only be modified by <strong>OPERATOR</strong> or <strong>ADMIN</strong> roles.\n");
                sb.append("    </p>\n");
                sb.append("    <div style=\"display: flex; gap: 12px; align-items: center;\">\n");
                sb.append("      <a href=\"/switch-user?switch_user_id=2&redirect=/update-charger\" class=\"btn btn-primary\">Switch to Operator (Maya Lin)</a>\n");
                sb.append("      <a href=\"/switch-user?switch_user_id=1&redirect=/update-charger\" class=\"btn btn-secondary\">Switch to Admin (Alex Vance)</a>\n");
                sb.append("      <a href=\"/\" class=\"btn btn-dark\">Back to Dashboard</a>\n");
                sb.append("    </div>\n");
                sb.append("  </div>\n");
                sb.append("</div>\n");
                sb.append(getFooter());
                return sb.toString();
            }

            sb.append("<div class=\"card\" style=\"max-width: 700px; margin: 0 auto;\">\n");
            sb.append("  <div class=\"card-header\">\n");
            sb.append("    <h2>⚙️ Update Charger Bay Telemetry Status (UPDATE CHARGERS)</h2>\n");
            sb.append("    <span class=\"role-badge\">Authorized as ").append(activeUserRole).append("</span>\n");
            sb.append("  </div>\n");
            sb.append("  <div class=\"card-body\">\n");
            sb.append("    <form method=\"POST\" action=\"/update-charger-action\">\n");

            sb.append("      <div class=\"form-group\">\n");
            sb.append("        <label>Select Charger Bay to Update:</label>\n");
            sb.append("        <select name=\"charger_id\" class=\"form-control\">\n");
            try {
                conn c = new conn();
                ResultSet rs = c.statement.executeQuery("SELECT c.charger_id, s.station_name, c.connector_type, c.status, c.power_kw FROM chargers c JOIN stations s ON c.station_id = s.station_id");
                while (rs.next()) {
                    sb.append("<option value=\"").append(rs.getInt("charger_id")).append("\">")
                            .append("Bay #").append(rs.getInt("charger_id")).append(" - ")
                            .append(rs.getString("station_name")).append(" (")
                            .append(rs.getString("connector_type")).append(", Current: ")
                            .append(rs.getString("status")).append(")</option>\n");
                }
            } catch (Exception ignored) {}
            sb.append("        </select>\n");
            sb.append("      </div>\n");

            sb.append("      <div class=\"form-group\">\n");
            sb.append("        <label>New Operational Status (ENUM):</label>\n");
            sb.append("        <select name=\"status\" class=\"form-control\">\n");
            sb.append("          <option value=\"AVAILABLE\">AVAILABLE (Free to book)</option>\n");
            sb.append("          <option value=\"OCCUPIED\">OCCUPIED (Active charging session)</option>\n");
            sb.append("          <option value=\"MAINTENANCE\">MAINTENANCE (Offline for servicing)</option>\n");
            sb.append("        </select>\n");
            sb.append("      </div>\n");

            sb.append("      <div class=\"form-row\">\n");
            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>Power Output Rating (kW):</label>\n");
            sb.append("          <input type=\"number\" step=\"0.1\" name=\"power_kw\" value=\"60.0\" class=\"form-control\" required />\n");
            sb.append("        </div>\n");
            sb.append("        <div class=\"form-group\">\n");
            sb.append("          <label>Tariff (Rs. per kWh):</label>\n");
            sb.append("          <input type=\"number\" step=\"0.01\" name=\"price_per_kwh\" value=\"19.50\" class=\"form-control\" required />\n");
            sb.append("        </div>\n");
            sb.append("      </div>\n");

            sb.append("      <div style=\"margin-top: 14px; display: flex; gap: 10px;\">\n");
            sb.append("        <button type=\"submit\" class=\"btn btn-primary\">Commit Telemetry Update</button>\n");
            sb.append("        <a href=\"/stations\" class=\"btn btn-secondary\">Cancel</a>\n");
            sb.append("      </div>\n");

            sb.append("    </form>\n");
            sb.append("  </div>\n");
            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 6: DECOMMISSION / REMOVE STATION (ADMIN ONLY)
        // =====================================================================
        private String renderRemoveStation(String flashMsg, String flashType) {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/remove-station"));

            if (!flashMsg.isEmpty()) {
                sb.append("<div class=\"alert alert-").append(flashType).append("\">").append(flashMsg).append("</div>");
            }

            if (!canRemoveStation()) {
                sb.append("<div class=\"card\" style=\"max-width: 700px; margin: 40px auto; border-left: 5px solid #ef4444;\">\n");
                sb.append("  <div class=\"card-header\"><h2 style=\"color: #b91c1c;\">🚫 Access Denied - Admin Only</h2></div>\n");
                sb.append("  <div class=\"card-body\">\n");
                sb.append("    <p style=\"font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 8px;\">\n");
                sb.append("      Role [").append(activeUserRole).append("] is not authorized to decommission stations.\n");
                sb.append("    </p>\n");
                sb.append("    <p style=\"font-size: 13.5px; color: #475569; line-height: 1.6; margin-bottom: 20px;\">\n");
                sb.append("      Removing a station triggers a cascade delete across all dependent chargers and bookings. Only <strong>ADMIN</strong> accounts hold destructive database privileges.\n");
                sb.append("    </p>\n");
                sb.append("    <div style=\"display: flex; gap: 12px; align-items: center;\">\n");
                sb.append("      <a href=\"/switch-user?switch_user_id=1&redirect=/remove-station\" class=\"btn btn-danger\">Switch to Admin (Alex Vance)</a>\n");
                sb.append("      <a href=\"/\" class=\"btn btn-dark\">Back to Dashboard</a>\n");
                sb.append("    </div>\n");
                sb.append("  </div>\n");
                sb.append("</div>\n");
                sb.append(getFooter());
                return sb.toString();
            }

            sb.append("<div class=\"card\" style=\"max-width: 700px; margin: 0 auto;\">\n");
            sb.append("  <div class=\"card-header\">\n");
            sb.append("    <h2 style=\"color: #991b1b;\">🗑️ Decommission Station (CASCADE DELETE)</h2>\n");
            sb.append("    <span class=\"role-badge\" style=\"border-color: #dc2626; color: #dc2626;\">ADMIN SUPERUSER PRIVILEGE</span>\n");
            sb.append("  </div>\n");
            sb.append("  <div class=\"card-body\">\n");
            sb.append("    <p style=\"font-size: 13.5px; color: #64748b; margin-bottom: 16px;\">\n");
            sb.append("      Demonstrates Foreign Key Referential Integrity and <strong>CASCADE DELETE</strong> in relational databases. Removing a station automatically removes its associated chargers in accordance with the schema constraints.\n");
            sb.append("    </p>\n");
            sb.append("    <form method=\"POST\" action=\"/remove-station-action\" onsubmit=\"return confirm('Confirm permanent deletion of this station and all connected bays?');\">\n");

            sb.append("      <div class=\"form-group\">\n");
            sb.append("        <label>Select Station to Remove:</label>\n");
            sb.append("        <select name=\"station_id\" class=\"form-control\">\n");
            try {
                conn c = new conn();
                ResultSet rs = c.statement.executeQuery("SELECT s.station_id, s.station_name, s.city, COUNT(c.charger_id) as bay_count " +
                        "FROM stations s LEFT JOIN chargers c ON s.station_id = c.station_id " +
                        "GROUP BY s.station_id ORDER BY s.station_id ASC");
                while (rs.next()) {
                    sb.append("<option value=\"").append(rs.getInt("station_id")).append("\">")
                            .append("Station #").append(rs.getInt("station_id")).append(" - ")
                            .append(rs.getString("station_name")).append(" (")
                            .append(rs.getString("city")).append(", ")
                            .append(rs.getInt("bay_count")).append(" bays)</option>\n");
                }
            } catch (Exception ignored) {}
            sb.append("        </select>\n");
            sb.append("      </div>\n");

            sb.append("      <div style=\"margin-top: 14px; display: flex; gap: 10px;\">\n");
            sb.append("        <button type=\"submit\" class=\"btn btn-danger\">Delete Station from MySQL</button>\n");
            sb.append("        <a href=\"/stations\" class=\"btn btn-secondary\">Cancel</a>\n");
            sb.append("      </div>\n");

            sb.append("    </form>\n");
            sb.append("  </div>\n");
            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 7: ROLE & PERMISSION VERIFICATION MATRIX (/roles)
        // =====================================================================
        private String renderRoleVerificationMatrix(String flashMsg, String flashType) {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/roles"));

            if (!flashMsg.isEmpty()) {
                sb.append("<div class=\"alert alert-").append(flashType).append("\">").append(flashMsg).append("</div>");
            }

            sb.append("<div class=\"card\">\n");
            sb.append("  <div class=\"card-header\"><h2>🛡️ Role-Based Access Control (RBAC) Specification & Live Verification</h2></div>\n");
            sb.append("  <div class=\"card-body\">\n");
            sb.append("    <p style=\"font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;\">\n");
            sb.append("      In Database Management Systems, <strong>Role-Based Access Control (RBAC)</strong> ensures principle of least privilege. The table below outlines each operation, its corresponding SQL execution command, and the authorized roles enforced both at the Java application layer and the MySQL relational database layer.\n");
            sb.append("    </p>\n");

            sb.append("    <div style=\"overflow-x: auto;\">\n");
            sb.append("      <table>\n");
            sb.append("        <thead>\n");
            sb.append("          <tr>\n");
            sb.append("            <th>Application Module</th>\n");
            sb.append("            <th>DBMS SQL Statement</th>\n");
            sb.append("            <th>USER (Driver)</th>\n");
            sb.append("            <th>OPERATOR (Station Mgr)</th>\n");
            sb.append("            <th>ADMIN (Super Admin)</th>\n");
            sb.append("            <th>Current Session (").append(activeUserRole).append(")</th>\n");
            sb.append("          </tr>\n");
            sb.append("        </thead>\n");
            sb.append("        <tbody>\n");

            String[][] matrix = {
                {"View Stations & Chargers", "SELECT with JOIN", "✅ PERMITTED", "✅ PERMITTED", "✅ PERMITTED", "✅ ALLOWED"},
                {"Reserve Slot (Book Slot)", "INSERT INTO bookings + Overlap Check", "✅ PERMITTED", "✅ PERMITTED", "✅ PERMITTED", "✅ ALLOWED"},
                {"View My Bookings", "SELECT FROM bookings WHERE user_id", "✅ PERMITTED (Own)", "✅ PERMITTED (All)", "✅ PERMITTED (All)", "✅ ALLOWED"},
                {"Add New Charging Station", "INSERT INTO stations", "❌ DENIED (403)", "✅ PERMITTED (Assigned)", "✅ PERMITTED", canAddStation() ? "✅ ALLOWED" : "<strong style='color:#dc2626;'>❌ BLOCKED</strong>"},
                {"Update Charger Telemetry", "UPDATE chargers SET status=...", "❌ DENIED (403)", "✅ PERMITTED", "✅ PERMITTED", canUpdateCharger() ? "✅ ALLOWED" : "<strong style='color:#dc2626;'>❌ BLOCKED</strong>"},
                {"Decommission / Remove Station", "DELETE FROM stations (CASCADE)", "❌ DENIED (403)", "❌ DENIED (403)", "✅ PERMITTED", canRemoveStation() ? "✅ ALLOWED" : "<strong style='color:#dc2626;'>❌ BLOCKED</strong>"},
                {"Direct SQL Query Console", "Direct JDBC Statement Execution", "❌ DENIED (403)", "❌ DENIED (403)", "✅ PERMITTED", canAccessDbmsConsole() ? "✅ ALLOWED" : "<strong style='color:#dc2626;'>❌ BLOCKED</strong>"}
            };

            for (String[] row : matrix) {
                sb.append("<tr>");
                sb.append("<td><strong>").append(row[0]).append("</strong></td>");
                sb.append("<td><code>").append(row[1]).append("</code></td>");
                sb.append("<td style=\"color: ").append(row[2].contains("PERMITTED") ? "#16a34a" : "#dc2626").append(";\">").append(row[2]).append("</td>");
                sb.append("<td style=\"color: ").append(row[3].contains("PERMITTED") ? "#16a34a" : "#dc2626").append(";\">").append(row[3]).append("</td>");
                sb.append("<td style=\"color: ").append(row[4].contains("PERMITTED") ? "#16a34a" : "#dc2626").append(";\">").append(row[4]).append("</td>");
                sb.append("<td>").append(row[5]).append("</td>");
                sb.append("</tr>");
            }

            sb.append("        </tbody>\n");
            sb.append("      </table>\n");
            sb.append("    </div>\n");

            // Instant Switch & Test Buttons
            sb.append("    <div style=\"margin-top: 24px; padding: 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;\">\n");
            sb.append("      <h3 style=\"font-size: 15px; font-weight: 700; color: #062817; margin-bottom: 10px;\">🧪 Test & Verify Roles in Real-Time:</h3>\n");
            sb.append("      <div style=\"display: flex; gap: 12px; flex-wrap: wrap;\">\n");
            sb.append("        <a href=\"/switch-user?switch_user_id=4&redirect=/roles\" class=\"btn btn-primary\" style=\"font-size: 13px;\">👤 Switch to USER (Elena Rostova)</a>\n");
            sb.append("        <a href=\"/switch-user?switch_user_id=2&redirect=/roles\" class=\"btn btn-secondary\" style=\"font-size: 13px;\">🔧 Switch to OPERATOR (Maya Lin)</a>\n");
            sb.append("        <a href=\"/switch-user?switch_user_id=1&redirect=/roles\" class=\"btn btn-dark\" style=\"font-size: 13px;\">🛡️ Switch to ADMIN (Alex Vance)</a>\n");
            sb.append("      </div>\n");
            sb.append("    </div>\n");

            sb.append("  </div>\n");
            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 8: DBMS CONSOLE (ADMIN ONLY)
        // =====================================================================
        private String renderDBMS(Map<String, String> params, String flashMsg, String flashType) {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/dbms"));

            if (!flashMsg.isEmpty()) {
                sb.append("<div class=\"alert alert-").append(flashType).append("\">").append(flashMsg).append("</div>");
            }

            if (!canAccessDbmsConsole()) {
                sb.append("<div class=\"card\" style=\"max-width: 700px; margin: 40px auto; border-left: 5px solid #ef4444;\">\n");
                sb.append("  <div class=\"card-header\"><h2 style=\"color: #b91c1c;\">🚫 Access Restricted - Admin Only</h2></div>\n");
                sb.append("  <div class=\"card-body\">\n");
                sb.append("    <p style=\"font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 8px;\">\n");
                sb.append("      Role [").append(activeUserRole).append("] cannot access the raw SQL query execution console.\n");
                sb.append("    </p>\n");
                sb.append("    <p style=\"font-size: 13.5px; color: #475569; line-height: 1.6; margin-bottom: 20px;\">\n");
                sb.append("      To protect database security, arbitrary SQL execution via JDBC is locked to <strong>ADMIN</strong> superusers.\n");
                sb.append("    </p>\n");
                sb.append("    <a href=\"/switch-user?switch_user_id=1&redirect=/dbms\" class=\"btn btn-primary\">Switch to Admin (Alex Vance)</a>\n");
                sb.append("  </div>\n");
                sb.append("</div>\n");
                sb.append(getFooter());
                return sb.toString();
            }

            String customSql = params.getOrDefault("sql", "SELECT s.station_name, s.city, COUNT(c.charger_id) as total_chargers, AVG(c.price_per_kwh) as avg_price FROM stations s JOIN chargers c ON s.station_id = c.station_id GROUP BY s.station_id");

            sb.append("<div class=\"card\">\n");
            sb.append("  <div class=\"card-header\"><h2>💾 Direct SQL Query Console (JDBC Statement Execution)</h2><span class=\"role-badge\">ADMIN SUPERUSER</span></div>\n");
            sb.append("  <div class=\"card-body\">\n");
            sb.append("    <form method=\"POST\" action=\"/dbms\">\n");
            sb.append("      <div class=\"form-group\">\n");
            sb.append("        <label>Enter SQL Query (SELECT statements):</label>\n");
            sb.append("        <textarea name=\"sql\" class=\"form-control\" rows=\"3\" style=\"font-family: monospace; font-size: 13.5px;\">").append(customSql).append("</textarea>\n");
            sb.append("      </div>\n");
            sb.append("      <button type=\"submit\" class=\"btn btn-primary\">Execute SQL Query via JDBC</button>\n");
            sb.append("    </form>\n");

            if (!customSql.trim().isEmpty()) {
                sb.append("<div style=\"margin-top: 20px;\">\n");
                sb.append("  <h3 style=\"font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 8px;\">Query Result Set:</h3>\n");
                try {
                    conn c = new conn();
                    ResultSet rs = c.statement.executeQuery(customSql);
                    ResultSetMetaData md = rs.getMetaData();
                    int cols = md.getColumnCount();

                    sb.append("<div style=\"overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 6px;\">\n");
                    sb.append("  <table>\n");
                    sb.append("    <thead><tr>");
                    for (int i = 1; i <= cols; i++) {
                        sb.append("<th>").append(md.getColumnLabel(i)).append("</th>");
                    }
                    sb.append("</tr></thead>\n");
                    sb.append("    <tbody>\n");

                    int rows = 0;
                    while (rs.next()) {
                        rows++;
                        sb.append("<tr>");
                        for (int i = 1; i <= cols; i++) {
                            sb.append("<td>").append(rs.getString(i) == null ? "NULL" : rs.getString(i)).append("</td>");
                        }
                        sb.append("</tr>");
                    }
                    if (rows == 0) {
                        sb.append("<tr><td colspan=\"").append(cols).append("\" style=\"text-align: center; color: #94a3b8; padding: 16px;\">Query executed successfully. 0 rows returned.</td></tr>");
                    }
                    sb.append("    </tbody>\n");
                    sb.append("  </table>\n");
                    sb.append("</div>\n");
                    sb.append("<div style=\"font-size: 12px; color: #64748b; margin-top: 6px;\">Rows returned: ").append(rows).append("</div>");

                } catch (Exception ex) {
                    sb.append("<div class=\"alert alert-error\" style=\"margin-top: 10px;\">SQL Error: ").append(ex.getMessage()).append("</div>");
                }
                sb.append("</div>\n");
            }

            sb.append("  </div>\n");
            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 9: SWING GUIDE
        // =====================================================================
        private String renderSwingGuide() {
            StringBuilder sb = new StringBuilder();
            sb.append(getHeader("/swing-guide"));

            sb.append("<div class=\"card\">\n");
            sb.append("  <div class=\"card-header\"><h2>🖥️ Academic Desktop Java Swing GUI Execution Instructions</h2></div>\n");
            sb.append("  <div class=\"card-body\">\n");
            sb.append("    <p style=\"font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;\">\n");
            sb.append("      This project contains complete, standalone <strong>Java Swing (.java)</strong> source files for local desktop execution with <strong>XAMPP MySQL / MariaDB</strong>.\n");
            sb.append("    </p>\n");

            sb.append("    <h3 style=\"font-size: 15px; font-weight: 700; color: #062817; margin-bottom: 8px;\">Step 1: Prerequisites</h3>\n");
            sb.append("    <ul style=\"margin-left: 20px; font-size: 13.5px; line-height: 1.8; color: #475569; margin-bottom: 16px;\">\n");
            sb.append("      <li>Install <strong>JDK 8, 11, 17, or 21</strong> (Oracle OpenJDK).</li>\n");
            sb.append("      <li>Install <strong>XAMPP</strong> (starts MySQL on port 3306 with default username <code>root</code> and blank password).</li>\n");
            sb.append("      <li>Run <code>schema.sql</code> and <code>seed.sql</code> inside phpMyAdmin (http://localhost/phpmyadmin).</li>\n");
            sb.append("    </ul>\n");

            sb.append("    <h3 style=\"font-size: 15px; font-weight: 700; color: #062817; margin-bottom: 8px;\">Step 2: Terminal Compilation & Run Commands</h3>\n");
            sb.append("    <div class=\"code-box\">\n");
            sb.append("# 1. Navigate to Java source directory<br/>\n");
            sb.append("cd ev-charging-station-availability-system/java_src<br/><br/>\n");
            sb.append("# 2. Compile all Java modules with MySQL Connector JAR<br/>\n");
            sb.append("javac -cp \".:mysql-connector-j-26.10.0.jar\" ev/charging/system/*.java<br/><br/>\n");
            sb.append("# 3. Run Splash Screen (Application Entry Point)<br/>\n");
            sb.append("java -cp \".:mysql-connector-j-26.10.0.jar\" ev.charging.system.Splash<br/><br/>\n");
            sb.append("# Or run Master Dashboard directly:<br/>\n");
            sb.append("java -cp \".:mysql-connector-j-26.10.0.jar\" ev.charging.system.Main_class\n");
            sb.append("    </div>\n");

            sb.append("  </div>\n");
            sb.append("</div>\n");

            sb.append(getFooter());
            return sb.toString();
        }

        // =====================================================================
        // VIEW 10: OFFICIAL PRINTABLE REPORT
        // =====================================================================
        private String renderPrintReport(Map<String, String> params) {
            String cityFilter = params.getOrDefault("city", "").trim();
            StringBuilder sb = new StringBuilder();
            String timestamp = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());

            sb.append("<!DOCTYPE html>\n")
              .append("<html lang=\"en\">\n")
              .append("<head>\n")
              .append("  <meta charset=\"UTF-8\" />\n")
              .append("  <title>Official EV Station Telemetry Report</title>\n")
              .append("  <style>\n")
              .append("    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }\n")
              .append("    body { background: #f1f5f9; color: #0f172a; padding: 24px; }\n")
              .append("    .toolbar { max-width: 1050px; margin: 0 auto 16px auto; display: flex; justify-content: space-between; align-items: center; background: #062817; color: white; padding: 12px 20px; border-radius: 6px; }\n")
              .append("    .btn { display: inline-flex; align-items: center; padding: 8px 16px; font-size: 13px; font-weight: 700; border-radius: 4px; border: none; cursor: pointer; text-decoration: none; }\n")
              .append("    .btn-print { background: #a3e635; color: #062817; }\n")
              .append("    .btn-csv { background: #059669; color: white; margin-left: 8px; }\n")
              .append("    .btn-back { background: #334155; color: white; }\n")
              .append("    .page { max-width: 1050px; margin: 0 auto; background: white; padding: 36px 40px; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }\n")
              .append("    .header { text-align: center; border-bottom: 2px solid #062817; padding-bottom: 16px; margin-bottom: 20px; }\n")
              .append("    .header h1 { font-size: 20px; font-weight: 800; color: #062817; text-transform: uppercase; letter-spacing: 0.5px; }\n")
              .append("    .header h2 { font-size: 14px; font-weight: 600; color: #475569; margin-top: 4px; }\n")
              .append("    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12.5px; color: #334155; background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 20px; }\n")
              .append("    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }\n")
              .append("    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }\n")
              .append("    th { background: #f1f5f9; font-weight: 700; text-transform: uppercase; color: #1e293b; font-size: 11px; }\n")
              .append("    .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }\n")
              .append("    .b-avail { background: #dcfce7; color: #166534; }\n")
              .append("    .b-occ { background: #fee2e2; color: #991b1b; }\n")
              .append("    .b-maint { background: #fef3c7; color: #92400e; }\n")
              .append("    .sign-box { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 20px; border-top: 1px dashed #94a3b8; font-size: 12px; color: #475569; }\n")
              .append("    @media print {\n")
              .append("      .no-print { display: none !important; }\n")
              .append("      body { background: white !important; padding: 0 !important; color: black !important; }\n")
              .append("      .page { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }\n")
              .append("      th { background: #e2e8f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n")
              .append("    }\n")
              .append("  </style>\n")
              .append("</head>\n")
              .append("<body>\n")
              .append("  <div class=\"toolbar no-print\">\n")
              .append("    <div><strong>🖨️ Official Printable Report View</strong> (Press Ctrl+P or use button)</div>\n")
              .append("    <div>\n")
              .append("      <button onclick=\"window.print()\" class=\"btn btn-print\">🖨️ Print / Save as PDF</button>\n")
              .append("      <a href=\"/export-stations-csv").append(!cityFilter.isEmpty() ? "?city=" + cityFilter : "").append("\" class=\"btn btn-csv\">📥 Download CSV</a>\n")
              .append("      <a href=\"/stations\" class=\"btn btn-back\" style=\"margin-left: 8px;\">⬅️ Back to Catalog</a>\n")
              .append("    </div>\n")
              .append("  </div>\n")
              .append("  <div class=\"page\">\n")
              .append("    <div class=\"header\">\n")
              .append("      <h1>Department of Information Technology &bull; Rajalakshmi Engineering College</h1>\n")
              .append("      <h2>Autonomous EV Infrastructure Telemetry & Charging Station Availability System</h2>\n")
              .append("      <div style=\"font-size: 11px; color: #64748b; margin-top: 6px;\">Relational Database Engine: MySQL 8.0 / MariaDB (Database: ev_charging_db)</div>\n")
              .append("    </div>\n")
              .append("    <div class=\"meta-grid\">\n")
              .append("      <div><strong>Document:</strong> Official Station Availability & Charger Telemetry Log</div>\n")
              .append("      <div><strong>Generation Timestamp:</strong> ").append(timestamp).append("</div>\n")
              .append("      <div><strong>Filter City Scope:</strong> ").append(cityFilter.isEmpty() ? "All Operational Cities" : cityFilter).append("</div>\n")
              .append("      <div><strong>Report Generated By:</strong> ").append(activeUserName).append(" (Role: ").append(activeUserRole).append(")</div>\n")
              .append("    </div>\n");

            // Data Table
            sb.append("    <table>\n")
              .append("      <thead>\n")
              .append("        <tr>\n")
              .append("          <th>Stn ID</th>\n")
              .append("          <th>Station Name</th>\n")
              .append("          <th>City</th>\n")
              .append("          <th>Hours</th>\n")
              .append("          <th>Bay ID</th>\n")
              .append("          <th>Connector Type</th>\n")
              .append("          <th>Power Rating</th>\n")
              .append("          <th>Tariff (INR)</th>\n")
              .append("          <th>Bay Status</th>\n")
              .append("        </tr>\n")
              .append("      </thead>\n")
              .append("      <tbody>\n");

            int rowCount = 0;
            int availableCount = 0;
            try {
                conn c = new conn();
                String query = "SELECT s.station_id, s.station_name, s.city, s.opening_time, s.closing_time, " +
                        "c.charger_id, c.connector_type, c.power_kw, c.price_per_kwh, c.status " +
                        "FROM stations s LEFT JOIN chargers c ON s.station_id = c.station_id ";
                if (!cityFilter.isEmpty()) {
                    query += "WHERE s.city LIKE '%" + cityFilter.replace("'", "''") + "%' ";
                }
                query += "ORDER BY s.station_id ASC, c.charger_id ASC";

                ResultSet rs = c.statement.executeQuery(query);
                while (rs.next()) {
                    rowCount++;
                    String status = rs.getString("status");
                    if ("AVAILABLE".equalsIgnoreCase(status)) availableCount++;
                    String bClass = "AVAILABLE".equalsIgnoreCase(status) ? "b-avail" : ("OCCUPIED".equalsIgnoreCase(status) ? "b-occ" : "b-maint");

                    sb.append("<tr>")
                      .append("<td>#").append(rs.getInt("station_id")).append("</td>")
                      .append("<td><strong>").append(rs.getString("station_name")).append("</strong></td>")
                      .append("<td>").append(rs.getString("city")).append("</td>")
                      .append("<td>").append(rs.getString("opening_time")).append(" - ").append(rs.getString("closing_time")).append("</td>")
                      .append("<td>Bay ").append(rs.getInt("charger_id")).append("</td>")
                      .append("<td>").append(rs.getString("connector_type") == null ? "-" : rs.getString("connector_type")).append("</td>")
                      .append("<td>").append(rs.getDouble("power_kw")).append(" kW</td>")
                      .append("<td>Rs. ").append(rs.getDouble("price_per_kwh")).append("/kWh</td>")
                      .append("<td><span class=\"badge ").append(bClass).append("\">").append(status == null ? "N/A" : status).append("</span></td>")
                      .append("</tr>\n");
                }
            } catch (Exception ex) {
                sb.append("<tr><td colspan=\"9\" style=\"color:red;\">Error loading report: ").append(ex.getMessage()).append("</td></tr>");
            }

            sb.append("      </tbody>\n")
              .append("    </table>\n")
              .append("    <div style=\"font-size: 12px; color: #475569; display: flex; justify-content: space-between; margin-bottom: 24px;\">\n")
              .append("      <div><strong>Total Records Rendered:</strong> ").append(rowCount).append(" bays</div>\n")
              .append("      <div><strong>Currently Available Bays:</strong> ").append(availableCount).append("</div>\n")
              .append("    </div>\n")
              .append("    <div class=\"sign-box\">\n")
              .append("      <div>Database Administrator: __________________________</div>\n")
              .append("      <div>Lab Evaluator / IT In-Charge: __________________________</div>\n")
              .append("      <div>Official Seal / Date: __________________________</div>\n")
              .append("    </div>\n")
              .append("  </div>\n")
              .append("</body>\n")
              .append("</html>");

            return sb.toString();
        }

        private void handleExportCsv(HttpExchange exchange, Map<String, String> params) throws IOException {
            String cityFilter = params.getOrDefault("city", "").trim();
            StringBuilder csv = new StringBuilder();
            csv.append("Station ID,Station Name,City,Opening Time,Closing Time,Bay ID,Connector Type,Power (kW),Tariff (Rs per kWh),Status\n");

            try {
                conn c = new conn();
                String query = "SELECT s.station_id, s.station_name, s.city, s.opening_time, s.closing_time, " +
                        "c.charger_id, c.connector_type, c.power_kw, c.price_per_kwh, c.status " +
                        "FROM stations s LEFT JOIN chargers c ON s.station_id = c.station_id ";
                if (!cityFilter.isEmpty()) {
                    query += "WHERE s.city LIKE '%" + cityFilter.replace("'", "''") + "%' ";
                }
                query += "ORDER BY s.station_id ASC, c.charger_id ASC";

                ResultSet rs = c.statement.executeQuery(query);
                while (rs.next()) {
                    csv.append(rs.getInt("station_id")).append(",")
                       .append("\"").append(rs.getString("station_name").replace("\"", "\"\"")).append("\",")
                       .append("\"").append(rs.getString("city").replace("\"", "\"\"")).append("\",")
                       .append(rs.getString("opening_time")).append(",")
                       .append(rs.getString("closing_time")).append(",")
                       .append(rs.getInt("charger_id")).append(",")
                       .append(rs.getString("connector_type") == null ? "" : rs.getString("connector_type")).append(",")
                       .append(rs.getDouble("power_kw")).append(",")
                       .append(rs.getDouble("price_per_kwh")).append(",")
                       .append(rs.getString("status") == null ? "" : rs.getString("status")).append("\n");
                }
            } catch (Exception ex) {
                csv.append("Error exporting: ").append(ex.getMessage()).append("\n");
            }

            byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/csv; charset=UTF-8");
            exchange.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"EV_Stations_Report.csv\"");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }
}
