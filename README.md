# Assignment Management System (AMS)

A robust, full-stack Assignment Management System built with **.NET 9 Web API** for the backend and **Next.js (React) / Tailwind CSS** for the frontend. The portal enables seamless collaboration between System Administrators, Teachers, and Students.

---

## 🚀 Key Features

### 👨‍💼 Administrator Portal
- **User Management**: Full CRUD operations for Admin, Teacher, and Student roles.
- **Course & Subject Management**: Create courses, add subjects, and assign teachers/students via Many-to-Many relationships.
- **System-wide Overview**: View all active courses, teacher assignments, student enrollments, and global system stats.
- **Application Settings**: Toggle registration policies, email alerts, and maintenance mode.

### 👨‍🏫 Teacher Portal
- **Dashboard Overview**: View assigned courses, subjects, and student count.
- **Assignment Creation**: Create, update, and manage assignments with deadlines and max marks.
- **Submission Grading**: Review student submissions, assign marks, and provide text feedback.

### 👨‍🎓 Student Portal
- **Enrolled Courses**: View courses and subjects enrolled in.
- **Assignment Portal**: View active assignments and submit solutions (Text/URL/File links).
- **Grade & Feedback Tracking**: View evaluation results, obtained marks, and teacher reviews.

---

## 🛠️ Technology Stack

- **Backend**: C# .NET 9 Web API, Entity Framework Core 9
- **Frontend**: Next.js (React 18+ / TypeScript), Tailwind CSS, SWR
- **Database**: PostGress
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **Architecture**: Clean Architecture / Layered (Core, Infrastructure, API, Tests)

---

## 🔗 API Endpoints Overview

Below is the list of all RESTful API endpoints organized by controller:

### 🔑 Authentication (`/api/Auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Auth/login` | Public | Authenticate user & generate JWT Token |
| `POST` | `/api/Auth/register` | Public / Admin | Register a new user |

### 👨‍💼 Admin Management (`/api/Admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Admin/stats` | Admin | Get dashboard statistics (counts) |
| `GET` | `/api/Admin/users` | Admin | Get all system users (filterable by role) |
| `PUT` | `/api/Admin/users/{id}` | Admin | Update user details & role |
| `DELETE` | `/api/Admin/users/{id}` | Admin | Delete a user from system |
| `GET` | `/api/Admin/users/{id}/details` | Admin | View full user profile & activity |
| `GET` | `/api/Admin/assignments-overview` | Admin | View system-wide assignments & submissions |

### 📚 Courses & Subjects (`/api/Courses`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Courses` | Authenticated | Get all active courses with counts |
| `POST` | `/api/Courses` | Admin | Create a new course |
| `PUT` | `/api/Courses/{id}` | Admin | Update course details |
| `DELETE` | `/api/Courses/{id}` | Admin | Delete a course |
| `POST` | `/api/Courses/{courseId}/subjects` | Admin | Add a subject under a course |
| `POST` | `/api/Courses/{courseId}/assign-teachers` | Admin | Assign multiple teachers to a course |
| `POST` | `/api/Courses/{courseId}/assign-students` | Admin | Assign multiple students to a course |
| `GET` | `/api/Courses/my-assigned-courses` | Teacher | Get courses assigned to logged-in teacher |

### 📝 Assignments (`/api/Assignments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Assignments` | Authenticated | Get all active assignments |
| `POST` | `/api/Assignments` | Teacher | Create a new assignment |
| `PUT` | `/api/Assignments/{id}` | Teacher | Update assignment details |
| `DELETE` | `/api/Assignments/{id}` | Teacher | Delete an assignment |

### 📤 Submissions & Grading (`/api/Submissions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Submissions` | Student | Submit solution for an assignment |
| `GET` | `/api/Submissions/assignment/{assignmentId}` | Teacher | Get all submissions for an assignment |
| `PUT` | `/api/Submissions/{id}/grade` | Teacher | Grade submission & provide feedback |
| `GET` | `/api/Submissions/my-submissions` | Student | Get submissions made by logged-in student |

---

## 📂 Project Structure

```
AssignmentManagementSystem/
├── AssignmentManagement.API/           # Web API Project (Controllers, Program.cs, Middlewares)
├── AssignmentManagement.Core/          # Core Domain (Entities, DTOs, Enums, Interfaces)
├── AssignmentManagement.Infrastructure/# Data Layer (EF Core AppDbContext, Migrations, Seeders)
├── AssignmentManagement.Tests/         # Unit Tests & Integration Tests
└── client/                              # Next.js Frontend Application
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js (v18 or higher)](https://nodejs.org/) & `npm`
- [SQL Server](https://www.microsoft.com/en-us/sql-server/) / LocalDB

---

## ⚙️ Environment Configuration

Do **NOT** commit actual secrets or production keys.

### 1. Backend (`AssignmentManagement.API/appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=AssignmentManagementDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyForJWTTokenGeneration123456!",
    "Issuer": "AssignmentManagementAPI",
    "Audience": "AssignmentManagementUsers"
  }
}
```
## 2. Frontend (client/.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```
💾 Database Setup & MigrationsOpen PowerShell or Terminal in the root directory.
```
//Run Database Migration:PowerShell
`dotnet ef database update --project AssignmentManagement.Infrastructure --startup-project AssignmentManagement.API`

//Running the Application1. Start Backend APIPowerShell
`dotnet run --project AssignmentManagement.API`

//Backend API runs at:
http://localhost:5000Swagger

//Documentation:
http://localhost:5000/swagger2. Start Frontend ApplicationPowerShellcd client

//For frontend
npm install
npm run dev

//Frontend application runs at:
http://localhost:3000
```
## Demo Credentials:
 -----------------
 Role    |         Email         |   Password
 -------------------------------------------------
 Admin   | admin@school.com      | Admin123456 
 Teacher | rabbi@school.com      | Teacher123456
 Student | student@school.com    | Student123456
-----------------------------------------------------

















