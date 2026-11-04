import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  CalendarCheck,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';

interface BookSlotViewProps {
  initialChargerId?: number;
  onNavigate: (tab: string) => void;
}

export const BookSlotView: React.FC<BookSlotViewProps> = ({ initialChargerId, onNavigate }) => {
  const { users, stations, chargers, bookings, currentUser, isUser, bookSlot } = useDatabase();

  const [selectedUserId, setSelectedUserId] = useState<number>(currentUser.user_id);
  const [selectedChargerId, setSelectedChargerId] = useState<number>(initialChargerId || 1);
  const [date, setDate] = useState<string>('2026-11-04');
  const [startTime, setStartTime] = useState<string>('10:00:00');
  const [endTime, setEndTime] = useState<string>('11:30:00');
  const [notes, setNotes] = useState<string>('Hyundai Ioniq 5, Target 80% SoC');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Available chargers list
  const availableBays = chargers.map(c => {
    const station = stations.find(s => s.station_id === c.station_id);
    return {
      charger: c,
      stationName: station ? station.station_name : 'Station',
      city: station ? station.city : ''
    };
  });

  const selectedCharger = chargers.find(c => c.charger_id === selectedChargerId);
  const selectedStation = selectedCharger ? stations.find(s => s.station_id === selectedCharger.station_id) : null;

  // Bookings specifically for the currently selected bay
  const bayBookings = bookings.filter(b => b.charger_id === selectedChargerId && b.booking_status === 'CONFIRMED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const result = bookSlot({
      userId: isUser ? currentUser.user_id : selectedUserId,
      chargerId: selectedChargerId,
      date,
      startTime,
      endTime,
      notes
    });

    setStatusMsg({
      text: result.message,
      type: result.type
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Alert Result */}
      {statusMsg && (
        <div
          className={`p-4 rounded-lg text-sm border-l-4 shadow-sm flex items-start gap-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-500'
              : 'bg-rose-50 text-rose-900 border-rose-500 font-semibold'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">
              {statusMsg.type === 'success' ? 'ACID Transaction Committed' : 'ACID Temporal Collision Guard'}
            </div>
            <div className="mt-0.5 leading-relaxed">{statusMsg.text}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#062817] to-[#0b3d22] text-white border-b border-emerald-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#a3e635] flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" />
                Reserve EV Charging Bay (ACID Safe)
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Demonstrates Database ACID Properties, Overlap Collision Prevention &amp; Bay Reservation in Relational DBMS
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 bg-[#a3e635]/20 text-[#a3e635] text-xs font-bold px-2.5 py-1 rounded border border-[#a3e635]">
              <ShieldCheck className="w-3.5 h-3.5" /> Overlap Index Active
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* User Account */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Driver Account:
              </label>
              {isUser ? (
                <div className="p-2.5 bg-slate-100 rounded-md border border-slate-300 text-xs text-slate-700 font-medium flex items-center justify-between">
                  <span>{currentUser.name} ({currentUser.email})</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                    Locked to You
                  </span>
                </div>
              ) : (
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      #{u.user_id} - {u.name} ({u.role} - {u.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Select Charger Bay */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Select Bay &amp; Charger:
              </label>
              <select
                value={selectedChargerId}
                onChange={e => setSelectedChargerId(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {availableBays.map(({ charger, stationName, city }) => (
                  <option key={charger.charger_id} value={charger.charger_id}>
                    Bay #{charger.charger_id} - {stationName} ({city}) &bull; {charger.connector_type} ({charger.power_kw} kW) [{charger.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Bay Telemetry Card */}
          {selectedCharger && selectedStation && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md text-xs flex flex-wrap items-center justify-between gap-3 text-emerald-900">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>{selectedStation.station_name}</strong> &bull; Bay #{selectedCharger.charger_id} ({selectedCharger.connector_type})
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span>Power: <strong>{selectedCharger.power_kw} kW</strong></span>
                <span>Tariff: <strong>Rs. {selectedCharger.price_per_kwh}/kWh</strong></span>
                <span>Status: <strong className="uppercase">{selectedCharger.status}</strong></span>
              </div>
            </div>
          )}

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Reservation Date:
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Time (HH:mm:ss):
              </label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                placeholder="10:00:00"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                End Time (HH:mm:ss):
              </label>
              <input
                type="text"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                placeholder="11:30:00"
                required
              />
            </div>
          </div>

          {/* Vehicle Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Vehicle Details &amp; Notes:
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Tata Nexon EV, Target 90% SoC"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-md shadow transition flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              Confirm Reservation (Check Overlaps)
            </button>

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition"
            >
              Back to Dashboard
            </button>

            <button
              type="button"
              onClick={() => {
                // Test collision trigger: automatically set values that will conflict with an existing booking
                if (bayBookings.length > 0) {
                  const b = bayBookings[0];
                  const partsStart = b.start_time.split(' ');
                  const partsEnd = b.end_time.split(' ');
                  setDate(partsStart[0]);
                  setStartTime(partsStart[1]);
                  setEndTime(partsEnd[1]);
                }
              }}
              className="px-3 py-2 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition ml-auto"
              title="Auto-fill time with an existing booking to test the double-booking rejection guard"
            >
              🧪 Fill Conflicting Slot (Test Guard)
            </button>
          </div>
        </form>

        {/* Existing Confirmed Windows on this Bay */}
        <div className="p-5 bg-slate-50 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Existing Confirmed Windows for Bay #{selectedChargerId}:
          </h3>

          {bayBookings.length > 0 ? (
            <div className="space-y-1.5">
              {bayBookings.map(b => (
                <div
                  key={b.booking_id}
                  className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200 text-xs font-mono"
                >
                  <span className="text-slate-800">
                    Booking #{b.booking_id}: <strong>{b.start_time}</strong> &rarr; <strong>{b.end_time}</strong>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    ACID Guard Reserved
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No confirmed reservations found on Bay #{selectedChargerId}. All time windows are open!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
