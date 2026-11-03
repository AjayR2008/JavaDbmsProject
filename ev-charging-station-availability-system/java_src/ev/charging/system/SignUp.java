package ev.charging.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

/**
 * User Registration Module for EV Charging Station System
 * Demonstrates SQL INSERT INTO USERS and form validation in Java Swing
 */
public class SignUp extends JFrame implements ActionListener {
    JTextField tName, tEmail, tPhone;
    JPasswordField tPassword;
    JComboBox<String> boxRole;
    JButton btnRegister, btnBack;

    public SignUp() {
        getContentPane().setBackground(new Color(248, 250, 252));
        setLayout(null);

        // Header Title
        JLabel heading = new JLabel("New User Registration");
        heading.setBounds(150, 15, 300, 30);
        heading.setFont(new Font("SAN_SERIF", Font.BOLD, 22));
        heading.setForeground(new Color(6, 40, 23));
        add(heading);

        // Full Name
        JLabel lblName = new JLabel("Full Name");
        lblName.setBounds(50, 70, 130, 30);
        lblName.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblName);

        tName = new JTextField();
        tName.setBounds(190, 70, 250, 30);
        tName.setFont(new Font("SAN_SERIF", Font.PLAIN, 14));
        add(tName);

        // Email
        JLabel lblEmail = new JLabel("Email");
        lblEmail.setBounds(50, 120, 130, 30);
        lblEmail.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblEmail);

        tEmail = new JTextField();
        tEmail.setBounds(190, 120, 250, 30);
        tEmail.setFont(new Font("SAN_SERIF", Font.PLAIN, 14));
        add(tEmail);

        // Password
        JLabel lblPassword = new JLabel("Password");
        lblPassword.setBounds(50, 170, 130, 30);
        lblPassword.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblPassword);

        tPassword = new JPasswordField();
        tPassword.setBounds(190, 170, 250, 30);
        add(tPassword);

        // Phone
        JLabel lblPhone = new JLabel("Phone Number");
        lblPhone.setBounds(50, 220, 130, 30);
        lblPhone.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblPhone);

        tPhone = new JTextField();
        tPhone.setBounds(190, 220, 250, 30);
        tPhone.setFont(new Font("SAN_SERIF", Font.PLAIN, 14));
        add(tPhone);

        // Role Selection
        JLabel lblRole = new JLabel("Role");
        lblRole.setBounds(50, 270, 130, 30);
        lblRole.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblRole);

        boxRole = new JComboBox<>(new String[]{"USER", "OPERATOR", "ADMIN"});
        boxRole.setBounds(190, 270, 250, 30);
        boxRole.setBackground(Color.WHITE);
        add(boxRole);

        // Register Button
        btnRegister = new JButton("REGISTER");
        btnRegister.setBounds(80, 330, 150, 38);
        btnRegister.setBackground(new Color(5, 150, 105));
        btnRegister.setForeground(Color.WHITE);
        btnRegister.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnRegister.addActionListener(this);
        add(btnRegister);

        // Back Button
        btnBack = new JButton("BACK");
        btnBack.setBounds(260, 330, 150, 38);
        btnBack.setBackground(new Color(30, 41, 59));
        btnBack.setForeground(Color.WHITE);
        btnBack.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        btnBack.addActionListener(this);
        add(btnBack);

        setSize(520, 430);
        setLocation(450, 200);
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btnRegister) {
            try {
                String name = tName.getText().trim();
                String email = tEmail.getText().trim();
                String password = new String(tPassword.getPassword()).trim();
                String phone = tPhone.getText().trim();
                String role = (String) boxRole.getSelectedItem();

                // Basic Validation
                if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                    JOptionPane.showMessageDialog(null, "Name, Email, and Password are required fields!");
                    return;
                }

                conn c = new conn();
                String query = "INSERT INTO USERS (name, email, password_hash, phone, role) " +
                        "VALUES ('" + name + "', '" + email + "', '" + password + "', '" + phone + "', '" + role + "')";

                c.statement.executeUpdate(query);
                JOptionPane.showMessageDialog(null, "Registration Successful! You can now login.");
                setVisible(false);
                new Login();
            } catch (Exception ex) {
                ex.printStackTrace();
                if (ex.getMessage().contains("Duplicate")) {
                    JOptionPane.showMessageDialog(null, "This email is already registered. Please use a different email.");
                } else {
                    JOptionPane.showMessageDialog(null, "Registration Error: " + ex.getMessage());
                }
            }
        } else if (e.getSource() == btnBack) {
            setVisible(false);
            new Login();
        }
    }

    public static void main(String[] args) {
        new SignUp();
    }
}
