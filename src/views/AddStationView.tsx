import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { AccessDeniedCard } from '../components/AccessDeniedCard';
import { PlusCircle, ShieldCheck, MapPin } from 'lucide-react';

interface AddStationViewProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const AddStationView: React.FC<AddStationViewProps> = ({ onNavigate }) => {
  const { users, currentUser, canAddStation, isOperator, addStation } = useDatabase();

  const [stationName, setStationName] = useState('Ozone EV PowerHub');
  const [city, setCity] = useState('Coimbatore');
  const [address, setAddress] = useState('Avinashi Road, Near Tech Park, Peelamedu');
  const [openingTime, setOpeningTime] = useState('05:00');
  const [closingTime, setClosingTime] = useState('23:59');
  const [latitude, setLatitude] = useState('11.0168');
  const [longitude, setLongitude] = useState('76.9558');
  const [operatorId, setOperatorId] = useState<number>(
    isOperator ? currentUser.user_id : (users.find(u => u.role === 'OPERATOR')?.user_id || currentUser.user_id)
  );

  if (!canAddStation) {
    return (
      <AccessDeniedCard
        requiredRole="ADMIN or OPERATOR"
        actionName="add new charging stations"
        sqlCommand="INSERT INTO stations"
        onNavigate={onNavigate}
      />
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const res = addStation({
      station_name: stationName.trim(),
      city: city.trim(),
      address: address.trim(),
      opening_time: openingTime.trim(),
      closing_time: closingTime.trim(),
      latitude: parseFloat(latitude) || 11.0,
      longitude: parseFloat(longitude) || 77.0,
      operator_id: isOperator ? currentUser.user_id : operatorId
    });

    if (res.success) {
      onNavigate('stations', { flash: { text: res.message, type: 'success' } });
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#062817] to-[#0b3d22] text-white border-b border-emerald-900 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#a3e635] flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              ➕ Add New Charging Station (INSERT INTO STATIONS)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Registers new infrastructure node in MySQL and automatically assigns initial charger bays
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635] uppercase">
            Authorized as {currentUser.role}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Station Name:
              </label>
              <input
                type="text"
                value={stationName}
                onChange={e => setStationName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                City:
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Address / Landmark:
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Opening Time (HH:mm):
              </label>
              <input
                type="text"
                value={openingTime}
                onChange={e => setOpeningTime(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Closing Time (HH:mm):
              </label>
              <input
                type="text"
                value={closingTime}
                onChange={e => setClosingTime(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                GPS Latitude:
              </label>
              <input
                type="text"
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                GPS Longitude:
              </label>
              <input
                type="text"
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Assigned Station Operator (Foreign Key: users.user_id):
            </label>
            {isOperator ? (
              <div className="p-2.5 bg-slate-100 rounded-md border border-slate-300 text-xs text-slate-700 font-medium flex items-center justify-between">
                <span>{currentUser.name} (Operator ID #{currentUser.user_id})</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded uppercase">
                  Locked to your account
                </span>
              </div>
            ) : (
              <select
                value={operatorId}
                onChange={e => setOperatorId(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {users
                  .filter(u => u.role === 'OPERATOR' || u.role === 'ADMIN')
                  .map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      #{u.user_id} - {u.name} ({u.role} &bull; {u.email})
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-md shadow transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Save Station to Database
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
