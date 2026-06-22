import React, { useState } from "react";
import { FileText, Download, Calendar, Users, Percent, CheckCircle, AlertTriangle, Printer, Sparkles } from "lucide-react";

interface StudentReport {
  rollNo: string;
  name: string;
  class: string;
  email: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

interface ReportsTabProps {
  reportsData: {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    latestDate: string;
    overallPercentage: number;
    totalHistoryDays: number;
    datesList: string[];
    studentReports: StudentReport[];
    recentActivity: any[];
  };
}

export default function ReportsTab({ reportsData }: ReportsTabProps) {
  const [filterPeriod, setFilterPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [reportSearch, setReportSearch] = useState("");

  // Filter students reports based on keywords
  const filteredReports = reportsData.studentReports.filter(r => {
    const term = reportSearch.toLowerCase().trim();
    if (term) {
      return (
        r.name.toLowerCase().includes(term) ||
        r.rollNo.toString().toLowerCase().includes(term) ||
        r.class.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Dynamic jsPDF downloader mechanism mimicking their legacy HTML prompt exactly!
  const handlePdfGeneration = () => {
    // 1. Dynamic Script check or append
    const download = () => {
      try {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();

        // Design PDF styles
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // #4F46E5 Brand Color
        doc.text("EduFlow AI Attendance Portal", 20, 24);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${new Date().toLocaleDateString()} — School Administration Hub`, 20, 32);
        doc.line(20, 36, 190, 36);

        // Core stats
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text("Operational Summary Measures", 20, 46);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Total Pupils Tracked: ${reportsData.totalStudents}`, 20, 54);
        doc.text(`Active Instructed School Days: ${reportsData.totalHistoryDays}`, 20, 60);
        doc.text(`Average Cumulative Attendance Rate: ${reportsData.overallPercentage}%`, 20, 66);
        doc.text(`Attendance Registered relative as of Last: ${reportsData.latestDate}`, 20, 72);

        // Grid contents header
        doc.line(20, 78, 190, 78);
        doc.setFont("Helvetica", "bold");
        doc.text("Enrollment Percentages Ledger", 20, 86);

        // Column Titles
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("Roll No", 20, 94);
        doc.text("Full Name", 40, 94);
        doc.text("Class", 95, 94);
        doc.text("Presents", 115, 94);
        doc.text("Absents", 135, 94);
        doc.text("Percentage Rate", 160, 94);
        doc.line(18, 97, 190, 97);

        doc.setFont("Helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        let y = 104;

        filteredReports.forEach((rpt) => {
          if (y > 270) {
            doc.addPage();
            y = 30;
          }
          doc.text(`#${rpt.rollNo}`, 20, y);
          doc.text(rpt.name.slice(0, 26), 40, rpt.name.length > 26 ? `${rpt.name.slice(0, 24)}..` : rpt.name);
          doc.text(`Grade ${rpt.class}`, 95, y);
          doc.text(`${rpt.presentDays} days`, 115, y);
          doc.text(`${rpt.absentDays} days`, 135, y);
          doc.text(`${rpt.percentage}%`, 160, y);
          
          y += 9;
        });

        doc.save(`EduFlow_Attendance_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      } catch (err) {
        alert("Preparing document libraries. Please wait a visual second and click again.");
      }
    };

    if (!(window as any).jspdf) {
      const scr = document.createElement("script");
      scr.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      scr.onload = () => download();
      scr.onerror = () => alert("Could not fetch jsPDF libraries in sandbox iframe.");
      document.body.appendChild(scr);
    } else {
      download();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="reports-tab-view">
      
      {/* 4 Cards Summary displays block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div id="report-card-students" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none block">Students Checked</span>
            <span className="text-3xl font-black text-[#4F46E5] block mt-2">{reportsData.totalStudents}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-4">Total registered on logs</div>
        </div>

        {/* Total History Days */}
        <div id="report-card-periods" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none block">Total Tracked Dates</span>
            <span className="text-3xl font-black text-slate-800 block mt-2">{reportsData.totalHistoryDays} Days</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-4">Active school sessions</div>
        </div>

        {/* Cumulative average */}
        <div id="report-card-average" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none block">Average Attendance</span>
            <span className="text-3xl font-black text-[#10B981] block mt-2">{reportsData.overallPercentage}%</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-4">Meets national goals</div>
        </div>

        {/* Action threshold cards */}
        <div id="report-card-risk" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none block">Critical Flags Count</span>
            <span className="text-3xl font-black text-[#EF4444] block mt-2">
              {reportsData.studentReports.filter(r => r.percentage < 75).length} Students
            </span>
          </div>
          <div className="text-[11px] text-rose-500 font-bold mt-4">Below 75% alarm thresholds</div>
        </div>

      </div>

      {/* Main ledger filters */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="font-bold text-base text-slate-800">Student Cumulative Performance List</h4>
            <p className="text-xs text-slate-400">Examines individual presents, absents and calculated percentage figures</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Local search in page */}
            <input 
              type="text"
              placeholder="Filter report by name, roll..."
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] placeholder:text-slate-400"
            />

            {/* Quick toggle intervals */}
            <div className="bg-slate-50 p-1 border border-slate-200 rounded-xl flex">
              <button 
                type="button"
                onClick={() => setFilterPeriod("daily")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterPeriod === "daily" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Daily
              </button>
              <button 
                type="button"
                onClick={() => setFilterPeriod("weekly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterPeriod === "weekly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Weekly
              </button>
              <button 
                type="button"
                onClick={() => setFilterPeriod("monthly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterPeriod === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                Monthly Report
              </button>
            </div>

            {/* Downloader Button */}
            <button
              onClick={handlePdfGeneration}
              className="px-4 py-2.5 bg-[#4F46E5] hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Report PDF</span>
            </button>
          </div>
        </div>

        {/* Dynamic results grid */}
        <div id="reports-ledger-table" className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 px-6 text-center w-28">Roll No</th>
                <th className="py-4 px-6">Pupil Candidate Name</th>
                <th className="py-4 px-4 text-center">Standard</th>
                <th className="py-4 px-4 text-center">Presents Log</th>
                <th className="py-4 px-4 text-center">Absents Log</th>
                <th className="py-4 px-6 text-right">Attendance rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
              {filteredReports.map((item) => (
                <tr key={item.rollNo} className="hover:bg-slate-50/40">
                  <td className="py-3 px-6 text-center font-mono font-bold text-slate-900">
                    #{item.rollNo}
                  </td>
                  <td className="py-3 px-6">
                    <span className="font-extrabold text-slate-900 block capitalize">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.email}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-600">
                    Grade {item.class}
                  </td>
                  <td className="py-3 px-4 text-center font-black text-emerald-600 font-mono">
                    {item.presentDays} days
                  </td>
                  <td className="py-3 px-4 text-center font-black text-rose-600 font-mono">
                    {item.absentDays} days
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-xs font-black ${item.percentage < 75 ? "text-rose-600" : item.percentage < 90 ? "text-amber-500" : "text-emerald-600"}`}>
                        {item.percentage}%
                      </span>
                      {/* Circle progress bar */}
                      <div className="w-7 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.percentage < 75 ? "bg-rose-500" : item.percentage < 90 ? "bg-amber-400" : "bg-emerald-500"}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No individual student logs mapped. Select or add candidate records details.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
