package ev.charging.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

/**
 * Main Class (Master Control Panel) for EV Charging Station Availability System
 * Enforces Role-Based Access Control (RBAC):
 * - ADMIN: Full access (Add, View, Book, Update, Remove)
 * - OPERATOR: Station management (Add Station, View, Book, Update Charger)
 * - USER: Customer operations (View Stations & Available Bays, Book Slot)
 */
public class Main_class extends JFrame implements ActionListener {
    JButton btnAddStation, btnViewStations, btnBookSlot, btnUpdateCharger, btnRemoveStation, btnExit;
    String role;
    String userName;
    int userId;

    public Main_class() {
        this(UserSession.currentUserRole, UserSession.currentUserName, UserSession.currentUserId);
    }

    public Main_class(String role, String name, int userId) {
        this.role = (role != null) ? role.toUpperCase() : "USER";
        this.userName = (name != null) ? name : "User";
        this.userId = userId;

        // Keep UserSession in sync
        UserSession.setSession(userId, userName, UserSession.currentUserEmail, this.role);

        getContentPane().setBackground(new Color(241, 245, 249));
        setLayout(null);

        // Header Title Bar
        JPanel headerPanel = new JPanel();
        headerPanel.setBounds(0, 0, 1120, 110);
        headerPanel.setBackground(new Color(6, 40, 23));
        headerPanel.setLayout(null);
        add(headerPanel);

        JLabel heading = new JLabel("EV Charging Station Management & Booking System");
        heading.setBounds(180, 15, 800, 32);
        heading.setFont(new Font("Raleway", Font.BOLD, 25));
        heading.setForeground(new Color(163, 230, 53)); // Lime Green
        headerPanel.add(heading);

        JLabel subHeading = new JLabel("Autonomous EV Infrastructure Telemetry & Relational Database Engine");
        subHeading.setBounds(260, 48, 600, 20);
        subHeading.setFont(new Font("SAN_SERIF", Font.PLAIN, 13));
        subHeading.setForeground(Color.WHITE);
        headerPanel.add(subHeading);

        // User Role Banner inside header
        String roleBadgeColor = "ADMIN".equals(this.role) ? "#ef4444" : ("OPERATOR".equals(this.role) ? "#f59e0b" : "#10b981");
        JLabel userBadge = new JLabel("Logged in as: " + this.userName + " | Role: [" + this.role + "] - " + UserSession.getRoleDescription(this.role));
        userBadge.setBounds(180, 75, 800, 24);
        userBadge.setFont(new Font("SAN_SERIF", Font.BOLD, 12));
        userBadge.setForeground(new Color(187, 247, 208));
        headerPanel.add(userBadge);

        // Buttons Grid
        // 1. Add Station (ADMIN, OPERATOR only)
        btnAddStation = new JButton(UserSession.canAddStation() ? "Add Charging Station" : "🔒 Add Station (Admin/Op)");
        btnAddStation.setBounds(180, 160, 230, 55);
        if (UserSession.canAddStation()) {
            btnAddStation.setBackground(new Color(5, 150, 105));
            btnAddStation.setForeground(Color.WHITE);
        } else {
            btnAddStation.setBackground(new Color(203, 213, 225));
            btnAddStation.setForeground(new Color(100, 116, 139));
        }
        btnAddStation.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnAddStation.addActionListener(this);
        add(btnAddStation);

        // 2. View Stations & Bays (ALL ROLES)
        btnViewStations = new JButton("View Stations & Bays");
        btnViewStations.setBounds(445, 160, 230, 55);
        btnViewStations.setBackground(new Color(5, 150, 105));
        btnViewStations.setForeground(Color.WHITE);
        btnViewStations.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnViewStations.addActionListener(this);
        add(btnViewStations);

        // 3. Reserve Slot (ALL ROLES)
        btnBookSlot = new JButton("Reserve Charging Slot");
        btnBookSlot.setBounds(710, 160, 230, 55);
        btnBookSlot.setBackground(new Color(16, 185, 129));
        btnBookSlot.setForeground(new Color(6, 40, 23));
        btnBookSlot.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnBookSlot.addActionListener(this);
        add(btnBookSlot);

        // 4. Update Charger Status (ADMIN, OPERATOR only)
        btnUpdateCharger = new JButton(UserSession.canUpdateCharger() ? "Update Charger Status" : "🔒 Update Charger (Admin/Op)");
        btnUpdateCharger.setBounds(180, 250, 230, 55);
        if (UserSession.canUpdateCharger()) {
            btnUpdateCharger.setBackground(new Color(30, 41, 59));
            btnUpdateCharger.setForeground(Color.WHITE);
        } else {
            btnUpdateCharger.setBackground(new Color(203, 213, 225));
            btnUpdateCharger.setForeground(new Color(100, 116, 139));
        }
        btnUpdateCharger.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnUpdateCharger.addActionListener(this);
        add(btnUpdateCharger);

        // 5. Remove Station (ADMIN ONLY)
        btnRemoveStation = new JButton(UserSession.canRemoveStation() ? "Remove Station / Slot" : "🔒 Remove Station (Admin Only)");
        btnRemoveStation.setBounds(445, 250, 230, 55);
        if (UserSession.canRemoveStation()) {
            btnRemoveStation.setBackground(new Color(225, 29, 72)); // Rose Red
            btnRemoveStation.setForeground(Color.WHITE);
        } else {
            btnRemoveStation.setBackground(new Color(203, 213, 225));
            btnRemoveStation.setForeground(new Color(100, 116, 139));
        }
        btnRemoveStation.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnRemoveStation.addActionListener(this);
        add(btnRemoveStation);

        // 6. Log Out
        btnExit = new JButton("Switch Role / Log Out");
        btnExit.setBounds(710, 250, 230, 55);
        btnExit.setBackground(new Color(71, 85, 105));
        btnExit.setForeground(Color.WHITE);
        btnExit.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnExit.addActionListener(this);
        add(btnExit);

        // Role Permission Matrix Footer
        JPanel roleInfoPanel = new JPanel();
        roleInfoPanel.setBounds(180, 340, 760, 60);
        roleInfoPanel.setBackground(new Color(226, 232, 240));
        roleInfoPanel.setBorder(BorderFactory.createLineBorder(new Color(203, 213, 225)));
        roleInfoPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 20, 8));
        add(roleInfoPanel);

        JLabel lblPerm = new JLabel("Role Permissions: USER [View, Book] | OPERATOR [View, Book, Add Station, Update Bays] | ADMIN [All Operations]");
        lblPerm.setFont(new Font("SAN_SERIF", Font.BOLD, 12));
        lblPerm.setForeground(new Color(30, 41, 59));
        roleInfoPanel.add(lblPerm);

        JLabel footerLabel = new JLabel("Database Engine: MySQL (ev_charging_db) &bull; Enforcing RBAC Security on Tables: users, stations, chargers, bookings");
        footerLabel.setBounds(180, 430, 800, 25);
        footerLabel.setFont(new Font("SAN_SERIF", Font.ITALIC, 12));
        footerLabel.setForeground(new Color(100, 116, 139));
        add(footerLabel);

        setSize(1120, 520);
        setLocation(180, 120);
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btnAddStation) {
            // RBAC Verification: ADMIN or OPERATOR only
            if (!UserSession.canAddStation()) {
                JOptionPane.showMessageDialog(this,
                    "ACCESS DENIED (Role-Based Access Control Violation)!\n\n" +
                    "Your current role is: [" + this.role + "]\n" +
                    "Regular users CANNOT add charging stations to the infrastructure.\n" +
                    "Only accounts with role 'ADMIN' or 'OPERATOR' are authorized to add stations.",
                    "Authorization Error - 403 Forbidden", JOptionPane.ERROR_MESSAGE);
                return;
            }
            new AddStation();
            setVisible(false);

        } else if (e.getSource() == btnViewStations) {
            // All roles can view
            new ViewStations();
            setVisible(false);

        } else if (e.getSource() == btnBookSlot) {
            // All logged-in roles can reserve slots
            new BookSlot();
            setVisible(false);

        } else if (e.getSource() == btnUpdateCharger) {
            // RBAC Verification: ADMIN or OPERATOR only
            if (!UserSession.canUpdateCharger()) {
                JOptionPane.showMessageDialog(this,
                    "ACCESS DENIED (Role-Based Access Control Violation)!\n\n" +
                    "Your current role is: [" + this.role + "]\n" +
                    "Regular users CANNOT modify charger hardware telemetry, power ratings, or tariffs.\n" +
                    "Only accounts with role 'OPERATOR' or 'ADMIN' are authorized to update chargers.",
                    "Authorization Error - 403 Forbidden", JOptionPane.ERROR_MESSAGE);
                return;
            }
            new UpdateCharger();
            setVisible(false);

        } else if (e.getSource() == btnRemoveStation) {
            // RBAC Verification: ADMIN ONLY
            if (!UserSession.canRemoveStation()) {
                JOptionPane.showMessageDialog(this,
                    "ACCESS DENIED (Admin Privilege Required)!\n\n" +
                    "Your current role is: [" + this.role + "]\n" +
                    "Decommissioning charging stations triggers foreign key cascade deletes on bays.\n" +
                    "Only accounts with role 'ADMIN' are authorized to remove stations.",
                    "Authorization Error - 403 Forbidden", JOptionPane.ERROR_MESSAGE);
                return;
            }
            new RemoveStation();
            setVisible(false);

        } else if (e.getSource() == btnExit) {
            setVisible(false);
            new Login();
        }
    }

    public static void main(String[] args) {
        new Main_class();
    }
}
