package ev.charging.system;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.text.MessageFormat;

/**
 * View Stations & Chargers Table Module
 * Demonstrates JTable, SQL SELECT with JOIN, Filter/Search by City,
 * and Robust Print / File Export functionality.
 */
public class ViewStations extends JFrame implements ActionListener {
    JTable table;
    DefaultTableModel model;
    JTextField tSearchCity;
    JButton btnSearch, btnPrint, btnExport, btnRefresh, btnBack;

    public ViewStations() {
        getContentPane().setBackground(new Color(254, 202, 202)); // Soft red/coral theme like sample report
        setLayout(null);

        JLabel lblSearch = new JLabel("Search by City:");
        lblSearch.setBounds(30, 20, 110, 25);
        lblSearch.setFont(new Font("SAN_SERIF", Font.BOLD, 13));
        add(lblSearch);

        tSearchCity = new JTextField();
        tSearchCity.setBounds(145, 20, 150, 25);
        add(tSearchCity);

        btnSearch = new JButton("Search");
        btnSearch.setBounds(305, 20, 85, 25);
        btnSearch.setBackground(Color.BLACK);
        btnSearch.setForeground(Color.WHITE);
        btnSearch.addActionListener(this);
        add(btnSearch);

        btnPrint = new JButton("Print Table");
        btnPrint.setBounds(400, 20, 105, 25);
        btnPrint.setBackground(new Color(5, 150, 105)); // Green
        btnPrint.setForeground(Color.WHITE);
        btnPrint.addActionListener(this);
        add(btnPrint);

        btnExport = new JButton("Export CSV");
        btnExport.setBounds(515, 20, 105, 25);
        btnExport.setBackground(new Color(30, 41, 59)); // Slate
        btnExport.setForeground(Color.WHITE);
        btnExport.addActionListener(this);
        add(btnExport);

        btnRefresh = new JButton("Show All");
        btnRefresh.setBounds(630, 20, 95, 25);
        btnRefresh.setBackground(Color.BLACK);
        btnRefresh.setForeground(Color.WHITE);
        btnRefresh.addActionListener(this);
        add(btnRefresh);

        btnBack = new JButton("Back");
        btnBack.setBounds(735, 20, 85, 25);
        btnBack.setBackground(Color.BLACK);
        btnBack.setForeground(Color.WHITE);
        btnBack.addActionListener(this);
        add(btnBack);

        // Table Setup
        String[] columns = {"ID", "Station Name", "City", "Connector", "Power (kW)", "Price/kWh", "Status"};
        model = new DefaultTableModel(columns, 0);
        table = new JTable(model);

        JScrollPane sp = new JScrollPane(table);
        sp.setBounds(30, 65, 920, 435);
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
                    "Rs. " + rs.getDouble("price_per_kwh"),
                    rs.getString("status")
                });
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private String exportTableToCSV() {
        try {
            File file = new File("EV_Stations_Report.csv");
            try (PrintWriter pw = new PrintWriter(file)) {
                // Header
                for (int i = 0; i < model.getColumnCount(); i++) {
                    pw.print(model.getColumnName(i) + (i < model.getColumnCount() - 1 ? "," : "\n"));
                }
                // Rows
                for (int r = 0; r < model.getRowCount(); r++) {
                    for (int c = 0; c < model.getColumnCount(); c++) {
                        Object val = model.getValueAt(r, c);
                        String s = val == null ? "" : val.toString().replace(",", " ");
                        pw.print(s + (c < model.getColumnCount() - 1 ? "," : "\n"));
                    }
                }
            }
            return file.getAbsolutePath();
        } catch (Exception e) {
            return "Export failed: " + e.getMessage();
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
                MessageFormat header = new MessageFormat("EV Charging Station Availability Report - Dept of IT");
                MessageFormat footer = new MessageFormat("Page {0,number,integer} - Autonomous Database Telemetry");
                boolean complete = table.print(JTable.PrintMode.FIT_WIDTH, header, footer);
                if (complete) {
                    JOptionPane.showMessageDialog(this, 
                        "Printing Completed Successfully!", 
                        "Print Status", JOptionPane.INFORMATION_MESSAGE);
                } else {
                    JOptionPane.showMessageDialog(this, 
                        "Printing job was cancelled by user.", 
                        "Print Status", JOptionPane.WARNING_MESSAGE);
                }
            } catch (Exception ex) {
                // Printer driver / hardware not configured -> Fallback to CSV report file
                String savedPath = exportTableToCSV();
                JOptionPane.showMessageDialog(this,
                    "Physical Printer Not Detected (" + ex.getMessage() + ").\n\n" +
                    "A printable table report file has been generated instead at:\n" + savedPath,
                    "Print to File Fallback", JOptionPane.INFORMATION_MESSAGE);
            }
        } else if (e.getSource() == btnExport) {
            String path = exportTableToCSV();
            JOptionPane.showMessageDialog(this, 
                "Report successfully exported as CSV!\nFile location:\n" + path, 
                "CSV Export Success", JOptionPane.INFORMATION_MESSAGE);
        } else if (e.getSource() == btnBack) {
            setVisible(false);
            new Main_class();
        }
    }

    public static void main(String[] args) {
        new ViewStations();
    }
}
