export interface Student {
  id: string;
  rollNo: string;
  name: string;
  class: string;
  email: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  rollNo: string;
  name: string;
  status: 'Present' | 'Absent';
}

export interface WebhookConfig {
  useWebhook: boolean;
  addStudentUrl: string;
  getStudentsUrl: string;
  saveAttendanceUrl: string;
  attendanceReportUrl: string;
}
