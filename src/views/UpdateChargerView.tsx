import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { AccessDeniedCard } from '../components/AccessDeniedCard';
import { ChargerStatus } from '../types';
import { Sliders, Zap, CheckCircle2 } from 'lucide-react';

interface UpdateChargerViewProps {
  initialChargerId?: number;
  onNavigate: (tab: string, meta?: any) => void;
}

export const UpdateChargerView: React.FC<UpdateChargerViewProps> = ({
  initialChargerId,
  onNavigate
}) => {
  const { chargers, stations, currentUser, canUpdateCharger, updateCharger } = useDatabase();

  const [selectedChargerId, setSelectedChargerId] = useState<number>(initialChargerId || 1);
  const currentCharger = chargers.find(c => c.charger_id === selectedChargerId) || chargers[0];

  const [status, setStatus] = useState<ChargerStatus>(currentCharger?.status || 'AVAILABLE');
  const [powerKw, setPowerKw] = useState<string>(String(currentCharger?.power_kw || 60.0));
  const [pricePerKwh, setPricePerKwh] = useState<string>(String(currentCharger?.price_per_kwh || 18.5));

  // Sync fields when charger selection changes
  const handleSelectCharger = (id: number) => {
    setSelectedChargerId(id);
    const c = chargers.find(item => item.charger_id === id);
    if (c) {
      setStatus(c.status);
      setPowerKw(String(c.power_kw));
      setPricePerKwh(String(c.price_per_kwh));
    }
  };

  if (!canUpdateCharger) {
    return (
      <AccessDeniedCard
        requiredRole="ADMIN or OPERATOR"
        actionName="update charger telemetry, power, or tariffs"
        sqlCommand="UPDATE chargers SET status = ..."
        onNavigate={onNavigate}
      />
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = updateCharger({
      charger_id: selectedChargerId,
      status,
      power_kw: parseFloat(powerKw) || 50.0,
      price_per_kwh: parseFloat(pricePerKwh) || 15.0
    });

    if (res.success) {
      onNavigate('stations', { flash: { text: res.message, type: 'success' } });
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#062817] to-[#0b3d22] text-white border-b border-emerald-900 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#a3e635] flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              ⚙️ Update Charger Bay Telemetry Status (UPDATE CHARGERS)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Adjust operational availability states, power kW limits, and tariffs in real-time
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635] uppercase">
            Authorized as {currentUser.role}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Charger Bay to Update:
            </label>
            <select
              value={selectedChargerId}
              onChange={e => handleSelectCharger(Number(e.target.value))}
              className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {chargers.map(c => {
                const s = stations.find(st => st.station_id === c.station_id);
                return (
                  <option key={c.charger_id} value={c.charger_id}>
                    Bay #{c.charger_id} &bull; {s ? s.station_name : 'Station'} ({c.connector_type}, Current: {c.status}, {c.power_kw} kW)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Operational Status (ENUM):
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ChargerStatus)}
              className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="AVAILABLE">AVAILABLE (Free to book / Ready for session)</option>
              <option value="OCCUPIED">OCCUPIED (Active charging session in progress)</option>
              <option value="MAINTENANCE">MAINTENANCE (Offline for servicing &amp; diagnostics)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Power Output Rating (kW):
              </label>
              <input
                type="number"
                step="0.1"
                value={powerKw}
                onChange={e => setPowerKw(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tariff (Rs. per kWh):
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePerKwh}
                onChange={e => setPricePerKwh(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-md shadow transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Commit Telemetry Update
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
