# School Management System

A comprehensive, enterprise-grade **School Management System (SMS)** built on the **MERN stack (MongoDB, Express.js, React 19, Node.js)** tailored for Indian curriculum institutions (CBSE / State Boards). The platform streamlines institutional administration, faculty workflows, examinations, CBSE grade card generation, fee ledger collections, and real-time student-parent communication.

---

## 📌 Project Overview

The **School Management System** is a unified web portal designed to eliminate manual paperwork and centralize daily school operations. It supports three distinct role-based portals (**Admin/Principal**, **Faculty/Teacher**, and **Student**) with secure JWT authentication and role-based access control (RBAC).

- **Academic Session**: `2026-27`
- **Curriculum Standard**: CBSE 10-point grading matrix ($A1$ to $E$) with Theory & Practical score breakdowns.
- **Financial Architecture**: Composite Indian fee structures with itemized heads (Tuition, Admission, Examination, Computer, and Annual Fee in ₹).
- **Communication Engine**: Categorized Circulars, Student Helpdesk Grievances, and Leave Sanctions Desk with automated notification alerts.

---

## 🚀 Features

- 🔐 **Multi-Role Authentication & RBAC**: Strict separation of concerns across Admin, Teacher, and Student roles with bcrypt password hashing and 24-hour expiring JWT tokens.
- 🎓 **Student Lifecycle Management**: Comprehensive student registration with CBSE Admission Numbers (`ADM/2026/0101`), Roll Numbers, Aadhaar records, and parent contact details.
- 👨‍🏫 **Faculty Directory & Workload**: Teacher profiles with Employee IDs (`EMP-101`), Indian qualifications (M.Sc, B.Ed), subject allocations, and classroom assignments.
- 🏫 **Classroom & Subject Matrix**: Class 9 to Class 12 sections with class teacher assignments, credits, and weekly period limits.
- 📅 **Period-Wise Attendance Tracker**: Subject-wise and daily period attendance logging with instant absence percentage calculations.
- 📝 **Homework & Coursework Desk**: Faculty homework assignment distribution with deadline tracking, student solution uploads, marks entry, and written feedback.
- 📊 **CBSE Examination & Report Card Generator**: Scheduling for Unit Tests, Half-Yearly, Pre-Board, and Annual Examinations with printable official CBSE Report Cards.
- 💰 **Institutional Fee Management**: Fee invoicing, partial installment tracking, remaining dues alerts, and printable Official Fee Payment Receipts.
- ⏱️ **Period-Wise Timetable**: Day-wise period matrices (08:00 AM to 12:00 PM with Tiffin Break) for all classes.
- 📢 **School Communication Hub**: Categorized Notice Board (`Holiday Notice`, `Exam Notice`, `PTM Notice`), Student Grievance Helpdesk, and Teacher Leave Approval Desk.
- 📊 **Institutional Audit & Reporting Engine**: Consolidated analytical reports for Students, Attendance, Results, Fees, Assignments, Complaints, and Leaves with Principal endorsement.
- 📱 **Fully Responsive UI**: Mobile, tablet, and desktop-optimized user experience.

---

## 👥 User Roles

### 👑 1. Admin / Principal
- Full institutional governance over students, teachers, classes, subjects, timetables, and settings.
- Financial fee invoicing, fee collection recording, and transaction receipts.
- Examination scheduling and school-wide analytical reports generation.

### 👨‍🏫 2. Faculty / Class Teacher
- Access restricted to assigned classes and subjects.
- Subject-wise and daily attendance marking.
- Homework assignment publishing and student submission grading.
- CBSE marks entry for Unit Tests and Term Examinations.
- Leave application sanctioning and student grievance redressal.

### 🎒 3. Student
- Strict privacy: Students can only view their own attendance, assignments, marks, and fee invoices.
- Homework submission with file attachments and notes.
- Downloadable official CBSE Report Cards and Fee Receipts.
- Leave request applications and academic query submissions.

---

## 🧩 Modules

| Module | Purpose / Scope |
|---|---|
| **Dashboard** | Real-time institutional telemetry, KPIs, and recent activity logs. |
| **Students** | Indian student registry with profile modals and admission wizards. |
| **Teachers** | Faculty directory with employee IDs, subject mappings, and qualifications. |
| **Classes & Subjects** | Classrooms, section capacities, curriculum codes, and weekly period quotas. |
| **Attendance** | Period-wise present, absent, late, and leave tracking with rate analytics. |
| **Assignments** | Coursework management, submission portals, and grading feedback. |
| **Examinations & Results** | Date sheet scheduling and automated CBSE grading with report cards. |
| **Fee Management** | Fee ledger in ₹, partial collections (UPI, Net Banking), and receipt generation. |
| **Timetable** | Period 1 to 6 daily class schedules with tiffin break slots. |
| **Communication** | Notice board circulars, grievance redressals, and leave approvals. |
| **Institutional Reports** | Exportable regulatory audits with official affiliations. |

---

## 💻 Technology Stack

- **Frontend**: React 19, Vite 8, React Router DOM 7, Axios, Lucide Icons, Modern Responsive CSS
- **Backend**: Node.js (v24), Express.js (v5), Mongoose 9, JSON Web Tokens (JWT), Bcrypt.js, CORS, Dotenv
- **Database**: MongoDB (Local or MongoDB Atlas)
- **Architecture**: RESTful API with Model-View-Controller (MVC) and JWT Bearer Token Guards

