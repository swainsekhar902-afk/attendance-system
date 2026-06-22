import React from "react";
import { Calendar, CheckCircle2, XCircle, Search, AlertCircle, RefreshCw, Save, Check, X } from "lucide-react";

interface AttendanceRecordInput {
  rollNo: string;
  name: string;
  status: "Present" | "Absent";
}

interface AttendanceTabProps {
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  attendanceRecords: AttendanceRecordInput[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecordInput[]>>;
  attendanceLoading: boolean;
  onSaveAttendance: () => void;
  attendanceActionStatus: { type: "success" | "error"; text: string } | null;
  studentsCount: number;
}

export default function AttendanceTab({
  attendanceDate,
  setAttendanceDate,
  attendanceRecords,
  setAttendanceRecords,
  attendanceLoading,
  onSaveAttendance,
  attendanceActionStatus,
  studentsCount
}: AttendanceTabProps) {

  const handleStatusChange = (index: number, newStatus: "Present" | "Absent") => {
    const next = [...attendanceRecords];
    next[index] = {
      ...next[index],
      status: newStatus
    };
    setAttendanceRecords(next);
  };

  const handleBulkChange = (status: "Present" | "Absent") => {
    const next = attendanceRecords.map(r => ({
      ...r,
      status
    }));
    setAttendanceRecords(next);
  };

  const getStyleForInitials = (roll: string) => {
    const colors = [
      "bg-indigo-100 text-indigo-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-600",
      "bg-rose-100 text-rose-700",
      "bg-sky-100 text-sky-700",
      "bg-purple-100 text-purple-700",
    ];
    const index = (parseInt(roll) || 0) % colors.length;
    return colors[index];
  };

  const getBannerInitials = (name: string) => {
    const pts = name.split(" ");
    if (pts.length >= 2) return `${pts[0][0]}${pts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="attendance-register-tab">
      
      {/* Date Pick header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-[#4F46E5] rounded-2xl shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800">Attendance Calendar Range</h4>
            <p className="text-xs text-slate-400">Mark or query registers for historical parameters</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Pick Active Date:</span>
          <input 
            type="date" 
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="py-2.5 px-4 bg-slate-50 border border-slate-200 text-xs font-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
          />
        </div>

      </div>

      {/* Main interactive directory sheet code */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Bulk controls bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800">
              Registrar Roll Call List
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Submit daily parameters. Automatically syncs duplicate rolls and saves logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button"
              onClick={() => handleBulkChange("Present")}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 rounded-lg text-[11px] font-bold transition cursor-pointer"
            >
              Mark All [Present]
            </button>
            <button 
              type="button"
              onClick={() => handleBulkChange("Absent")}
              className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-100 hover:bg-rose-100 rounded-lg text-[11px] font-bold transition cursor-pointer"
            >
              Mark All [Absent]
            </button>
          </div>
        </div>

        {/* Loading overlay frame */}
        {attendanceLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#4F46E5] animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-bold">Synchronizing Date Log Fields...</p>
          </div>
        ) : (
          <div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-100 bg-slate-50/20">
                    <th className="py-4 px-6 text-center w-24">Roll ID</th>
                    <th className="py-4 px-6">Enrolled Pupil Name</th>
                    <th className="py-4 px-4">Instant Status Selector</th>
                    <th className="py-4 px-6 text-right w-48">Status Summary Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {attendanceRecords.map((record, index) => (
                    <tr key={record.rollNo} className="hover:bg-slate-50/40 transition">
                      
                      {/* Roll No */}
                      <td className="py-3 px-6 text-center font-mono font-bold text-slate-800 bg-slate-50/10">
                        #{record.rollNo}
                      </td>

                      {/* Name initials */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${getStyleForInitials(record.rollNo)}`}>
                            {getBannerInitials(record.name)}
                          </div>
                          <span className="font-extrabold text-slate-900 capitalize">{record.name}</span>
                        </div>
                      </td>

                      {/* Selector Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(index, "Present")}
                            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${record.status === "Present" ? "bg-emerald-500 text-white shadow-sm font-black" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleStatusChange(index, "Absent")}
                            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${record.status === "Absent" ? "bg-rose-500 text-white shadow-sm font-black" : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"}`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>

                      {/* Status Check badge */}
                      <td className="py-3 px-6 text-right">
                        {record.status === "Present" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100">
                            Absent
                          </span>
                        )}
                      </td>

                    </tr>
                  ))}

                  {attendanceRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-slate-400">
                        <div className="max-w-sm mx-auto">
                          <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">No students are currently active in roster.</p>
                          <p className="text-xs text-slate-400 mt-1">Please populate students in "Students Roster" tab before compiling records.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Action Controls */}
            {attendanceRecords.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">
                  Verify your input markers before compiling. Active entries list: <b>{attendanceRecords.length} student cards</b>.
                </span>
                
                <button
                  type="button"
                  onClick={onSaveAttendance}
                  className="px-5 py-3 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Synchronize attendance sheet</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
