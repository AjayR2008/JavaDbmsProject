import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Station, Charger } from '../types';
import {
  Printer,
  Download,
  Search,
  Zap,
  CalendarCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers
} from 'lucide-react';

interface StationsCatalogViewProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPrintReport: (cityFilter: string) => void;
}

interface CatalogRow {
  station: Station;
  charger: Charger | null;
}

export const StationsCatalogView: React.FC<StationsCatalogViewProps> = ({
  onNavigate,
  onOpenPrintReport
}) => {
  const { stations, chargers, canUpdateCharger } = useDatabase();
  const [cityFilter, setCityFilter] = useState('');

  // Flatten stations + chargers (SQL JOIN equivalent)
  const rows: CatalogRow[] = stations.flatMap((station): CatalogRow[] => {
    const stationChargers = chargers.filter(c => c.station_id === station.station_id);
    if (stationChargers.length === 0) {
      return [
        {
          station,
          charger: null
        }
      ];
    }
    return stationChargers.map(charger => ({
      station,
      charger
    }));
  });

  const filteredRows: CatalogRow[] = rows.filter(r => {
    if (!cityFilter.trim()) return true;
    return r.station.city.toLowerCase().includes(cityFilter.toLowerCase().trim());
  });

  const exportCsv = () => {
    const header = 'Station ID,Station Name,City,Opening Time,Closing Time,Bay ID,Connector Type,Power (kW),Tariff (Rs per kWh),Status\n';
    const csvContent = filteredRows
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#062817] flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              📍 Stations &amp; Charger Bays Catalog (SQL JOIN View)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live relational join across <code className="font-mono text-slate-700 bg-slate-200 px-1 py-0.5 rounded text-[11px]">stations</code> and <code className="font-mono text-slate-700 bg-slate-200 px-1 py-0.5 rounded text-[11px]">chargers</code> tables
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by City..."
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
              />
            </div>

            {cityFilter && (
              <button
                onClick={() => setCityFilter('')}
                className="px-2 py-1.5 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md transition"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => onOpenPrintReport(cityFilter)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-[#062817] hover:bg-[#041c10] text-white shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#a3e635]" />
              Official Report
            </button>

            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Stn ID</th>
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3">Hours</th>
                <th className="py-2.5 px-3">Bay ID</th>
                <th className="py-2.5 px-3">Connector</th>
                <th className="py-2.5 px-3">Power</th>
                <th className="py-2.5 px-3">Tariff</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map(({ station, charger }, idx) => {
                const statusColor = charger
                  ? {
                      AVAILABLE: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
                      OCCUPIED: 'bg-rose-100 text-rose-800 border border-rose-200',
                      MAINTENANCE: 'bg-amber-100 text-amber-800 border border-amber-200'
                    }[charger.status]
                  : 'bg-slate-100 text-slate-600';

                return (
                  <tr key={`${station.station_id}-${charger ? charger.charger_id : idx}`} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">#{station.station_id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>{station.station_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{station.address}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{station.city}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {station.opening_time} - {station.closing_time}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                      {charger ? `Bay ${charger.charger_id}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {charger ? charger.connector_type : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-mono">
                      {charger ? `${charger.power_kw} kW` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-mono">
                      {charger ? `Rs. ${charger.price_per_kwh.toFixed(2)}/kWh` : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      {charger ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor}`}>
                          {charger.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">No bays</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {charger && charger.status === 'AVAILABLE' && (
                        <button
                          onClick={() => onNavigate('book', { preselectedChargerId: charger.charger_id })}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300 transition mr-1.5"
                        >
                          <CalendarCheck className="w-3 h-3" /> Reserve
                        </button>
                      )}

                      {charger && canUpdateCharger && (
                        <button
                          onClick={() => onNavigate('update-charger', { preselectedChargerId: charger.charger_id })}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition"
                          title="Update bay telemetry"
                        >
                          <Sliders className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No charging stations or bays match your city search "{cityFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2">
          <div>
            Showing <strong>{filteredRows.length}</strong> bay records across <strong>{stations.length}</strong> operational stations.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Available:{' '}
              {chargers.filter(c => c.status === 'AVAILABLE').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Occupied:{' '}
              {chargers.filter(c => c.status === 'OCCUPIED').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Maintenance:{' '}
              {chargers.filter(c => c.status === 'MAINTENANCE').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
