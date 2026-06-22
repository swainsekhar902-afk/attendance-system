import React from "react";
import { Search, Plus, Edit2, Trash2, Mail, Users, Filter, CheckCircle2 } from "lucide-react";
import { Student } from "../types";

interface StudentsTabProps {
  students: Student[];
  studentSearch: string;
  setStudentSearch: (val: string) => void;
  classFilter: string;
  setClassFilter: (val: string) => void;
  classesList: string[];
  onAddTrigger: () => void;
  onEditTrigger: (student: Student) => void;
  onDeleteTrigger: (id: string, name: string) => void;
  useWebhook: boolean;
}

export default function StudentsTab({
  students,
  studentSearch,
  setStudentSearch,
  classFilter,
  setClassFilter,
  classesList,
  onAddTrigger,
  onEditTrigger,
  onDeleteTrigger,
  useWebhook
}: StudentsTabProps) {

  // Filtration logic matcher of student properties
  const filtered = students.filter(s => {
    const term = studentSearch.toLowerCase().trim();
    if (term) {
      const matchTerm = 
        s.name.toLowerCase().includes(term) || 
        s.rollNo.toString().toLowerCase().includes(term) || 
        s.email.toLowerCase().includes(term);
      if (!matchTerm) return false;
    }
    if (classFilter !== "all" && s.class !== classFilter) {
      return false;
    }
    return true;
  });

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
    <div className="space-y-6 animate-fadeIn" id="students-tab-view">
      
      {/* Filters and Command controls header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search layout */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search student lists by roll ID, complete name, index, contact or emails..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition"
          />
        </div>

        {/* Option Selection fields */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All School Grades</option>
              {classesList.map(c => (
                <option key={c} value={c}>Class/Grade {c}</option>
              ))}
            </select>
          </div>

          <button 
            id="register-student-main-btn"
            onClick={onAddTrigger}
            className="px-4 py-2.5 bg-[#4F46E5] hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Student Record
          </button>
        </div>

      </div>

      {/* Main detailed tables displaying results */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h4 className="font-bold text-sm text-slate-800">Enrollment Roster Directory</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Showing list of registered student details or fallback records</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-50 border border-indigo-100/60 font-bold text-[#4F46E5] px-2.5 py-1 rounded-lg">
              {filtered.length} matching students
            </span>
            {useWebhook && (
              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                Sheets Live Link ACTIVE
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-100 bg-slate-50/30">
                <th className="py-4 px-6 text-center w-24">Roll ID</th>
                <th className="py-4 px-6">Pupil / Full Name</th>
                <th className="py-4 px-4">Standard/Class Code</th>
                <th className="py-4 px-4">Parent Portal Email</th>
                <th className="py-4 px-6 text-right w-44">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition">
                  {/* Roll No */}
                  <td className="py-3 px-6 text-center font-mono font-bold text-slate-900 bg-slate-50/20">
                    #{s.rollNo}
                  </td>
                  
                  {/* Name Details */}
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${getStyleForInitials(s.rollNo)}`}>
                        {getBannerInitials(s.name)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block capitalize">{s.name}</span>
                        <span className="text-[10px] text-slate-400">ID: {s.id.slice(0, 10)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Class */}
                  <td className="py-3 px-4 font-bold text-indigo-600">
                    Grade {s.class}
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-slate-500 font-mono">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{s.email}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button 
                        onClick={() => onEditTrigger(s)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Edit profile information"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => onDeleteTrigger(s.id, s.name)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Remove student permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-bold bg-slate-50/10">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <Users className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-sm text-slate-700">No Pupils Register Matches Found</p>
                      <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                        Verify entered query keywords or class parameters, or register a new card.
                      </p>
                      <button 
                        onClick={onAddTrigger}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs mt-4 transition cursor-pointer"
                      >
                        Register New Student Profile
                      </button>
                    </div>
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
