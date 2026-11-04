import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { AccessDeniedCard } from '../components/AccessDeniedCard';
import { Database, Play, Sparkles } from 'lucide-react';

interface SqlConsoleViewProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const SqlConsoleView: React.FC<SqlConsoleViewProps> = ({ onNavigate }) => {
  const { currentUser, canAccessDbmsConsole, executeSql } = useDatabase();

  const [query, setQuery] = useState(
    'SELECT s.station_name, s.city, COUNT(c.charger_id) as total_chargers, AVG(c.price_per_kwh) as avg_price FROM stations s JOIN chargers c ON s.station_id = c.station_id GROUP BY s.station_id'
  );

  const [result, setResult] = useState(() => executeSql(query));

  if (!canAccessDbmsConsole) {
    return (
      <AccessDeniedCard
        requiredRole="ADMIN"
        actionName="execute arbitrary SQL queries in the direct database console"
        sqlCommand="Direct JDBC / Relational Query Execution"
        onNavigate={onNavigate}
      />
    );
  }

  const handleRun = (sqlToRun?: string) => {
    const q = sqlToRun || query;
    const res = executeSql(q);
    setResult(res);
  };

  const presets = [
    {
      label: 'Stations & Average Tariffs (GROUP BY)',
      sql: 'SELECT s.station_name, s.city, COUNT(c.charger_id) as total_chargers, AVG(c.price_per_kwh) as avg_price FROM stations s JOIN chargers c ON s.station_id = c.station_id GROUP BY s.station_id'
    },
    {
      label: 'All Stations & Bays (JOIN)',
      sql: 'SELECT * FROM stations s JOIN chargers c ON s.station_id = c.station_id'
    },
    {
      label: 'Users & RBAC Credentials',
      sql: 'SELECT * FROM users'
    },
    {
      label: 'Slot Reservations (bookings)',
      sql: 'SELECT * FROM bookings'
    },
    {
      label: 'Charging Energy Sessions & Billing',
      sql: 'SELECT * FROM charging_sessions'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#062817] to-[#0b3d22] text-white border-b border-emerald-900 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#a3e635] flex items-center gap-2">
              <Database className="w-5 h-5" />
              💾 Direct SQL Query Console (Relational Statement Execution)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Interactive relational query processor simulating direct JDBC statement execution on ev_charging_db
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635] uppercase">
            ADMIN SUPERUSER
          </span>
        </div>

        {/* Query Input */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Enter SQL Query (SELECT statements):
              </label>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Presets:</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p.sql);
                    handleRun(p.sql);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full p-3 font-mono text-xs text-slate-900 bg-slate-900 text-emerald-300 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#a3e635]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRun()}
              className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-md shadow transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Execute SQL Query via Relational Engine
            </button>
          </div>

          {/* Result Set */}
          {result && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Query Result Set ({result.rowCount} rows):
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Engine: In-Memory Relational Emulator (ev_charging_db)
                </span>
              </div>

              {result.error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-semibold">
                  SQL Error: {result.error}
                </div>
              )}

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                      {result.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-3 font-mono">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70 transition">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-3 font-mono text-slate-800">
                            {val !== null ? String(val) : <span className="text-slate-400">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {result.rows.length === 0 && (
                      <tr>
                        <td colSpan={result.columns.length || 1} className="py-6 text-center text-slate-400">
                          Query executed successfully. 0 rows returned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
