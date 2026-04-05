"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Toast } from "@/components/ui/Feedback";
import { addClass, updateClass, deleteClass } from "@/app/dashboard/actions";

interface Class {
  id: string;
  name: string;
  level: string; // ARM
  student_count: number;
}

interface ClassesTableProps {
  initialClasses: Class[];
}

export default function ClassesTable({ initialClasses }: ClassesTableProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: "", arm: "" });
  const [isPending, setIsPending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const router = useRouter();

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({ name: "", arm: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Class) => {
    setEditingClass(c);
    setFormData({ name: c.name, arm: c.level });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.arm.trim()) {
      setToast({ message: "Please fill in all fields", type: "error" });
      return;
    }

    setIsPending(true);
    const res = editingClass
      ? await updateClass(editingClass.id, formData)
      : await addClass(formData);

    if (res.success) {
      setToast({ message: `Class successfully ${editingClass ? "updated" : "added"}`, type: "success" });
      setIsModalOpen(false);
      router.refresh();
      // Optimistic upate or refresh
    } else {
      setToast({ message: res.error || "An error occurred", type: "error" });
    }
    setIsPending(false);
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      setToast({ message: "Cannot delete class: Students are still assigned to it.", type: "error" });
      return;
    }

    if (!confirm("Are you sure you want to delete this class?")) return;

    setIsPending(true);
    const res = await deleteClass(id);
    if (res.success) {
      setToast({ message: "Class deleted successfully", type: "success" });
      router.refresh();
    } else {
      setToast({ message: res.error || "An error occurred", type: "error" });
    }
    setIsPending(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-[#E5E7EB] flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-[#1C1C1C]">All Classes</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Manage your school arms and grade levels.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-all flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20 active:scale-95"
        >
          <span>+</span> Add Class
        </button>
      </div>

      {initialClasses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-[#9CA3AF] border-b border-[#F3F4F6] bg-[#F9FAFB]/50">
                <th className="px-8 py-4 font-bold">Class Name</th>
                <th className="px-8 py-4 font-bold">Arm</th>
                <th className="px-12 py-4 font-bold">Students</th>
                <th className="px-8 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {initialClasses.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-[#1C1C1C]">{c.name}</td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] group-hover:bg-white transition-colors uppercase">
                      {c.level}
                    </span>
                  </td>
                  <td className="px-12 py-5 text-sm font-medium text-[#1C1C1C]">{c.student_count}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-2 rounded-lg hover:bg-[#EDE9FE] text-[#7C3AED] transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.student_count)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-20 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-5xl mb-6 animate-bounce">🏫</div>
          <h3 className="text-xl font-bold text-[#1C1C1C] mb-2" style={{ fontFamily: "var(--font-display)" }}>No classes yet</h3>
          <p className="text-sm text-[#6B7280] mb-8 max-w-xs mx-auto">Establish your grade levels and classroom divisions to begin enrollment.</p>
          <button
            onClick={handleOpenAdd}
            className="px-8 py-3 rounded-2xl bg-[#7C3AED] text-white font-bold hover:bg-[#6D28D9] transition-all shadow-xl shadow-[#7C3AED]/25 active:scale-95"
          >
            Create Your First Class
          </button>
        </div>
      )}

      {/* Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? "Edit Class" : "Add New Class"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Class Name</label>
            <input
              type="text"
              placeholder="e.g. JSS 1, SS 2"
              className="w-full px-5 py-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm text-[#1C1C1C] placeholder-[#9CA3AF]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Arm</label>
            <input
              type="text"
              placeholder="e.g. A, B, C"
              className="w-full px-5 py-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm text-[#1C1C1C] placeholder-[#9CA3AF]"
              value={formData.arm}
              onChange={(e) => setFormData({ ...formData, arm: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 rounded-2xl bg-[#7C3AED] text-white font-bold hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20 active:scale-95 disabled:opacity-50 mt-4 h-14 relative"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              editingClass ? "Save Changes" : "Create Class"
            )}
          </button>
        </form>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
