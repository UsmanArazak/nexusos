"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/Feedback";
import { bulkUpsertResults, getExistingScores } from "@/app/dashboard/actions";
import { calculateGrade } from "@/lib/resultsUtils";


interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
}

interface Props {
  classes: { id: string; name: string; level: string }[];
  subjects: { id: string; name: string; code: string }[];
  studentsByClass: Record<string, Student[]>;
}

const TERMS = ["First Term", "Second Term", "Third Term"];

function currentSession() {
  const now = new Date();
  const year = now.getFullYear();
  // Academic session: Sept–Aug. If month is Sept or later, session starts this year.
  const startYear = now.getMonth() >= 8 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-600 bg-green-50",
  B: "text-blue-600 bg-blue-50",
  C: "text-yellow-700 bg-yellow-50",
  D: "text-orange-600 bg-orange-50",
  F: "text-red-600 bg-red-50",
};

export default function ResultsEntryForm({ classes, subjects, studentsByClass }: Props) {
  const router = useRouter();

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [term, setTerm] = useState(TERMS[0]);
  const [session, setSession] = useState(currentSession());
  const [scores, setScores] = useState<Record<string, string>>({}); // studentId → raw string input
  const [isPending, setIsPending] = useState(false);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const students: Student[] = classId ? (studentsByClass[classId] ?? []) : [];

  // Load existing scores whenever the filter set changes
  const loadExisting = useCallback(async () => {
    if (!classId || !subjectId || !term || !session) return;
    setIsLoadingScores(true);
    const res = await getExistingScores({ classId, subjectId, term, session });
    if (res.success && res.scoreMap) {
      const mapped: Record<string, string> = {};
      Object.entries(res.scoreMap).forEach(([sid, s]) => {
        mapped[sid] = String(s);
      });
      setScores(mapped);
    } else {
      setScores({});
    }
    setIsLoadingScores(false);
  }, [classId, subjectId, term, session]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const handleScoreChange = (studentId: string, raw: string) => {
    setScores((prev) => ({ ...prev, [studentId]: raw }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classId || !subjectId || !term || !session) {
      setToast({ message: "Please select all filter fields before saving.", type: "error" });
      return;
    }

    if (students.length === 0) {
      setToast({ message: "No students found for the selected class.", type: "error" });
      return;
    }

    // Validate each score
    const scoreEntries: { studentId: string; score: number }[] = [];
    for (const student of students) {
      const raw = scores[student.id] ?? "";
      if (raw === "" || raw === undefined) continue; // skip blanks — allow partial saves

      const parsed = parseFloat(raw);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        setToast({
          message: `Invalid score for ${student.first_name} ${student.last_name}. Must be 0–100.`,
          type: "error",
        });
        return;
      }
      scoreEntries.push({ studentId: student.id, score: parsed });
    }

    if (scoreEntries.length === 0) {
      setToast({ message: "Enter at least one score before saving.", type: "error" });
      return;
    }

    setIsPending(true);
    const res = await bulkUpsertResults({ classId, subjectId, term, session, scores: scoreEntries });

    if (res.success) {
      setToast({ message: `${scoreEntries.length} score(s) saved successfully.`, type: "success" });
      router.refresh();
    } else {
      setToast({ message: res.error || "Failed to save scores.", type: "error" });
    }
    setIsPending(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Filter Bar */}
      <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm">
        <h2 className="text-lg font-bold text-[#1C1C1C] mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-xs font-black">01</span>
          Select Class, Subject & Term
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Class</label>
            <select
              value={classId}
              onChange={(e) => { setClassId(e.target.value); setScores({}); }}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 text-sm font-medium transition-all"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.level}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 text-sm font-medium transition-all"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ""}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 text-sm font-medium transition-all"
            >
              {TERMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Session</label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="e.g. 2024/2025"
              className="w-full px-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 text-sm font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* Score Entry Table */}
      {classId && subjectId ? (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E5E7EB] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#1C1C1C] flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-xs font-black">02</span>
                  Enter Scores
                </h2>
                <p className="text-xs text-[#6B7280] mt-1 ml-11">
                  {isLoadingScores ? "Loading existing scores..." : `${students.length} student(s) in class. Scores range: 0 – 100.`}
                </p>
              </div>
              <button
                type="submit"
                disabled={isPending || isLoadingScores}
                className="px-6 py-3 rounded-2xl bg-[#7C3AED] text-white text-sm font-bold hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20 active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : "Save Scores"}
              </button>
            </div>

            {students.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-4xl mb-4">🎓</div>
                <p className="text-[#6B7280] font-medium">No students enrolled in this class yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-[#9CA3AF] border-b border-[#F3F4F6] bg-[#F9FAFB]/50">
                      <th className="px-8 py-4 font-bold">#</th>
                      <th className="px-8 py-4 font-bold">Admission No.</th>
                      <th className="px-8 py-4 font-bold">Student Name</th>
                      <th className="px-8 py-4 font-bold w-40">Score (0–100)</th>
                      <th className="px-8 py-4 font-bold">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {students.map((s, i) => {
                      const raw = scores[s.id] ?? "";
                      const parsed = parseFloat(raw);
                      const grade = !isNaN(parsed) && raw !== "" ? calculateGrade(parsed) : null;
                      const gradeColor = grade ? GRADE_COLORS[grade] : "";
                      return (
                        <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-8 py-4 text-sm text-[#9CA3AF] font-bold">{i + 1}</td>
                          <td className="px-8 py-4 text-sm font-bold text-[#7C3AED] uppercase tracking-tight">{s.admission_number}</td>
                          <td className="px-8 py-4 text-sm font-bold text-[#1C1C1C]">{s.last_name}, {s.first_name}</td>
                          <td className="px-8 py-4">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={raw}
                              onChange={(e) => handleScoreChange(s.id, e.target.value)}
                              placeholder="—"
                              className="w-28 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 text-sm font-bold text-center transition-all"
                            />
                          </td>
                          <td className="px-8 py-4">
                            {grade && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${gradeColor}`}>
                                {grade}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-16 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto mb-4 text-3xl">📝</div>
          <p className="text-[#6B7280] font-medium">Select a class and subject above to start entering scores.</p>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
