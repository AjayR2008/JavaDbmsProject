package ev.charging.system;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import javax.swing.JOptionPane;

/**
 * JDBC Database Connectivity Class
 * Establishes persistent connection to MySQL relational database
 * Database: ev_charging_db (MariaDB / MySQL)
 */
public class conn {
    public Connection connection;
    public Statement statement;

    public conn() {
        try {
            // Register MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Connect to MySQL server running on port 3306
            // Database: ev_charging_db (created by schema.sql)
            connection = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/ev_charging_db?useSSL=false&allowPublicKeyRetrieval=true",
                "root",
                ""
            );

            statement = connection.createStatement();
            System.out.println("Database Connection Established Successfully.");
        } catch (Exception e) {
            System.err.println("JDBC Connection Error: " + e.getMessage());
            JOptionPane.showMessageDialog(null, 
                "Connection Failed!\n\n" + e.getMessage() + 
                "\n\nCheck:\n1. Is XAMPP MySQL running?\n2. Did you run schema.sql in phpMyAdmin?\n3. Is the root password correct in conn.java?",
                "JDBC Connection Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}
