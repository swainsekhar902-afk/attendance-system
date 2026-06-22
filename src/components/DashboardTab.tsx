import React from "react";
import { TrendingUp, Users, CheckCircle, XCircle, Calendar } from "lucide-react";

interface DashboardTabProps {
  reportsData: {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    latestDate: string;
    overallPercentage: number;
    totalHistoryDays: number;
    datesList: string[];
    studentReports: any[];
    recentActivity: any[];
  };
  onNavigateToStudents: () => void;
  onNavigateToReports: () => void;
}

export default function DashboardTab({
  reportsData,
  onNavigateToStudents,
  onNavigateToReports
}: DashboardTabProps) {

  // Dynamic alphabet color helpers for list rows
  const getBannerInitials = (name: string) => {
    const pts = name.split(" ");
    if (pts.length >= 2) return `${pts[0][0]}${pts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getStyleForInitials = (roll: string) => {
    const colors = [
      "bg-indigo-100 text-indigo-700",
      "bg-emerald-100 text-emerald-700",
      "bg-amber-100 text-amber-500",
      "bg-rose-100 text-rose-700",
      "bg-sky-100 text-sky-700",
      "bg-purple-100 text-purple-700",
    ];
    const index = (parseInt(roll) || 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="dashboard-tab-view">
      
      {/* 4 Cards Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Total Students */}
        <div id="stat-card-total" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Total Students</span>
              <div className="p-1 px-2 text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-100/60 rounded-lg">Roster Active</div>
            </div>
            <div className="text-4xl font-extrabold text-[#4F46E5] mt-3">
              {reportsData.totalStudents}
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">Total enrolled students tracked in student records database</p>
        </div>

        {/* Card 2: Present Today */}
        <div id="stat-card-present" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Present Today</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            </div>
            <div className="text-4xl font-extrabold text-[#10B981] mt-3">
              {reportsData.presentToday}
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            For attendance date: <b className="text-slate-600">{reportsData.latestDate === "No Records" ? "None Rec" : reportsData.latestDate}</b>
          </p>
        </div>

        {/* Card 3: Absent Today */}
        <div id="stat-card-absent" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Absent Today</span>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg">High Risk alert</span>
            </div>
            <div className="text-4xl font-extrabold text-[#EF4444] mt-3">
              {reportsData.absentToday}
            </div>
          </div>
          <p className="mt-4 text-[11px] text-rose-500 font-bold">In Need of Attention counsels</p>
        </div>

        {/* Card 4: Overall Rate */}
        <div id="stat-card-rate" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none block">Overall Attendance Rate</span>
            <div className="text-4xl font-extrabold text-[#F59E0B] mt-3">
              {reportsData.overallPercentage}%
            </div>
          </div>
          <div className="mt-4 w-full">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${reportsData.overallPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Trend View */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Visual Weekly trends (Vibrant Palette column style) */}
        <div id="visual-weekly-trends" className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-800">Weekly Attendance Trends</h3>
                <p className="text-xs text-slate-400">Chronological summary of previous instruction sessions percentage rates</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-lg text-slate-600">
                Latest 5 periods
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-around gap-4 mt-6 px-4">
            {reportsData.datesList.slice(-5).map((d: string) => {
              // Calculate real metrics on that date
              const recordsOnDate = reportsData.recentActivity.filter((a: any) => a.date === d) || [];
              const rawDate = new Date(d);
              const dayName = rawDate.toLocaleDateString("en-US", { weekday: "short" });

              const totalLogs = reportsData.recentActivity.filter((x: any) => x.date === d).length;
              const presentLogs = reportsData.recentActivity.filter((x: any) => x.date === d && x.status === "Present").length;
              const percentValue = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 95;

              return (
                <div key={d} className="flex flex-col items-center gap-2 w-full justify-end h-full min-h-[160px]">
                  <span className="text-[11px] text-slate-500 font-bold leading-none">{percentValue}%</span>
                  <div className="w-full bg-slate-50 rounded-t-xl h-[70%] relative overflow-hidden">
                    <div 
                      className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${percentValue < 75 ? "bg-rose-400 animate-pulse" : percentValue < 90 ? "bg-amber-400" : "bg-[#4F46E5]"}`}
                      style={{ height: `${percentValue}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-none mt-1">{dayName}</span>
                  <span className="text-[10px] text-slate-400 leading-none">{d.slice(5)}</span>
                </div>
              );
            })}

            {reportsData.datesList.length === 0 && (
              <div className="flex flex-col items-center justify-center w-full h-[180px] text-slate-400">
                <Calendar className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-xs font-medium">No recorded periods found. Complete attendance list on current calendar first.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Dynamic List Preview: Recent attendance activities and logs */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6" id="dashboard-recent-activities">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-800">Recent Attendance Activity</h3>
            <p className="text-xs text-slate-400">Chronological history log of marked instances in standard schedules</p>
          </div>
          <button 
            onClick={onNavigateToReports}
            className="text-xs font-bold text-[#4F46E5] underline hover:text-[#4338CA]"
          >
            Manage entire sheet
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-100 bg-slate-50/30">
                <th className="pb-3 pt-2 pl-4">Student Name</th>
                <th className="pb-3 pt-2 text-center">Roll No</th>
                <th className="pb-3 pt-2">Class Code</th>
                <th className="pb-3 pt-2">Status</th>
                <th className="pb-3 pt-2 text-right pr-4">Timestamp File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
              {reportsData.recentActivity.slice(0, 6).map((activity: any) => (
                <tr key={activity.id} className="hover:bg-slate-50/50">
                  <td className="py-3 pl-4 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[10px] ${getStyleForInitials(activity.rollNo)} shrink-0`}>
                      {getBannerInitials(activity.name)}
                    </div>
                    <span className="font-semibold text-slate-800 capitalize">{activity.name}</span>
                  </td>
                  <td className="py-3 text-center font-mono text-slate-500 font-bold">#{activity.rollNo}</td>
                  <td className="py-3 font-semibold text-slate-600">Grade 10-A</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${activity.status === "Present" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-4 font-mono text-slate-400 font-bold">{activity.date}</td>
                </tr>
              ))}

              {reportsData.recentActivity.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    No registry rows committed today. Select "Mark Attendance" to submit values.
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
