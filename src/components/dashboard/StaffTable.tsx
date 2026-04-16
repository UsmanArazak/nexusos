"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Toast } from "@/components/ui/Feedback";
import { deleteStaff } from "@/app/dashboard/actions";

interface Staff {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  role: string;
  class_assigned?: string;
  email?: string;
}

interface StaffTableProps {
  initialStaff: Staff[];
  initialCount: number;
}

export default function StaffTable({ initialStaff, initialCount }: StaffTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [staff, setStaff] = useState(initialStaff);
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "all");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const totalPages = Math.ceil(initialCount / 20);

  useEffect(() => {
    setStaff(initialStaff);
  }, [initialStaff]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query, page: 1 });
  };

  const updateFilters = (updates: any) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(updates).forEach((key) => {
      if (updates[key] === "all" || !updates[key]) {
        params.delete(key);
      } else {
        params.set(key, updates[key]);
      }
    });
    router.push(`/dashboard/staff?${params.toString()}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setIsDeleting(id);
    const res = await deleteStaff(id);
    if (res.success) {
      setToast({ message: "Staff record deleted", type: "success" });
      router.refresh();
    } else {
      setToast({ message: res.error || "failed to delete", type: "error" });
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <form onSubmit={handleSearch} className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search name, ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-sm focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all"
          />
          <div className="absolute left-3.5 top-3.5 text-gray-400">🔍</div>
        </form>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              updateFilters({ role: e.target.value, page: 1 });
            }}
            className="px-4 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-sm focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] transition-all"
          >
            <option value="all">All Roles</option>
            <option value="teacher">Teachers</option>
            <option value="staff">Non-Teaching Staff</option>
          </select>

          <Link
            href="/dashboard/staff/new"
            className="px-6 py-3 rounded-2xl bg-[#7C3AED] text-white text-sm font-bold hover:bg-[#6D28D9] transition-all flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20 whitespace-nowrap active:scale-95"
          >
            <span>+</span> Add Staff
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {staff.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-[#9CA3AF] border-b border-[#F3F4F6] bg-[#F9FAFB]/50">
                    <th className="px-8 py-5 font-bold">Employee ID</th>
                    <th className="px-8 py-5 font-bold">Full Name</th>
                    <th className="px-8 py-5 font-bold">Role</th>
                    <th className="px-8 py-5 font-bold">Assigned Class</th>
                    <th className="px-8 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors group">
                      <td className="px-8 py-5 text-sm font-bold text-[#7C3AED] uppercase tracking-tighter">
                        {s.employee_number}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-[#1C1C1C]">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          s.role === 'teacher' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-[#6B7280]">
                        {s.class_assigned || "None"}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/dashboard/staff/${s.id}`}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          >
                            👁️
                          </Link>
                          <Link
                            href={`/dashboard/staff/${s.id}/edit`}
                            className="p-2 rounded-lg hover:bg-[#EDE9FE] text-[#7C3AED] transition-colors"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(s.id, `${s.first_name} ${s.last_name}`)}
                            disabled={isDeleting === s.id}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                          >
                            {isDeleting === s.id ? "..." : "🗑️"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-8 py-6 border-t border-[#F3F4F6] flex justify-between items-center text-sm font-medium">
                <p className="text-[#6B7280]">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => updateFilters({ page: page - 1 })}
                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-40 transition-all font-bold"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => updateFilters({ page: page + 1 })}
                    className="px-4 py-2 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-40 transition-all font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-5xl mb-6 animate-bounce">
              👨‍🏫
            </div>
            <h3 className="text-xl font-bold text-[#1C1C1C] mb-2">No staff records</h3>
            <p className="text-sm text-[#6B7280] mb-8 max-w-xs mx-auto">
              Add your teachers and administrative staff to start managing your school team.
            </p>
            <Link
              href="/dashboard/staff/new"
              className="px-8 py-3 rounded-2xl bg-[#7C3AED] text-white font-bold hover:bg-[#6D28D9] transition-all shadow-xl shadow-[#7C3AED]/25 active:scale-95"
            >
              Add Your First Staff Member
            </Link>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
