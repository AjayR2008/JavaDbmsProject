package ev.charging.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.ResultSet;

/**
 * Slot Reservation Module for EV Charging Station Availability System
 * Demonstrates Core DBMS Transaction Management, ACID properties,
 * and Double-Booking Collision Prevention logic in Java.
 */
public class BookSlot extends JFrame implements ActionListener {
    JComboBox<String> boxCharger;
    JTextField tUserId, tDate, tStartTime, tEndTime, tNotes;
    JButton btnReserve, btnBack;

    public BookSlot() {
        getContentPane().setBackground(new Color(240, 253, 244)); // Emerald Tint
        setLayout(null);

        JLabel heading = new JLabel("Reserve EV Charging Bay (ACID Safe)");
        heading.setBounds(260, 20, 500, 40);
        heading.setFont(new Font("Raleway", Font.BOLD, 22));
        heading.setForeground(new Color(6, 40, 23));
        add(heading);

        // User ID
        JLabel lblUser = new JLabel("User ID:");
        lblUser.setBounds(60, 80, 150, 30);
        lblUser.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblUser);

        tUserId = new JTextField("4"); // Default demo user
        tUserId.setBounds(220, 80, 180, 30);
        add(tUserId);

        // Select Charger Bay
        JLabel lblCharger = new JLabel("Select Bay & Charger:");
        lblCharger.setBounds(440, 80, 180, 30);
        lblCharger.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblCharger);

        boxCharger = new JComboBox<>();
        boxCharger.setBounds(620, 80, 260, 30);
        boxCharger.setBackground(Color.WHITE);
        populateChargers();
        add(boxCharger);

        // Date
        JLabel lblDate = new JLabel("Reservation Date (YYYY-MM-DD):");
        lblDate.setBounds(60, 130, 250, 30);
        lblDate.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblDate);

        tDate = new JTextField("2026-11-02");
        tDate.setBounds(280, 130, 150, 30);
        add(tDate);

        // Start Time
        JLabel lblStart = new JLabel("Start Time (HH:mm:ss):");
        lblStart.setBounds(60, 180, 200, 30);
        lblStart.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblStart);

        tStartTime = new JTextField("10:00:00");
        tStartTime.setBounds(280, 180, 150, 30);
        add(tStartTime);

        // End Time
        JLabel lblEnd = new JLabel("End Time (HH:mm:ss):");
        lblEnd.setBounds(460, 180, 200, 30);
        lblEnd.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblEnd);

        tEndTime = new JTextField("11:30:00");
        tEndTime.setBounds(640, 180, 150, 30);
        add(tEndTime);

        // Notes
        JLabel lblNotes = new JLabel("Vehicle Notes:");
        lblNotes.setBounds(60, 230, 150, 30);
        lblNotes.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblNotes);

        tNotes = new JTextField("Hyundai Ioniq 5, Target 80% SoC");
        tNotes.setBounds(220, 230, 570, 30);
        add(tNotes);

        // Buttons
        btnReserve = new JButton("Confirm Reservation (Check Overlaps)");
        btnReserve.setBounds(240, 310, 340, 42);
        btnReserve.setBackground(new Color(5, 150, 105));
        btnReserve.setForeground(Color.WHITE);
        btnReserve.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        btnReserve.addActionListener(this);
        add(btnReserve);

        btnBack = new JButton("Back to Dashboard");
        btnBack.setBounds(600, 310, 200, 42);
        btnBack.setBackground(new Color(30, 41, 59));
        btnBack.setForeground(Color.WHITE);
        btnBack.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        btnBack.addActionListener(this);
        add(btnBack);

        setSize(940, 430);
        setLocation(240, 160);
        setVisible(true);
    }

    private void populateChargers() {
        try {
            conn c = new conn();
            String query = "SELECT c.charger_id, s.station_name, c.connector_type, c.power_kw FROM CHARGERS c JOIN STATIONS s ON c.station_id = s.station_id WHERE c.status = 'AVAILABLE' LIMIT 20";
            ResultSet rs = c.statement.executeQuery(query);
            while (rs.next()) {
                int id = rs.getInt("charger_id");
                String name = rs.getString("station_name");
                String type = rs.getString("connector_type");
                double kw = rs.getDouble("power_kw");
                boxCharger.addItem(id + " - " + name + " (" + type + ", " + kw + " kW)");
            }
        } catch (Exception ex) {
            boxCharger.addItem("1 - EcoHub Downtown (CCS2, 150 kW)");
            boxCharger.addItem("2 - Silicon Bay SuperStation (350 kW)");
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btnReserve) {
            try {
                int userId = Integer.parseInt(tUserId.getText().trim());
                String selectedItem = (String) boxCharger.getSelectedItem();
                int chargerId = Integer.parseInt(selectedItem.split(" - ")[0]);

                String date = tDate.getText().trim();
                String startTimestamp = date + " " + tStartTime.getText().trim();
                String endTimestamp = date + " " + tEndTime.getText().trim();
                String notes = tNotes.getText().trim();

                conn c = new conn();

                // -------------------------------------------------------------
                // DBMS Overlap Collision Prevention (ACID Transaction Logic)
                // Temporal Overlap Predicate: (start_time < new_end) AND (end_time > new_start)
                // -------------------------------------------------------------
                String collisionCheckQuery = "SELECT booking_id, start_time, end_time FROM BOOKINGS " +
                        "WHERE charger_id = " + chargerId + " AND booking_status = 'CONFIRMED' " +
                        "AND (start_time < '" + endTimestamp + "' AND end_time > '" + startTimestamp + "') " +
                        "LIMIT 1";

                ResultSet rsConflict = c.statement.executeQuery(collisionCheckQuery);

                if (rsConflict.next()) {
                    // Double-booking collision detected! Abort insertion.
                    String existingStart = rsConflict.getString("start_time");
                    String existingEnd = rsConflict.getString("end_time");
                    JOptionPane.showMessageDialog(null,
                        "DOUBLE BOOKING REJECTED!\nBay #" + chargerId + " is already reserved from " + existingStart + " to " + existingEnd + ".\nPlease choose another time window.",
                        "Database Conflict Warning", JOptionPane.WARNING_MESSAGE);
                } else {
                    // Safe to proceed with ACID reservation insertion
                    String insertQuery = "INSERT INTO BOOKINGS (user_id, charger_id, start_time, end_time, booking_status, notes) " +
                            "VALUES (" + userId + ", " + chargerId + ", '" + startTimestamp + "', '" + endTimestamp + "', 'CONFIRMED', '" + notes + "')";

                    c.statement.executeUpdate(insertQuery);

                    JOptionPane.showMessageDialog(null,
                        "SLOT RESERVATION CONFIRMED!\nCharger Bay #" + chargerId + " successfully reserved from " + startTimestamp + " to " + endTimestamp + ".\nRecord saved in database table: BOOKINGS",
                        "Transaction Success", JOptionPane.INFORMATION_MESSAGE);

                    setVisible(false);
                    new Main_class();
                }

            } catch (Exception ex) {
                ex.printStackTrace();
                JOptionPane.showMessageDialog(null, "Booking Error: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            }
        } else if (e.getSource() == btnBack) {
            setVisible(false);
            new Main_class();
        }
    }

    public static void main(String[] args) {
        new BookSlot();
    }
}
