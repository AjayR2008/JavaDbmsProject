import React from 'react';
import { useDatabase } from '../context/DatabaseContext';

export const Footer: React.FC = () => {
  const { currentUser } = useDatabase();

  return (
    <footer className="bg-[#062817] text-slate-400 py-4 px-6 text-center text-xs border-t border-[#14532d] mt-auto no-print">
      <div>
        EV Charging Station Availability System &bull; Enforcing{' '}
        <span className="text-[#a3e635] font-semibold">Strict Role-Based Access Control (RBAC)</span> in React & Relational DBMS.
      </div>
      <div className="mt-1 text-slate-500">
        Active Session: <strong className="text-slate-300">{currentUser.name} ({currentUser.role})</strong> &bull; Database: ev_charging_db (In-Memory ACID Engine with Local Persistence)
      </div>
    </footer>
  );
};
