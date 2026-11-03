package ev.charging.system;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.ResultSet;

/**
 * View Stations & Chargers Table Module
 * Demonstrates JTable, SQL SELECT with JOIN, Filter/Search by City, and Print functionality
 */
public class ViewStations extends JFrame implements ActionListener {
    JTable table;
    DefaultTableModel model;
    JTextField tSearchCity;
    JButton btnSearch, btnPrint, btnRefresh, btnBack;

    public ViewStations() {
        getContentPane().setBackground(new Color(254, 202, 202)); // Soft red/coral theme like sample report
        setLayout(null);

        JLabel lblSearch = new JLabel("Search by City:");
        lblSearch.setBounds(30, 20, 120, 25);
        lblSearch.setFont(new Font("SAN_SERIF", Font.BOLD, 14));
        add(lblSearch);

        tSearchCity = new JTextField();
        tSearchCity.setBounds(160, 20, 180, 25);
        add(tSearchCity);

        btnSearch = new JButton("Search");
        btnSearch.setBounds(360, 20, 100, 25);
        btnSearch.setBackground(Color.BLACK);
        btnSearch.setForeground(Color.WHITE);
        btnSearch.addActionListener(this);
        add(btnSearch);

        btnPrint = new JButton("Print Table");
        btnPrint.setBounds(480, 20, 110, 25);
        btnPrint.setBackground(Color.BLACK);
        btnPrint.setForeground(Color.WHITE);
        btnPrint.addActionListener(this);
        add(btnPrint);

        btnRefresh = new JButton("Show All");
        btnRefresh.setBounds(610, 20, 100, 25);
        btnRefresh.setBackground(Color.BLACK);
        btnRefresh.setForeground(Color.WHITE);
        btnRefresh.addActionListener(this);
        add(btnRefresh);

        btnBack = new JButton("Back");
        btnBack.setBounds(730, 20, 100, 25);
        btnBack.setBackground(Color.BLACK);
        btnBack.setForeground(Color.WHITE);
        btnBack.addActionListener(this);
        add(btnBack);

        // Table Setup
        String[] columns = {"ID", "Station Name", "City", "Connector", "Power (kW)", "Price/kWh", "Status"};
        model = new DefaultTableModel(columns, 0);
        table = new JTable(model);

        JScrollPane sp = new JScrollPane(table);
        sp.setBounds(30, 70, 920, 430);
        add(sp);

        loadTableData("");

        setSize(1000, 560);
        setLocation(200, 100);
        setVisible(true);
    }

    private void loadTableData(String cityFilter) {
        model.setRowCount(0);
        try {
            conn c = new conn();
            String query = "SELECT s.station_id, s.station_name, s.city, c.connector_type, c.power_kw, c.price_per_kwh, c.status " +
                    "FROM STATIONS s JOIN CHARGERS c ON s.station_id = c.station_id";

            if (cityFilter != null && !cityFilter.trim().isEmpty()) {
                query += " WHERE LOWER(s.city) LIKE '%" + cityFilter.trim().toLowerCase() + "%'";
            }
            query += " ORDER BY s.station_id ASC, c.power_kw DESC";

            ResultSet rs = c.statement.executeQuery(query);
            while (rs.next()) {
                model.addRow(new Object[]{
                    rs.getInt("station_id"),
                    rs.getString("station_name"),
                    rs.getString("city"),
                    rs.getString("connector_type"),
                    rs.getDouble("power_kw") + " kW",
                    "$" + rs.getDouble("price_per_kwh"),
                    rs.getString("status")
                });
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == btnSearch) {
            loadTableData(tSearchCity.getText().trim());
        } else if (e.getSource() == btnRefresh) {
            tSearchCity.setText("");
            loadTableData("");
        } else if (e.getSource() == btnPrint) {
            try {
                table.print();
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        } else if (e.getSource() == btnBack) {
            setVisible(false);
            new Main_class();
        }
    }

    public static void main(String[] args) {
        new ViewStations();
    }
}
