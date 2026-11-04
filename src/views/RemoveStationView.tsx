import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { AccessDeniedCard } from '../components/AccessDeniedCard';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RemoveStationViewProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const RemoveStationView: React.FC<RemoveStationViewProps> = ({ onNavigate }) => {
  const { stations, chargers, currentUser, canRemoveStation, removeStation } = useDatabase();

  const [selectedStationId, setSelectedStationId] = useState<number>(
    stations.length > 0 ? stations[0].station_id : 1
  );

  if (!canRemoveStation) {
    return (
      <AccessDeniedCard
        requiredRole="ADMIN"
        actionName="decommission or delete charging stations"
        sqlCommand="DELETE FROM stations (CASCADE)"
        onNavigate={onNavigate}
      />
    );
  }

  const selectedStation = stations.find(s => s.station_id === selectedStationId);
  const dependentBays = chargers.filter(c => c.station_id === selectedStationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !window.confirm(
        `Confirm permanent decommissioning of Station #${selectedStationId} (${selectedStation?.station_name})? This will CASCADE DELETE ${dependentBays.length} connected charger bays.`
      )
    ) {
      return;
    }

    const res = removeStation(selectedStationId);
    if (res.success) {
      onNavigate('stations', { flash: { text: res.message, type: 'success' } });
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-red-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 to-slate-900 text-white border-b border-red-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              🗑️ Decommission Station (CASCADE DELETE)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Demonstrates Foreign Key Referential Integrity &amp; Cascade Deletion in Relational DBMS
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-red-900/60 text-red-300 border border-red-700 uppercase tracking-wider">
            ADMIN SUPERUSER PRIVILEGE
          </span>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Demonstrates Foreign Key Referential Integrity and <strong>CASCADE DELETE</strong> in relational databases.
              Removing a station automatically cascades to delete all connected bays from table <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">chargers</code> and associated reservations from <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">bookings</code>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Station to Decommission:
            </label>
            <select
              value={selectedStationId}
              onChange={e => setSelectedStationId(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
            >
              {stations.map(s => {
                const bayCount = chargers.filter(c => c.station_id === s.station_id).length;
                return (
                  <option key={s.station_id} value={s.station_id}>
                    Station #{s.station_id} &bull; {s.station_name} ({s.city}, {bayCount} bays)
                  </option>
                );
              })}
            </select>
          </div>

          {selectedStation && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <div className="text-slate-800 font-semibold">
                Target: {selectedStation.station_name} ({selectedStation.city})
              </div>
              <div className="text-slate-500">
                Address: {selectedStation.address}
              </div>
              <div className="text-red-700 font-medium">
                ⚠️ Will permanently delete {dependentBays.length} active charger bays connected to this facility.
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete Station from Relational Database
            </button>
            <button
              type="button"
              onClick={() => onNavigate('stations')}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
