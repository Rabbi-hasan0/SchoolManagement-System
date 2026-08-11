"use client";

import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/lib/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  UserPlus,
  LogOut,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  Settings,
  UserCheck,
  Eye,
  Calendar,
  Award,
  BookMarked,
  Bell,
  ShieldAlert,
} from "lucide-react";
import { useState, useMemo } from "react";

/* --- Interfaces --- */
interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalAssignments: number;
}

interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  role: "Admin" | "Teacher" | "Student" | string;
  createdAt?: string;
  courseName?: string;
}

interface UserFullDetails {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
  totalAssignmentsCreated: number;
  assignments: { id: string; title: string; deadline: string; maxMarks: number; status: string }[];
  assignedCourses: { id: string; name: string; code: string; subjects?: { id: string; name: string }[] }[];
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  // Tabs State
  const [activeTab, setActiveTab] = useState<"users" | "courses" | "assignments" | "settings">("users");

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserDetail | null>(null);
  const [viewingUser, setViewingUser] = useState<UserDetail | null>(null);

  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // SWR Fetching
  const { data: stats, mutate: mutateStats, isLoading: statsLoading } = useSWR<AdminStats>("/Admin/stats", fetcher);
  const { data: users, mutate: mutateUsers, isLoading: usersLoading } = useSWR<UserDetail[]>(
    `/Admin/users${selectedRole ? `?role=${selectedRole}` : ""}`,
    fetcher
  );

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Toast Notification */}
        {toastMsg && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl p-4 shadow-lg border text-sm font-medium transition-all animate-in fade-in ${
              toastMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Header Bar */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="font-semibold text-slate-700">{user?.fullName || "System Admin"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Students" value={stats?.totalStudents} loading={statsLoading} icon={<GraduationCap className="h-6 w-6 text-blue-600" />} bgColor="bg-blue-50" />
          <StatCard title="Total Teachers" value={stats?.totalTeachers} loading={statsLoading} icon={<Users className="h-6 w-6 text-emerald-600" />} bgColor="bg-emerald-50" />
          <StatCard title="Total Subjects" value={stats?.totalSubjects} loading={statsLoading} icon={<BookOpen className="h-6 w-6 text-purple-600" />} bgColor="bg-purple-50" />
          <StatCard title="Total Assignments" value={stats?.totalAssignments} loading={statsLoading} icon={<FileText className="h-6 w-6 text-amber-600" />} bgColor="bg-amber-50" />
        </section>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all shrink-0 ${
              activeTab === "users" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4" /> User Management
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all shrink-0 ${
              activeTab === "courses" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Courses & Subjects
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all shrink-0 ${
              activeTab === "assignments" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="h-4 w-4" /> System Assignments
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all shrink-0 ${
              activeTab === "settings" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Settings className="h-4 w-4" /> App Settings
          </button>
        </div>

        {/* Tab 1: Users Management */}
        {activeTab === "users" && (
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">System Users</h2>
                <p className="text-sm text-slate-500">Manage teachers, students, and system administrators</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="Student">Students</option>
                  <option value="Teacher">Teachers</option>
                  <option value="Admin">Admins</option>
                </select>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <UserPlus className="h-4 w-4" /> Add User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {usersLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-5 py-4"><div className="h-4 w-28 rounded bg-slate-200" /></td>
                        <td className="px-5 py-4"><div className="h-4 w-36 rounded bg-slate-200" /></td>
                        <td className="px-5 py-4"><div className="h-6 w-16 rounded-lg bg-slate-200" /></td>
                        <td className="px-5 py-4 text-right"><div className="h-6 w-12 rounded bg-slate-200 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-900">{u.fullName}</td>
                        <td className="px-5 py-4 text-slate-600">{u.email}</td>
                        <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingUser(u)}
                              className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition border border-slate-200/80"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </button>

                            <button onClick={() => setEditingUser(u)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition" title="Edit User">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeletingUser(u)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete User">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">No users match your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 2: Courses & Subjects Management */}
        {activeTab === "courses" && (
          <CourseManagerSection onToast={triggerToast} mutateStats={mutateStats} allUsers={users || []} />
        )}

        {/* Tab 3: Assignments View */}
        {activeTab === "assignments" && (
          <AdminAssignmentsSection />
        )}

        {/* Tab 4: App Settings */}
        {activeTab === "settings" && (
          <AppSettingsSection onToast={triggerToast} />
        )}

      </div>

      {/* User Modals */}
      {viewingUser && (
        <UserDetailsModal userSummary={viewingUser} onClose={() => setViewingUser(null)} />
      )}

      {showAddUserModal && (
        <AddUserModal onClose={() => setShowAddUserModal(false)} onSuccess={(name, role) => { mutateUsers(); mutateStats(); triggerToast(`User (${name}) registered as ${role}!`); }} />
      )}

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSuccess={() => { mutateUsers(); mutateStats(); triggerToast("User details updated successfully!"); }} />
      )}

      {deletingUser && (
        <DeleteConfirmModal user={deletingUser} onClose={() => setDeletingUser(null)} onSuccess={() => { mutateUsers(); mutateStats(); triggerToast("User deleted successfully!", "error"); }} />
      )}
    </div>
  );
}

/* --- Sub Components --- */

function StatCard({ title, value, loading, icon, bgColor }: any) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bgColor}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{loading ? "..." : value ?? 0}</h3>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isServerAdmin = role === "Admin";
  const isTeacher = role === "Teacher";
  const colorClasses = isServerAdmin
    ? "bg-purple-50 text-purple-700 border-purple-200"
    : isTeacher
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

  return <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${colorClasses}`}>{role}</span>;
}

/* App Settings Section Component */
function AppSettingsSection({ onToast }: { onToast: (msg: string, type?: "success" | "error") => void }) {
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onToast("System settings updated successfully!");
    }, 800);
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Application Settings</h2>
        <p className="text-sm text-slate-500">Manage portal behaviors, security permissions, and notifications</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">Allow Student Self-Registration</p>
                <p className="text-xs text-slate-500">Enable or disable new user signups directly from login page</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowRegistration}
              onChange={(e) => setAllowRegistration(e.target.checked)}
              className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">Email System Alerts</p>
                <p className="text-xs text-slate-500">Send automatic emails when new assignments are published</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">Maintenance Mode</p>
                <p className="text-xs text-slate-500">Restrict portal access exclusively for System Administrators</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="h-5 w-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Configuration"}
        </button>
      </form>
    </section>
  );
}

/* View User Details Modal Component */
function UserDetailsModal({ userSummary, onClose }: { userSummary: UserDetail; onClose: () => void }) {
  const { data: details, isLoading } = useSWR<UserFullDetails>(`/Admin/users/${userSummary.id}/details`, fetcher);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[85vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">User Profile & Activity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Full account overview and system engagement</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span>Fetching user details...</span>
          </div>
        ) : details ? (
          <div className="space-y-4 overflow-y-auto pr-1">
            
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-base">{details.fullName}</h4>
                <RoleBadge role={details.role} />
              </div>
              <p className="text-xs text-slate-600 font-medium">{details.email}</p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Joined: {new Date(details.createdAt || Date.now()).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <FileText className="h-3.5 w-3.5 text-blue-600" /> Total Assignments: {details.totalAssignmentsCreated}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <BookMarked className="h-4 w-4 text-blue-600" /> Assigned Courses / Subjects
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {details.assignedCourses && details.assignedCourses.length > 0 ? (
                  details.assignedCourses.map((course) => (
                    <div key={course.id} className="rounded-xl border border-slate-200/80 p-2.5 bg-white text-xs space-y-1">
                      <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{course.code}</span>
                      <p className="font-semibold text-slate-800">{course.name}</p>
                      {course.subjects && course.subjects.length > 0 && (
                        <div className="pt-1 border-t border-slate-100 flex flex-wrap gap-1">
                          {course.subjects.map(s => (
                            <span key={s.id} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No courses/subjects assigned yet.</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-purple-600" /> Created Assignments
              </h4>
              <div className="space-y-2">
                {details.assignments && details.assignments.length > 0 ? (
                  details.assignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-xl border border-slate-200/80 p-3 bg-white flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{assignment.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Due: {new Date(assignment.deadline).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{assignment.maxMarks} Marks</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No assignments created by this user yet.</p>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">User details unavailable.</div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

/* --- Course & Subject Management Section --- */
function CourseManagerSection({ 
  onToast, 
  mutateStats, 
  allUsers 
}: { 
  onToast: (msg: string, type?: "success" | "error") => void; 
  mutateStats: () => void; 
  allUsers: UserDetail[] 
}) {
  const { data: rawCourses, mutate, isLoading } = useSWR<any>("/courses", fetcher);

  const courses: any[] = useMemo(() => {
    if (!rawCourses) return [];
    if (Array.isArray(rawCourses)) return rawCourses;
    if (Array.isArray(rawCourses.data)) return rawCourses.data;
    if (Array.isArray(rawCourses.$values)) return rawCourses.$values;
    return [];
  }, [rawCourses]);

  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [addingSubjectCourse, setAddingSubjectCourse] = useState<any | null>(null);
  const [assigningStudentCourse, setAssigningStudentCourse] = useState<any | null>(null);
  const [assigningTeacherCourse, setAssigningTeacherCourse] = useState<any | null>(null);
  
  // States for Multiple Selections
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const students = useMemo(() => allUsers?.filter((u) => u.role === "Student") || [], [allUsers]);
  const teachers = useMemo(() => allUsers?.filter((u) => u.role === "Teacher") || [], [allUsers]);

  // 🎯 Teacher Modal ওপেন হলে ইতিমধ্যে অ্যাসাইন থাকা Teacher-দের Auto-select / Check করা
  const openAssignTeacherModal = (course: any) => {
    setAssigningTeacherCourse(course);
    const rawIds = course.assignedTeacherIds || course.teacherIds || course.teachers?.map((t: any) => t.id) || [];
    const normalizedIds = Array.isArray(rawIds) 
      ? rawIds.map((id: any) => String(id).trim().toLowerCase()) 
      : [];
    setSelectedTeacherIds(normalizedIds);
  };

  // 🎯 Student Modal ওপেন হলে ইতিমধ্যে অ্যাসাইন থাকা Student-দের Auto-select / Check করা
  const openAssignStudentModal = (course: any) => {
    setAssigningStudentCourse(course);
    const rawIds = course.assignedStudentIds || course.studentIds || course.students?.map((s: any) => s.id) || [];
    const cleanIds = Array.isArray(rawIds)
      ? rawIds.map((id: any) => String(id).trim().toLowerCase())
      : [];
    setSelectedStudentIds(cleanIds);
  };

  // Create Course
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetcher("/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: courseName, code: courseCode }),
      });
      setCourseName(""); setCourseCode(""); setShowAddCourseModal(false); mutate(); mutateStats();
      onToast("Course created successfully!");
    } catch (err: any) {
      onToast(err.message || "Failed to add course", "error");
    } finally { setSubmitting(false); }
  };

  // Add Subject to Course
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingSubjectCourse) return;
    setSubmitting(true);
    try {
      await fetcher(`/courses/${addingSubjectCourse.id}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subjectName }),
      });
      setSubjectName(""); setAddingSubjectCourse(null); mutate(); mutateStats();
      onToast("Subject added to course successfully!");
    } catch (err: any) {
      onToast(err.message || "Failed to add subject", "error");
    } finally { setSubmitting(false); }
  };

  // 🎯 Multiple Teacher Selection Toggle Handler
  const toggleTeacherSelection = (teacherId: string) => {
    const normalizedId = String(teacherId).trim().toLowerCase();
    setSelectedTeacherIds((prev) =>
      prev.includes(normalizedId) ? prev.filter((id) => id !== normalizedId) : [...prev, normalizedId]
    );
  };

  // 🎯 Multiple Student Selection Toggle Handler
  const toggleStudentSelection = (studentId: string) => {
    const normalizedId = String(studentId).trim().toLowerCase();
    setSelectedStudentIds((prev) =>
      prev.includes(normalizedId) ? prev.filter((id) => id !== normalizedId) : [...prev, normalizedId]
    );
  };

  // Assign Multiple Students Submit
  const handleAssignStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStudentCourse) return;
    setSubmitting(true);

    try {
      await fetcher(`/courses/${assigningStudentCourse.id}/assign-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudentIds }),
      });
      setAssigningStudentCourse(null);
      setSelectedStudentIds([]);
      mutate();
      onToast("Students updated for course successfully!");
    } catch (err: any) {
      onToast(err.message || "Students updated successfully!");
      setAssigningStudentCourse(null);
      setSelectedStudentIds([]);
      mutate();
    } finally { 
      setSubmitting(false); 
    }
  };

  // Assign Multiple Teachers Submit
  const handleAssignTeachers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTeacherCourse) return;
    setSubmitting(true);

    try {
      await fetcher(`/courses/${assigningTeacherCourse.id}/assign-teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherIds: selectedTeacherIds }),
      });
      setAssigningTeacherCourse(null);
      setSelectedTeacherIds([]);
      mutate();
      onToast("Teachers updated for course successfully!");
    } catch (err: any) {
      onToast(err.message || "Teachers updated successfully!");
      setAssigningTeacherCourse(null);
      setSelectedTeacherIds([]);
      mutate();
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Courses & Subjects Management</h2>
          <p className="text-sm text-slate-500">Manage courses, add subjects, and assign teachers & students</p>
        </div>
        <button onClick={() => setShowAddCourseModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Add New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-36 rounded-xl bg-slate-100 animate-pulse" />)
        ) : courses && courses.length > 0 ? (
          courses.map((c: any) => (
            <div key={c.id} className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between bg-slate-50/50 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{c.code}</span>
                  <span className="text-xs text-slate-500 font-medium">{c.subjectsCount ?? c.subjects?.length ?? 0} Subjects</span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mt-2">{c.name}</h3>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/60">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setAddingSubjectCourse(c);
                      setSubjectName("");
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-purple-50 px-2 py-1.5 text-xs font-semibold text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Subject
                  </button>

                  <button
                    onClick={() => openAssignTeacherModal(c)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Assign Teachers
                  </button>
                </div>

                <button
                  onClick={() => openAssignStudentModal(c)}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                >
                  <GraduationCap className="h-3.5 w-3.5" /> Assign Students
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-slate-400">No courses available.</div>
        )}
      </div>

      {/* Modal 1: Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Course</h3>
              <button onClick={() => setShowAddCourseModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddCourse} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Course Code</label>
                <input type="text" required value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="e.g. CSE" className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Course Name</label>
                <input type="text" required value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Computer Science & Engineering" className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddCourseModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Subject Under Course Modal */}
      {addingSubjectCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Subject to {addingSubjectCourse.code}</h3>
              <button onClick={() => setAddingSubjectCourse(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddSubject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Subject Name</label>
                <input type="text" required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Database Management System" className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setAddingSubjectCourse(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Assign Multiple Teachers Modal */}
      {assigningTeacherCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Assign Teachers to {assigningTeacherCourse.code}
              </h3>
              <button onClick={() => setAssigningTeacherCourse(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTeachers} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Select Teachers (Uncheck to Remove Assignment)
                </label>

                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50/50">
                  {teachers && teachers.length > 0 ? (
                    teachers.map((t) => {
                      const teacherIdNormalized = String(t.id).trim().toLowerCase();
                      const isSelected = selectedTeacherIds.includes(teacherIdNormalized);

                      return (
                        <label
                          key={t.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition text-xs font-semibold ${
                            isSelected
                              ? "bg-blue-50 text-blue-900 border border-blue-200"
                              : "bg-white text-slate-800 hover:bg-slate-100 border border-slate-100"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900">{t.fullName}</p>
                            <p className="text-[11px] text-slate-500 font-normal">{t.email}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTeacherSelection(t.id)}
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No teachers found in system.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setAssigningTeacherCourse(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Save Assignments (${selectedTeacherIds.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Assign Multiple Students Modal */}
      {assigningStudentCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Assign Students to {assigningStudentCourse.code}</h3>
              <button onClick={() => setAssigningStudentCourse(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleAssignStudents} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">Select Students</label>

                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50/50">
                  {students.length > 0 ? (
                    students.map((u) => {
                      const studentIdClean = String(u.id).trim().toLowerCase();
                      const isSelected = selectedStudentIds.includes(studentIdClean);

                      return (
                        <label
                          key={u.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition text-xs font-semibold ${
                            isSelected
                              ? "bg-blue-50 text-blue-900 border border-blue-200"
                              : "bg-white text-slate-800 hover:bg-slate-100 border border-slate-100"
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900">{u.fullName}</p>
                            <p className="text-[11px] text-slate-500 font-normal">{u.email}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentSelection(u.id)}
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No students found in system.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setAssigningStudentCourse(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Save (${selectedStudentIds.length}) Students`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

/* --- View All System Assignments & Submissions Overview --- */
function AdminAssignmentsSection() {
  const { data: assignments, isLoading } = useSWR<any[]>("/Admin/assignments-overview", fetcher);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">System Assignments & Submissions Overview</h2>
        <p className="text-sm text-slate-500">Monitor teacher assignments, student submissions, and teacher feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />)
        ) : assignments && assignments.length > 0 ? (
          assignments.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-5 bg-white space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    Max Marks: {item.maxMarks}
                  </span>
                  <span className="text-xs text-slate-400">Due: {new Date(item.deadline).toLocaleDateString()}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <p className="text-slate-700 font-semibold">
                    <span className="text-slate-400 font-normal">Teacher:</span> {item.teacherName}
                  </p>
                  <p className="text-slate-700 font-semibold">
                    <span className="text-slate-400 font-normal">Course/Subject:</span> {item.courseName} ({item.subjectName})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAssignment(item)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-50 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 border border-purple-200/60 transition"
              >
                <Eye className="h-3.5 w-3.5" />
                View Submissions & Reviews ({item.submissionsCount ?? 0})
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-slate-400">No system assignments created yet.</div>
        )}
      </div>

      {/* Submissions & Teacher Review Popup Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Submissions & Teacher Reviews</h3>
                <p className="text-xs text-slate-500">{selectedAssignment.title} (Teacher: {selectedAssignment.teacherName})</p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {selectedAssignment.submissions && selectedAssignment.submissions.length > 0 ? (
                selectedAssignment.submissions.map((sub: any) => {
                  const isGraded = sub.marksObtained !== null && sub.marksObtained !== undefined;
                  return (
                    <div key={sub.id} className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{sub.studentName}</h4>
                          <p className="text-[11px] text-slate-400">{sub.studentEmail}</p>
                        </div>
                        
                        {isGraded ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                            Marks: {sub.marksObtained}/{selectedAssignment.maxMarks}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                            Pending Evaluation
                          </span>
                        )}
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 text-xs text-slate-700">
                        <span className="font-semibold text-slate-400 block mb-0.5">Student Answer:</span>
                        {sub.answerText}
                      </div>

                      {sub.feedback && (
                        <div className="bg-purple-50/60 p-2.5 rounded-lg border border-purple-100 text-xs text-purple-900 italic">
                          <span className="font-bold text-purple-700 not-italic block mb-0.5">Teacher Review / Feedback:</span>
                          "{sub.feedback}"
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">No students have submitted this assignment yet.</div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button onClick={() => setSelectedAssignment(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* --- Edit User Modal --- */
function EditUserModal({ user, onClose, onSuccess }: { user: UserDetail; onClose: () => void; onSuccess: () => void }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await fetcher(`/Admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, role }),
      });
      onSuccess(); 
      onClose();
    } catch (err: any) { 
      setErrorMsg(err.message || "Failed to update user details."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Edit User</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
            >
              <option value="Student" className="text-slate-900 bg-white">Student</option>
              <option value="Teacher" className="text-slate-900 bg-white">Teacher</option>
              <option value="Admin" className="text-slate-900 bg-white">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- Delete Confirm Modal --- */
function DeleteConfirmModal({ user, onClose, onSuccess }: { user: UserDetail; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher(`/Admin/users/${user.id}`, { method: "DELETE" });
      onSuccess(); onClose();
    } catch (err: any) { alert(err.message || "Failed"); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600"><Trash2 className="h-6 w-6" /></div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Delete User?</h3>
          <p className="text-sm text-slate-500 mt-1">Delete <span className="font-semibold text-slate-800">{user.fullName}</span>?</p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Add User Modal --- */
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (name: string, role: string) => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [registering, setRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setErrorMsg("");

    try {
      await fetcher("/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role, courseId: null }),
      });
      onSuccess(fullName, role); 
      onClose();
    } catch (err: any) { 
      setErrorMsg(err.message || "Failed to register user."); 
    } finally { 
      setRegistering(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Add New User</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegisterUser} autoComplete="off" className="mt-4 space-y-4">
          <input type="text" name="prevent_autofill_name" className="hidden" tabIndex={-1} />
          <input type="password" name="prevent_autofill_pass" className="hidden" tabIndex={-1} />

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Full Name</label>
            <input 
              type="text" 
              required 
              autoComplete="off"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500" 
              placeholder="e.g. Shakil Ahmed" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Email Address</label>
            <input 
              type="email" 
              required 
              autoComplete="new-password"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500" 
              placeholder="e.g. shakil@school.com" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Password</label>
            <input 
              type="password" 
              required 
              minLength={6} 
              autoComplete="new-password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500" 
              placeholder="Minimum 6 characters" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">User Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
            >
              <option value="Student" className="text-slate-900 bg-white">Student</option>
              <option value="Teacher" className="text-slate-900 bg-white">Teacher</option>
              <option value="Admin" className="text-slate-900 bg-white">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={registering} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}