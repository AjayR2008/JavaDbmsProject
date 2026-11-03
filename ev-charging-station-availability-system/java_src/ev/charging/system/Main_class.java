package ev.charging.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

/**
 * Main Class (Master Control Panel) for EV Charging Station Availability System
 * Demonstrates Java Swing JFrame, Component Layouts, and Navigation to Sub-modules
 */
public class Main_class extends JFrame implements ActionListener {
    JButton btnAddStation, btnViewStations, btnBookSlot, btnUpdateCharger, btnRemoveStation, btnExit;

    public Main_class() {
        getContentPane().setBackground(new Color(241, 245, 249));
        setLayout(null);

        // Header Title Bar
        JPanel headerPanel = new JPanel();
        headerPanel.setBounds(0, 0, 1120, 100);
        headerPanel.setBackground(new Color(6, 40, 23));
        headerPanel.setLayout(null);
        add(headerPanel);

        JLabel heading = new JLabel("EV Charging Station Management & Booking System");
        heading.setBounds(180, 25, 800, 35);
        heading.setFont(new Font("Raleway", Font.BOLD, 26));
        heading.setForeground(new Color(163, 230, 53)); // Lime Green
        headerPanel.add(heading);

        JLabel subHeading = new JLabel("Autonomous EV Infrastructure Telemetry & Relational Database Engine");
        subHeading.setBounds(260, 62, 600, 20);
        subHeading.setFont(new Font("SAN_SERIF", Font.PLAIN, 14));
        subHeading.setForeground(Color.WHITE);
        headerPanel.add(subHeading);

        // Buttons Grid
        btnAddStation = new JButton("Add Charging Station");
        btnAddStation.setBounds(180, 180, 220, 55);
        btnAddStation.setBackground(new Color(5, 150, 105));
        btnAddStation.setForeground(Color.WHITE);
        btnAddStation.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        btnAddStation.addActionListener(this);
        add(btnAddStation);

        btnViewStations = new JButton("View Stations & Bays");
        btnViewStations.setBounds(450, 180, 220, 55);
        btnViewStations.setBackground(new Color(5, 150, 105));
        btnViewStations.setForeground(Color.WHITE);
        btnViewStations.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        btnViewStations.addActionListener(this);
        add(btnViewStations);

        btnBookSlot = new JButton("Reserve Charging Slot");
        btnBookSlot.setBounds(720, 180, 220, 55);
        btnBookSlot.setBackground(new Color(16, 185, 129));
        btnBookSlot.setForeground(new Color(6, 40, 23));
        btnBookSlot.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        btnBookSlot.addActionListener(this);
        add(btnBookSlot);

        btnUpdateCharger = new JButton("Update Charger Status");
        btnUpdateCharger.setBounds(180, 280, 220, 55);
        btnUpdateCharger.setBackground(new Color(30, 41, 59));
        btnUpdateCharger.setForeground(Color.WHITE);
        btnUpdateCharger.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        btnUpdateCharger.addActionListener(this);
        add(btnUpdateCharger);

        btnRemoveStation = new JButton("Remove Station / Slot");
        btnRemoveStation.setBounds(450, 280, 220, 55);
        btnRemoveStation.setBackground(new Color(225, 29, 72)); // Rose Red
        btnRemoveStation.setForeground(Color.WHITE);
        btnRemoveStation.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        btnRemoveStation.addActionListener(this);
        add(btnRemoveStation);

        btnExit = new JButton("Log Out & Exit");
        btnExit.setBounds(720, 280, 220, 55);
        btnExit.setBackground(new Color(71, 85, 105));
        btnExit.setForeground(Color.WHITE);
        btnExit.setFont(new Font("SAN_SERIF", Font.BOLD, 15));
        btnExit.addActionListener(this);
        add(btnExit);

        // System Footer Status
        JLabel footerLabel = new JLabel("Connected to MySQL Relational Database Engine (Tables: USERS, STATIONS, CHARGERS, BOOKINGS, SESSIONS)");
        footerLabel.setBounds(180, 420, 800, 30);
        footerLabel.setFont(new Font("SAN_SERIF", Font.ITALIC, 13));
        footerLabel.setForeground(new Color(100, 116, 139));
        add(footerLabel);

        setSize(1120, 530);
        setLocation(180, 120);
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btnAddStation) {
            new AddStation();
            setVisible(false);
        } else if (e.getSource() == btnViewStations) {
            new ViewStations();
            setVisible(false);
        } else if (e.getSource() == btnBookSlot) {
            new BookSlot();
            setVisible(false);
        } else if (e.getSource() == btnUpdateCharger) {
            new UpdateCharger();
            setVisible(false);
        } else if (e.getSource() == btnRemoveStation) {
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
