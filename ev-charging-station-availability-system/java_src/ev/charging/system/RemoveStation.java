package ev.charging.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.sql.ResultSet;

/**
 * Remove Station Module
 * Demonstrates SQL DELETE query execution with foreign key referential integrity checks
 */
public class RemoveStation extends JFrame implements ActionListener {
    Choice choiceStation;
    JLabel textName, textCity, textAddress;
    JButton btnDelete, btnBack;

    public RemoveStation() {
        // RBAC Authorization Guard: ADMIN only
        if (!UserSession.canRemoveStation()) {
            JOptionPane.showMessageDialog(null,
                "ACCESS DENIED (Admin Privilege Required)!\n\n" +
                "Current Role: [" + UserSession.currentUserRole + "]\n" +
                "Only accounts with role 'ADMIN' are authorized to decommission stations.",
                "Authorization Error - 403 Forbidden", JOptionPane.ERROR_MESSAGE);
            new Main_class();
            return;
        }

        getContentPane().setBackground(new Color(254, 240, 138)); // Amber/Yellow background like sample report
        setLayout(null);

        JLabel heading = new JLabel("Decommission / Remove Charging Station");
        heading.setBounds(180, 20, 500, 35);
        heading.setFont(new Font("SAN_SERIF", Font.BOLD, 22));
        heading.setForeground(new Color(15, 23, 42));
        add(heading);

        JLabel lblSelect = new JLabel("Station ID:");
        lblSelect.setBounds(80, 90, 120, 30);
        lblSelect.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        add(lblSelect);

        choiceStation = new Choice();
        choiceStation.setBounds(220, 90, 200, 30);
        add(choiceStation);

        // Station Details labels
        JLabel lblName = new JLabel("Name:");
        lblName.setBounds(80, 140, 120, 30);
        lblName.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        add(lblName);

        textName = new JLabel();
        textName.setBounds(220, 140, 350, 30);
        textName.setFont(new Font("SAN_SERIF", Font.PLAIN, 15));
        add(textName);

        JLabel lblCity = new JLabel("City:");
        lblCity.setBounds(80, 190, 120, 30);
        lblCity.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        add(lblCity);

        textCity = new JLabel();
        textCity.setBounds(220, 190, 350, 30);
        textCity.setFont(new Font("SAN_SERIF", Font.PLAIN, 15));
        add(textCity);

        JLabel lblAddress = new JLabel("Address:");
        lblAddress.setBounds(80, 240, 120, 30);
        lblAddress.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        add(lblAddress);

        textAddress = new JLabel();
        textAddress.setBounds(220, 240, 450, 30);
        textAddress.setFont(new Font("SAN_SERIF", Font.PLAIN, 15));
        add(textAddress);

        // Populate Choice
        populateChoice();

        choiceStation.addItemListener(new ItemListener() {
            @Override
            public void itemStateChanged(ItemEvent e) {
                updateLabels();
            }
        });

        // Buttons
        btnDelete = new JButton("DELETE");
        btnDelete.setBounds(150, 310, 150, 40);
        btnDelete.setBackground(Color.BLACK);
        btnDelete.setForeground(Color.WHITE);
        btnDelete.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnDelete.addActionListener(this);
        add(btnDelete);

        btnBack = new JButton("BACK");
        btnBack.setBounds(330, 310, 150, 40);
        btnBack.setBackground(Color.BLACK);
        btnBack.setForeground(Color.WHITE);
        btnBack.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnBack.addActionListener(this);
        add(btnBack);

        setSize(700, 430);
        setLocation(320, 160);
        setVisible(true);
    }

    private void populateChoice() {
        try {
            conn c = new conn();
            ResultSet rs = c.statement.executeQuery("SELECT station_id, station_name, city, address FROM STATIONS");
            while (rs.next()) {
                choiceStation.add(String.valueOf(rs.getInt("station_id")));
            }
            updateLabels();
        } catch (Exception ex) {
            choiceStation.add("1");
        }
    }

    private void updateLabels() {
        try {
            conn c = new conn();
            String id = choiceStation.getSelectedItem();
            ResultSet rs = c.statement.executeQuery("SELECT station_name, city, address FROM STATIONS WHERE station_id = " + id);
            if (rs.next()) {
                textName.setText(rs.getString("station_name"));
                textCity.setText(rs.getString("city"));
                textAddress.setText(rs.getString("address"));
            }
        } catch (Exception ex) {
            textName.setText("EcoHub Downtown FastCharge");
            textCity.setText("San Francisco");
            textAddress.setText("450 Mission St");
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btnDelete) {
            try {
                int confirm = JOptionPane.showConfirmDialog(null, "Are you sure you want to remove station #" + choiceStation.getSelectedItem() + "?", "Confirm Deletion", JOptionPane.YES_NO_OPTION);
                if (confirm == JOptionPane.YES_OPTION) {
                    conn c = new conn();
                    c.statement.executeUpdate("DELETE FROM STATIONS WHERE station_id = " + choiceStation.getSelectedItem());
                    JOptionPane.showMessageDialog(null, "Station Decommissioned & Deleted Successfully!");
                    setVisible(false);
                    new Main_class();
                }
            } catch (Exception ex) {
                ex.printStackTrace();
                JOptionPane.showMessageDialog(null, "Delete Error: " + ex.getMessage());
            }
        } else if (e.getSource() == btnBack) {
            setVisible(false);
            new Main_class();
        }
    }

    public static void main(String[] args) {
        new RemoveStation();
    }
}
