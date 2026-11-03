package ev.charging.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

/**
 * Add Station Module
 * Demonstrates GUI form data collection and JDBC SQL INSERT INTO STATIONS
 */
public class AddStation extends JFrame implements ActionListener {
    JTextField tName, tAddress, tCity, tLat, tLng, tOpen, tClose, tOperator;
    JButton btnAdd, btnBack;

    public AddStation() {
        // RBAC Authorization Guard
        if (!UserSession.canAddStation()) {
            JOptionPane.showMessageDialog(null,
                "ACCESS DENIED (Role-Based Access Control)!\n\n" +
                "Current Role: [" + UserSession.currentUserRole + "]\n" +
                "Regular users cannot add charging stations.\n" +
                "Required Role: ADMIN or OPERATOR.",
                "Authorization Error - 403 Forbidden", JOptionPane.ERROR_MESSAGE);
            new Main_class();
            return;
        }

        getContentPane().setBackground(new Color(163, 255, 188)); // Classic Green background like student report
        setLayout(null);

        JLabel heading = new JLabel("Add EV Charging Station Detail");
        heading.setBounds(320, 30, 500, 50);
        heading.setFont(new Font("serif", Font.BOLD, 25));
        add(heading);

        // Station Name
        JLabel lblName = new JLabel("Station Name");
        lblName.setBounds(50, 130, 150, 30);
        lblName.setFont(new Font("SAN_SERIF", Font.BOLD, 18));
        add(lblName);

        tName = new JTextField();
        tName.setBounds(200, 130, 220, 30);
        tName.setBackground(new Color(177, 252, 197));
        add(tName);

        // City
        JLabel lblCity = new JLabel("City");
        lblCity.setBounds(460, 130, 150, 30);
        lblCity.setFont(new Font("SAN_SERIF", Font.BOLD, 18));
        add(lblCity);

        tCity = new JTextField();
        tCity.setBounds(620, 130, 220, 30);
        tCity.setBackground(new Color(177, 252, 197));
        add(tCity);

        // Address
        JLabel lblAddress = new JLabel("Address");
        lblAddress.setBounds(50, 180, 150, 30);
        lblAddress.setFont(new Font("SAN_SERIF", Font.BOLD, 18));
        add(lblAddress);

        tAddress = new JTextField();
        tAddress.setBounds(200, 180, 640, 30);
        tAddress.setBackground(new Color(177, 252, 197));
        add(tAddress);

        // Opening Time
        JLabel lblOpen = new JLabel("Opening Time");
        lblOpen.setBounds(50, 230, 150, 30);
        lblOpen.setFont(new Font("SAN_SERIF", Font.BOLD, 18));
        add(lblOpen);

        tOpen = new JTextField("06:00");
        tOpen.setBounds(200, 230, 220, 30);
        tOpen.setBackground(new Color(177, 252, 197));
        add(tOpen);

        // Closing Time
        JLabel lblClose = new JLabel("Closing Time");
        lblClose.setBounds(460, 230, 150, 30);
        lblClose.setFont(new Font("SAN_SERIF", Font.BOLD, 18));
        add(lblClose);

        tClose = new JTextField("23:00");
        tClose.setBounds(620, 230, 220, 30);
        tClose.setBackground(new Color(177, 252, 197));
        add(tClose);

        // Latitude & Longitude
        JLabel lblLat = new JLabel("Latitude");
        lblLat.setBounds(50, 280, 150, 30);
        lblLat.setFont(new Font("SAN_SERIF", Font.BOLD, 18));
        add(lblLat);

        tLat = new JTextField("37.7749");
        tLat.setBounds(200, 280, 220, 30);
        tLat.setBackground(new Color(177, 252, 197));
        add(tLat);

        JLabel lblLng = new JLabel("Longitude");
        lblLng.setBounds(460, 280, 150, 30);
        lblLng.setFont(new Font("SAN_SERIF", Font.BOLD, 18));
        add(lblLng);

        tLng = new JTextField("-122.4194");
        tLng.setBounds(620, 280, 220, 30);
        tLng.setBackground(new Color(177, 252, 197));
        add(tLng);

        // Operator ID
        JLabel lblOp = new JLabel("Operator ID");
        lblOp.setBounds(50, 330, 150, 30);
        lblOp.setFont(new Font("SAN_SERIF", Font.BOLD, 18));
        add(lblOp);

        tOperator = new JTextField("2");
        tOperator.setBounds(200, 330, 220, 30);
        tOperator.setBackground(new Color(177, 252, 197));
        add(tOperator);

        // Buttons
        btnAdd = new JButton("ADD DETAILS");
        btnAdd.setBounds(480, 410, 180, 45);
        btnAdd.setBackground(Color.BLACK);
        btnAdd.setForeground(Color.WHITE);
        btnAdd.addActionListener(this);
        add(btnAdd);

        btnBack = new JButton("BACK");
        btnBack.setBounds(260, 410, 180, 45);
        btnBack.setBackground(Color.BLACK);
        btnBack.setForeground(Color.WHITE);
        btnBack.addActionListener(this);
        add(btnBack);

        setSize(940, 530);
        setLocation(240, 120);
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btnAdd) {
            try {
                String name = tName.getText().trim();
                String city = tCity.getText().trim();
                String address = tAddress.getText().trim();
                String open = tOpen.getText().trim();
                String close = tClose.getText().trim();
                double lat = Double.parseDouble(tLat.getText().trim());
                double lng = Double.parseDouble(tLng.getText().trim());
                int opId = Integer.parseInt(tOperator.getText().trim());

                conn c = new conn();
                String query = "INSERT INTO STATIONS (station_name, address, city, latitude, longitude, opening_time, closing_time, operator_id, status) " +
                        "VALUES ('" + name + "', '" + address + "', '" + city + "', " + lat + ", " + lng + ", '" + open + "', '" + close + "', " + opId + ", 'ACTIVE')";

                c.statement.executeUpdate(query);
                JOptionPane.showMessageDialog(null, "Station Details Added Successfully to Database!");
                setVisible(false);
                new Main_class();
            } catch (Exception ex) {
                ex.printStackTrace();
                JOptionPane.showMessageDialog(null, "Error: " + ex.getMessage());
            }
        } else if (e.getSource() == btnBack) {
            setVisible(false);
            new Main_class();
        }
    }

    public static void main(String[] args) {
        new AddStation();
    }
}