---

## 📁 Project Structure

```
School-Management-System/
├── .gitignore
├── README.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   └── api.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── admin/
│       │       ├── AdminLayout.jsx
│       │       └── AdminSidebar.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── AdminDashboard.jsx
│           ├── TeacherDashboard.jsx
│           ├── StudentDashboard.jsx
│           └── admin/
│               ├── AdminOverview.jsx
│               └── modules/
│                   ├── StudentsModule.jsx
│                   ├── TeachersModule.jsx
│                   ├── ClassesModule.jsx
│                   ├── SubjectsModule.jsx
│                   ├── AttendanceModule.jsx
│                   ├── NoticesModule.jsx
│                   ├── ComplaintsModule.jsx
│                   ├── FeesModule.jsx
│                   ├── LeavesModule.jsx
│                   └── AcademicModules.jsx
└── server/
    ├── package.json
    ├── server.js
    ├── config/
    │   └── db.js
    ├── middlewares/
    │   └── authMiddleware.js
    ├── models/
    │   ├── User.js
    │   ├── Student.js
    │   ├── Teacher.js
    │   ├── Class.js
    │   ├── Subject.js
    │   ├── Attendance.js
    │   ├── Assignment.js
    │   ├── Exam.js
    │   ├── Result.js
    │   ├── Fee.js
    │   ├── Timetable.js
    │   ├── Notice.js
    │   ├── Complaint.js
    │   ├── Leave.js
    │   ├── Notification.js
    │   ├── Activity.js
    │   └── SchoolProfile.js
    ├── controllers/
    │   ├── authController.js
    │   ├── adminController.js
    │   ├── attendanceController.js
    │   ├── assignmentController.js
    │   ├── academicController.js
    │   ├── communicationController.js
    │   └── financeController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── adminRoutes.js
    │   ├── attendanceRoutes.js
    │   ├── assignmentRoutes.js
    │   ├── academicRoutes.js
    │   ├── communicationRoutes.js
    │   └── financeRoutes.js
    └── scripts/
        ├── seed.js
        └── testEndToEnd.js
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v18+ (Tested on v24)
- **MongoDB**: Local MongoDB community service running or MongoDB Atlas connection string.
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/school-management-system.git
cd school-management-system
```

### 2. Configure Backend Environment
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/school_management
JWT_SECRET=supersecretjwtkey_school_mgmt_2026
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# 1. Install Server Dependencies
cd server
npm install

# 2. Install Client Dependencies
cd ../client
npm install
```

---

## 🏃 Running Locally

### Start Backend API Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend Vite Server
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Quick Description |
|---|---|---|---|
| **👑 Principal / Admin** | `admin@school.com` | `admin123` | Institutional management & reports |
| **👨‍🏫 Class Teacher** | `teacher@school.com` | `teacher123` | Mrs. Neha Sharma (Mathematics Dept) |
| **🎒 Student** | `student@school.com` | `student123` | Aarav Sharma (Class 10-A, Roll #101) |

*(1-Click Demo Login buttons are available directly on the login screen for instant testing).*

---

## 📡 API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Fetch current profile |
| `GET` | `/api/admin/stats` | Admin | Aggregate dashboard metrics |
| `GET` | `/api/admin/students` | Admin, Teacher | List all enrolled students |
| `POST` | `/api/admin/students` | Admin | Register new student |
| `GET` | `/api/attendance/my-attendance` | Student | Fetch personal attendance |
| `POST` | `/api/attendance` | Teacher, Admin | Mark period-wise attendance |
| `GET` | `/api/assignments/my-assignments`| Student | Fetch assigned coursework |
| `POST` | `/api/assignments/:id/submit` | Student | Submit homework deliverable |
| `GET` | `/api/academic/my-results` | Student | Fetch exam results & report cards |
| `GET` | `/api/finance/fees` | Admin | Fetch institutional fee ledger |
| `POST` | `/api/finance/fees` | Admin | Generate fee invoice |
| `PATCH`| `/api/finance/fees/:id/pay` | Admin | Record fee payment transaction |
| `GET` | `/api/finance/timetable` | Authenticated | Fetch class weekly period timetable |
| `GET` | `/api/communication/notices` | Authenticated | Fetch circulars & notice board |
| `POST` | `/api/communication/leaves` | Authenticated | Submit leave application |
| `PATCH`| `/api/communication/leaves/:id/review` | Admin, Teacher | Sanction / reject leave request |
| `GET` | `/api/finance/reports` | Admin | Generate comprehensive institutional report |

---

## 🔮 Future Enhancements

- 🚌 **Live GPS Transport Tracking**: Real-time school bus location map with geofenced arrival alerts.
- 📱 **Mobile Native Application**: React Native mobile app for iOS and Android.
- 💳 **Integrated Payment Gateway**: Automated UPI webhooks and Razorpay/Paytm checkout integration.
- 📲 **Automated WhatsApp / SMS Notifications**: Real-time attendance alerts and circular broadcasts sent directly to parents' mobile phones.

---

## 👨‍💻 Author

**B.Tech Computer Science & Engineering Portfolio Project**  
*Built with passion for modern educational engineering.*
