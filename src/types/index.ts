/**
 * NexusOS — Shared TypeScript Types
 * All entities carry a school_id to enforce multi-tenant isolation.
 */

// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole =
  | "super_admin"
  | "school_admin"
  | "teacher"
  | "staff"
  | "student"
  | "parent";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  school_id: string | null; // null only for super_admin
  avatar_url?: string;
  created_at: string;
}

// ─── School ──────────────────────────────────────────────────────────────────

export interface School {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  website_enabled: boolean;
  subscription_status: "active" | "trial" | "expired";
  created_at: string;
}

// ─── Academic ────────────────────────────────────────────────────────────────

export interface Class {
  id: string;
  school_id: string;
  name: string;
  level?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code?: string;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  user_id: string;
  admission_number: string;
  class_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  avatar_url?: string;
  created_at: string;
}

export interface Staff {
  id: string;
  school_id: string;
  user_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  role: Extract<UserRole, "teacher" | "staff">;
  department?: string;
  avatar_url?: string;
  created_at: string;
}

// ─── Results & Attendance ─────────────────────────────────────────────────────

export interface Result {
  id: string;
  school_id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  term: string;
  session: string;
  score: number;
  grade?: string;
  remarks?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  created_at: string;
}

// ─── Fees & Payments ──────────────────────────────────────────────────────────

export interface FeeStructure {
  id: string;
  school_id: string;
  name: string;
  amount: number;
  term: string;
  session: string;
  class_id?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  school_id: string;
  student_id: string;
  fee_structure_id: string;
  amount_paid: number;
  paystack_reference: string;
  status: "pending" | "success" | "failed";
  paid_at?: string;
  created_at: string;
}

// ─── Events & Messages ────────────────────────────────────────────────────────

export interface Event {
  id: string;
  school_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface Message {
  id: string;
  school_id: string;
  sender_id: string;
  recipient_id?: string;
  subject: string;
  body: string;
  is_broadcast: boolean;
  read_at?: string;
  created_at: string;
}
