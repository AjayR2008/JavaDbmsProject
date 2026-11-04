import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowRightLeft, User, Wrench } from 'lucide-react';

export const RolesMatrixView: React.FC = () => {
  const {
    currentUser,
    switchUser,
    canAddStation,
    canUpdateCharger,
    canRemoveStation,
    canAccessDbmsConsole
  } = useDatabase();

  const matrix = [
    {
      module: 'View Stations & Chargers',
      sql: 'SELECT with JOIN',
      user: '✅ PERMITTED',
      operator: '✅ PERMITTED',
      admin: '✅ PERMITTED',
      current: true
    },
    {
      module: 'Reserve Slot (Book Slot)',
      sql: 'INSERT INTO bookings + Overlap Check',
      user: '✅ PERMITTED',
      operator: '✅ PERMITTED',
      admin: '✅ PERMITTED',
      current: true
    },
    {
      module: 'View My Bookings',
      sql: 'SELECT FROM bookings WHERE user_id',
      user: '✅ PERMITTED (Own)',
      operator: '✅ PERMITTED (All)',
      admin: '✅ PERMITTED (All)',
      current: true
    },
    {
      module: 'Add New Charging Station',
      sql: 'INSERT INTO stations',
      user: '❌ DENIED (403)',
      operator: '✅ PERMITTED (Assigned)',
      admin: '✅ PERMITTED',
      current: canAddStation
    },
    {
      module: 'Update Charger Telemetry',
      sql: 'UPDATE chargers SET status=...',
      user: '❌ DENIED (403)',
      operator: '✅ PERMITTED',
      admin: '✅ PERMITTED',
      current: canUpdateCharger
    },
    {
      module: 'Decommission / Remove Station',
      sql: 'DELETE FROM stations (CASCADE)',
      user: '❌ DENIED (403)',
      operator: '❌ DENIED (403)',
      admin: '✅ PERMITTED',
      current: canRemoveStation
    },
    {
      module: 'Direct SQL Query Console',
      sql: 'Direct Database Query Execution',
      user: '❌ DENIED (403)',
      operator: '❌ DENIED (403)',
      admin: '✅ PERMITTED',
      current: canAccessDbmsConsole
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#062817] to-[#0b3d22] text-white border-b border-emerald-900 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#a3e635] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              🛡️ Role-Based Access Control (RBAC) Specification &amp; Live Verification
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Live enforcement matrix comparing authorization permissions across application and database layers
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635] uppercase">
            Current: {currentUser.role}
          </span>
        </div>

        {/* Matrix Table */}
        <div className="p-6">
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-5">
            In Database Management Systems, <strong>Role-Based Access Control (RBAC)</strong> ensures the principle of least privilege. The table below outlines each operation, its corresponding SQL execution command, and the authorized roles enforced at both the React UI layer and the relational storage layer.
          </p>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Application Module</th>
                  <th className="py-3 px-4">DBMS SQL Statement</th>
                  <th className="py-3 px-4">USER (Driver)</th>
                  <th className="py-3 px-4">OPERATOR (Station Mgr)</th>
                  <th className="py-3 px-4">ADMIN (Super Admin)</th>
                  <th className="py-3 px-4">Current Session ({currentUser.role})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrix.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">{row.module}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{row.sql}</code>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{row.user}</td>
                    <td className="py-3 px-4 font-semibold text-amber-700">{row.operator}</td>
                    <td className="py-3 px-4 font-semibold text-purple-700">{row.admin}</td>
                    <td className="py-3 px-4 font-bold">
                      {row.current ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ALLOWED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3 h-3 text-red-600" /> BLOCKED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instant Switch & Test Section */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
              🧪 Test &amp; Verify Roles in Real-Time:
            </h3>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => switchUser(4)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition"
              >
                <User className="w-3.5 h-3.5" /> 👤 Switch to USER (Elena Rostova)
              </button>
              <button
                onClick={() => switchUser(2)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-md bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
              >
                <Wrench className="w-3.5 h-3.5" /> 🔧 Switch to OPERATOR (Maya Lin)
              </button>
              <button
                onClick={() => switchUser(1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-md bg-[#062817] hover:bg-[#031b0f] text-white shadow-sm transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#a3e635]" /> 🛡️ Switch to ADMIN (Alex Vance)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
