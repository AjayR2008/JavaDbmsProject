package ev.charging.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.ResultSet;

/**
 * Update Charger Telemetry Module
 * Demonstrates SQL UPDATE statements to toggle hardware status: AVAILABLE, OCCUPIED, MAINTENANCE
 */
public class UpdateCharger extends JFrame implements ActionListener {
    JComboBox<String> boxCharger;
    JComboBox<String> boxStatus;
    JTextField tPower, tPrice;
    JButton btnUpdate, btnBack;

    public UpdateCharger() {
        // RBAC Authorization Guard
        if (!UserSession.canUpdateCharger()) {
            JOptionPane.showMessageDialog(null,
                "ACCESS DENIED (Role-Based Access Control)!\n\n" +
                "Current Role: [" + UserSession.currentUserRole + "]\n" +
                "Regular users cannot modify charger telemetry, power, or tariffs.\n" +
                "Required Role: ADMIN or OPERATOR.",
                "Authorization Error - 403 Forbidden", JOptionPane.ERROR_MESSAGE);
            new Main_class();
            return;
        }

        getContentPane().setBackground(new Color(224, 242, 254)); // Light Blue theme
        setLayout(null);

        JLabel heading = new JLabel("Update Charger Bay Telemetry Status");
        heading.setBounds(260, 25, 450, 35);
        heading.setFont(new Font("SAN_SERIF", Font.BOLD, 22));
        heading.setForeground(new Color(15, 23, 42));
        add(heading);

        // Select Charger
        JLabel lblCharger = new JLabel("Select Bay #:");
        lblCharger.setBounds(100, 90, 150, 30);
        lblCharger.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        add(lblCharger);

        boxCharger = new JComboBox<>();
        boxCharger.setBounds(260, 90, 320, 30);
        boxCharger.setBackground(Color.WHITE);
        populateChargers();
        add(boxCharger);

        // Status Select
        JLabel lblStatus = new JLabel("Operational Status:");
        lblStatus.setBounds(100, 150, 150, 30);
        lblStatus.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        add(lblStatus);

        boxStatus = new JComboBox<>(new String[]{"AVAILABLE", "OCCUPIED", "MAINTENANCE"});
        boxStatus.setBounds(260, 150, 320, 30);
        boxStatus.setBackground(Color.WHITE);
        add(boxStatus);

        // Power kW
        JLabel lblPower = new JLabel("Power Output (kW):");
        lblPower.setBounds(100, 210, 150, 30);
        lblPower.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        add(lblPower);

        tPower = new JTextField("150");
        tPower.setBounds(260, 210, 320, 30);
        add(tPower);

        // Price
        JLabel lblPrice = new JLabel("Tariff ($/kWh):");
        lblPrice.setBounds(100, 270, 150, 30);
        lblPrice.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        add(lblPrice);

        tPrice = new JTextField("0.38");
        tPrice.setBounds(260, 270, 320, 30);
        add(tPrice);

        // Buttons
        btnUpdate = new JButton("UPDATE TELEMETRY");
        btnUpdate.setBounds(200, 350, 200, 45);
        btnUpdate.setBackground(new Color(5, 150, 105));
        btnUpdate.setForeground(Color.WHITE);
        btnUpdate.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnUpdate.addActionListener(this);
        add(btnUpdate);

        btnBack = new JButton("BACK");
        btnBack.setBounds(430, 350, 150, 45);
        btnBack.setBackground(Color.BLACK);
        btnBack.setForeground(Color.WHITE);
        btnBack.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnBack.addActionListener(this);
        add(btnBack);

        setSize(780, 470);
        setLocation(280, 140);
        setVisible(true);
    }

    private void populateChargers() {
        try {
            conn c = new conn();
            ResultSet rs = c.statement.executeQuery("SELECT charger_id, connector_type, status FROM CHARGERS LIMIT 25");
            while (rs.next()) {
                boxCharger.addItem("Bay #" + rs.getInt("charger_id") + " - " + rs.getString("connector_type") + " [" + rs.getString("status") + "]");
            }
        } catch (Exception e) {
            boxCharger.addItem("Bay #1 - CCS2 [AVAILABLE]");
            boxCharger.addItem("Bay #2 - Type 2 [OCCUPIED]");
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btnUpdate) {
            try {
                String selected = (String) boxCharger.getSelectedItem();
                int chargerId = Integer.parseInt(selected.split(" - ")[0].replace("Bay #", ""));
                String newStatus = (String) boxStatus.getSelectedItem();
                double power = Double.parseDouble(tPower.getText().trim());
                double price = Double.parseDouble(tPrice.getText().trim());

                conn c = new conn();
                String query = "UPDATE CHARGERS SET status = '" + newStatus + "', power_kw = " + power + ", price_per_kwh = " + price + " WHERE charger_id = " + chargerId;
                c.statement.executeUpdate(query);

                JOptionPane.showMessageDialog(null, "Charger Bay #" + chargerId + " Updated to " + newStatus + " Successfully!");
                setVisible(false);
                new Main_class();
            } catch (Exception ex) {
                ex.printStackTrace();
                JOptionPane.showMessageDialog(null, "Update Error: " + ex.getMessage());
            }
        } else if (e.getSource() == btnBack) {
            setVisible(false);
            new Main_class();
        }
    }

    public static void main(String[] args) {
        new UpdateCharger();
    }
}
