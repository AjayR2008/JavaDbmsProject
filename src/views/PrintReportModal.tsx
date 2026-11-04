import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Station, Charger } from '../types';
import { Printer, Download, X } from 'lucide-react';

interface PrintReportModalProps {
  cityFilter: string;
  onClose: () => void;
}

interface ReportRow {
  station: Station;
  charger: Charger | null;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ cityFilter, onClose }) => {
  const { stations, chargers, currentUser } = useDatabase();

  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const rows: ReportRow[] = stations.flatMap((station): ReportRow[] => {
    const stationChargers = chargers.filter(c => c.station_id === station.station_id);
    if (stationChargers.length === 0) {
      return [{ station, charger: null }];
    }
    return stationChargers.map(charger => ({ station, charger }));
  });

  const filtered = rows.filter(r => {
    if (!cityFilter.trim()) return true;
    return r.station.city.toLowerCase().includes(cityFilter.toLowerCase().trim());
  });

  const availableCount = filtered.filter(r => r.charger?.status === 'AVAILABLE').length;

  const exportCsv = () => {
    const header = 'Station ID,Station Name,City,Opening Time,Closing Time,Bay ID,Connector Type,Power (kW),Tariff (Rs per kWh),Status\n';
    const csvContent = filtered
      .map(r => {
        const s = r.station;
        const c = r.charger;
        return [
          s.station_id,
          `"${s.station_name.replace(/"/g, '""')}"`,
          `"${s.city.replace(/"/g, '""')}"`,
          s.opening_time,
          s.closing_time,
          c ? c.charger_id : '',
          c ? `"${c.connector_type}"` : '',
          c ? c.power_kw : '',
          c ? c.price_per_kwh : '',
          c ? c.status : ''
        ].join(',');
      })
      .join('\n');

    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'EV_Stations_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="w-full max-w-4xl bg-[#062817] text-white p-3 rounded-t-lg border-b border-[#a3e635] flex items-center justify-between no-print shadow-lg">
        <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
          <Printer className="w-4 h-4 text-[#a3e635]" />
          <span>Official Printable Report View</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-[#a3e635] text-[#062817] text-xs font-bold rounded hover:bg-[#bef264] transition flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded hover:bg-emerald-600 transition flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 bg-slate-700 text-white text-xs font-bold rounded hover:bg-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Report Document */}
      <div className="w-full max-w-4xl bg-white text-slate-900 p-8 sm:p-10 rounded-b-lg shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Document Header */}
        <div className="text-center border-b-2 border-[#062817] pb-4 mb-6">
          <h1 className="text-base sm:text-lg font-extrabold text-[#062817] uppercase tracking-wider">
            Department of Information Technology &bull; Rajalakshmi Engineering College
          </h1>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            Autonomous EV Infrastructure Telemetry &amp; Charging Station Availability System
          </h2>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Relational Database Engine: MySQL 8.0 / MariaDB (Database: ev_charging_db)
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 border border-slate-200 p-3.5 rounded-md mb-6">
          <div>
            <strong>Document:</strong> Official Station Availability &amp; Charger Telemetry Log
          </div>
          <div>
            <strong>Generation Timestamp:</strong> {timestamp}
          </div>
          <div>
            <strong>Filter City Scope:</strong> {cityFilter.trim() ? cityFilter : 'All Operational Cities'}
          </div>
          <div>
            <strong>Report Generated By:</strong> {currentUser.name} (Role: {currentUser.role})
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs text-left border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px] tracking-wider border-b border-slate-300">
                <th className="p-2 border border-slate-300">Stn ID</th>
                <th className="p-2 border border-slate-300">Station Name</th>
                <th className="p-2 border border-slate-300">City</th>
                <th className="p-2 border border-slate-300">Hours</th>
                <th className="p-2 border border-slate-300">Bay ID</th>
                <th className="p-2 border border-slate-300">Connector</th>
                <th className="p-2 border border-slate-300">Power</th>
                <th className="p-2 border border-slate-300">Tariff (INR)</th>
                <th className="p-2 border border-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ station, charger }, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-2 border border-slate-200 font-mono">#{station.station_id}</td>
                  <td className="p-2 border border-slate-200 font-semibold">{station.station_name}</td>
                  <td className="p-2 border border-slate-200">{station.city}</td>
                  <td className="p-2 border border-slate-200 font-mono text-[11px]">
                    {station.opening_time} - {station.closing_time}
                  </td>
                  <td className="p-2 border border-slate-200 font-mono">
                    {charger ? `Bay ${charger.charger_id}` : '-'}
                  </td>
                  <td className="p-2 border border-slate-200">{charger ? charger.connector_type : '-'}</td>
                  <td className="p-2 border border-slate-200 font-mono">{charger ? `${charger.power_kw} kW` : '-'}</td>
                  <td className="p-2 border border-slate-200 font-mono">
                    {charger ? `Rs. ${charger.price_per_kwh.toFixed(2)}/kWh` : '-'}
                  </td>
                  <td className="p-2 border border-slate-200 font-bold text-[10px]">
                    {charger ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded ${
                          charger.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : charger.status === 'OCCUPIED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {charger.status}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Record Counts */}
        <div className="flex justify-between text-xs text-slate-600 font-medium mb-10">
          <div>
            <strong>Total Records Rendered:</strong> {filtered.length} bays
          </div>
          <div>
            <strong>Currently Available Bays:</strong> {availableCount}
          </div>
        </div>

        {/* Signature Box */}
        <div className="pt-6 border-t border-dashed border-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-700">
          <div>
            <div className="mb-8">Database Administrator:</div>
            <div className="border-b border-slate-400 w-44"></div>
          </div>
          <div>
            <div className="mb-8">Lab Evaluator / IT In-Charge:</div>
            <div className="border-b border-slate-400 w-44"></div>
          </div>
          <div>
            <div className="mb-8">Official Seal / Date:</div>
            <div className="border-b border-slate-400 w-44"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
