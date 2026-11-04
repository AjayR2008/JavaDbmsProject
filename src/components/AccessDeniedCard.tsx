import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { ShieldAlert, UserCheck, ShieldCheck, Wrench } from 'lucide-react';

interface AccessDeniedCardProps {
  requiredRole: 'ADMIN' | 'OPERATOR' | 'ADMIN or OPERATOR';
  actionName: string;
  sqlCommand: string;
  onNavigate: (tab: string) => void;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  requiredRole,
  actionName,
  sqlCommand,
  onNavigate
}) => {
  const { currentUser, switchUser } = useDatabase();

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white border border-red-200 border-l-4 border-l-red-600 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h2 className="text-base font-bold text-red-800">🚫 Access Denied - 403 Forbidden</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">
          RBAC Policy Enforced
        </span>
      </div>

      <div className="p-6">
        <p className="text-base font-semibold text-slate-800 mb-2">
          Role <span className="text-red-600 font-bold">[{currentUser.role}]</span> is not authorized to {actionName}.
        </p>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          In the relational database schema, executing <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-xs">{sqlCommand}</code> is strictly restricted to <strong>{requiredRole}</strong> roles. Your current authenticated session as <strong>{currentUser.name}</strong> holds only consumer-level privileges.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            🧪 Instant Role Switch to Test This Feature:
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {requiredRole.includes('OPERATOR') && (
              <button
                onClick={() => switchUser(2)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-amber-600 text-white hover:bg-amber-700 transition"
              >
                <Wrench className="w-3.5 h-3.5" /> Switch to Operator (Maya Lin)
              </button>
            )}
            <button
              onClick={() => switchUser(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Switch to Admin (Alex Vance)
            </button>
            <button
              onClick={() => onNavigate('roles')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              <UserCheck className="w-3.5 h-3.5" /> View Role Matrix
            </button>
          </div>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
        >
          &larr; Return to Dashboard
        </button>
      </div>
    </div>
  );
};
