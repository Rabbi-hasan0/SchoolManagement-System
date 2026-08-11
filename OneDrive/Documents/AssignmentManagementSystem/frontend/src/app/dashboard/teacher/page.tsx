"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/lib/api";
import {
  LogOut,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  Award,
  Users,
  AlertCircle,
  MessageSquare,
  Check,
  Pencil,
  Trash2,
  FileEdit,
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  status: "Draft" | "Published" | number;
  subjectId: string;
  subjectName?: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  answerText: string;
  submittedAt: string;
  marksObtained?: number | null;
  feedback?: string | null;
  status: string; // Submitted, Evaluated, Resubmitted
}

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);
  
  const [selectedAssignmentForSub, setSelectedAssignmentForSub] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);

  // Fetch Assignments & ONLY Assigned Subjects for Logged-In Teacher
  const { data: assignments, mutate: mutateAssignments, isLoading } = useSWR<Assignment[]>("/Assignments", fetcher);
  const { data: myAssignedSubjects } = useSWR<any[]>("/Courses/my-assigned-courses", fetcher);

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
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl p-4 shadow-lg border text-sm font-medium transition-all ${
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Teacher Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="font-semibold text-slate-700">{user?.fullName || "Teacher"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Assignments Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Course Assignments</h2>
              <p className="text-sm text-slate-500">Create, manage, publish, and evaluate student work</p>
            </div>
            {assignments && assignments.length > 0 && (
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Total: {assignments.length}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4 animate-pulse">
                  <div className="h-5 w-20 bg-slate-200 rounded" />
                  <div className="h-6 w-3/4 bg-slate-200 rounded" />
                  <div className="h-12 w-full bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : assignments && assignments.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((item) => {
                const isPastDeadline = new Date(item.deadline) < new Date();
                const isPublished = item.status === "Published" || item.status === 2;

                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-5 transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="space-y-3">
                      {/* Top Meta */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                          <Award className="h-3.5 w-3.5" />
                          {item.maxMarks} Marks
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            isPastDeadline ? "text-amber-600 font-semibold" : "text-slate-500"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(item.deadline).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-slate-500 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            <FileEdit className="h-3.5 w-3.5" /> Draft
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingAssignment(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Assignment"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAssignment(item)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Assignment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAssignmentForSub(item)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                      >
                        <Users className="h-3.5 w-3.5" />
                        View Submissions
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-sm">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-base font-bold text-slate-900">No assignments created yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Start by creating your first coursework assignment for students.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" /> Create Assignment
              </button>
            </div>
          )}
        </section>

      </div>

      {/* Modal 1: Create Assignment */}
      {showAddModal && (
        <AssignmentFormModal
          subjects={myAssignedSubjects || []}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            mutateAssignments();
            triggerToast("Assignment created successfully!");
          }}
        />
      )}

      {/* Modal 2: Edit Assignment */}
      {editingAssignment && (
        <AssignmentFormModal
          initialData={editingAssignment}
          subjects={myAssignedSubjects || []}
          onClose={() => setEditingAssignment(null)}
          onSuccess={() => {
            mutateAssignments();
            triggerToast("Assignment updated successfully!");
          }}
        />
      )}

      {/* Modal 3: Delete Assignment */}
      {deletingAssignment && (
        <DeleteAssignmentModal
          assignment={deletingAssignment}
          onClose={() => setDeletingAssignment(null)}
          onSuccess={() => {
            mutateAssignments();
            triggerToast("Assignment deleted successfully!", "error");
          }}
        />
      )}

      {/* Modal 4: View Submissions List */}
      {selectedAssignmentForSub && (
        <SubmissionsModal
          assignment={selectedAssignmentForSub}
          onClose={() => setSelectedAssignmentForSub(null)}
          onGrade={(sub) => setGradingSubmission(sub)}
        />
      )}

      {/* Modal 5: Grade & Review Submission */}
      {gradingSubmission && selectedAssignmentForSub && (
        <GradeSubmissionModal
          submission={gradingSubmission}
          maxMarks={selectedAssignmentForSub.maxMarks}
          onClose={() => setGradingSubmission(null)}
          onSuccess={() => {
            triggerToast("Submission evaluated and status updated!");
          }}
        />
      )}

    </div>
  );
}

