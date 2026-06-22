import React from "react";
import { Settings, Save, AlertTriangle, PlayCircle, HelpCircle, Check, Network, HelpCircle as HelpIcon } from "lucide-react";
import { WebhookConfig } from "../types";

interface WebhookTabProps {
  webhookConfig: WebhookConfig;
  setWebhookConfig: React.Dispatch<React.SetStateAction<WebhookConfig>>;
  webhookLoading: boolean;
  onSaveConfig: (e: React.FormEvent) => void;
  webhookStatus: { type: "success" | "error"; text: string } | null;
}

export default function WebhookTab({
  webhookConfig,
  setWebhookConfig,
  webhookLoading,
  onSaveConfig,
  webhookStatus
}: WebhookTabProps) {

  const handleChange = (key: keyof WebhookConfig, value: any) => {
    setWebhookConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="webhook-config-tab">
      
      {/* Alert banner for active status */}
      {webhookStatus && (
        <div id="webhook-action-status-banner" className={`p-4 rounded-2xl flex items-center gap-3 border ${webhookStatus.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
          {webhookStatus.type === "success" ? (
            <Check className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span className="text-sm font-semibold">{webhookStatus.text}</span>
        </div>
      )}

      {/* Grid container splitting settings values and setting manuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings panel form */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-[#4F46E5] rounded-xl shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">Connection Endpoints Configuration</h4>
              <p className="text-xs text-slate-400">Map custom n8n webhooks or ngrok proxy paths to Google Sheets</p>
            </div>
          </div>

          <form onSubmit={onSaveConfig} className="space-y-5">
            
            {/* Master Toggle Webhook */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <span className="text-xs font-black text-slate-800 block">Enable Automated n8n Workflows</span>
                <span className="text-[10px] text-slate-400 mt-0.5">When checked, web responses prioritize your configured sheets</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={webhookConfig.useWebhook}
                  onChange={(e) => handleChange("useWebhook", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
              </label>
            </div>

            {/* Input URL blocks */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  1. Add Student Webhook Trigger URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://pacifism-cheek-chute.ngrok-free.dev/webhook/add_student"
                  value={webhookConfig.addStudentUrl}
                  disabled={!webhookConfig.useWebhook}
                  onChange={(e) => handleChange("addStudentUrl", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  2. Fetch Student List Webhook URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://pacifism-cheek-chute.ngrok-free.dev/webhook/students-data"
                  value={webhookConfig.getStudentsUrl}
                  disabled={!webhookConfig.useWebhook}
                  onChange={(e) => handleChange("getStudentsUrl", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  3. Save Attendance Log Webhook
                </label>
                <input 
                  type="url" 
                  placeholder="https://pacifism-cheek-chute.ngrok-free.dev/webhook-test/attendance"
                  value={webhookConfig.saveAttendanceUrl}
                  disabled={!webhookConfig.useWebhook}
                  onChange={(e) => handleChange("saveAttendanceUrl", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                  4. Attendance PDF Report Hook (Optional)
                </label>
                <input 
                  type="url" 
                  placeholder="https://pacifism-cheek-chute.ngrok-free.dev/webhook/generate-pdf-report"
                  value={webhookConfig.attendanceReportUrl}
                  disabled={!webhookConfig.useWebhook}
                  onChange={(e) => handleChange("attendanceReportUrl", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="mt-4 px-5 py-3 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Webhook Parameters</span>
            </button>

          </form>
        </div>

        {/* Informative Manual Help sidebar frame */}
        <div className="bg-[#1E1B4B] rounded-3xl shadow-xl p-6 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3.5 mb-5 border-b border-white/10 pb-4">
              <Network className="w-5 h-5 text-amber-300" />
              <div>
                <h4 className="font-extrabold text-xs">n8n Docker Integration</h4>
                <p className="text-[9px] text-[#A5B4FC]">Google Sheets Structure Manuals</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-amber-300 block mb-1">Step 1: Setup Google Sheets</span>
                <p className="text-slate-300">
                  Create a new sheet with exactly two tab schemas:
                </p>
                <ul className="list-disc pl-4 mt-1 text-slate-300 space-y-1">
                  <li><b>Tab "Student Database":</b> Columns <code className="bg-white/10 px-1 rounded font-mono">Roll No | Name | Class | Email</code></li>
                  <li><b>Tab "Attendance":</b> Columns <code className="bg-white/10 px-1 rounded font-mono">Date | Roll No | Name | Status</code></li>
                </ul>
              </div>

              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-amber-300 block mb-1">Step 2: Start n8n container</span>
                <code className="block bg-[#0F172A] p-2 rounded text-[10px] font-mono select-all text-emerald-300 border border-white/5">
                  docker run -it -p 5678:5678 n8nio/n8n
                </code>
              </div>

              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-amber-300 block mb-1">Step 3: Expose with ngrok</span>
                <code className="block bg-[#0F172A] p-2 rounded text-[10px] font-mono select-all text-emerald-300 border border-white/5">
                  ngrok http 5678
                </code>
                <p className="text-slate-400 text-[10px] mt-1">Copy the provided public ngrok https url and write Webhook URLs here.</p>
              </div>

              <div className="text-[11px] leading-relaxed border-t border-white/5 pt-3">
                <span className="font-bold text-slate-200 block mb-1">💡 Fail-safe Fallback Mode</span>
                <p className="text-slate-400 text-[10px]">
                  If your n8n container is offline or disabled, EduFlow automatically falls back to secure, durable local server JSON database state variables. Data tracking will never pause!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-center text-[10px] text-indigo-300">
            For advanced custom nodes, contact: <b className="text-white">swainsekhar902@gmail.com</b>
          </div>
        </div>

      </div>

    </div>
  );
}
