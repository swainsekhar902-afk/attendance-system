import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dns from "dns";

// Fix Node v17+ localhost resolution speeds by preferring ipv4
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

app.use(express.json());

// Database File Path
const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

// Ensure structure exists and initialize seed data if missing
function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const initialStudents = [
    { id: "s1", rollNo: "101", name: "Alex Rivera", class: "10-A", email: "alex.rivera@school.com" },
    { id: "s2", rollNo: "102", name: "Betty Chen", class: "10-A", email: "betty.chen@school.com" },
    { id: "s3", rollNo: "103", name: "Marcus Vance", class: "10-B", email: "marcus.vance@school.com" },
    { id: "s4", rollNo: "104", name: "Diana Prince", class: "10-A", email: "diana.prince@school.com" },
    { id: "s5", rollNo: "105", name: "Ethan Hunt", class: "10-B", email: "ethan.hunt@school.com" },
    { id: "s6", rollNo: "106", name: "Fiona Gallagher", class: "10-C", email: "fiona.g@school.com" },
    { id: "s7", rollNo: "107", name: "George Brooks", class: "10-B", email: "george.b@school.com" },
    { id: "s8", rollNo: "108", name: "Hannah Abbott", class: "10-C", email: "hannah.a@school.com" }
  ];

  const dates = [
    "2026-06-05", "2026-06-08", "2026-06-09", "2026-06-10", "2026-06-11",
    "2026-06-12", "2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18",
    "2026-06-19"
  ];

  const initialAttendance: any[] = [];
  let recordId = 1;

  // Pre-populate realistic, organic attendance history
  dates.forEach(date => {
    initialStudents.forEach(student => {
      let status: "Present" | "Absent" = "Present";

      if (student.rollNo === "103") {
        // Marcus has ~54% attendance
        status = ["2026-06-05", "2026-06-09", "2026-06-11", "2026-06-15", "2026-06-18"].includes(date)
          ? "Absent"
          : "Present";
      } else if (student.rollNo === "106") {
        // Fiona has ~45% attendance
        status = ["2026-06-08", "2026-06-09", "2026-06-12", "2026-06-16", "2026-06-17", "2026-06-19"].includes(date)
          ? "Absent"
          : "Present";
      } else if (student.rollNo === "102" && date === "2026-06-11") {
        status = "Absent";
      } else if (student.rollNo === "104" && date === "2026-06-15") {
        status = "Absent";
      } else if (student.rollNo === "105" && date === "2026-06-12") {
        status = "Absent";
      } else if (student.rollNo === "107" && ["2026-06-10", "2026-06-17"].includes(date)) {
        status = "Absent";
      }

      initialAttendance.push({
        id: `att-${recordId++}`,
        date,
        rollNo: student.rollNo,
        name: student.name,
        status
      });
    });
  });

  const defaultWebhookConfig = {
    useWebhook: false,
    addStudentUrl: "",
    getStudentsUrl: "",
    saveAttendanceUrl: "",
    attendanceReportUrl: ""
  };

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      students: initialStudents,
      attendance: initialAttendance,
      webhookConfig: defaultWebhookConfig
    }, null, 2));
  } else {
    try {
      const curr = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      if (!curr.students || !curr.attendance || !curr.webhookConfig) {
        fs.writeFileSync(DB_PATH, JSON.stringify({
          students: curr.students || initialStudents,
          attendance: curr.attendance || initialAttendance,
          webhookConfig: curr.webhookConfig || defaultWebhookConfig
        }, null, 2));
      }
    } catch (e) {
      fs.writeFileSync(DB_PATH, JSON.stringify({
        students: initialStudents,
        attendance: initialAttendance,
        webhookConfig: defaultWebhookConfig
      }, null, 2));
    }
  }
}

ensureDb();

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDb(data: any) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Webhook config endpoints
app.get("/api/webhook-config", (req, res) => {
  const db = readDb();
  res.json(db.webhookConfig);
});