/* --- Assignment Create / Edit Form Modal --- */
function AssignmentFormModal({
  initialData,
  subjects,
  onClose,
  onSuccess,
}: {
  initialData?: Assignment;
  subjects: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : ""
  );
  const [maxMarks, setMaxMarks] = useState(initialData?.maxMarks || 100);

  const [subjectId, setSubjectId] = useState(
    initialData?.subjectId || (subjects && subjects.length > 0 ? subjects[0].subjectId || subjects[0].id : "")
  );

  const [isPublished, setIsPublished] = useState(
    initialData ? initialData.status === "Published" || initialData.status === 2 : true
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!subjectId && subjects && subjects.length > 0) {
      setSubjectId(subjects[0].subjectId || subjects[0].id);
    }
  }, [subjects, subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const finalSubjectId = subjectId || (subjects && subjects.length > 0 ? subjects[0].subjectId || subjects[0].id : "");

    if (!finalSubjectId) {
      setErrorMsg("Please select an assigned course/subject first.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = initialData ? `/Assignments/${initialData.id}` : "/Assignments";
      const method = initialData ? "PUT" : "POST";

      await fetcher(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          deadline: new Date(deadline).toISOString(),
          maxMarks: Number(maxMarks),
          isPublished,
          subjectId: finalSubjectId,
        }),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {initialData ? "Edit Assignment" : "Create New Assignment"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500"
              placeholder="e.g. Midterm Programming Assignment"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Assign Course / Subject</label>
            {subjects && subjects.length > 0 ? (
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
              >
                {subjects.map((s) => {
                  const sId = s.subjectId || s.id;
                  const displayName = s.courseName
                    ? `[${s.courseCode || "CSE"}] ${s.courseName} - ${s.subjectName || s.name}`
                    : `${s.code ? `${s.code} - ` : ""}${s.name}`;

                  return (
                    <option key={sId} value={sId} className="text-slate-900 bg-white">
                      {displayName}
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="p-3 text-xs text-amber-800 bg-amber-50 rounded-xl border border-amber-200 font-medium">
                ⚠️ You have not been assigned to any subjects yet. Please ask the Admin to assign you to a subject first.
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500"
              placeholder="Detailed instructions for students..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Deadline</label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Max Marks</label>
              <input
                type="number"
                required
                min={1}
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Status</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                <input
                  type="radio"
                  name="status"
                  checked={isPublished}
                  onChange={() => setIsPublished(true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                Publish Now
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                <input
                  type="radio"
                  name="status"
                  checked={!isPublished}
                  onChange={() => setIsPublished(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                Save as Draft
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={loading || !subjects || subjects.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : initialData ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- Delete Assignment Modal --- */
function DeleteAssignmentModal({
  assignment,
  onClose,
  onSuccess,
}: {
  assignment: Assignment;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher(`/Assignments/${assignment.id}`, { method: "DELETE" });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to delete assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Trash2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Delete Assignment?</h3>
          <p className="text-sm text-slate-500 mt-1">
            Are you sure you want to delete <span className="font-semibold text-slate-800">{assignment.title}</span>?
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Submissions List Sub-Component --- */
function SubmissionsModal({
  assignment,
  onClose,
  onGrade,
}: {
  assignment: Assignment;
  onClose: () => void;
  onGrade: (submission: Submission) => void;
}) {
  const { data: submissions, isLoading } = useSWR<Submission[]>(
    `/Submissions/assignment/${assignment.id}`,
    fetcher
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[85vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Student Submissions</h3>
            <p className="text-xs text-slate-500 mt-0.5">{assignment.title} (Max Marks: {assignment.maxMarks})</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span>Loading submissions...</span>
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const isGraded = sub.marksObtained !== null && sub.marksObtained !== undefined;
                return (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{sub.studentName || "Student"}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                          {sub.status || "Submitted"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 bg-white p-2 rounded-lg border border-slate-100 mt-1">
                        {sub.answerText}
                      </p>
                    </div>

                    <div className="flex item-center sm:flex-col item-end gap-2 shrink-0">
                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                          <Check className="h-3.5 w-3.5" /> Graded: {sub.marksObtained}/{assignment.maxMarks}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                          Pending Review
                        </span>
                      )}

                      <button
                        onClick={() => onGrade(sub)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {isGraded ? "Edit Grade / Status" : "Review & Grade"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              No submissions received for this assignment yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* --- Grade & Status Change Modal Sub-Component --- */
function GradeSubmissionModal({
  submission,
  maxMarks,
  onClose,
  onSuccess,
}: {
  submission: Submission;
  maxMarks: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [marksObtained, setMarksObtained] = useState<number>(submission.marksObtained ?? 0);
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? "");
  const [status, setStatus] = useState<string>(submission.status || "Evaluated");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      await fetcher(`/Submissions/${submission.id}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marksObtained: Number(marksObtained),
          feedback,
          status,
        }),
      });

      // Local State Update
      submission.marksObtained = Number(marksObtained);
      submission.feedback = feedback;
      submission.status = status;

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save evaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Grade & Change Status</h3>
            <p className="text-xs text-slate-500">{submission.studentName || "Student Submission"}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Student Answer</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 max-h-32 overflow-y-auto leading-relaxed">
              {submission.answerText}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">
              Marks Obtained (Max: {maxMarks})
            </label>
            <input
              type="number"
              required
              min={0}
              max={maxMarks}
              value={marksObtained}
              onChange={(e) => setMarksObtained(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Submission Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="Evaluated">Evaluated</option>
              <option value="Submitted">Submitted</option>
              <option value="Resubmitted">Resubmitted</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600">Feedback / Remarks</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Well written! Good understanding of the topic."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Evaluation"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}