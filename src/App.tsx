import React, { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Settings, 
  Plus, 
  Calendar, 
  FileText, 
  Sliders, 
  Loader2, 
  AlertTriangle, 
  GraduationCap,
  ArrowRight,
  LogOut,
  Moon,
  Sun,
  X
} from "lucide-react";
import { Student, AttendanceRecord, WebhookConfig } from "./types";
import LoginScreen from "./components/LoginScreen";
import DashboardTab from "./components/DashboardTab";
import StudentsTab from "./components/StudentsTab";
import AttendanceTab from "./components/AttendanceTab";
import ReportsTab from "./components/ReportsTab";
import WebhookTab from "./components/WebhookTab";

interface AttendanceRecordInput {
  rollNo: string;
  name: string;
  status: "Present" | "Absent";
}

export default function App() {
  // Login Authentication State
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "students" | "attendance" | "reports" | "webhook">("dashboard");

  // Core Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  
  const [reportsData, setReportsData] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    latestDate: "No Records",
    overallPercentage: 100,
    totalHistoryDays: 0,
    datesList: [] as string[],
    studentReports: [] as any[],
    recentActivity: [] as any[]
  });
  const [reportsLoading, setReportsLoading] = useState(true);

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toLocaleDateString("sv-SE") // Returns YYYY-MM-DD local format safely
  );
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordInput[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceActionStatus, setAttendanceActionStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Webhook State
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    useWebhook: false,
    addStudentUrl: "",
    getStudentsUrl: "",
    saveAttendanceUrl: "",
    attendanceReportUrl: ""
  });
  const [webhookLoading, setWebhookLoading] = useState(true);
  const [webhookStatus, setWebhookStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Modals Forms State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentForm, setStudentForm] = useState({
    id: "",
    rollNo: "",
    name: "",
    class: "",
    email: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Search & Filters State
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  // Fetch student roster from SQLite/file server db
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error("Failed to load student list", e);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch compiled reports statistical dashboard
  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReportsData(data);
      }
    } catch (e) {
      console.error("Failed to fetch statistics", e);
    } finally {
      setReportsLoading(false);
    }
  };

  // Fetch webhook configurations
  const fetchWebhookConfig = async () => {
    try {
      setWebhookLoading(true);
      const res = await fetch("/api/webhook-config");
      if (res.ok) {
        const data = await res.json();
        setWebhookConfig(data);
      }
    } catch (e) {
      console.error("Failed to fetch webhook config", e);
    } finally {
      setWebhookLoading(false);
    }
  };

  // Save Webhook configuration settings
  const saveWebhookConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setWebhookStatus(null);
      const res = await fetch("/api/webhook-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookConfig)
      });
      if (res.ok) {
        setWebhookStatus({ type: 'success', text: "n8n Webhook Configuration updated successfully!" });
        fetchStudents();
      } else {
        setWebhookStatus({ type: 'error', text: "Failed to update webhook endpoints." });
      }
    } catch (error) {
      setWebhookStatus({ type: 'error', text: `Connection aborted: ${(error as Error).message}` });
    }
  };

  // Fetch attendance items for specified date
  const fetchAttendanceForDate = async (targetDate: string) => {
    try {
      setAttendanceLoading(true);
      // Fetch newest roster fast to make sure mappings are absolute
      const studentRes = await fetch("/api/students");
      let currentRoster: Student[] = students;
      if (studentRes.ok) {
        const roster = await studentRes.json();
        setStudents(roster);
        currentRoster = roster;
      }

      const res = await fetch(`/api/attendance?date=${targetDate}`);
      if (res.ok) {
        const data = await res.json();
        const recordsFromDb: AttendanceRecord[] = data.records || [];
        
        // Match existing records or make default "Present"
        const mappedRecords = currentRoster.map(student => {
          const match = recordsFromDb.find(r => r.rollNo.toString().trim() === student.rollNo.toString().trim());
          return {
            rollNo: student.rollNo,
            name: student.name,
            status: match ? match.status : ("Present" as const)
          };
        });
        setAttendanceRecords(mappedRecords);
      }
    } catch (e) {
      console.error("Failed loading attendance data", e);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Save marked attendance sheet
  const saveAttendanceSheet = async () => {
    try {
      setAttendanceActionStatus(null);
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: attendanceDate,
          records: attendanceRecords
        })
      });

      const responseData = await res.json();
      if (res.ok) {
        setAttendanceActionStatus({
          type: 'success',
          text: responseData.message || "Attendance roll-call saved & dispatched successfully!"
        });
        fetchReports();
      } else {
        setAttendanceActionStatus({
          type: 'error',
          text: responseData.error || "Failed to commit attendance records."
        });
      }
    } catch (err) {
      setAttendanceActionStatus({
        type: 'error',
        text: `Network failure saving registers: ${(err as Error).message}`
      });
    }
  };

  // Forms Submissions: Add Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccessMessage(null);

    if (!studentForm.rollNo.trim() || !studentForm.name.trim() || !studentForm.class.trim() || !studentForm.email.trim()) {
      setFormError("All input metrics are required!");
      return;
    }

    // Verify local double entry duplicates
    const matchingRoll = students.some(
      s => s.rollNo.toString().trim() === studentForm.rollNo.toString().trim()
    );
    if (matchingRoll) {
      setFormError(`Duplicate Roll Warning: Student roll number "${studentForm.rollNo}" is already allocated!`);
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: studentForm.rollNo.trim(),
          name: studentForm.name.trim(),
          class: studentForm.class.trim(),
          email: studentForm.email.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccessMessage("Student registered successfully! Synchronizing...");
        setStudentForm({ id: "", rollNo: "", name: "", class: "", email: "" });
        fetchStudents();
        fetchReports();
        setTimeout(() => {
          setShowAddModal(false);
          setFormSuccessMessage(null);
        }, 1200);
      } else {
        setFormError(data.error || "Could not write student profile.");
      }
    } catch (e) {
      setFormError("Network error: Server was unreachable.");
    }
  };

  // Forms Submissions: Edit Student
  const handleEditStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccessMessage(null);

    if (!studentForm.rollNo.trim() || !studentForm.name.trim() || !studentForm.class.trim() || !studentForm.email.trim()) {
      setFormError("All indicators must contain values.");
      return;
    }

    try {
      const res = await fetch(`/api/students/${studentForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: studentForm.rollNo.trim(),
          name: studentForm.name.trim(),
          class: studentForm.class.trim(),
          email: studentForm.email.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccessMessage("Student update committed successfully!");
        fetchStudents();
        fetchReports();
        setTimeout(() => {
          setShowEditModal(false);
          setFormSuccessMessage(null);
          setStudentForm({ id: "", rollNo: "", name: "", class: "", email: "" });
        }, 1200);
      } else {
        setFormError(data.error || "Could not modify student record.");
      }
    } catch (e) {
      setFormError("Network connection error modifying profile.");
    }
  };

  const deleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Delete pupil "${name}"? This removes historical registers indices in database.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchStudents();
        fetchReports();
      }
    } catch (e) {
      alert("Failed to delete student database entry");
    }
  };

  // Bootstrap setups
  useEffect(() => {
    fetchStudents();
    fetchReports();
    fetchWebhookConfig();
  }, []);

  // Sync attendance list when active date shifts
  useEffect(() => {
    fetchAttendanceForDate(attendanceDate);
  }, [attendanceDate, students.length]);

  // Handle unique classes list
  const classesList: string[] = Array.from(new Set(students.map(s => s.class))).sort() as string[];

  if (!loggedInUser) {
    return <LoginScreen onLoginSuccess={(user) => setLoggedInUser(user)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden leading-snug">
      
      {/* 1. SIDEBAR Navigation - Vibrant Indigo Brand Sidebar */}
      <aside className="w-68 bg-[#1E1B4B] h-full flex flex-col text-white shrink-0 shadow-2xl justify-between relative z-20 border-r border-[#312E81]">
        
        {/* Brand Banner */}
        <div>
          <div className="p-6 flex items-center gap-3.5 border-b border-[#312E81]">
            <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center ring-4 ring-[#4F46E5]/20 shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block">EduFlow Admin</span>
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">AI Attendance</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 flex flex-col gap-1.5" id="sidebar-action-tabs">
            
            {/* Dashboard Overview */}
            <button 
              id="sidebar-nav-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 text-xs font-black cursor-pointer ${activeTab === "dashboard" ? "bg-[#4F46E5] text-white shadow-md" : "hover:bg-white/5 text-slate-400 hover:text-white"}`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard Hub</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 transition ${activeTab === "dashboard" ? "translate-x-0" : "opacity-0 -translate-x-2"}`} />
            </button>

            {/* Students Profiles */}
            <button 
              id="sidebar-nav-students"
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 text-xs font-black cursor-pointer ${activeTab === "students" ? "bg-[#4F46E5] text-white shadow-md animate-slideRight" : "hover:bg-white/5 text-slate-400 hover:text-white"}`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Students Roster</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 transition ${activeTab === "students" ? "translate-x-0" : "opacity-0 -translate-x-2"}`} />
            </button>

            {/* Mark Attendance */}
            <button 
              id="sidebar-nav-attendance"
              onClick={() => setActiveTab("attendance")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 text-xs font-black cursor-pointer ${activeTab === "attendance" ? "bg-[#4F46E5] text-white shadow-md" : "hover:bg-white/5 text-slate-400 hover:text-white"}`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Mark Attendance</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 transition ${activeTab === "attendance" ? "translate-x-0" : "opacity-0 -translate-x-2"}`} />
            </button>

            {/* Attendance Reports */}
            <button 
              id="sidebar-nav-reports"
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 text-xs font-black cursor-pointer ${activeTab === "reports" ? "bg-[#4F46E5] text-white shadow-md" : "hover:bg-white/5 text-slate-400 hover:text-white"}`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Evaluation Reports</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 transition ${activeTab === "reports" ? "translate-x-0" : "opacity-0 -translate-x-2"}`} />
            </button>

            {/* n8n Webhook Settings */}
            <button 
              id="sidebar-nav-webhook"
              onClick={() => setActiveTab("webhook")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 text-xs font-black cursor-pointer ${activeTab === "webhook" ? "bg-[#4F46E5] text-white shadow-md" : "hover:bg-white/5 text-slate-400 hover:text-white"}`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4" />
                <span>n8n Sheet Webhooks</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 transition ${activeTab === "webhook" ? "translate-x-0" : "opacity-0 -translate-x-2"}`} />
            </button>

          </nav>
        </div>

        {/* Footer info & Logout details */}
        <div className="p-4 border-t border-[#312E81] bg-[#111827]/40">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Admin Portal Mode</span>
              <span className="text-xs text-indigo-100 font-extrabold block truncate capitalize">{loggedInUser}</span>
            </div>
            
            <button 
              onClick={() => setLoggedInUser(null)}
              className="p-2 py-2 bg-indigo-500/10 hover:bg-rose-500/20 text-indigo-300 hover:text-rose-400 rounded-lg cursor-pointer transition"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* 2. MAIN WORKING CANVAS WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0" id="main-working-canvas">
        
        {/* Interactive action status indicators bar */}
        {attendanceActionStatus && (
          <div className={`p-3.5 px-6 border-b text-xs font-bold leading-normal flex items-center justify-between ${attendanceActionStatus.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"}`}>
            <span>{attendanceActionStatus.text}</span>
            <button onClick={() => setAttendanceActionStatus(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Secondary Navigation Headers header */}
        <header className="h-16 border-b border-slate-100 bg-white px-8 flex items-center justify-between shadow-sm relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-800 tracking-tight uppercase">
              {activeTab === "dashboard" && "Performance Analytics dashboard"}
              {activeTab === "students" && "Students lists ledger"}
              {activeTab === "attendance" && "Daily Attendance registers"}
              {activeTab === "reports" && "Statistical school reports"}
              {activeTab === "webhook" && "n8n pipeline configuration"}
            </h1>
            <span className="text-slate-300 font-bold font-mono">/</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
              Active Roll Count: {students.length} pupils
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>EduFlow Core Stable Host</span>
            </div>
          </div>
        </header>

        {/* Main tabs scrollable center */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          
          {activeTab === "dashboard" && (
            <DashboardTab 
              reportsData={reportsData}
              onNavigateToStudents={() => setActiveTab("students")}
              onNavigateToReports={() => setActiveTab("reports")}
            />
          )}

          {activeTab === "students" && (
            <StudentsTab 
              students={students}
              studentSearch={studentSearch}
              setStudentSearch={setStudentSearch}
              classFilter={classFilter}
              setClassFilter={setClassFilter}
              classesList={classesList}
              useWebhook={webhookConfig.useWebhook}
              onAddTrigger={() => {
                setStudentForm({ id: "", rollNo: "", name: "", class: "", email: "" });
                setFormError(null);
                setFormSuccessMessage(null);
                setShowAddModal(true);
              }}
              onEditTrigger={(std) => {
                setStudentForm({
                  id: std.id,
                  rollNo: std.rollNo,
                  name: std.name,
                  class: std.class,
                  email: std.email
                });
                setFormError(null);
                setFormSuccessMessage(null);
                setShowEditModal(true);
              }}
              onDeleteTrigger={(id, name) => deleteStudent(id, name)}
            />
          )}

          {activeTab === "attendance" && (
            <AttendanceTab 
              attendanceDate={attendanceDate}
              setAttendanceDate={setAttendanceDate}
              attendanceRecords={attendanceRecords}
              setAttendanceRecords={setAttendanceRecords}
              attendanceLoading={attendanceLoading}
              onSaveAttendance={saveAttendanceSheet}
              attendanceActionStatus={attendanceActionStatus}
              studentsCount={students.length}
            />
          )}

          {activeTab === "reports" && (
            <ReportsTab reportsData={reportsData} />
          )}

          {activeTab === "webhook" && (
            <WebhookTab 
              webhookConfig={webhookConfig}
              setWebhookConfig={setWebhookConfig}
              webhookLoading={webhookLoading}
              onSaveConfig={saveWebhookConfig}
              webhookStatus={webhookStatus}
            />
          )}

        </div>

      </main>

      {/* 3. ADD STUDENT MODAL PORTAL */}
      {showAddModal && (
        <div id="add-student-modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 animate-scaleIn">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-sm">Add New Student</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-[11px] font-bold rounded-xl leading-normal">
                  {formError}
                </div>
              )}

              {formSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-[11px] font-bold rounded-xl leading-normal">
                  {formSuccessMessage}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  1) Student Roll Number ID (Unique key)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 101"
                  value={studentForm.rollNo}
                  onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  2) Student Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Kumar"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5] capitalize"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  3) Grade/Class Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 10A"
                  value={studentForm.class}
                  onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  4) Parent Portal Email Address (Reports dispatch target)
                </label>
                <input 
                  type="email" 
                  placeholder="e.g. parent@school.com"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT STUDENT MODAL PORTAL */}
      {showEditModal && (
        <div id="edit-student-modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-100 animate-scaleIn">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-sm">Edit Student Profile</h4>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudentSubmit} className="space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-[11px] font-bold rounded-xl leading-normal">
                  {formError}
                </div>
              )}

              {formSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-[11px] font-bold rounded-xl leading-normal">
                  {formSuccessMessage}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  1) Student Roll Number ID (Unique key)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 101"
                  value={studentForm.rollNo}
                  onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  2) Student Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Kumar"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5] capitalize"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  3) Grade/Class Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 10A"
                  value={studentForm.class}
                  onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  4) Parent Portal Email Address (Reports dispatch target)
                </label>
                <input 
                  type="email" 
                  placeholder="e.g. parent@school.com"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
