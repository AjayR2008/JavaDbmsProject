package ev.charging.system;

/**
 * User Session Management & Role-Based Access Control (RBAC) Engine
 * -----------------------------------------------------------------
 * Manages authenticated user state and enforces authorization rules
 * across all Java Swing modules and database transactions.
 * 
 * Defined Roles:
 * - ADMIN: Full access (Add, Update, Remove, View, Book, DBMS console)
 * - OPERATOR: Station management (Add Station, Update Charger telemetry, View, Book)
 * - USER: Customer access (View Stations, Reserve Slot, View Sessions)
 */
public class UserSession {
    public static int currentUserId = 1;
    public static String currentUserName = "Alex Vance";
    public static String currentUserEmail = "admin@evcharge.com";
    public static String currentUserRole = "ADMIN";

    public static void setSession(int userId, String name, String email, String role) {
        currentUserId = userId;
        currentUserName = name;
        currentUserEmail = email;
        currentUserRole = role != null ? role.toUpperCase() : "USER";
    }

    public static void clear() {
        currentUserId = 0;
        currentUserName = "Guest";
        currentUserEmail = "";
        currentUserRole = "GUEST";
    }

    public static boolean isLoggedIn() {
        return currentUserId > 0 && !"GUEST".equals(currentUserRole);
    }

    public static boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(currentUserRole);
    }

    public static boolean isOperator() {
        return "OPERATOR".equalsIgnoreCase(currentUserRole);
    }

    public static boolean isUser() {
        return "USER".equalsIgnoreCase(currentUserRole);
    }

    public static boolean canAddStation() {
        return isAdmin() || isOperator();
    }

    public static boolean canUpdateCharger() {
        return isAdmin() || isOperator();
    }

    public static boolean canRemoveStation() {
        return isAdmin();
    }

    public static boolean canExecuteCustomSql() {
        return isAdmin();
    }

    public static boolean canBookSlot() {
        return isLoggedIn();
    }

    public static String getRoleDescription(String role) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return "Super Administrator - Full infrastructure, telemetry, user management & deletion rights";
        } else if ("OPERATOR".equalsIgnoreCase(role)) {
            return "Station Operator - Infrastructure monitoring, station registration & bay telemetry updates";
        } else if ("USER".equalsIgnoreCase(role)) {
            return "EV Customer / Driver - View station catalog, bay availability & reserve charging slots";
        }
        return "Unauthenticated Guest";
    }
}
