package ev.charging.system;

import javax.swing.*;
import java.awt.*;

/**
 * Splash Screen Module for EV Charging Station Availability System
 * Demonstrates Java Swing JFrame and Multithreading (Thread.sleep)
 */
public class Splash extends JFrame {

    public Splash() {
        // Set background color
        getContentPane().setBackground(new Color(6, 40, 23)); // Dark Forest Green
        setLayout(null);

        // Header Title
        JLabel heading = new JLabel("EV Charging Station Availability System", SwingConstants.CENTER);
        heading.setBounds(100, 80, 900, 60);
        heading.setFont(new Font("Raleway", Font.BOLD, 32));
        heading.setForeground(new Color(163, 230, 53)); // Lime green accent
        add(heading);

        // Subtitle
        JLabel sub = new JLabel("Centralized Relational Infrastructure & Slot Reservation Engine", SwingConstants.CENTER);
        sub.setBounds(150, 150, 800, 30);
        sub.setFont(new Font("SAN_SERIF", Font.PLAIN, 18));
        sub.setForeground(Color.WHITE);
        add(sub);

        // Department Info
        JLabel dept = new JLabel("Department of Information Technology - Rajalakshmi Engineering College", SwingConstants.CENTER);
        dept.setBounds(150, 520, 800, 30);
        dept.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        dept.setForeground(new Color(110, 231, 183));
        add(dept);

        // Frame properties
        setSize(1100, 650);
        setLocation(150, 80);
        setVisible(true);

        // Splash timer thread
        try {
            Thread.sleep(4000);
            setVisible(false);
            new Login(); // Transition to Login Frame
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        new Splash();
    }
}