app.post("/api/webhook-config", (req, res) => {
  const db = readDb();
  db.webhookConfig = {
    ...db.webhookConfig,
    ...req.body
  };
  writeDb(db);
  res.json({ success: true, message: "Webhook configuration saved successfully", config: db.webhookConfig });
});

// GET custom proxy status/endpoints
app.get("/api/students", async (req, res) => {
  const db = readDb();
  const config = db.webhookConfig;

  if (config.useWebhook && config.getStudentsUrl) {
    try {
      console.log(`Fetching students from n8n webhook: ${config.getStudentsUrl}`);
      const response = await fetch(config.getStudentsUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        const externalData = await response.json();
        // Assume external webhook returns a list of students or parses appropriately
        if (Array.isArray(externalData)) {
          // If the list is empty, we can choose to return the external array
          return res.json(externalData);
        }
      }
    } catch (error: any) {
      console.error("n8n Webhook failed, falling back to local DB:", error.message);
    }
  }

  res.json(db.students);
});

app.post("/api/students", async (req, res) => {
  const { name, rollNo, class: studentClass, email } = req.body;
  if (!name || !rollNo || !studentClass || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const db = readDb();

  // 1. Validation for duplicate roll number locally
  const rolls = db.students.map((s: any) => s.rollNo.toString().trim());
  if (rolls.includes(rollNo.toString().trim())) {
    return res.status(400).json({ error: `Roll Number "${rollNo}" already exists in the system!` });
  }

  const newStudent = {
    id: `student-${Date.now()}`,
    rollNo: rollNo.toString().trim(),
    name: name.trim(),
    class: studentClass.trim(),
    email: email.trim()
  };

  const config = db.webhookConfig;
  let webhookTriggered = false;
  let webhookError: string | null = null;

  if (config.useWebhook && config.addStudentUrl) {
    try {
      console.log(`Triggering n8n Add Student webhook: ${config.addStudentUrl}`);
      const response = await fetch(config.addStudentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent)
      });
      if (!response.ok) {
        webhookError = `n8n webhook returned status: ${response.statusText}`;
      } else {
        webhookTriggered = true;
      }
    } catch (error: any) {
      webhookError = `n8n webhook network error: ${error.message}`;
    }
  }

  // Save changes locally anyway to maintain out-of-the-box system state consistent with webhook configuration
  db.students.push(newStudent);
  writeDb(db);

  res.json({
    success: true,
    student: newStudent,
    webhookTriggered,
    webhookWarning: webhookError,
    message: webhookError 
      ? `Student added locally, but webhook failed: ${webhookError}` 
      : "Student added successfully to database!"
  });
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const { name, rollNo, class: studentClass, email } = req.body;

  const db = readDb();
  const idx = db.students.findIndex((s: any) => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Cross check duplicate roll number if changing roll number
  const originalStudent = db.students[idx];
  if (rollNo && rollNo.toString().trim() !== originalStudent.rollNo) {
    const rolls = db.students.map((s: any) => s.rollNo.toString().trim());
    if (rolls.includes(rollNo.toString().trim())) {
      return res.status(400).json({ error: `Roll Number "${rollNo}" already exists!` });
    }
  }

  db.students[idx] = {
    ...originalStudent,
    name: name ? name.trim() : originalStudent.name,
    rollNo: rollNo ? rollNo.toString().trim() : originalStudent.rollNo,
    class: studentClass ? studentClass.trim() : originalStudent.class,
    email: email ? email.trim() : originalStudent.email
  };

  writeDb(db);
  res.json({ success: true, student: db.students[idx] });
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const student = db.students.find((s: any) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Remove the student
  db.students = db.students.filter((s: any) => s.id !== id);
  // Optional: remove their attendance logs too, or keep them
  db.attendance = db.attendance.filter((a: any) => a.rollNo !== student.rollNo);

  writeDb(db);
  res.json({ success: true, message: "Student deleted successfully" });
});

// Attendance API
app.get("/api/attendance", (req, res) => {
  const { date } = req.query;
  const targetDate = date ? date.toString() : new Date().toISOString().split("T")[0];

  const db = readDb();
  // Filter attendance records on that date
  const records = db.attendance.filter((r: any) => r.date === targetDate);

  res.json({
    date: targetDate,
    records
  });
});

app.post("/api/attendance", async (req, res) => {
  const { date, records } = req.body; // records is an array of { rollNo, name, status: 'Present' | 'Absent' }
  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ error: "Invalid attendance dataset submitted" });
  }

  const db = readDb();

  // Clear existing attendance records for that day to avoid copies
  db.attendance = db.attendance.filter((r: any) => r.date !== date);

  let recordId = Date.now();
  const logsToSave = records.map((r: any) => ({
    id: `att-${recordId++}`,
    date,
    rollNo: r.rollNo.toString().trim(),
    name: r.name,
    status: r.status === "Present" ? "Present" : "Absent"
  }));

  db.attendance.push(...logsToSave);
  writeDb(db);

  const config = db.webhookConfig;
  let webhookTriggered = false;
  let webhookError: string | null = null;

  if (config.useWebhook && config.saveAttendanceUrl) {
    try {
      console.log(`Triggering n8n Save Attendance webhook: ${config.saveAttendanceUrl}`);
      const response = await fetch(config.saveAttendanceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records: logsToSave })
      });
      if (!response.ok) {
        webhookError = `n8n webhook error: ${response.statusText}`;
      } else {
        webhookTriggered = true;
      }
    } catch (error: any) {
      webhookError = `n8n Webhook Network Error: ${error.message}`;
    }
  }

  res.json({
    success: true,
    count: logsToSave.length,
    webhookTriggered,
    webhookWarning: webhookError,
    message: webhookError ? `Attendance saved locally, but webhook failed: ${webhookError}` : "Attendance verified and stored successfully!"
  });
});

