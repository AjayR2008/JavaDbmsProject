package ev.charging.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.ResultSet;

/**
 * Authentication Module for EV Charging Station System
 * Demonstrates Java Swing GUI, Event Handling (ActionListener), and JDBC SQL Execution
 * Validates user credentials (email + password) against the USERS table
 */
public class Login extends JFrame implements ActionListener {
    JTextField tusername;
    JPasswordField tpassword;
    JButton login, signup, back;

    public Login() {
        getContentPane().setBackground(new Color(248, 250, 252));
        setLayout(null);

        // Header Title
        JLabel title = new JLabel("System Authentication");
        title.setBounds(150, 20, 300, 30);
        title.setFont(new Font("SAN_SERIF", Font.BOLD, 22));
        title.setForeground(new Color(6, 40, 23));
        add(title);

        // Username Label & Field
        JLabel username = new JLabel("Email / Username");
        username.setBounds(60, 80, 150, 30);
        username.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(username);

        tusername = new JTextField();
        tusername.setBounds(210, 80, 220, 30);
        tusername.setFont(new Font("SAN_SERIF", Font.PLAIN, 14));
        add(tusername);

        // Password Label & Field
        JLabel password = new JLabel("Password");
        password.setBounds(60, 130, 150, 30);
        password.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(password);

        tpassword = new JPasswordField();
        tpassword.setBounds(210, 130, 220, 30);
        add(tpassword);

        // Login Button
        login = new JButton("LOGIN");
        login.setBounds(60, 190, 120, 35);
        login.setBackground(new Color(5, 150, 105)); // Emerald Green
        login.setForeground(Color.WHITE);
        login.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        login.addActionListener(this);
        add(login);

        // Sign Up Button
        signup = new JButton("SIGN UP");
        signup.setBounds(195, 190, 120, 35);
        signup.setBackground(new Color(37, 99, 235)); // Blue
        signup.setForeground(Color.WHITE);
        signup.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        signup.addActionListener(this);
        add(signup);

        // Back / Exit Button
        back = new JButton("EXIT");
        back.setBounds(330, 190, 120, 35);
        back.setBackground(new Color(30, 41, 59));
        back.setForeground(Color.WHITE);
        back.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        back.addActionListener(this);
        add(back);

        setSize(520, 300);
        setLocation(450, 250);
        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == login) {
            try {
                String email = tusername.getText().trim();
                String pass = new String(tpassword.getPassword()).trim();

                if (email.isEmpty() || pass.isEmpty()) {
                    JOptionPane.showMessageDialog(null, "Please enter both Email and Password.");
                    return;
                }

                conn c = new conn();
                // SQL Query for Authentication — checks email and password_hash
                String query = "SELECT user_id, name, role FROM USERS WHERE email = '" + email + "' AND password_hash = '" + pass + "'";
                ResultSet rs = c.statement.executeQuery(query);

                if (rs.next()) {
                    int userId = rs.getInt("user_id");
                    String role = rs.getString("role");
                    String name = rs.getString("name");
                    UserSession.setSession(userId, name, email, role);
                    JOptionPane.showMessageDialog(null, 
                        "Login Successful!\nWelcome: " + name + " (" + role + ")\n\nRole Privileges:\n" + UserSession.getRoleDescription(role),
                        "Authentication Success", JOptionPane.INFORMATION_MESSAGE);
                    setVisible(false);
                    new Main_class(role, name, userId);
                } else {
                    JOptionPane.showMessageDialog(null, "Invalid Email or Password. Please try again.");
                }
            } catch (Exception ex) {
                ex.printStackTrace();
                JOptionPane.showMessageDialog(null, "Database Error: " + ex.getMessage());
            }
        } else if (e.getSource() == signup) {
            setVisible(false);
            new SignUp();
        } else if (e.getSource() == back) {
            System.exit(0);
        }
    }

    public static void main(String[] args) {
        new Login();
    }
}
