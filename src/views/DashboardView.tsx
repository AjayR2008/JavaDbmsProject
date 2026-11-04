import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  MapPin,
  CalendarCheck,
  PlusCircle,
  Sliders,
  Trash2,
  Database,
  Shield,
  Zap,
  BatteryCharging,
  Layers,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  flashMsg?: { text: string; type: 'success' | 'error' | 'info' } | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, flashMsg }) => {
  const {
    stations,
    chargers,
    bookings,
    users,
    currentUser,
    canAddStation,
    canUpdateCharger,
    canRemoveStation,
    canAccessDbmsConsole,
    cancelBooking
  } = useDatabase();

  const totalStations = stations.length;
  const totalBays = chargers.length;
  const availableBays = chargers.filter(c => c.status === 'AVAILABLE').length;
  const activeBookings = bookings.filter(b => b.booking_status === 'CONFIRMED').length;

  const roleColor = {
    ADMIN: 'border-l-red-500 bg-red-50/40 text-red-700',
    OPERATOR: 'border-l-amber-500 bg-amber-50/40 text-amber-700',
    USER: 'border-l-emerald-500 bg-emerald-50/40 text-emerald-700'
  }[currentUser.role];

  const roleDesc = {
    ADMIN: 'Super Administrator - Full infrastructure, telemetry, user management & deletion rights',
    OPERATOR: 'Station Operator - Infrastructure monitoring, station registration & bay telemetry updates',
    USER: 'EV Customer / Driver - View station catalog, bay availability & reserve charging slots'
  }[currentUser.role];

  // Recent bookings: filter if USER, show all if OPERATOR or ADMIN
  const visibleBookings = (currentUser.role === 'USER'
    ? bookings.filter(b => b.user_id === currentUser.user_id)
    : bookings
  ).slice(0, 8);

  return (
    <div className="space-y-6">
      {flashMsg && (
        <div
          className={`p-3.5 rounded-md text-sm border-l-4 ${
            flashMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
              : flashMsg.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-500 font-semibold'
              : 'bg-blue-50 text-blue-800 border-blue-500'
          }`}
        >
          {flashMsg.text}
        </div>
      )}

      {/* College Submission Quick Banner */}
      <div className="bg-gradient-to-r from-[#5c1c72] via-[#4a165b] to-[#062817] text-white p-4 sm:p-5 rounded-lg shadow-md border-l-4 border-l-[#f5a623] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <h3 className="text-sm sm:text-base font-bold text-amber-300">
              Official College Project Report Ready for Submission (REC 2026)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-purple-950">
              Bonafide &bull; Verified
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">
            Formatted to Rajalakshmi Engineering College guidelines. Team: <strong>Ajay (251001008), Aravind (251001020), Bhuvaneshwaran (251001035), Adhithya (251001006)</strong> &bull; Co-ordinator: <strong>Chandramohan</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigate('college-pdf')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#a3e635] hover:bg-[#bef264] text-[#062817] font-extrabold text-xs rounded shadow transition whitespace-nowrap"
        >
          <span>📄 Open &amp; Download PDF</span>
          <span>&rarr;</span>
        </button>
      </div>

      {/* Role Status Banner */}
      <div className={`bg-white border border-slate-200 border-l-4 rounded-lg p-5 shadow-sm ${roleColor}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                Active Authenticated Account: <span className="text-[#062817]">{currentUser.name}</span>
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider bg-slate-900 text-white">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              {roleDesc}
            </p>
          </div>
          <button
            onClick={() => onNavigate('roles')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-md bg-[#059669] hover:bg-[#047857] text-white shadow-sm transition whitespace-nowrap"
          >
            <Shield className="w-4 h-4" /> Verify All Roles & Permissions
          </button>
        </div>
      </div>

      {/* Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 border-l-4 border-l-[#059669] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-[#062817]">{totalStations}</span>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Total Stations
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 border-l-4 border-l-[#10b981] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-emerald-600">
              {availableBays} <span className="text-sm font-normal text-slate-500">/ {totalBays}</span>
            </span>
            <BatteryCharging className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Available Charger Bays
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 border-l-4 border-l-indigo-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-indigo-700">{activeBookings}</span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Active Slot Bookings
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xl font-extrabold text-amber-700">{currentUser.role}</span>
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Security Privilege Level
          </div>
        </div>
      </div>

      {/* RBAC Action Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#062817] flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            🚀 RBAC Operations for [{currentUser.role}]
          </h2>
          <span className="text-xs text-slate-500">
            Enforced by Application Layer &amp; SQL Engine
          </span>
        </div>

        <div className="p-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('stations')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-md shadow-sm transition"
          >
            <MapPin className="w-3.5 h-3.5" /> View Stations Catalog
          </button>

          <button
            onClick={() => onNavigate('book')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#062817] hover:bg-[#031b0f] text-white text-xs font-bold rounded-md shadow-sm transition"
          >
            <CalendarCheck className="w-3.5 h-3.5" /> Reserve Charging Slot
          </button>

          {canAddStation ? (
            <button
              onClick={() => onNavigate('add-station')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-md border border-slate-300 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" /> Add Station
            </button>
          ) : (
            <button
              onClick={() => onNavigate('add-station')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-md border border-slate-200 opacity-70 hover:opacity-100 transition"
              title="Click to view 403 authorization requirement"
            >
              🔒 Add Station (Admin/Operator)
            </button>
          )}

          {canUpdateCharger ? (
            <button
              onClick={() => onNavigate('update-charger')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-md border border-slate-300 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" /> Update Charger Status
            </button>
          ) : (
            <button
              onClick={() => onNavigate('update-charger')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-md border border-slate-200 opacity-70 hover:opacity-100 transition"
              title="Click to view 403 authorization requirement"
            >
              🔒 Update Charger (Admin/Operator)
            </button>
          )}

          {canRemoveStation ? (
            <button
              onClick={() => onNavigate('remove-station')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-sm transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Decommission Station
            </button>
          ) : (
            <button
              onClick={() => onNavigate('remove-station')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-md border border-slate-200 opacity-70 hover:opacity-100 transition"
              title="Click to view 403 authorization requirement"
            >
              🔒 Decommission Station (Admin Only)
            </button>
          )}

          {canAccessDbmsConsole ? (
            <button
              onClick={() => onNavigate('dbms')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md shadow-sm transition"
            >
              <Database className="w-3.5 h-3.5 text-[#a3e635]" /> Direct SQL Console
            </button>
          ) : (
            <button
              onClick={() => onNavigate('dbms')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-md border border-slate-200 opacity-70 hover:opacity-100 transition"
              title="Click to view 403 authorization requirement"
            >
              🔒 Direct SQL Console (Admin Only)
            </button>
          )}
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#062817]">
            📋 Bookings in Relational Database ({currentUser.role === 'USER' ? `Filtered for You: ${currentUser.name}` : `System Wide View: ${currentUser.role}`})
          </h2>
          <button
            onClick={() => onNavigate('book')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            + Create New Slot Reservation
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-4">Booking ID</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Station</th>
                <th className="py-2.5 px-4">Bay #</th>
                <th className="py-2.5 px-4">Start Window</th>
                <th className="py-2.5 px-4">End Window</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Notes</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleBookings.map((b) => {
                const userObj = users.find(u => u.user_id === b.user_id);
                const chargerObj = chargers.find(c => c.charger_id === b.charger_id);
                const stationObj = stations.find(s => s.station_id === chargerObj?.station_id);

                return (
                  <tr key={b.booking_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">#{b.booking_id}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{userObj?.name || `User #${b.user_id}`}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-semibold">{stationObj?.station_name || 'Station'}</td>
                    <td className="py-2.5 px-4 text-slate-600">Bay {b.charger_id}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{b.start_time}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{b.end_time}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.booking_status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : b.booking_status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 truncate max-w-[180px]">{b.notes || '-'}</td>
                    <td className="py-2.5 px-4 text-right">
                      {b.booking_status === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Cancel reservation #${b.booking_id}?`)) {
                              cancelBooking(b.booking_id);
                            }
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visibleBookings.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