// Analytics Dashboard metrics
app.get("/api/reports", (req, res) => {
  const db = readDb();
  const students = db.students;
  const attendance = db.attendance;

  // Active or distinct days in attendance log
  const distinctDates = Array.from(new Set(attendance.map((r: any) => r.date))).sort();
  const totalDays = distinctDates.length;

  // Student specific stats
  const studentReports = students.map((s: any) => {
    const studentLogs = attendance.filter((r: any) => r.rollNo === s.rollNo);
    const presentDays = studentLogs.filter((r: any) => r.status === "Present").length;
    const absentDays = studentLogs.filter((r: any) => r.status === "Absent").length;
    const studentTotalDays = studentLogs.length;
    const attendancePercentage = studentTotalDays > 0 ? Math.round((presentDays / studentTotalDays) * 100) : 100;

    return {
      rollNo: s.rollNo,
      name: s.name,
      class: s.class,
      email: s.email,
      totalDays: studentTotalDays,
      presentDays,
      absentDays,
      percentage: attendancePercentage
    };
  });

  // Calculate overall metrics for today (which we assume is the latest date recorded)
  const latestDate = distinctDates[distinctDates.length - 1] || "None Rec";
  const latestLogs = attendance.filter((r: any) => r.date === latestDate);
  const presentToday = latestLogs.filter((r: any) => r.status === "Present").length;
  const absentToday = latestLogs.filter((r: any) => r.status === "Absent").length;

  const totalPresentLogs = attendance.filter((r: any) => r.status === "Present").length;
  const totalLogsCount = attendance.length;
  const overallPercentage = totalLogsCount > 0 ? Math.round((totalPresentLogs / totalLogsCount) * 100) : 100;

  res.json({
    totalStudents: students.length,
    presentToday,
    absentToday,
    latestDate,
    overallPercentage,
    totalHistoryDays: totalDays,
    datesList: distinctDates,
    studentReports,
    recentActivity: attendance.slice(-10).reverse() // Last 10 records
  });
});

// -------------------------------------------------------------
// Vite Express Middleware & Static Asset Handling
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Attendance System running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Failed to start server bootstrap:", err);
});
