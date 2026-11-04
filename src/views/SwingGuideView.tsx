import React from 'react';
import { Terminal, Laptop, Database, CheckCircle2, Copy } from 'lucide-react';

export const SwingGuideView: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const commandText = `# 1. Navigate to Java source directory
cd ev-charging-station-availability-system/java_src

# 2. Compile all Java modules with MySQL Connector JAR
javac -cp ".:mysql-connector-j-26.10.0.jar" ev/charging/system/*.java

# 3. Run Splash Screen (Application Entry Point)
java -cp ".:mysql-connector-j-26.10.0.jar" ev.charging.system.Splash

# Or run Master Dashboard directly:
java -cp ".:mysql-connector-j-26.10.0.jar" ev.charging.system.Main_class`;

  const copyCode = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#062817] to-[#0b3d22] text-white border-b border-emerald-900 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#a3e635] flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              🖥️ Academic Desktop Java Swing GUI Execution Instructions
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Instructions for running the standalone Java Swing (.java) desktop GUI locally with XAMPP MySQL
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635] uppercase">
            Desktop Java / Swing
          </span>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            The project repository retains complete, standalone <strong>Java Swing (.java)</strong> source files designed for academic laboratory demonstration, evaluation, and local desktop execution with <strong>XAMPP MySQL / MariaDB</strong>.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-600" /> Step 1: Environment Prerequisites
              </h3>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 ml-2">
                <li>Install <strong>JDK 8, 11, 17, or 21</strong> (Oracle OpenJDK).</li>
                <li>Install <strong>XAMPP</strong> (starts MySQL on port 3306 with default username <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">root</code> and blank password).</li>
                <li>Execute <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">schema.sql</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">seed.sql</code> inside phpMyAdmin.</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" /> Step 2: Terminal Compilation &amp; Run Commands
                </h3>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Commands'}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-700">
                <pre>{commandText}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
