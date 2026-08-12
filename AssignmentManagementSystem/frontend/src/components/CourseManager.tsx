"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { BookOpen, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function CourseManager() {
  const { data: courses, mutate, isLoading } = useSWR<Course[]>("/Courses", fetcher);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Add Course
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetcher("/Courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });
      setName("");
      setCode("");
      setShowAddModal(false);
      mutate();
    } catch (err: any) {
      alert(err.message || "Failed to add course");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Course
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSubmitting(true);
    try {
      await fetcher(`/Courses/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });
      setEditingCourse(null);
      mutate();
    } catch (err: any) {
      alert(err.message || "Failed to update course");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Course
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await fetcher(`/Courses/${id}`, { method: "DELETE" });
      mutate();
    } catch (err: any) {
      alert(err.message || "Failed to delete course");
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Courses Management</h2>
          <p className="text-sm text-slate-500">Create, edit and manage academic courses</p>
        </div>
        <button
          onClick={() => {
            setName("");
            setCode("");
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-slate-400">Loading courses...</p>
        ) : courses && courses.length > 0 ? (
          courses.map((c) => (
            <div key={c.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{c.code}</span>
                <h3 className="font-bold text-slate-800 mt-1">{c.name}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingCourse(c);
                    setName(c.name);
                    setCode(c.code);
                  }}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No courses available.</p>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingCourse) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingCourse ? "Edit Course" : "Add Course"}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingCourse(null); }} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={editingCourse ? handleUpdate : handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Course Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CSE-101"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600">Course Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Computer Fundamentals"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingCourse(null); }} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCourse ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}