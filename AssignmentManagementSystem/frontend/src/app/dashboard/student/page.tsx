"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/lib/api";
import {
  LogOut,
  Send,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  Award,
  FileText,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Eye,
  RefreshCw,
  Hourglass,
  BookOpen,
  Check,
} from "lucide-react";

interface Submission {
  id: string;
  answerText: string;
  submittedAt: string;
  marksObtained?: number | null;
  feedback?: string | null;
  status?: string;
}

interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  subjectName?: string;
  courseName?: string;
  courseCode?: string;
  teacherName?: string;
  mySubmission?: Submission | null;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  
  // Modals State
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [detailsAssignment, setDetailsAssignment] = useState<StudentAssignment | null>(null);
  const [viewResultSubmission, setViewResultSubmission] = useState<{ submission: Submission; maxMarks: number; title: string } | null>(null);

  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "submitted">("all");
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // SWR Fetching (Calls updated GetAssignments endpoint)
  const { data: rawAssignments, mutate: mutateAssignments, isLoading: loadingAssignments } = useSWR<any>("/Assignments", fetcher);

  // Safe Array Normalization
  const assignments: StudentAssignment[] = useMemo(() => {
    if (!rawAssignments) return [];
    if (Array.isArray(rawAssignments)) return rawAssignments;
    if (Array.isArray(rawAssignments.data)) return rawAssignments.data;
    if (Array.isArray(rawAssignments.$values)) return rawAssignments.$values;
    return [];
  }, [rawAssignments]);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filtered Assignments List based on Submission State
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const isSubmitted = !!item.mySubmission;
      if (activeTab === "pending") return !isSubmitted;
      if (activeTab === "submitted") return isSubmitted;
      return true;
    });
  }, [assignments, activeTab]);

  // Stats
  const submittedCount = useMemo(() => {
    return assignments.filter((a) => !!a.mySubmission).length;
  }, [assignments]);

  const pendingCount = useMemo(() => {
    return Math.max(0, assignments.length - submittedCount);
  }, [assignments, submittedCount]);

  // Open Modal for Submit or Resubmit
  const openSubmitModal = (item: StudentAssignment) => {
    setSelectedAssignment(item);
    setAnswerText(item.mySubmission?.answerText || "");
    setErrorMsg("");
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      await fetcher("/Submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          answerText,
        }),
      });

      setAnswerText("");
      setSelectedAssignment(null);
      await mutateAssignments(); // Refresh Assignments list
      triggerToast("Assignment answer submitted successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit assignment.");
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="font-semibold text-slate-700">{user?.fullName || "Student"}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Assigned Coursework</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{assignments.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Pending Work</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{pendingCount}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Submitted Work</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{submittedCount}</h3>
            </div>
          </div>
        </div>

        {/* Assignments Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Class Assignments</h2>
              <p className="text-sm text-slate-500">View details, submit work, and review grades & feedback</p>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab("submitted")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "submitted" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Submitted ({submittedCount})
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {loadingAssignments ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4 animate-pulse">
                  <div className="h-5 w-20 bg-slate-200 rounded" />
                  <div className="h-6 w-3/4 bg-slate-200 rounded" />
                  <div className="h-12 w-full bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredAssignments.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssignments.map((item) => {
                const existingSubmission = item.mySubmission;
                const isPastDeadline = new Date(item.deadline) < new Date();
                const isGraded = existingSubmission?.marksObtained !== null && existingSubmission?.marksObtained !== undefined;

                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-5 transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                          <Award className="h-3.5 w-3.5" />
                          {item.maxMarks} Marks
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            isPastDeadline ? "text-red-600 font-semibold" : "text-slate-500"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(item.deadline).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Course / Subject Tag */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <BookOpen className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">
                          [{item.courseCode || "COURSE"}] {item.subjectName || "Subject"}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      
                      {/* 1. View Details Button */}
                      <button
                        onClick={() => setDetailsAssignment(item)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Details & Instructions
                      </button>

                      {/* 2. Submit / Resubmit Work Button */}
                      {existingSubmission ? (
                        isPastDeadline ? (
                          <div className="w-full rounded-xl bg-emerald-50 p-2 text-center text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Submitted (Deadline Closed)
                          </div>
                        ) : (
                          <button
                            onClick={() => openSubmitModal(item)}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Resubmit / Edit Answer
                          </button>
                        )
                      ) : isPastDeadline ? (
                        <div className="rounded-xl bg-amber-50 p-2 text-center text-xs font-semibold text-amber-700 border border-amber-200 flex items-center justify-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" /> Deadline Passed
                        </div>
                      ) : (
                        <button
                          onClick={() => openSubmitModal(item)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                        >
                          <Send className="h-3.5 w-3.5" /> Submit Answer
                        </button>
                      )}

                      {/* 3. View Result & Feedback Button */}
                      {existingSubmission && (
                        <button
                          onClick={() =>
                            setViewResultSubmission({
                              submission: existingSubmission,
                              maxMarks: item.maxMarks,
                              title: item.title,
                            })
                          }
                          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition border ${
                            isGraded
                              ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          <Award className="h-3.5 w-3.5" /> {isGraded ? `Graded (${existingSubmission.marksObtained}/${item.maxMarks})` : "View Submission Result"}
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-sm">
              <Sparkles className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-900">No assignments found</h3>
              <p className="mt-1 text-sm text-slate-500">
                You're all caught up! No active assignments under this tab.
              </p>
            </div>
          )}
        </section>

      </div>

      {/* Modal 1: View Assignment Details Modal */}
      {detailsAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Assignment Details</h3>
              <button onClick={() => setDetailsAssignment(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                  Max Marks: {detailsAssignment.maxMarks}
                </span>
                {detailsAssignment.subjectName && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    <BookOpen className="h-3 w-3" /> {detailsAssignment.subjectName}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900">{detailsAssignment.title}</h2>
              <p className="text-xs text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <Clock className="h-3.5 w-3.5 text-amber-600" /> Due Date & Time: {new Date(detailsAssignment.deadline).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Instructions / Description</label>
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 border border-slate-200/70 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
                {detailsAssignment.description}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setDetailsAssignment(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Submit / Update Answer Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedAssignment.mySubmission ? "Resubmit / Update Answer" : "Submit Assignment Answer"}
                </h3>
                <p className="text-xs font-medium text-slate-500">{selectedAssignment.title}</p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Your Answer / Solution Links
                </label>
                <textarea
                  required
                  rows={5}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Paste your GitHub repository link, drive URL, or written answer here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedAssignment(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Answer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View Result & Feedback Modal */}
      {viewResultSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Submission Evaluation</h3>
              <button onClick={() => setViewResultSubmission(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center space-y-3 py-1">
              <p className="text-xs font-semibold text-slate-500">{viewResultSubmission.title}</p>

              {/* Status Badge */}
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Status: {viewResultSubmission.submission.status || "Submitted"}
                </span>
              </div>

              {/* Evaluated Marks or Pending Result */}
              {viewResultSubmission.submission.marksObtained !== null && viewResultSubmission.submission.marksObtained !== undefined ? (
                <div className="rounded-2xl bg-emerald-50 p-5 border border-emerald-200 space-y-2">
                  <span className="text-xs font-semibold text-emerald-700 uppercase">Obtained Grade</span>
                  <h2 className="text-3xl font-extrabold text-emerald-800">
                    {viewResultSubmission.submission.marksObtained} <span className="text-base font-normal text-emerald-600">/ {viewResultSubmission.maxMarks}</span>
                  </h2>

                  {viewResultSubmission.submission.feedback && (
                    <div className="pt-3 border-t border-emerald-200/80 text-left">
                      <p className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> Teacher Feedback:
                      </p>
                      <p className="text-xs text-emerald-800 italic mt-1 bg-white p-3 rounded-xl border border-emerald-100 leading-relaxed">
                        "{viewResultSubmission.submission.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-amber-50 p-6 border border-amber-200 text-amber-800 space-y-2">
                  <Hourglass className="h-8 w-8 text-amber-600 mx-auto animate-pulse" />
                  <h4 className="font-bold text-base">Result Pending</h4>
                  <p className="text-xs text-amber-700">
                    Your teacher is currently reviewing your submission. Check back later once evaluation is complete!
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setViewResultSubmission(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}