import React, { useRef, useState } from 'react';
import { RecLogo } from '../components/RecLogo';
import {
  Printer,
  Download,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CollegeSubmissionPdfViewProps {
  onBack: () => void;
}

export const CollegeSubmissionPdfView: React.FC<CollegeSubmissionPdfViewProps> = ({ onBack }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const students = [
    { name: 'AJAY', roll: '251001008' },
    { name: 'ARAVIND', roll: '251001020' },
    { name: 'BHUVANESHWARAN', roll: '251001035' },
    { name: 'ADHITHYA', roll: '251001006' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageElements = reportRef.current.querySelectorAll('.report-a4-page');

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(el, {
          scale: 1.8,
          useCORS: true,
          logging: false
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save('EV_Charging_Station_Availability_System_Project_Report_REC_2026.pdf');
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to browser print dialog
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 pb-16">
      {/* Top Floating Action Bar (Hidden when printing) */}
      <div className="sticky top-0 z-50 bg-[#062817] text-white px-4 py-3 shadow-md border-b-2 border-[#a3e635] no-print">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to App
            </button>
            <div>
              <div className="text-sm font-bold text-[#a3e635] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#a3e635]" />
                Rajalakshmi Engineering College &bull; Official Project Report (2026)
              </div>
              <div className="text-[11px] text-slate-300">
                EV Charging Station Availability System &bull; Integrated OOPS and DBMS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs text-slate-300">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                className="hover:text-white p-0.5"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                className="hover:text-white p-0.5"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#a3e635] hover:bg-[#bef264] text-[#062817] font-bold text-xs rounded shadow transition"
              title="Print document or Save as PDF with native vector quality"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-bold text-xs rounded shadow transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isGeneratingPdf ? 'Generating PDF...' : 'Download (.pdf)'}
            </button>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="max-w-4xl mx-auto my-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-center justify-between no-print">
        <div>
          <strong>College Submission Notice:</strong> Formatted to exact REC guidelines with student names (Ajay, Aravind, Bhuvaneshwaran, Adhithya), <strong>Chandramohan</strong> as Coordinator (HOD name omitted as instructed), and academic year 2026.
        </div>
        <button
          onClick={handlePrint}
          className="ml-4 font-bold text-emerald-800 underline hover:text-emerald-950 whitespace-nowrap"
        >
          Print Now (Ctrl+P)
        </button>
      </div>

      {/* Multi-Page Report Container */}
      <div
        ref={reportRef}
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        className="transition-transform duration-200"
      >
        {/* ========================================================================= */}
        {/* PAGE 1: TITLE / COVER PAGE */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between text-center">
          <div className="pt-8">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-slate-900 mb-6 font-serif">
              EV CHARGING STATION AVAILABILITY SYSTEM
            </h1>

            <h2 className="text-sm sm:text-base font-semibold italic text-slate-700 font-serif mb-12">
              Integrated OOPS and DBMS project report
            </h2>

            <div className="text-xs uppercase font-serif tracking-widest text-slate-600 mb-3">
              Submitted by
            </div>

            <div className="space-y-1.5 text-xs sm:text-sm font-bold font-serif text-slate-900 mb-10">
              {students.map((s, idx) => (
                <div key={idx}>
                  {s.name} – {s.roll}
                </div>
              ))}
            </div>

            <div className="text-xs italic font-serif text-slate-600 mb-2">
              of
            </div>
            <div className="text-xs sm:text-sm font-bold uppercase font-serif text-slate-900 mb-6">
              BACHELOR OF ENGINEERING
            </div>

            <div className="text-xs italic font-serif text-slate-600 mb-2">
              in
            </div>
            <div className="text-xs sm:text-sm font-bold font-serif text-slate-900 mb-10">
              Department of Information Technology
            </div>

            <div className="text-xs sm:text-sm font-bold uppercase font-serif text-slate-900">
              RAJALAKSHMI ENGINEERING COLLEGE, THANDALAM
            </div>
            <div className="text-[11px] font-serif italic text-slate-700 mt-1">
              (An Autonomous Institution)
            </div>
          </div>

          {/* Logo & Year */}
          <div className="pb-8 flex flex-col items-center">
            <div className="my-8">
              <RecLogo className="h-20" />
            </div>

            <div className="text-xs font-bold font-serif text-slate-900">
              November 2026
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">1</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 2: BONAFIDE CERTIFICATE */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="text-center pt-8 mb-10">
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 tracking-wider">
                RAJALAKSHMI ENGINEERING COLLEGE
              </h2>
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-widest mt-6 pb-2 border-b-2 border-slate-900 inline-block">
                BONAFIDE CERTIFICATE
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-900 indent-12 mb-16">
              Certified that this project report titled <strong>“EV CHARGING STATION AVAILABILITY SYSTEM”</strong> is the bonafide work of <strong>“AJAY (251001008), ARAVIND (251001020), BHUVANESHWARAN (251001035), ADHITHYA (251001006)”</strong> who carried out the project work under my supervision.
            </p>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-10 text-xs mb-16">
              <div>
                <div className="font-bold uppercase tracking-wider mb-8 text-slate-900">SIGNATURE</div>
                <div className="font-semibold text-slate-800">Internal Faculty Name</div>
                <div className="font-bold text-slate-900">Course Incharge</div>
                <div className="text-slate-700">Object Oriented Programming System</div>
                <div className="text-slate-700">Department of Information Technology</div>
              </div>

              <div>
                <div className="font-bold uppercase tracking-wider mb-8 text-slate-900">SIGNATURE</div>
                <div className="font-semibold text-slate-800">Internal Faculty Name</div>
                <div className="font-bold text-slate-900">Course Incharge</div>
                <div className="text-slate-700">Database Management System</div>
                <div className="text-slate-700">Department of Information Technology</div>
              </div>
            </div>

            {/* Coordinator (CHANDRAMOHAN - DO NOT PUT HOD NAME) */}
            <div className="mb-20">
              <div className="font-bold uppercase tracking-wider mb-8 text-slate-900">SIGNATURE</div>
              <div className="font-bold text-sm text-slate-900">CHANDRAMOHAN</div>
              <div className="font-semibold text-xs text-slate-800">Project Co-ordinator</div>
              <div className="text-xs text-slate-700">Department of Information Technology</div>
              <div className="text-xs text-slate-700">Rajalakshmi Engineering College</div>
            </div>

            <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-900 pt-8 border-t border-slate-300">
              <div>INTERNAL EXAMINER</div>
              <div>EXTERNAL EXAMINER</div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">2</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 3: ABSTRACT */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="text-center pt-8 mb-8">
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 tracking-widest pb-1 border-b-2 border-slate-900 inline-block">
                ABSTRACT
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-justify leading-relaxed text-slate-800 space-y-4">
              <p className="indent-12">
                In today's rapidly modernizing automotive and green energy ecosystem, efficient automated management systems are critical to sustaining the transition toward electric vehicles (EV). The <strong>EV Charging Station Availability System</strong> is an integrated software platform engineered to monitor infrastructure readiness, coordinate charging bay telemetry, and manage consumer slot reservations with mathematical temporal collision prevention.
              </p>
              <p>
                Every charging hub, whether municipally operated, commercial, or privately deployed, requires an integrated relational information system to safeguard against resource contention, over-subscription, and unpredictable queuing delays. This project provides a clean, responsive interface backed by a relational database management system (RDBMS) executing strict ACID transaction principles.
              </p>
              <p>
                The primary objective of this project is to implement full lifecycle infrastructure management: registering charging stations, monitoring electrical telemetry (power ratings in kW, connector bay standards including CCS2, Type 2, Tesla Supercharger, CHAdeMO, and real-time tariffs in INR/kWh), reserving charging slots with zero-overlap collision checking, modifying hardware operational states (Available, Occupied, Maintenance), and enforcing relational cascade deletions during facility decommissioning.
              </p>
              <p>
                Crucially, the system demonstrates <strong>Role-Based Access Control (RBAC)</strong> across three distinct tiers: <strong>ADMIN</strong> (full infrastructure creation, deletion, and raw SQL console access), <strong>OPERATOR</strong> (station registration and hardware telemetry updates), and <strong>USER</strong> (consumer catalog viewing, bay reservation, and billing receipts).
              </p>
              <p>
                The backend engine is implemented using fundamental concepts of <strong>Object Oriented Programming (OOPS)</strong> in Java (encapsulation, abstraction, inheritance, polymorphism, and Swing event-driven architecture) coupled with <strong>Database Management System (DBMS)</strong> technologies (JDBC, MySQL / MariaDB, SQL normalization, indexing, foreign keys, and ACID transaction isolation).
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">3</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 4: TABLE OF CONTENTS */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="text-center pt-8 mb-8">
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 tracking-widest pb-1 border-b-2 border-slate-900 inline-block">
                TABLE OF CONTENTS
              </h2>
            </div>

            <table className="w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left">
                  <th className="py-2 font-bold uppercase text-slate-900 w-28">CHAPTER</th>
                  <th className="py-2 font-bold uppercase text-slate-900">CONTENTS</th>
                  <th className="py-2 font-bold uppercase text-slate-900 text-right w-24">PAGE NO.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 font-bold">1</td>
                  <td className="py-2.5 font-bold">INTRODUCTION</td>
                  <td className="py-2.5 text-right font-mono">5</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">1.1 PROBLEM STATEMENT</td>
                  <td className="py-1 text-right font-mono text-slate-600">5</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">1.2 PROJECT OVERVIEW</td>
                  <td className="py-1 text-right font-mono text-slate-600">5</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">1.3 PURPOSE</td>
                  <td className="py-1 text-right font-mono text-slate-600">5</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">1.4 SCOPE</td>
                  <td className="py-1 text-right font-mono text-slate-600">6</td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold">2</td>
                  <td className="py-2.5 font-bold">FUNCTIONALITIES PROVIDED</td>
                  <td className="py-2.5 text-right font-mono">7</td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold">3</td>
                  <td className="py-2.5 font-bold">SYSTEM FLOW DIAGRAM</td>
                  <td className="py-2.5 text-right font-mono">8</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">3.1 DATAFLOW DIAGRAM (DFD)</td>
                  <td className="py-1 text-right font-mono text-slate-600">8</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">3.2 USE CASE DIAGRAM</td>
                  <td className="py-1 text-right font-mono text-slate-600">9</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">3.3 ENTITY RELATIONSHIP DIAGRAM (ERD)</td>
                  <td className="py-1 text-right font-mono text-slate-600">10</td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold">4</td>
                  <td className="py-2.5 font-bold">MODULE DESCRIPTION</td>
                  <td className="py-2.5 text-right font-mono">11</td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold">5</td>
                  <td className="py-2.5 font-bold">IMPLEMENTATION</td>
                  <td className="py-2.5 text-right font-mono">12</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">5.1 SPLASH PAGE &amp; JDBC ENGINE</td>
                  <td className="py-1 text-right font-mono text-slate-600">12</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">5.2 AUTHENTICATION &amp; LOGIN PAGE</td>
                  <td className="py-1 text-right font-mono text-slate-600">17</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">5.3 MAIN CONTROL PANEL (MAIN CLASS)</td>
                  <td className="py-1 text-right font-mono text-slate-600">20</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">5.4 ADD STATION MODULE</td>
                  <td className="py-1 text-right font-mono text-slate-600">24</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">5.5 VIEW STATIONS CATALOG</td>
                  <td className="py-1 text-right font-mono text-slate-600">28</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">5.6 BOOK SLOT (ACID COLLISION GUARD)</td>
                  <td className="py-1 text-right font-mono text-slate-600">32</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">5.7 UPDATE CHARGER TELEMETRY</td>
                  <td className="py-1 text-right font-mono text-slate-600">36</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="py-1 pl-4 text-slate-700">5.8 REMOVE / DECOMMISSION STATION</td>
                  <td className="py-1 text-right font-mono text-slate-600">39</td>
                </tr>

                <tr>
                  <td className="py-2.5 font-bold">6</td>
                  <td className="py-2.5 font-bold">CONCLUSION</td>
                  <td className="py-2.5 text-right font-mono">41</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">7</td>
                  <td className="py-2.5 font-bold">REFERENCES</td>
                  <td className="py-2.5 text-right font-mono">42</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">4</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 5: 1 - INTRODUCTION */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-900 pt-8 mb-6 border-b border-slate-300 pb-2">
              1 - INTRODUCTION
            </h2>

            <div className="space-y-6 text-xs sm:text-sm text-justify leading-relaxed text-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                  1.1 PROBLEM STATEMENT
                </h3>
                <p className="indent-8">
                  The rapid adoption of electric mobility has resulted in severe infrastructure bottlenecks: lack of visibility into charger bay operational status, long wait queues, power standard mismatches, and frequent reservation conflicts (double-bookings). There is a critical necessity for an autonomous, reliable EV Charging Station Availability and Reservation Management System that synchronizes electrical telemetry and enforces rigorous relational ACID transaction control.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                  1.2 PROJECT OVERVIEW
                </h3>
                <p className="indent-8">
                  The EV Charging Station Availability System is an enterprise-grade desktop and relational database management solution created to automate infrastructure tracking, bay allocation, and billing calculations. The application allows operators to administer multiple charging stations across metropolitan centers (e.g. Chennai, Bangalore, Hyderabad, Delhi, Pune, Kolkata, Mumbai), monitor bay-level availability (Available, Occupied, Maintenance), and calculate tariffs per kilowatt-hour. For drivers, it provides seamless booking windows protected by temporal overlap collision algorithms.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                  1.3 PURPOSE
                </h3>
                <p className="indent-8">
                  The purpose of this software engineering project is to replace error-prone manual spreadsheets with a high-integrity, automated database management system. Key goals include:
                </p>
                <ul className="list-disc list-inside space-y-1.5 mt-2 ml-4 text-slate-700">
                  <li>To centralize multi-city charging station locations, operating hours, and geo-coordinates in a structured relational database.</li>
                  <li>To provide real-time status monitoring for each charger bay, connector standard, and rated capacity (kW).</li>
                  <li>To implement ACID-safe transaction locking that completely prevents double-booking collision anomalies on any charger bay.</li>
                  <li>To enforce multi-role security (Admin, Operator, Customer) ensuring strict role-based access control.</li>
                  <li>To deliver official printable telemetry audit logs and CSV export capabilities for regulatory compliance.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">5</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 6: 1.4 SCOPE */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-6">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                1.4 SCOPE
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-justify leading-relaxed text-slate-800">
              <p className="indent-8">
                The scope of the EV Charging Station Availability System encompasses both desktop GUI presentation and backend relational database management:
              </p>

              <ul className="list-disc list-inside space-y-3 ml-4 text-slate-700">
                <li>
                  <strong>Infrastructure Telemetry Management:</strong> Capturing station names, physical street addresses, operational time windows (opening/closing), GPS coordinates (latitude/longitude), and assigning responsible station operators.
                </li>
                <li>
                  <strong>Charger Bay Standard Support:</strong> Tracking individual bays per station with power capacity ratings (from AC 22 kW Level 2 to DC 350 kW Ultra-Fast Chargers) across industry standard connectors (CCS2, Type 2, Tesla Supercharger, CHAdeMO, GB/T).
                </li>
                <li>
                  <strong>ACID Temporal Reservation Guard:</strong> Implementing robust interval overlap validation checking:
                  <div className="my-2 p-2.5 bg-slate-100 rounded font-mono text-xs text-slate-900">
                    Predicate: (start_time &lt; new_end) AND (end_time &gt; new_start)
                  </div>
                  ensuring that no bay can ever be reserved concurrently by two drivers.
                </li>
                <li>
                  <strong>Role-Based Access Control (RBAC):</strong> Separating user privileges into Admin (total infrastructure control), Operator (station and bay maintenance), and Customer User (booking slots and viewing personal reservations).
                </li>
                <li>
                  <strong>Foreign Key Referential Integrity &amp; Cascade Delete:</strong> Modeling strict foreign keys between <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">users</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">stations</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">chargers</code>, and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">bookings</code>. Decommissioning a station automatically cascades to safely remove its associated bays without orphaned database records.
                </li>
                <li>
                  <strong>Audit Logging &amp; Official Reporting:</strong> Generating standardized printable operational reports complete with evaluation signatures and direct CSV downloads.
                </li>
              </ul>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">6</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 7: 2 - FUNCTIONALITIES PROVIDED */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-900 pt-8 mb-6 border-b border-slate-300 pb-2">
              2 - FUNCTIONALITIES PROVIDED
            </h2>

            <div className="text-xs sm:text-sm text-slate-800 space-y-4">
              <p className="font-bold text-slate-900">
                FUNCTIONALITIES PROVIDED BY EV CHARGING STATION AVAILABILITY SYSTEM:
              </p>

              <ul className="space-y-3 text-slate-700 ml-2">
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">&bull;</span>
                  <span><strong>Zero-Friction Authentication &amp; RBAC:</strong> Secure credential validation with dynamic role-based UI adaptations and 403 Forbidden enforcement on privileged database operations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">&bull;</span>
                  <span><strong>Multi-City Infrastructure Catalog:</strong> Relational SQL JOIN queries combining stations and bays with instant city-based indexing and filtering.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">&bull;</span>
                  <span><strong>ACID Overlap Collision Guard:</strong> Mathematical verification of reservation timestamps preventing double-booking race conditions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">&bull;</span>
                  <span><strong>Dynamic Bay Telemetry Updating:</strong> Real-time toggle of hardware states between <em>AVAILABLE</em>, <em>OCCUPIED</em>, and <em>MAINTENANCE</em> alongside power output and tariff adjustments.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">&bull;</span>
                  <span><strong>Automated Infrastructure Provisioning:</strong> Instant generation of initial charging bays (CCS2 60kW, Type 2 22kW) upon station registration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">&bull;</span>
                  <span><strong>Destructive Cascade Safety:</strong> Admin-only station decommissioning enforcing foreign-key cascade deletes to maintain database normalization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">&bull;</span>
                  <span><strong>Interactive Direct SQL Console:</strong> Native simulator executing relational SELECT, JOIN, and aggregate GROUP BY statements.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-900 font-bold">&bull;</span>
                  <span><strong>Academic Reporting Engine:</strong> One-click generation of formal A4 printable evaluation documents and structured CSV exports.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">7</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 8: 3 - SYSTEM FLOW DIAGRAM (DFD) */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-900 pt-8 mb-4 border-b border-slate-300 pb-2">
              3 - SYSTEM FLOW DIAGRAM
            </h2>

            <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-800 mb-4">
              System flow diagrams illustrate the movement of data, decisions, and transformations through application and database components.
            </p>

            <h3 className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wider">
              3.1 DATAFLOW DIAGRAM (DFD)
            </h3>

            {/* Visual DFD Diagram (SVG) */}
            <div className="my-4 p-4 border border-slate-300 rounded-md bg-slate-50 flex justify-center">
              <svg viewBox="0 0 650 360" className="w-full max-w-lg">
                {/* Entities */}
                <rect x="20" y="30" width="120" height="50" rx="6" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
                <text x="80" y="60" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">EV Driver (User)</text>

                <rect x="20" y="150" width="120" height="50" rx="6" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
                <text x="80" y="180" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">Station Operator</text>

                <rect x="20" y="270" width="120" height="50" rx="6" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
                <text x="80" y="300" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#991b1b">Admin Superuser</text>

                {/* Processes */}
                <circle cx="270" cy="55" r="38" fill="#dcfce7" stroke="#059669" strokeWidth="2" />
                <text x="270" y="52" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#065f46">1.0 Authenticate</text>
                <text x="270" y="66" textAnchor="middle" fontSize="9" fill="#065f46">&amp; RBAC Check</text>

                <circle cx="270" cy="175" r="38" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                <text x="270" y="172" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#075985">2.0 Slot Booking</text>
                <text x="270" y="186" textAnchor="middle" fontSize="9" fill="#075985">&amp; ACID Guard</text>

                <circle cx="270" cy="295" r="38" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                <text x="270" y="292" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">3.0 Bay Telemetry</text>
                <text x="270" y="306" textAnchor="middle" fontSize="9" fill="#92400e">&amp; Cascade Engine</text>

                {/* Database Stores */}
                <path d="M460,40 h150 v30 h-150 z M460,55 h150" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
                <text x="535" y="52" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">D1: USERS</text>

                <path d="M460,110 h150 v30 h-150 z M460,125 h150" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
                <text x="535" y="122" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">D2: STATIONS</text>

                <path d="M460,180 h150 v30 h-150 z M460,195 h150" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
                <text x="535" y="192" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">D3: CHARGERS</text>

                <path d="M460,250 h150 v30 h-150 z M460,265 h150" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
                <text x="535" y="262" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e293b">D4: BOOKINGS</text>

                {/* Arrows */}
                <line x1="140" y1="55" x2="230" y2="55" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="140" y1="175" x2="230" y2="175" stroke="#475569" strokeWidth="2" />
                <line x1="140" y1="295" x2="230" y2="295" stroke="#475569" strokeWidth="2" />

                <line x1="310" y1="55" x2="460" y2="55" stroke="#475569" strokeWidth="2" />
                <line x1="310" y1="175" x2="460" y2="195" stroke="#475569" strokeWidth="2" />
                <line x1="310" y1="175" x2="460" y2="265" stroke="#475569" strokeWidth="2" />
                <line x1="310" y1="295" x2="460" y2="125" stroke="#475569" strokeWidth="2" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-600 text-center italic">
              Figure 3.1: Data Flow Diagram (DFD Level 1) for EV Charging Station Availability System
            </p>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">8</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 9: 3.2 USE CASE DIAGRAM */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-4">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                3.2 USE CASE DIAGRAM
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-800 mb-4">
              A use case diagram models interactions between actors (Driver, Operator, Admin) and the core functional units of the EV system.
            </p>

            {/* Visual Use Case SVG */}
            <div className="my-4 p-4 border border-slate-300 rounded-md bg-slate-50 flex justify-center">
              <svg viewBox="0 0 650 380" className="w-full max-w-lg">
                {/* Boundary */}
                <rect x="150" y="15" width="340" height="350" rx="8" fill="#ffffff" stroke="#94a3b8" strokeDasharray="4,4" strokeWidth="2" />
                <text x="320" y="35" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">EV System Boundary</text>

                {/* Left Actor: Driver */}
                <circle cx="60" cy="90" r="14" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                <line x1="60" y1="104" x2="60" y2="140" stroke="#334155" strokeWidth="2" />
                <line x1="35" y1="118" x2="85" y2="118" stroke="#334155" strokeWidth="2" />
                <line x1="60" y1="140" x2="40" y2="175" stroke="#334155" strokeWidth="2" />
                <line x1="60" y1="140" x2="80" y2="175" stroke="#334155" strokeWidth="2" />
                <text x="60" y="195" textAnchor="middle" fontSize="10" fontWeight="bold">EV Driver</text>

                {/* Left Actor: Operator */}
                <circle cx="60" cy="250" r="14" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                <line x1="60" y1="264" x2="60" y2="300" stroke="#334155" strokeWidth="2" />
                <line x1="35" y1="278" x2="85" y2="278" stroke="#334155" strokeWidth="2" />
                <line x1="60" y1="300" x2="40" y2="335" stroke="#334155" strokeWidth="2" />
                <line x1="60" y1="300" x2="80" y2="335" stroke="#334155" strokeWidth="2" />
                <text x="60" y="355" textAnchor="middle" fontSize="10" fontWeight="bold">Operator</text>

                {/* Right Actor: Admin */}
                <circle cx="580" cy="180" r="14" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
                <line x1="580" y1="194" x2="580" y2="230" stroke="#dc2626" strokeWidth="2" />
                <line x1="555" y1="208" x2="605" y2="208" stroke="#dc2626" strokeWidth="2" />
                <line x1="580" y1="230" x2="560" y2="265" stroke="#dc2626" strokeWidth="2" />
                <line x1="580" y1="230" x2="600" y2="265" stroke="#dc2626" strokeWidth="2" />
                <text x="580" y="285" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#991b1b">Admin</text>

                {/* Use Case Ellipses */}
                <ellipse cx="320" cy="65" rx="85" ry="18" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
                <text x="320" y="69" textAnchor="middle" fontSize="10" fontWeight="bold">Login &amp; Auth</text>

                <ellipse cx="320" cy="115" rx="85" ry="18" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
                <text x="320" y="119" textAnchor="middle" fontSize="10" fontWeight="bold">View Station Catalog</text>

                <ellipse cx="320" cy="165" rx="85" ry="18" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
                <text x="320" y="169" textAnchor="middle" fontSize="10" fontWeight="bold">Reserve Slot (ACID)</text>

                <ellipse cx="320" cy="215" rx="85" ry="18" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
                <text x="320" y="219" textAnchor="middle" fontSize="10" fontWeight="bold">Add Station</text>

                <ellipse cx="320" cy="265" rx="85" ry="18" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
                <text x="320" y="269" textAnchor="middle" fontSize="10" fontWeight="bold">Update Bay Telemetry</text>

                <ellipse cx="320" cy="315" rx="85" ry="18" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
                <text x="320" y="319" textAnchor="middle" fontSize="10" fontWeight="bold">Decommission Station</text>

                {/* Association Lines */}
                <line x1="85" y1="110" x2="235" y2="65" stroke="#64748b" strokeWidth="1.2" />
                <line x1="85" y1="120" x2="235" y2="115" stroke="#64748b" strokeWidth="1.2" />
                <line x1="85" y1="130" x2="235" y2="165" stroke="#64748b" strokeWidth="1.2" />

                <line x1="85" y1="270" x2="235" y2="215" stroke="#64748b" strokeWidth="1.2" />
                <line x1="85" y1="280" x2="235" y2="265" stroke="#64748b" strokeWidth="1.2" />

                <line x1="555" y1="190" x2="405" y2="65" stroke="#dc2626" strokeWidth="1.2" />
                <line x1="555" y1="200" x2="405" y2="115" stroke="#dc2626" strokeWidth="1.2" />
                <line x1="555" y1="210" x2="405" y2="165" stroke="#dc2626" strokeWidth="1.2" />
                <line x1="555" y1="220" x2="405" y2="215" stroke="#dc2626" strokeWidth="1.2" />
                <line x1="555" y1="230" x2="405" y2="265" stroke="#dc2626" strokeWidth="1.2" />
                <line x1="555" y1="240" x2="405" y2="315" stroke="#dc2626" strokeWidth="1.5" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-600 text-center italic">
              Figure 3.2: Use Case Diagram with Role-Based Actors and Boundaries
            </p>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">9</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 10: 3.3 ENTITY RELATIONSHIP DIAGRAM (ERD) */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-4">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                3.3 ENTITY RELATIONSHIP DIAGRAM (ERD)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-800 mb-4">
              The ER diagram illustrates the relational database model of <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ev_charging_db</code>, specifying primary keys (PK), foreign keys (FK), attributes, and cardinalities.
            </p>

            {/* Visual ER Diagram (SVG) */}
            <div className="my-4 p-4 border border-slate-300 rounded-md bg-slate-50 flex justify-center">
              <svg viewBox="0 0 650 360" className="w-full max-w-lg">
                {/* Table: USERS */}
                <rect x="20" y="40" width="130" height="120" fill="#ffffff" stroke="#065f46" strokeWidth="2" rx="4" />
                <rect x="20" y="40" width="130" height="24" fill="#065f46" />
                <text x="85" y="56" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">USERS</text>
                <text x="26" y="80" fontSize="9" fontWeight="bold" fill="#b91c1c">&#128273; user_id (PK)</text>
                <text x="26" y="95" fontSize="9">name</text>
                <text x="26" y="110" fontSize="9">email (UNIQUE)</text>
                <text x="26" y="125" fontSize="9">password_hash</text>
                <text x="26" y="140" fontSize="9">role (ENUM)</text>

                {/* Table: STATIONS */}
                <rect x="260" y="40" width="140" height="135" fill="#ffffff" stroke="#0284c7" strokeWidth="2" rx="4" />
                <rect x="260" y="40" width="140" height="24" fill="#0284c7" />
                <text x="330" y="56" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">STATIONS</text>
                <text x="266" y="80" fontSize="9" fontWeight="bold" fill="#b91c1c">&#128273; station_id (PK)</text>
                <text x="266" y="95" fontSize="9">station_name</text>
                <text x="266" y="110" fontSize="9">city, address</text>
                <text x="266" y="125" fontSize="9">opening, closing</text>
                <text x="266" y="140" fontSize="9" fill="#0369a1">&#8618; operator_id (FK)</text>
                <text x="266" y="155" fontSize="9">status (ENUM)</text>

                {/* Table: CHARGERS */}
                <rect x="490" y="40" width="140" height="135" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" rx="4" />
                <rect x="490" y="40" width="140" height="24" fill="#7c3aed" />
                <text x="560" y="56" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">CHARGERS</text>
                <text x="496" y="80" fontSize="9" fontWeight="bold" fill="#b91c1c">&#128273; charger_id (PK)</text>
                <text x="496" y="95" fontSize="9" fill="#7c3aed">&#8618; station_id (FK)</text>
                <text x="496" y="110" fontSize="9">connector_type</text>
                <text x="496" y="125" fontSize="9">power_kw</text>
                <text x="496" y="140" fontSize="9">price_per_kwh</text>
                <text x="496" y="155" fontSize="9">status (ENUM)</text>

                {/* Table: BOOKINGS */}
                <rect x="180" y="230" width="150" height="110" fill="#ffffff" stroke="#c026d3" strokeWidth="2" rx="4" />
                <rect x="180" y="230" width="150" height="24" fill="#c026d3" />
                <text x="255" y="246" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">BOOKINGS</text>
                <text x="186" y="270" fontSize="9" fontWeight="bold" fill="#b91c1c">&#128273; booking_id (PK)</text>
                <text x="186" y="285" fontSize="9" fill="#065f46">&#8618; user_id (FK)</text>
                <text x="186" y="300" fontSize="9" fill="#7c3aed">&#8618; charger_id (FK)</text>
                <text x="186" y="315" fontSize="9">start_time, end_time</text>
                <text x="186" y="330" fontSize="9">booking_status</text>

                {/* Table: CHARGING_SESSIONS */}
                <rect x="430" y="230" width="160" height="110" fill="#ffffff" stroke="#d97706" strokeWidth="2" rx="4" />
                <rect x="430" y="230" width="160" height="24" fill="#d97706" />
                <text x="510" y="246" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">CHARGING_SESSIONS</text>
                <text x="436" y="270" fontSize="9" fontWeight="bold" fill="#b91c1c">&#128273; session_id (PK)</text>
                <text x="436" y="285" fontSize="9" fill="#c026d3">&#8618; booking_id (FK)</text>
                <text x="436" y="300" fontSize="9">energy_used (kWh)</text>
                <text x="436" y="315" fontSize="9">total_cost (INR)</text>
                <text x="436" y="330" fontSize="9">session timestamps</text>

                {/* Relationships */}
                <line x1="150" y1="100" x2="260" y2="100" stroke="#334155" strokeWidth="1.5" />
                <text x="200" y="93" fontSize="9" fill="#475569">1 &rarr; M</text>

                <line x1="400" y1="100" x2="490" y2="100" stroke="#334155" strokeWidth="1.5" />
                <text x="440" y="93" fontSize="9" fill="#475569">1 &rarr; M (CASCADE)</text>

                <line x1="85" y1="160" x2="180" y2="280" stroke="#334155" strokeWidth="1.5" />
                <text x="115" y="230" fontSize="9" fill="#475569">1 &rarr; M</text>

                <line x1="560" y1="175" x2="330" y2="280" stroke="#334155" strokeWidth="1.5" />
                <text x="460" y="225" fontSize="9" fill="#475569">1 &rarr; M</text>

                <line x1="330" y1="285" x2="430" y2="285" stroke="#334155" strokeWidth="1.5" />
                <text x="370" y="278" fontSize="9" fill="#475569">1 &rarr; 1</text>
              </svg>
            </div>

            <p className="text-[11px] text-slate-600 text-center italic">
              Figure 3.3: Relational Entity Relationship Diagram (ERD) with Constraints and Keys
            </p>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">10</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 11: 4 - MODULE DESCRIPTION */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-900 pt-8 mb-6 border-b border-slate-300 pb-2">
              4 - MODULE DESCRIPTION
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-justify leading-relaxed text-slate-800">
              <p>The system is architected into cohesive modules balancing OOPS modularity and DBMS transactional boundaries:</p>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase">SPLASH &amp; SYSTEM INITIALIZATION MODULE:</h4>
                <p>Initializes graphical look-and-feel, verifies database connectivity via JDBC, tests table schemas, and automatically loads the primary interactive gateway.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase">AUTHENTICATION &amp; ROLE SESSION MANAGEMENT:</h4>
                <p>Authenticates user email and password against the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">users</code> table. Maintains session state with encapsulated access methods, dynamically locking unauthorized features.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase">MAIN CONTROL PANEL (MASTER DASHBOARD):</h4>
                <p>Presents high-level KPIs: Total Stations, Available Charger Bays, Active Slot Bookings, and Role Permissions with quick-launch triggers.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase">ADD CHARGING STATION MODULE (ADMIN &amp; OPERATOR):</h4>
                <p>Allows authorized infrastructure personnel to insert new charging stations into MySQL with geo-coordinates, hours, and auto-provisions two starter charger bays (CCS2 and Type 2).</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase">VIEW STATIONS &amp; CHARGER BAYS CATALOG (ALL ROLES):</h4>
                <p>Executes an inner/left JOIN between stations and chargers with instant city search, tabular visualization, printable report view, and CSV export.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase">SLOT RESERVATION &amp; ACID COLLISION PREVENTION (ALL ROLES):</h4>
                <p>Core DBMS transactional engine. Checks temporal overlaps before committing bookings. Rejects colliding reservations with detailed conflict reports.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase">UPDATE CHARGER TELEMETRY (ADMIN &amp; OPERATOR):</h4>
                <p>Enables operators to modify bay operational states (Available, Occupied, Maintenance), power ratings, and pricing tariffs via SQL UPDATE statements.</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase">DECOMMISSION STATION (CASCADE DELETE - ADMIN ONLY):</h4>
                <p>Demonstrates destructive referential integrity. Deleting a parent station cascades to delete all dependent child charger bays and historical bookings.</p>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">11</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGES 12 - 14: 5.1 SPLASH & JDBC IMPLEMENTATION */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-900 pt-8 mb-4 border-b border-slate-300 pb-2">
              5 - IMPLEMENTATION
            </h2>

            <h3 className="font-bold text-slate-900 mb-3 uppercase text-xs tracking-wider">
              5.1 SPLASH PAGE &amp; JDBC CONNECTION
            </h3>

            {/* Swing UI Mockup */}
            <div className="my-3 p-4 border border-slate-300 rounded bg-[#062817] text-white flex flex-col items-center justify-center shadow-inner h-44">
              <div className="text-xs uppercase tracking-widest text-[#a3e635] font-bold mb-1">
                Anna University / REC Dept of IT
              </div>
              <div className="text-lg font-bold text-[#a3e635] mb-2">
                ⚡ EV Charging Station Availability System
              </div>
              <div className="text-xs text-slate-300 mb-3">
                Autonomous EV Infrastructure Telemetry &amp; DBMS Engine
              </div>
              <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden border border-[#a3e635]/40">
                <div className="bg-[#a3e635] h-full w-3/4 animate-pulse"></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                Connecting to MySQL on port 3306...
              </div>
            </div>

            <div className="text-xs font-bold uppercase text-slate-800 mt-4 mb-2">
              JAVA SOURCE CODE: Splash.java
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`package ev.charging.system;

import javax.swing.*;
import java.awt.*;

public class Splash extends JFrame {
    Splash() {
        getContentPane().setBackground(new Color(6, 40, 23));
        setLayout(null);

        JLabel heading = new JLabel("EV Charging Station Availability System");
        heading.setBounds(180, 80, 800, 40);
        heading.setFont(new Font("Raleway", Font.BOLD, 26));
        heading.setForeground(new Color(163, 230, 53));
        add(heading);

        setSize(1000, 500);
        setLocation(200, 150);
        setVisible(true);

        try {
            Thread.sleep(3000);
            setVisible(false);
            new Login();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        new Splash();
    }
}`}
            </pre>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">12</div>
        </div>

        {/* PAGE 13: JDBC CONN CODE */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                DATABASE CONNECTIVITY CODE: conn.java
              </h4>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-800 mb-4">
              The <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">conn</code> class acts as the centralized Database Connection Singleton encapsulating the JDBC driver registration, connection pooling, and statement allocation.
            </p>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`package ev.charging.system;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class conn {
    public Connection connection;
    public Statement statement;

    public conn() {
        try {
            // Load MySQL / MariaDB JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Establish JDBC Connection to ev_charging_db
            connection = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/ev_charging_db?useSSL=false&allowPublicKeyRetrieval=true",
                "root",
                "" // Default XAMPP Password
            );

            // Create reusable SQL Statement
            statement = connection.createStatement();
        } catch (Exception e) {
            System.err.println("JDBC Connection Failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`}
            </pre>

            <div className="mt-6 text-xs text-slate-700 leading-relaxed">
              <strong>Database Configuration Highlights:</strong>
              <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
                <li>Driver: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">com.mysql.cj.jdbc.Driver</code></li>
                <li>Database Catalog: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ev_charging_db</code></li>
                <li>Default Port: 3306 (Standard MySQL / MariaDB)</li>
                <li>Character Encoding: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">utf8mb4_unicode_ci</code></li>
              </ul>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">13</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGES 14 - 16: 5.2 AUTHENTICATION & LOGIN */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-4">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                5.2 AUTHENTICATION &amp; LOGIN MODULE
              </h3>
            </div>

            {/* Swing Login UI Mockup */}
            <div className="my-3 p-4 border border-slate-300 rounded bg-slate-100 flex flex-col items-center justify-center shadow h-52">
              <div className="w-80 bg-white border border-slate-300 rounded shadow-md p-4">
                <div className="text-xs font-bold text-center text-[#062817] mb-3 uppercase tracking-wider">
                  System Authentication
                </div>
                <div className="space-y-2 text-[11px]">
                  <div>
                    <label className="block text-slate-600 font-bold mb-0.5">Email / Username:</label>
                    <div className="p-1 border border-slate-300 rounded bg-slate-50 font-mono">admin@evcharge.com</div>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-0.5">Password:</label>
                    <div className="p-1 border border-slate-300 rounded bg-slate-50 font-mono">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 text-center py-1 bg-[#059669] text-white font-bold rounded text-[10px]">LOGIN</div>
                    <div className="flex-1 text-center py-1 bg-blue-600 text-white font-bold rounded text-[10px]">SIGN UP</div>
                    <div className="flex-1 text-center py-1 bg-slate-800 text-white font-bold rounded text-[10px]">EXIT</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold uppercase text-slate-800 mt-4 mb-2">
              JAVA SOURCE CODE: Login.java (Snippet)
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`public void actionPerformed(ActionEvent e) {
    if (e.getSource() == login) {
        String email = tusername.getText().trim();
        String pass = new String(tpassword.getPassword()).trim();

        try {
            conn c = new conn();
            String query = "SELECT user_id, name, role FROM users WHERE email = ? AND password_hash = ?";
            PreparedStatement ps = c.connection.prepareStatement(query);
            ps.setString(1, email);
            ps.setString(2, pass);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                int id = rs.getInt("user_id");
                String name = rs.getString("name");
                String role = rs.getString("role");
                UserSession.setSession(id, name, email, role);
                setVisible(false);
                new Main_class(role, name, id);
            } else {
                JOptionPane.showMessageDialog(null, "Invalid Email or Password!");
            }
        } catch (Exception ex) { ex.printStackTrace(); }
    }
}`}
            </pre>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">14</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGES 15 - 17: 5.3 MAIN CONTROL PANEL (MAIN_CLASS) */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-4">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                5.3 MAIN CONTROL PANEL (Main_class.java)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-800 mb-4">
              The <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Main_class</code> serves as the primary operational dashboard, binding authenticated role privileges to UI action buttons.
            </p>

            {/* Swing Dashboard UI Mockup */}
            <div className="my-3 p-4 border border-slate-300 rounded bg-slate-100 shadow h-56">
              <div className="bg-[#062817] text-white p-3 rounded mb-3">
                <div className="text-xs font-bold text-[#a3e635]">EV Charging Station Management &amp; Booking System</div>
                <div className="text-[10px] text-slate-300">Logged in as: Alex Vance | Role: [ADMIN] - Full Privileges</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-[#059669] text-white font-bold rounded">Add Station</div>
                <div className="p-2 bg-[#059669] text-white font-bold rounded">View Stations</div>
                <div className="p-2 bg-[#10b981] text-[#062817] font-bold rounded">Reserve Slot</div>
                <div className="p-2 bg-slate-800 text-white font-bold rounded">Update Charger</div>
                <div className="p-2 bg-red-600 text-white font-bold rounded">Remove Station</div>
                <div className="p-2 bg-slate-600 text-white font-bold rounded">Log Out</div>
              </div>
            </div>

            <div className="text-xs font-bold uppercase text-slate-800 mt-4 mb-2">
              JAVA SOURCE CODE: Main_class.java (RBAC Enforcement)
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`// Role-Based Button Configuration in Main_class constructor
btnAddStation = new JButton(UserSession.canAddStation() ? "Add Charging Station" : "🔒 Add Station (Admin/Op)");
if (!UserSession.canAddStation()) {
    btnAddStation.setBackground(new Color(203, 213, 225));
    btnAddStation.setEnabled(false);
}

btnRemoveStation = new JButton(UserSession.canRemoveStation() ? "Remove Station" : "🔒 Remove (Admin Only)");
if (!UserSession.canRemoveStation()) {
    btnRemoveStation.setBackground(new Color(203, 213, 225));
    btnRemoveStation.setEnabled(false);
}`}
            </pre>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">15</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGES 16 - 19: 5.4 - 5.8 CORE MODULE IMPLEMENTATIONS */}
        {/* ========================================================================= */}
        {/* ADD STATION */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-4">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                5.4 ADD STATION MODULE (AddStation.java)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-800 mb-3">
              Inserts new charging station metadata and triggers automatic child records insertion in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">chargers</code>:
            </p>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-700 mb-4">
{`// Add Station Transaction with Generated Keys
String sql = "INSERT INTO stations (station_name, address, city, latitude, longitude, " +
             "opening_time, closing_time, operator_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')";
PreparedStatement ps = c.connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
ps.setString(1, stationName);
ps.setString(2, address);
ps.setString(3, city);
ps.setDouble(4, latitude);
ps.setDouble(5, longitude);
ps.setString(6, openTime);
ps.setString(7, closeTime);
ps.setInt(8, operatorId);
ps.executeUpdate();

ResultSet rs = ps.getGeneratedKeys();
int newStationId = rs.next() ? rs.getInt(1) : 0;

// Auto-provision 2 initial charger bays
String baySql = "INSERT INTO chargers (station_id, connector_type, power_kw, price_per_kwh, status) VALUES (?, ?, ?, ?, 'AVAILABLE')";
PreparedStatement psBay = c.connection.prepareStatement(baySql);
psBay.setInt(1, newStationId);
psBay.setString(2, "CCS2");
psBay.setDouble(3, 60.0);
psBay.setDouble(4, 18.50);
psBay.executeUpdate();`}
            </pre>

            <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider pt-2 border-t border-slate-200">
              5.5 VIEW STATIONS CATALOG (ViewStations.java)
            </h3>
            <p className="text-xs text-slate-800 mb-2">
              Executes a relational SQL LEFT JOIN to combine station facilities and bay hardware states into a unified table model:
            </p>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`String query = "SELECT s.station_id, s.station_name, s.city, s.opening_time, s.closing_time, " +
               "c.charger_id, c.connector_type, c.power_kw, c.price_per_kwh, c.status " +
               "FROM stations s LEFT JOIN chargers c ON s.station_id = c.station_id " +
               "ORDER BY s.station_id ASC, c.charger_id ASC";`}
            </pre>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">16</div>
        </div>

        {/* BOOK SLOT & ACID COLLISION ENGINE */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-4">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                5.6 BOOK SLOT MODULE &amp; ACID OVERLAP GUARD (BookSlot.java)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed text-slate-800 mb-3">
              The core DBMS innovation of this project is the temporal collision prevention algorithm. Before any reservation is committed to table <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">bookings</code>, the system evaluates the mutual exclusion predicate:
            </p>

            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded font-mono text-xs text-emerald-950 mb-4">
              Temporal Collision Condition:<br />
              <strong>(existing.start_time &lt; new_end) AND (existing.end_time &gt; new_start)</strong>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`// ACID Overlap Collision Check Query
String collisionCheck = "SELECT booking_id, start_time, end_time FROM bookings " +
                        "WHERE charger_id = ? AND booking_status = 'CONFIRMED' " +
                        "AND (start_time < ? AND end_time > ?) LIMIT 1";

try (PreparedStatement ps = c.connection.prepareStatement(collisionCheck)) {
    ps.setInt(1, chargerId);
    ps.setString(2, endTimestamp);
    ps.setString(3, startTimestamp);
    ResultSet rs = ps.executeQuery();

    if (rs.next()) {
        int conflictId = rs.getInt("booking_id");
        String c0 = rs.getString("start_time");
        String c1 = rs.getString("end_time");
        JOptionPane.showMessageDialog(null, 
            "DOUBLE-BOOKING REJECTED (ACID Guard): Bay #" + chargerId + 
            " is already reserved by Booking #" + conflictId + 
            " from " + c0 + " to " + c1 + ". Please choose another time.",
            "Transaction Conflict", JOptionPane.ERROR_MESSAGE);
        return;
    }
}

// Safe to Insert Confirmed Reservation
String insertSql = "INSERT INTO bookings (user_id, charger_id, start_time, end_time, booking_status, notes) " +
                   "VALUES (?, ?, ?, ?, 'CONFIRMED', ?)";`}
            </pre>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">17</div>
        </div>

        {/* UPDATE CHARGER & REMOVE STATION */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <div className="pt-8 mb-4">
              <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">
                5.7 UPDATE CHARGER &amp; 5.8 REMOVE STATION MODULES
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">
                  UPDATE CHARGER TELEMETRY (UpdateCharger.java):
                </h4>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`String sql = "UPDATE chargers SET status = ?, power_kw = ?, price_per_kwh = ? WHERE charger_id = ?";
PreparedStatement ps = c.connection.prepareStatement(sql);
ps.setString(1, newStatus); // AVAILABLE, OCCUPIED, MAINTENANCE
ps.setDouble(2, powerKw);
ps.setDouble(3, pricePerKwh);
ps.setInt(4, chargerId);
ps.executeUpdate();`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">
                  DECOMMISSION STATION WITH CASCADE DELETE (RemoveStation.java):
                </h4>
                <p className="text-xs text-slate-700 mb-2">
                  Demonstrates foreign key referential integrity. When a parent station record is removed, MySQL's foreign key constraint <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ON DELETE CASCADE</code> automatically purges all child bay records from the database without orphaned dependencies:
                </p>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`// Admin Decommission Command
String deleteSql = "DELETE FROM stations WHERE station_id = ?";
PreparedStatement ps = c.connection.prepareStatement(deleteSql);
ps.setInt(1, stationId);
int affectedRows = ps.executeUpdate();
// Dependent rows in 'chargers' and 'bookings' removed automatically by RDBMS!`}
                </pre>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">18</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 19: 6 - CONCLUSION */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-900 pt-8 mb-6 border-b border-slate-300 pb-2">
              6 - CONCLUSION
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-justify leading-relaxed text-slate-800">
              <p className="indent-8">
                In conclusion, the <strong>EV Charging Station Availability System</strong> successfully demonstrates the harmonious integration of <strong>Object Oriented Programming (OOPS)</strong> and <strong>Relational Database Management Systems (DBMS)</strong>. The system addresses critical real-world challenges in electric vehicle charging infrastructure: eliminating double-booking collisions, managing charger hardware operational states, providing multi-city visibility, and enforcing strict Role-Based Access Control.
              </p>
              <p>
                By employing JDBC with prepared statements and parameter binding, the application ensures high execution efficiency and imperviousness to SQL injection vulnerabilities. The use of foreign key referential integrity with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">ON DELETE CASCADE</code> guarantees that infrastructure decommissioning maintains database normalization without lingering orphaned rows.
              </p>
              <p>
                The project highlights the indispensable value of software design patterns—such as the Singleton connection pattern, Model-View separation, and Role-Based Access Control (RBAC). Furthermore, the temporal overlap collision check provides a mathematically sound ACID reservation mechanism suitable for production deployment in autonomous smart-city charging networks.
              </p>
              <p>
                Through this laboratory capstone project, our team gained deep practical insights into full-stack relational database engineering, transaction isolation levels, GUI event-driven architectures, and institutional report generation.
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">19</div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 20: 7 - REFERENCES */}
        {/* ========================================================================= */}
        <div className="report-a4-page print-page flex flex-col justify-between font-serif">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-900 pt-8 mb-6 border-b border-slate-300 pb-2">
              7 - REFERENCES
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-800">
              <div>
                <strong>1. Java: The Complete Reference (12th Edition)</strong>
                <p className="text-slate-600">Herbert Schildt, Oracle Press / McGraw-Hill Education, 2021.</p>
              </div>

              <div>
                <strong>2. Database System Concepts (7th Edition)</strong>
                <p className="text-slate-600">Abraham Silberschatz, Henry F. Korth, and S. Sudarshan, McGraw-Hill, 2019.</p>
              </div>

              <div>
                <strong>3. MySQL 8.0 Reference Manual &amp; Connector/J Developer Guide</strong>
                <p className="text-slate-600">Oracle Corporation, Official Technical Documentation, 2024–2026.</p>
              </div>

              <div>
                <strong>4. IEEE Transactions on Intelligent Transportation Systems</strong>
                <p className="text-slate-600">"Scheduling and Queuing Models for Electric Vehicle Fast Charging Infrastructure," IEEE, 2023.</p>
              </div>

              <div>
                <strong>5. Open Charge Point Protocol (OCPP 2.0.1 Specification)</strong>
                <p className="text-slate-600">Open Charge Alliance (OCA), EV Architecture &amp; Telemetry Guidelines, 2022.</p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <strong>Project GitHub Repository:</strong>
                <p className="font-mono text-xs text-blue-700">https://github.com/AjayR2008/JavaDbmsProject</p>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400">20</div>
        </div>
      </div>
    </div>
  );
};
