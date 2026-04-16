"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/Feedback";
import { addStudent, updateStudent, generateAdmissionNumber } from "@/app/dashboard/actions";

interface StudentFormProps {
  initialData?: any;
  classes: { id: string; name: string; level: string }[];
  isEdit?: boolean;
}

export default function StudentForm({ initialData, classes, isEdit }: StudentFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    admission_number: initialData?.admission_number || "",
    class_id: initialData?.class_id || "",
    gender: initialData?.gender || "male",
    date_of_birth: initialData?.date_of_birth || "",
    avatar_url: initialData?.avatar_url || "",
  });

  useEffect(() => {
    if (!isEdit && !formData.admission_number) {
      const getNum = async () => {
        const num = await generateAdmissionNumber();
        setFormData(prev => ({ ...prev, admission_number: num }));
      };
      getNum();
    }
  }, [isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.admission_number || !formData.class_id || !formData.date_of_birth) {
      setToast({ message: "Please fill all required fields", type: "error" });
      return;
    }

    setIsPending(true);
    const res = isEdit 
      ? await updateStudent(initialData.id, formData)
      : await addStudent(formData);

    if (res.success) {
      setToast({ message: `Student successfully ${isEdit ? "updated" : "enrolled"}`, type: "success" });
      setTimeout(() => router.push("/dashboard/students"), 1500);
    } else {
      setToast({ message: res.error || "An error occurred", type: "error" });
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 sm:p-12 shadow-sm space-y-10">
          
          {/* Section: Identity */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#1C1C1C] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-xs">01</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm"
                  placeholder="e.g. Samuel"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm"
                  placeholder="e.g. Okon"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section: Enrollment */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#1C1C1C] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-xs">02</span>
              Enrollment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">Admission Number</label>
                <input
                  type="text"
                  required
                  readOnly={isEdit}
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value.toUpperCase() })}
                  className={`w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] font-medium text-sm tracking-widest ${
                    isEdit ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed" : "bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all"
                  }`}
                  placeholder="e.g. NX/2025/001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">Assigned Class</label>
                <select
                  required
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm"
                >
                  <option value="">Select a Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 rounded-2xl border border-[#E5E7EB] text-[#6B7280] font-bold hover:bg-[#F9FAFB] transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-[2] py-4 rounded-2xl bg-[#7C3AED] text-white font-bold hover:bg-[#6D28D9] transition-all shadow-xl shadow-[#7C3AED]/20 active:scale-95 disabled:opacity-50 h-14"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : isEdit ? "Save Changes" : "Enrol Student"}
            </button>
          </div>

        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
