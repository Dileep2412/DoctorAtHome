import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LogOut, Search, X, Phone, MapPin, Calendar,
  ChevronRight, ChevronLeft, ClipboardList, Clock, UserCheck, Activity, CheckCircle2, XCircle,
  Trash2, Download, Stethoscope, Plus, FileText, Eye, Receipt, MessageCircle, Menu,
  BarChart3, IndianRupee, Bell, CalendarDays, History,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/doctor-home-logo.png";

import { COLORS, FONT_HEADING, FONT_BODY, type Appointment } from "./pdfShared";
import {
  PrescriptionModal, emptyPrescriptionForm, buildPrescriptionPdf,
  type PrescriptionForm,
} from "./PrescriptionModal";
import {
  InvoiceModal, emptyInvoiceForm, buildInvoicePdf,
  type InvoiceForm,
} from "./InvoiceModal";

const fontLinkId = "dah-crm-font";
if (typeof document !== "undefined" && !document.getElementById(fontLinkId)) {
  const link = document.createElement("link");
  link.id = fontLinkId;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);
}

// ── Tokens ──
const INK = "#10192B";
const SLATE = "#5B6472";
const CANVAS = "#F5F7FA";
const LINE = "#E3E7ED";
const AMBER = "#C77D0A";
const AMBER_BG = "#FDF6E9";
const ROSE = "#C4433B";
const ROSE_BG = "#FBEEED";
const BLUE = "#1D4ED8";
const BLUE_BG = "#EEF3FE";
const TEAL_BG = "#EAF9F6";
const GREEN = "#1E8E5A";
const GREEN_BG = "#EAF7EF";

// Dark sidebar tokens
const SIDEBAR_BG = "#0B2249";
const SIDEBAR_ACTIVE_BG = "#15315F";
const SIDEBAR_TEXT = "rgba(255,255,255,0.68)";
const SIDEBAR_TEXT_MUTED = "rgba(255,255,255,0.4)";

const STATUS_OPTIONS = ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Pending: { bg: AMBER_BG, text: AMBER, dot: AMBER },
  Assigned: { bg: BLUE_BG, text: BLUE, dot: BLUE },
  "In Progress": { bg: TEAL_BG, text: "#0F766E", dot: COLORS.teal },
  Completed: { bg: GREEN_BG, text: GREEN, dot: GREEN },
  Cancelled: { bg: "#F1F3F6", text: SLATE, dot: "#A6AEBB" },
};

const AVATAR_PALETTE = [
  { bg: "#EAF3FF", fg: "#1D4ED8" }, { bg: "#EAF9F6", fg: "#0F766E" },
  { bg: "#FDF6E9", fg: "#B7791F" }, { bg: "#FBEEED", fg: "#B4453D" },
  { bg: "#F1EEFB", fg: "#6D4FC0" }, { bg: "#F0F5EA", fg: "#5C8A2E" },
];
const avatarStyleFor = (name: string) => AVATAR_PALETTE[(name || "?").charCodeAt(0) % AVATAR_PALETTE.length];
const initialsFor = (name: string) =>
  (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const loadImageAsDataUrl = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });

const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const { bg, fg } = avatarStyleFor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT_HEADING, fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
    }}>
      {initialsFor(name)}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: st.bg, color: st.text, fontSize: 12.5, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
      {status}
    </span>
  );
};

// Small badge shown next to a booking's ID when it was created as a follow-up
const FollowUpBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, background: AMBER_BG, color: AMBER, fontSize: 10.5, fontWeight: 700 }}>
    <Clock size={10} /> Follow-up
  </span>
);

const sectionLabelSt: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: SLATE, margin: "0 0 8px" };

interface QuickCreateForm {
  patientName: string;
  phone: string;
  address: string;
  service: string;
  date: string;
  googleMapsLink: string;
}
const emptyQuickCreate = (): QuickCreateForm => ({
  patientName: "", phone: "", address: "", service: "", date: new Date().toISOString().slice(0, 10), googleMapsLink: "",
});

const AdminCRM = () => {
  const [authed, setAuthed] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [view, setView] = useState<"bookings" | "doctors" | "analytics" | "calendar">("bookings");
  const [pdfMonth, setPdfMonth] = useState("all");
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorMobile, setNewDoctorMobile] = useState("");
  const [newDoctorSpecialization, setNewDoctorSpecialization] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);

  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateForm, setQuickCreateForm] = useState<QuickCreateForm>(emptyQuickCreate());
  const [quickCreateSubmitting, setQuickCreateSubmitting] = useState(false);

  // Follow-up booking: the prescription's "Follow Up" field is free text
  // (doctor's note, not a real date), so the admin picks the actual date here.
  const [followUpPickerOpen, setFollowUpPickerOpen] = useState(false);
  const [followUpDateValue, setFollowUpDateValue] = useState("");

  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionForm | null>(null);
  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm | null>(null);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) setAvatarMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset the follow-up date picker whenever a different booking is opened
  useEffect(() => {
    setFollowUpPickerOpen(false);
    setFollowUpDateValue("");
  }, [selected?.id]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthed(false); setChecking(false); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");
      setAuthed(!!data && data.length > 0);
      setAdminEmail(session.user.email ?? null);
      setChecking(false);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setAuthed(false); setAdminEmail(null); return; }
      setAdminEmail(session.user.email ?? null);
      supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin")
        .then(({ data }) => setAuthed(!!data?.length));
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) setLoginError("Login galat hai. Email/password check karein.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  };

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: authed,
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").order("name");
      if (error) throw error;
      return data;
    },
    enabled: authed,
  });

  // All invoices, used for the Analytics tab (revenue totals)
  const { data: allInvoices } = useQuery({
    queryKey: ["all-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("total_amount, created_at, booking_id");
      if (error) throw error;
      return data as { total_amount: number; created_at: string; booking_id: string }[];
    },
    enabled: authed && view === "analytics",
  });

  const { data: existingPrescription } = useQuery({
    queryKey: ["prescription-for-booking", selected?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions").select("id, pdf_url, created_at, follow_up, follow_up_booking_id")
        .eq("booking_id", selected!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: authed && !!selected,
  });

  const { data: existingInvoice } = useQuery({
    queryKey: ["invoice-for-booking", selected?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices").select("id, pdf_url, invoice_number, total_amount, created_at")
        .eq("booking_id", selected!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: authed && !!selected,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, string> }) => {
      const { error } = await supabase.from("appointments").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      setSelected((prev) => prev ? { ...prev, ...variables.updates } : prev);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      setSelected(null);
    },
  });

  const addDoctorMutation = useMutation({
    mutationFn: async (doc: { name: string; mobile: string; specialization: string }) => {
      const { error } = await supabase.from("doctors").insert([doc]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors-list"] });
      setNewDoctorName(""); setNewDoctorMobile(""); setNewDoctorSpecialization("");
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors-list"] }),
  });

  const generateBookingCode = () => {
    const d = new Date();
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `DAH-${yy}${mm}-${rand}`;
  };

  const quickCreateMutation = useMutation({
    mutationFn: async (form: QuickCreateForm) => {
      const { error } = await supabase.from("appointments").insert({
        booking_code: generateBookingCode(),
        patient_name: form.patientName,
        phone: form.phone,
        address: form.address,
        service: form.service,
        date: form.date,
        google_maps_link: form.googleMapsLink || null,
        status: "Pending",
        assigned_doctor: "Not Assigned",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      setShowQuickCreate(false);
      setQuickCreateForm(emptyQuickCreate());
      showToast("Booking created successfully!", "success");
    },
    onSettled: () => setQuickCreateSubmitting(false),
  });

  const handleQuickCreate = () => {
    if (!quickCreateForm.patientName.trim() || !quickCreateForm.phone.trim()) {
      showToast("Patient name aur phone number zaroori hai.", "error");
      return;
    }
    setQuickCreateSubmitting(true);
    quickCreateMutation.mutate(quickCreateForm);
  };

  // ── Follow-up booking ──
  // The prescription's "Follow Up" field is a free-text doctor's note (e.g.
  // "Review after 3 days"), not a real date, so the admin picks the actual
  // follow-up date. This creates a new appointment for that date, links it
  // back to the prescription, and marks it so the "already booked" state
  // prevents duplicate follow-ups.
  const followUpMutation = useMutation({
    mutationFn: async (followUpDate: string) => {
      if (!selected) throw new Error("No booking selected");
      if (!followUpDate) throw new Error("Pick a follow-up date first");
      if (existingPrescription?.follow_up_booking_id) throw new Error("Follow-up already booked");

      const { data: newBooking, error } = await supabase.from("appointments").insert({
        booking_code: generateBookingCode(),
        patient_name: selected.patient_name,
        phone: selected.phone,
        address: selected.address,
        service: selected.service,
        date: followUpDate,
        google_maps_link: selected.google_maps_link ?? null,
        status: "Pending",
        assigned_doctor: selected.assigned_doctor || "Not Assigned",
        is_follow_up: true,
        parent_booking_id: selected.id,
      }).select().single();
      if (error) throw error;

      if (existingPrescription?.id) {
        const { error: updateErr } = await supabase.from("prescriptions")
          .update({ follow_up_booking_id: newBooking.id })
          .eq("id", existingPrescription.id);
        if (updateErr) throw updateErr;
      }

      return newBooking as Appointment;
    },
    onSuccess: (newBooking) => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["prescription-for-booking", selected?.id] });
      showToast(`Follow-up booking ${newBooking.booking_code} created for ${new Date(newBooking.date).toLocaleDateString("en-IN")}`, "success");
      setFollowUpPickerOpen(false);
      setFollowUpDateValue("");
      setSelected(newBooking);
    },
    onError: (err: any) => showToast("Failed to create follow-up: " + (err.message || "Unknown error"), "error"),
  });

  const handleDownloadPDF = () => {
    const rows = (appointments ?? []).filter((a) => {
      if (pdfMonth === "all") return true;
      const d = new Date(a.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === pdfMonth;
    });

    const doc = new jsPDF();
    doc.setFillColor(10, 37, 88);
    doc.rect(0, 0, 210, 24, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("Doctor At Home - Bookings Report", 14, 11);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Period: ${pdfMonth === "all" ? "All time" : pdfMonth} | Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 18);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 30,
      head: [["Booking ID", "Patient", "Mobile", "Status", "Doctor", "Date"]],
      body: rows.map((a) => [
        a.booking_code, a.patient_name, a.phone, a.status,
        a.assigned_doctor || "Not Assigned", new Date(a.created_at).toLocaleDateString("en-IN"),
      ]),
      headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`bookings-${pdfMonth}-${Date.now()}.pdf`);
  };

  const openPrescriptionForm = (a: Appointment) => {
    setPrescriptionForm(emptyPrescriptionForm(a));
    setShowPrescriptionForm(true);
  };

  const handleGeneratePrescription = async () => {
    if (!prescriptionForm || !selected) return;
    setPrescriptionSubmitting(true);
    try {
      const logoDataUrl = await loadImageAsDataUrl(logo);
      const doc = buildPrescriptionPdf(prescriptionForm, logoDataUrl);
      const pdfBlob = doc.output("blob");
      const fileName = `prescription-${selected.booking_code}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage.from("prescriptions").upload(fileName, pdfBlob, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("prescriptions").getPublicUrl(fileName);
      const pdfUrl = publicUrlData.publicUrl;
      const { error: insertError } = await supabase.from("prescriptions").insert({
        booking_id: selected.id, patient_name: prescriptionForm.patientName, age_sex: prescriptionForm.ageSex,
        address: prescriptionForm.address, prescription_date: prescriptionForm.date,
        chief_complaints: prescriptionForm.chiefComplaints, clinical_assessment: prescriptionForm.clinicalAssessment,
        vitals: { rbs: prescriptionForm.rbs, bp: prescriptionForm.bp, pr: prescriptionForm.pr, spo2: prescriptionForm.spo2, temp: prescriptionForm.temp },
        past_history: prescriptionForm.pastHistory,
        examination: { cns: prescriptionForm.cns, cvs: prescriptionForm.cvs, rs: prescriptionForm.rs, pa: prescriptionForm.pa, others: prescriptionForm.othersExam },
        medicines: prescriptionForm.medicines.filter((m) => m.name.trim()),
        investigations: prescriptionForm.investigations,
        advice: [...prescriptionForm.adviceChecked, ...(prescriptionForm.adviceCustom.trim() ? [prescriptionForm.adviceCustom.trim()] : [])],
        follow_up: prescriptionForm.followUp, pdf_url: pdfUrl,
      });
      if (insertError) throw insertError;
      fetch("https://aukzwkiowsfkvhehyfpu.supabase.co/functions/v1/send-whatsapp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected.phone, message: `Hello ${prescriptionForm.patientName},\n\nYour prescription from DoctorAtHome is ready.\n\nDownload: ${pdfUrl}\n\n- DoctorAtHome, Bhopal` }),
      }).catch((err) => console.error("WhatsApp notify failed:", err));
      showToast("Prescription generated and sent to the patient!", "success");
      queryClient.invalidateQueries({ queryKey: ["prescription-for-booking", selected.id] });
      setShowPrescriptionForm(false);
    } catch (err: any) {
      console.error(err);
      showToast("Failed to generate prescription: " + (err.message || "Unknown error"), "error");
    } finally {
      setPrescriptionSubmitting(false);
    }
  };

  const openInvoiceForm = (a: Appointment) => {
    setInvoiceForm(emptyInvoiceForm(a));
    setShowInvoiceForm(true);
  };

  const handleGenerateInvoice = async () => {
    if (!invoiceForm || !selected) return;
    setInvoiceSubmitting(true);
    try {
      const logoDataUrl = await loadImageAsDataUrl(logo);
      const doc = buildInvoicePdf(invoiceForm, logoDataUrl);
      const pdfBlob = doc.output("blob");
      const fileName = `invoice-${selected.booking_code}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage.from("invoices").upload(fileName, pdfBlob, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from("invoices").getPublicUrl(fileName);
      const pdfUrl = publicUrlData.publicUrl;
      const validItems = invoiceForm.items.filter((it) => it.particulars.trim());
      const totalAmount = validItems.reduce((sum, it) => sum + (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0), 0);
      const { error: insertError } = await supabase.from("invoices").insert({
        booking_id: selected.id, invoice_number: invoiceForm.billNo,
        items: validItems.map((it) => ({ particulars: it.particulars, qty: parseFloat(it.qty) || 0, rate: parseFloat(it.rate) || 0, amount: (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0) })),
        total_amount: totalAmount, pdf_url: pdfUrl,
      });
      if (insertError) throw insertError;
      fetch("https://aukzwkiowsfkvhehyfpu.supabase.co/functions/v1/send-whatsapp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected.phone, message: `Hello ${invoiceForm.patientName},\n\nYour invoice from DoctorAtHome (Bill No. ${invoiceForm.billNo}) is ready.\n\nDownload: ${pdfUrl}\n\n- DoctorAtHome, Bhopal` }),
      }).catch((err) => console.error("WhatsApp notify failed:", err));
      showToast("Invoice generated and sent to the patient!", "success");
      queryClient.invalidateQueries({ queryKey: ["invoice-for-booking", selected.id] });
      setShowInvoiceForm(false);
    } catch (err: any) {
      console.error(err);
      showToast("Failed to generate invoice: " + (err.message || "Unknown error"), "error");
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  // ── Login screen ──
  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CANVAS }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", border: `3px solid ${LINE}`, borderTopColor: COLORS.teal, animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: CANVAS, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: FONT_BODY }}>
        <div style={{ width: "100%", maxWidth: 900, display: "grid", gridTemplateColumns: "1fr", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(10,37,88,0.16)" }} className="dah-login-grid">
          <div className="dah-login-left" style={{ background: "linear-gradient(160deg, #0A2558 0%, #0d3a8a 55%, #0EA5E9 100%)", padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(20,184,166,0.32), transparent)", top: -90, right: -90 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", marginBottom: 32 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.teal }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Operations console</span>
              </div>
              <h1 style={{ fontFamily: FONT_HEADING, fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1.25, marginBottom: 14 }}>Every home visit,<br />one clear view</h1>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, maxWidth: 300 }}>Bookings, doctors, and patient records in one place.</p>
            </div>
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {["Review and triage every booking", "Assign the right doctor in a tap", "Send prescriptions and bills instantly"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(20,184,166,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: COLORS.surface, padding: "48px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 320 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 14, padding: 10 }}>
                  <img src={logo} alt="Doctor At Home" style={{ height: 48, width: 48, objectFit: "contain" }} />
                </div>
              </div>
              <h2 style={{ fontFamily: FONT_HEADING, fontSize: 21, fontWeight: 700, color: COLORS.navy, textAlign: "center", marginBottom: 4 }}>Welcome back</h2>
              <p style={{ fontSize: 13, color: SLATE, textAlign: "center", marginBottom: 28 }}>Sign in to your admin account</p>
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: INK, display: "block", marginBottom: 6 }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@doctorathome.com"
                    style={{ width: "100%", padding: "11px 13px", borderRadius: 9, border: `1.5px solid ${LINE}`, fontSize: 14, boxSizing: "border-box", background: CANVAS }} />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: INK, display: "block", marginBottom: 6 }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password"
                    style={{ width: "100%", padding: "11px 13px", borderRadius: 9, border: `1.5px solid ${LINE}`, fontSize: 14, boxSizing: "border-box", background: CANVAS }} />
                </div>
                {loginError && (
                  <div style={{ padding: "9px 12px", borderRadius: 8, background: ROSE_BG, border: `1px solid #F0B8B3` }}>
                    <p style={{ fontSize: 12.5, color: ROSE, margin: 0 }}>{loginError}</p>
                  </div>
                )}
                <button type="submit" disabled={loginLoading}
                  style={{ width: "100%", padding: "12px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 6, opacity: loginLoading ? 0.7 : 1, boxShadow: "0 4px 14px rgba(10,37,88,0.25)" }}>
                  {loginLoading ? "Signing in..." : "Sign in to dashboard"}
                </button>
              </form>
            </div>
          </div>
        </div>
        <style>{`
          @media (min-width: 800px) { .dah-login-grid { grid-template-columns: 1.05fr 1fr !important; } }
          @media (max-width: 799px) { .dah-login-left { display: none !important; } }
        `}</style>
      </div>
    );
  }

  const filtered = (appointments ?? []).filter((a) => {
    const matchStatus = statusTab === "all" || a.status === statusTab;
    const q = search.trim().toLowerCase();
    const matchSearch = q === "" || a.patient_name?.toLowerCase().includes(q) || a.phone?.includes(q) || a.booking_code?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = { all: appointments?.length ?? 0 };
  STATUS_OPTIONS.forEach((s) => { counts[s] = appointments?.filter((a) => a.status === s).length ?? 0; });

  const phoneCounts: Record<string, number> = {};
  (appointments ?? []).forEach((a) => { phoneCounts[a.phone] = (phoneCounts[a.phone] || 0) + 1; });

  const statItems = [
    { label: "Total", value: counts.all, fg: BLUE },
    { label: "Pending", value: counts.Pending, fg: AMBER },
    { label: "Assigned", value: counts.Assigned, fg: BLUE },
    { label: "In progress", value: counts["In Progress"], fg: "#0F766E" },
    { label: "Completed", value: counts.Completed, fg: GREEN },
    { label: "Cancelled", value: counts.Cancelled, fg: SLATE },
  ];

  const timeline = selected ? [
    { label: "Booking received", time: selected.created_at, done: true },
    { label: `Status: ${selected.status}`, time: null, done: true },
    { label: "Prescription generated", time: existingPrescription?.created_at ?? null, done: !!existingPrescription },
    { label: "Invoice generated", time: existingInvoice?.created_at ?? null, done: !!existingInvoice },
  ] : [];

  // ── Analytics computations ──
  const totalRevenue = (allInvoices ?? []).reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  const thisMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const monthRevenue = (allInvoices ?? []).filter((inv) => inv.created_at?.slice(0, 7) === thisMonthKey)
    .reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  const doctorStats = (doctors ?? []).map((d: any) => {
    const doctorBookings = (appointments ?? []).filter((a) => a.assigned_doctor === d.name);
    const completed = doctorBookings.filter((a) => a.status === "Completed").length;
    return { name: d.name, total: doctorBookings.length, completed };
  }).sort((a, b) => b.total - a.total);
  const maxDoctorBookings = Math.max(1, ...doctorStats.map((d) => d.total));

  const sidebarContent = (
    <>
      <div style={{ padding: sidebarCollapsed ? "20px 14px 16px" : "20px 18px 16px", display: "flex", alignItems: "center", gap: 11, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <img src={logo} alt="" style={{ height: 30, width: 30, objectFit: "contain", flexShrink: 0, borderRadius: 6, background: "#fff", padding: 2 }} />
        {!sidebarCollapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 14, color: "#fff", margin: 0, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Doctor At Home</p>
            <p style={{ fontSize: 10.5, color: SIDEBAR_TEXT_MUTED, margin: 0 }}>Admin console</p>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="dah-collapse-desktop"
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, cursor: "pointer", color: "#fff", padding: 5, display: "flex", flexShrink: 0 }}
        >
          <ChevronLeft size={13} style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </button>
      </div>
      <nav style={{ padding: 10, flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        {[
          { key: "bookings" as const, label: "Bookings", icon: ClipboardList },
          { key: "calendar" as const, label: "Calendar", icon: CalendarDays },
          { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
          { key: "doctors" as const, label: "Doctors", icon: Stethoscope },
        ].map((item) => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              title={item.label}
              onClick={() => { setView(item.key); setMobileMenuOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: sidebarCollapsed ? "10px" : "9px 11px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                borderRadius: 8, background: active ? SIDEBAR_ACTIVE_BG : "transparent",
                color: active ? "#fff" : SIDEBAR_TEXT, fontWeight: active ? 700 : 600, fontSize: 13.5,
                borderLeft: active ? `3px solid ${COLORS.teal}` : "3px solid transparent",
                border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              }}
            >
              <item.icon size={17} color={active ? COLORS.teal : "rgba(255,255,255,0.45)"} />
              {!sidebarCollapsed && item.label}
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: CANVAS, display: "flex", fontFamily: FONT_BODY, color: INK }}>

      {/* ── Sidebar (desktop) ── */}
      <aside style={{
        width: sidebarCollapsed ? 68 : 220, flexShrink: 0, background: SIDEBAR_BG,
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
        transition: "width 0.15s",
      }} className="dah-sidebar-desktop">
        {sidebarContent}
      </aside>

      {/* ── Sidebar (mobile drawer) ── */}
      {mobileMenuOpen && (
        <>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 80 }} />
          <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: 240, maxWidth: "80%", background: SIDEBAR_BG, zIndex: 90, display: "flex", flexDirection: "column", boxShadow: "12px 0 32px rgba(15,23,42,0.18)" }}>
            <button onClick={() => setMobileMenuOpen(false)} style={{ position: "absolute", top: 14, right: -42, background: "rgba(15,23,42,0.55)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={18} color="#fff" />
            </button>
            {sidebarContent}
          </div>
        </>
      )}

      {/* ── Main ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        <header style={{ background: COLORS.surface, borderBottom: `1px solid ${LINE}`, padding: "16px 24px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 1180, flexWrap: "wrap" }}>
            <button onClick={() => setMobileMenuOpen(true)} className="dah-menu-mobile" style={{ display: "none", background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 8, padding: 8, cursor: "pointer", color: COLORS.navy, flexShrink: 0 }}>
              <Menu size={18} />
            </button>
            <h1 style={{ fontFamily: FONT_HEADING, fontSize: 21, fontWeight: 700, color: COLORS.navy, margin: 0, whiteSpace: "nowrap" }}>
              {view === "bookings" ? "Bookings" : view === "doctors" ? "Doctors" : view === "calendar" ? "Calendar" : "Analytics"}
            </h1>

            {view === "bookings" && (
              <>
                <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                  <Search size={15} color="#A6AEBB" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                  <input placeholder="Search name, mobile, booking ID" value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px 8px 32px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13.5, boxSizing: "border-box" }} />
                </div>
                <select value={pdfMonth} onChange={(e) => setPdfMonth(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13, background: "#fff" }}>
                  <option value="all">All time</option>
                  {Array.from(new Set((appointments ?? []).map((a) => {
                    const d = new Date(a.created_at);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                  }))).sort().reverse().map((key) => {
                    const [y, m] = key.split("-");
                    const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
                    return <option key={key} value={key}>{label}</option>;
                  })}
                </select>
                <button onClick={handleDownloadPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${LINE}`, background: "#fff", color: COLORS.navy, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Download size={14} /> Export
                </button>
                <button onClick={() => setShowQuickCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Plus size={14} /> New booking
                </button>
              </>
            )}

            {/* Notification bell */}
            <div ref={notifRef} style={{ position: "relative", marginLeft: "auto" }}>
              <button onClick={() => setNotifOpen((v) => !v)} style={{ position: "relative", background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 8, padding: 8, cursor: "pointer", color: COLORS.navy, display: "flex" }}>
                <Bell size={16} />
                {counts.Pending > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, background: ROSE, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                    {counts.Pending}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", top: 44, right: 0, width: 280, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, boxShadow: "0 12px 32px rgba(15,23,42,0.16)", overflow: "hidden", zIndex: 30 }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${LINE}` }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: INK }}>Pending bookings</p>
                  </div>
                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    {(appointments ?? []).filter((a) => a.status === "Pending").length === 0 && (
                      <p style={{ padding: "16px 14px", fontSize: 12.5, color: SLATE, margin: 0 }}>Nothing pending — all caught up.</p>
                    )}
                    {(appointments ?? []).filter((a) => a.status === "Pending").slice(0, 6).map((a) => (
                      <button key={a.id} onClick={() => { setSelected(a); setNotifOpen(false); setView("bookings"); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${LINE}`, cursor: "pointer", textAlign: "left" }}>
                        <Avatar name={a.patient_name} size={28} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.patient_name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: SLATE }}>{a.booking_code}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top-right avatar dropdown */}
            <div ref={avatarMenuRef} style={{ position: "relative" }}>
              <button onClick={() => setAvatarMenuOpen((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 13 }}>
                  {(adminEmail || "AD").slice(0, 2).toUpperCase()}
                </div>
              </button>
              {avatarMenuOpen && (
                <div style={{ position: "absolute", top: 44, right: 0, width: 220, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, boxShadow: "0 12px 32px rgba(15,23,42,0.16)", overflow: "hidden", zIndex: 30 }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${LINE}` }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{adminEmail || "Admin"}</p>
                    <p style={{ margin: 0, fontSize: 11, color: SLATE }}>Administrator</p>
                  </div>
                  <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", color: ROSE, fontSize: 13, fontWeight: 600 }}>
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {view === "bookings" && (
        <>
        <div style={{ margin: "20px 24px 0", background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, display: "flex", overflowX: "auto" }}>
          {statItems.map((s, i) => (
            <div key={s.label} style={{ flex: "1 1 120px", minWidth: 110, padding: "14px 18px", borderLeft: i === 0 ? "none" : `1px solid ${LINE}` }}>
              <p style={{ fontFamily: FONT_HEADING, margin: 0, fontSize: 24, fontWeight: 700, color: s.fg }}>{s.value}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: SLATE, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, padding: "16px 24px 0", overflowX: "auto" }}>
          {["all", ...STATUS_OPTIONS].map((s) => {
            const active = statusTab === s;
            return (
              <button key={s} onClick={() => setStatusTab(s)}
                style={{ padding: "6px 13px", borderRadius: 999, border: `1px solid ${active ? COLORS.navy : LINE}`, background: active ? COLORS.navy : COLORS.surface, color: active ? "#fff" : SLATE, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.15s" }}>
                {s === "all" ? "All" : s} <span style={{ opacity: 0.7 }}>({counts[s]})</span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {isLoading && <p style={{ fontSize: 13.5, color: SLATE }}>Loading…</p>}
          {!isLoading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <ClipboardList size={32} style={{ margin: "0 auto 10px", opacity: 0.4, color: "#A6AEBB" }} />
              <p style={{ fontSize: 13.5, color: SLATE }}>No bookings match this filter yet.</p>
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <div className="dah-table-desktop" style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: CANVAS, borderBottom: `1px solid ${LINE}` }}>
                    {["Patient", "Booking ID", "Mobile", "Status", "Doctor", ""].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 12, fontWeight: 700, color: SLATE }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} onClick={() => setSelected(a)} style={{ borderBottom: `1px solid ${LINE}`, cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = CANVAS)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={a.patient_name} size={32} />
                          <span style={{ color: INK, fontWeight: 600 }}>{a.patient_name}</span>
                          {phoneCounts[a.phone] > 1 && (
                            <span title="Returning patient" style={{ fontSize: 10, fontWeight: 700, color: BLUE, background: BLUE_BG, borderRadius: 999, padding: "1px 6px" }}>Repeat</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: COLORS.navy }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {a.booking_code}
                          {a.is_follow_up && <FollowUpBadge />}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: SLATE }}>{a.phone}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={a.status} /></td>
                      <td style={{ padding: "12px 16px", color: SLATE }}>{a.assigned_doctor}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}><ChevronRight size={16} color="#A6AEBB" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && filtered.length > 0 && (
            <div className="dah-cards-mobile" style={{ display: "none", flexDirection: "column", gap: 10 }}>
              {filtered.map((a) => (
                <div key={a.id} onClick={() => setSelected(a)} style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, cursor: "pointer", display: "flex", gap: 12 }}>
                  <Avatar name={a.patient_name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: COLORS.navy, fontSize: 13.5 }}>
                        {a.booking_code}
                        {a.is_follow_up && <FollowUpBadge />}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: INK }}>{a.patient_name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: SLATE }}>{a.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}

        {view === "calendar" && (
          <div style={{ padding: 24, flex: 1 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <button onClick={() => setCalendarMonth((c) => { const m = c.m === 0 ? 11 : c.m - 1; const y = c.m === 0 ? c.y - 1 : c.y; return { y, m }; })}
                  style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: COLORS.navy }}>‹</button>
                <p style={{ margin: 0, fontFamily: FONT_HEADING, fontSize: 16, fontWeight: 700, color: INK }}>
                  {new Date(calendarMonth.y, calendarMonth.m).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
                <button onClick={() => setCalendarMonth((c) => { const m = c.m === 11 ? 0 : c.m + 1; const y = c.m === 11 ? c.y + 1 : c.y; return { y, m }; })}
                  style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: COLORS.navy }}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: SLATE, padding: "4px 0" }}>{d}</div>
                ))}
                {(() => {
                  const firstDay = new Date(calendarMonth.y, calendarMonth.m, 1).getDay();
                  const daysInMonth = new Date(calendarMonth.y, calendarMonth.m + 1, 0).getDate();
                  const cells = [];
                  for (let i = 0; i < firstDay; i++) cells.push(null);
                  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                  return cells.map((d, i) => {
                    if (d === null) return <div key={`e${i}`} />;
                    const dateKey = `${calendarMonth.y}-${String(calendarMonth.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                    const dayBookings = (appointments ?? []).filter((a) => (a.date || a.created_at)?.slice(0, 10) === dateKey);
                    const isToday = new Date().toISOString().slice(0, 10) === dateKey;
                    const isSelected = calendarSelectedDate === dateKey;
                    return (
                      <button key={dateKey} onClick={() => setCalendarSelectedDate(isSelected ? null : dateKey)}
                        style={{
                          minHeight: 56, borderRadius: 9, border: isSelected ? `1.5px solid ${COLORS.teal}` : isToday ? `1.5px solid ${COLORS.navy}` : `1px solid ${LINE}`,
                          background: isSelected ? TEAL_BG : "#fff", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
                        }}>
                        <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? COLORS.navy : INK }}>{d}</span>
                        {dayBookings.length > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.teal, background: TEAL_BG, borderRadius: 999, padding: "1px 6px" }}>{dayBookings.length}</span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {calendarSelectedDate && (
              <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18 }}>
                <p style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 700, color: INK }}>
                  Bookings on {new Date(calendarSelectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                {(appointments ?? []).filter((a) => (a.date || a.created_at)?.slice(0, 10) === calendarSelectedDate).length === 0 && (
                  <p style={{ fontSize: 12.5, color: SLATE }}>No bookings on this day.</p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(appointments ?? []).filter((a) => (a.date || a.created_at)?.slice(0, 10) === calendarSelectedDate).map((a) => (
                    <button key={a.id} onClick={() => { setSelected(a); setView("bookings"); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: `1px solid ${LINE}`, background: CANVAS, cursor: "pointer", textAlign: "left" }}>
                      <Avatar name={a.patient_name} size={30} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: INK, display: "flex", alignItems: "center", gap: 6 }}>
                          {a.patient_name}
                          {a.is_follow_up && <FollowUpBadge />}
                        </p>
                        <p style={{ margin: 0, fontSize: 11.5, color: SLATE }}>{a.booking_code}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "analytics" && (
          <div style={{ padding: 24, flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: GREEN_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IndianRupee size={19} color={GREEN} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: SLATE, fontWeight: 600 }}>Total revenue</p>
                  <p style={{ fontFamily: FONT_HEADING, margin: "1px 0 0", fontSize: 22, fontWeight: 700, color: INK }}>₹{totalRevenue.toFixed(0)}</p>
                </div>
              </div>
              <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: BLUE_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Calendar size={19} color={BLUE} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: SLATE, fontWeight: 600 }}>This month</p>
                  <p style={{ fontFamily: FONT_HEADING, margin: "1px 0 0", fontSize: 22, fontWeight: 700, color: INK }}>₹{monthRevenue.toFixed(0)}</p>
                </div>
              </div>
              <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Receipt size={19} color={COLORS.teal} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: SLATE, fontWeight: 600 }}>Invoices raised</p>
                  <p style={{ fontFamily: FONT_HEADING, margin: "1px 0 0", fontSize: 22, fontWeight: 700, color: INK }}>{(allInvoices ?? []).length}</p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 320px) 1fr", gap: 16, marginBottom: 16 }} className="dah-analytics-grid">
              <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: INK, alignSelf: "flex-start" }}>Status distribution</p>
                {(() => {
                  const total = counts.all || 1;
                  const segs = STATUS_OPTIONS.map((s) => ({ s, pct: (counts[s] / total) * 100, color: STATUS_STYLES[s].dot }));
                  let acc = 0;
                  const stops = segs.map((seg) => { const start = acc; acc += seg.pct; return `${seg.color} ${start}% ${acc}%`; }).join(", ");
                  return (
                    <>
                      <div style={{ width: 140, height: 140, borderRadius: "50%", background: counts.all ? `conic-gradient(${stops})` : LINE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 92, height: 92, borderRadius: "50%", background: COLORS.surface, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <p style={{ margin: 0, fontFamily: FONT_HEADING, fontSize: 22, fontWeight: 700, color: INK }}>{counts.all}</p>
                          <p style={{ margin: 0, fontSize: 10.5, color: SLATE }}>bookings</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16, width: "100%" }}>
                        {segs.filter((s) => s.pct > 0).map((seg) => (
                          <div key={seg.s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                            <span style={{ color: SLATE, flex: 1 }}>{seg.s}</span>
                            <span style={{ color: INK, fontWeight: 700 }}>{counts[seg.s]}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 }}>
                <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: INK }}>Doctor performance</p>
                {doctorStats.length === 0 && <p style={{ fontSize: 13, color: SLATE }}>No doctors added yet.</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {doctorStats.map((d) => (
                    <div key={d.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{d.name}</span>
                      <span style={{ fontSize: 12, color: SLATE }}>{d.completed} completed / {d.total} total</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: CANVAS, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(d.total / maxDoctorBookings) * 100}%`, background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.teal})`, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {view === "doctors" && (
          <div style={{ padding: 24, flex: 1 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, marginBottom: 18 }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: INK }}>Add a doctor</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input placeholder="Doctor name" value={newDoctorName} onChange={(e) => setNewDoctorName(e.target.value)} style={{ flex: "1 1 160px", padding: "9px 12px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13.5 }} />
                <input placeholder="Mobile" value={newDoctorMobile} onChange={(e) => setNewDoctorMobile(e.target.value)} style={{ flex: "1 1 130px", padding: "9px 12px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13.5 }} />
                <input placeholder="Specialization" value={newDoctorSpecialization} onChange={(e) => setNewDoctorSpecialization(e.target.value)} style={{ flex: "1 1 160px", padding: "9px 12px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13.5 }} />
                <button onClick={() => { if (!newDoctorName.trim()) return; addDoctorMutation.mutate({ name: newDoctorName.trim(), mobile: newDoctorMobile.trim(), specialization: newDoctorSpecialization.trim() }); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: COLORS.navy, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden" }}>
              {(!doctors || doctors.length === 0) && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <Stethoscope size={28} style={{ margin: "0 auto 10px", opacity: 0.4, color: "#A6AEBB" }} />
                  <p style={{ fontSize: 13.5, color: SLATE }}>No doctors added yet.</p>
                </div>
              )}
              {doctors?.map((d: any, idx: number) => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: idx < doctors.length - 1 ? `1px solid ${LINE}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Stethoscope size={17} color={COLORS.teal} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: INK }}>{d.name}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 12.5, color: SLATE }}>{d.specialization || "—"} {d.mobile ? `· ${d.mobile}` : ""}</p>
                    </div>
                  </div>
                  <button onClick={() => { if (confirm(`Delete Dr. ${d.name}?`)) deleteDoctorMutation.mutate(d.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: ROSE, padding: 6 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", zIndex: 40 }} />
          <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: "100%", maxWidth: 440, background: COLORS.surface, zIndex: 50, boxShadow: "-12px 0 40px rgba(15,23,42,0.14)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={selected.patient_name} size={44} />
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: INK, display: "flex", alignItems: "center", gap: 8 }}>
                    {selected.patient_name}
                    {selected.is_follow_up && <FollowUpBadge />}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12.5, color: SLATE }}>{selected.booking_code}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#A6AEBB", padding: 4 }}><X size={20} /></button>
            </div>

            <div style={{ padding: 22, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: INK }}>
                  <Phone size={14} color={SLATE} /><a href={`tel:${selected.phone}`} style={{ color: INK, textDecoration: "none" }}>{selected.phone}</a>
                </div>
                {selected.address && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: INK }}>
                    <MapPin size={14} color={SLATE} style={{ marginTop: 2 }} /><span>{selected.address}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: INK }}>
                  <Calendar size={14} color={SLATE} /><span>{new Date(selected.created_at).toLocaleString("en-IN")}</span>
                </div>
                {selected.google_maps_link && (
                  <a href={selected.google_maps_link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: COLORS.teal, textDecoration: "none" }}>
                    <MapPin size={13} /> Open location in Maps
                  </a>
                )}
              </div>

              {/* Follow-up: schedule a follow-up booking from this one's prescription date,
                  or show that it's already booked (prevents duplicate follow-up bookings). */}
              {selected.is_follow_up && (
                <div style={{ background: AMBER_BG, border: `1px solid #F0D9AE`, borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={14} color={AMBER} />
                  <p style={{ margin: 0, fontSize: 12.5, color: AMBER, fontWeight: 600 }}>
                    This booking is itself a follow-up
                    {(() => {
                      const parent = (appointments ?? []).find((a) => a.id === selected.parent_booking_id);
                      return parent ? <> of <button onClick={() => setSelected(parent)} style={{ background: "none", border: "none", padding: 0, color: AMBER, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>{parent.booking_code}</button></> : null;
                    })()}
                  </p>
                </div>
              )}

              {existingPrescription?.follow_up && (
                <div>
                  <p style={sectionLabelSt}>Follow-up</p>
                  <div style={{ background: CANVAS, border: `1px solid ${LINE}`, borderRadius: 9, padding: "9px 12px", marginBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 11.5, color: SLATE, fontWeight: 600 }}>Doctor's note</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: INK }}>{existingPrescription.follow_up}</p>
                  </div>

                  {existingPrescription.follow_up_booking_id ? (
                    <button
                      onClick={() => {
                        const fu = (appointments ?? []).find((a) => a.id === existingPrescription.follow_up_booking_id);
                        if (fu) setSelected(fu);
                      }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px", borderRadius: 9, border: `1.5px solid ${GREEN}`, background: GREEN_BG, color: GREEN, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      <CheckCircle2 size={16} /> Follow-up already booked
                    </button>
                  ) : followUpPickerOpen ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        type="date"
                        value={followUpDateValue}
                        onChange={(e) => setFollowUpDateValue(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1.5px solid ${AMBER}`, fontSize: 13.5, boxSizing: "border-box" }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => { setFollowUpPickerOpen(false); setFollowUpDateValue(""); }}
                          style={{ flex: 1, padding: "10px", borderRadius: 9, border: `1px solid ${LINE}`, background: "#fff", color: SLATE, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => followUpMutation.mutate(followUpDateValue)}
                          disabled={!followUpDateValue || followUpMutation.isPending}
                          style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 9, border: "none", background: !followUpDateValue ? "#D7DCE3" : `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: !followUpDateValue ? "not-allowed" : "pointer", opacity: followUpMutation.isPending ? 0.7 : 1 }}
                        >
                          <Clock size={14} /> {followUpMutation.isPending ? "Scheduling…" : "Confirm follow-up"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFollowUpPickerOpen(true)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px", borderRadius: 9, border: `1.5px solid ${AMBER}`, background: AMBER_BG, color: AMBER, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      <Clock size={16} /> Schedule follow-up
                    </button>
                  )}
                </div>
              )}

              {/* Patient history — other bookings from the same phone number */}
              {(() => {
                const previousVisits = (appointments ?? [])
                  .filter((a) => a.phone === selected.phone && a.id !== selected.id)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                if (previousVisits.length === 0) return null;
                return (
                  <div style={{ background: BLUE_BG, border: `1px solid #C7D9FA`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <History size={14} color={BLUE} />
                      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: BLUE }}>
                        Returning patient — {previousVisits.length} previous visit{previousVisits.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {previousVisits.slice(0, 5).map((v) => (
                        <button key={v.id} onClick={() => setSelected(v)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 10px", borderRadius: 8, border: "1px solid #C7D9FA", background: "#fff", cursor: "pointer", textAlign: "left" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: COLORS.navy, display: "flex", alignItems: "center", gap: 6 }}>
                              {v.booking_code}
                              {v.is_follow_up && <FollowUpBadge />}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: SLATE }}>{new Date(v.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <StatusBadge status={v.status} />
                        </button>
                      ))}
                      {previousVisits.length > 5 && (
                        <p style={{ margin: "2px 0 0", fontSize: 11.5, color: SLATE }}>+{previousVisits.length - 5} more visit(s)</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={sectionLabelSt}>Status</p>
                  <select value={selected.status} onChange={(e) => updateMutation.mutate({ id: selected.id, updates: { status: e.target.value } })}
                    style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13.5, background: "#fff" }}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <p style={sectionLabelSt}>Assign doctor</p>
                  <select value={selected.assigned_doctor} onChange={(e) => updateMutation.mutate({ id: selected.id, updates: { assigned_doctor: e.target.value } })}
                    style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13.5, background: "#fff" }}>
                    <option value="Not Assigned">Not assigned</option>
                    {doctors?.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <p style={sectionLabelSt}>Documents</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {existingPrescription?.pdf_url ? (
                    <a href={existingPrescription.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 9, border: `1.5px solid ${COLORS.teal}`, background: TEAL_BG, color: "#0F766E", fontSize: 13.5, fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}>
                      <Eye size={16} /> View prescription
                    </a>
                  ) : (
                    <button onClick={() => openPrescriptionForm(selected)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 9, border: `1.5px solid ${LINE}`, background: "#fff", color: INK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                      <FileText size={16} color={COLORS.teal} /> Generate prescription
                    </button>
                  )}
                  {existingInvoice?.pdf_url ? (
                    <a href={existingInvoice.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 9, border: `1.5px solid ${COLORS.navy}`, background: BLUE_BG, color: COLORS.navy, fontSize: 13.5, fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}>
                      <Eye size={16} /> View invoice
                    </a>
                  ) : (
                    <button onClick={() => openInvoiceForm(selected)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: 9, border: `1.5px solid ${LINE}`, background: "#fff", color: INK, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                      <Receipt size={16} color={COLORS.navy} /> Generate invoice
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p style={sectionLabelSt}>Activity</p>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {timeline.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, paddingBottom: i < timeline.length - 1 ? 14 : 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.done ? COLORS.teal : "#D7DCE3", marginTop: 3, flexShrink: 0 }} />
                        {i < timeline.length - 1 && <div style={{ width: 1, flex: 1, background: LINE, marginTop: 2 }} />}
                      </div>
                      <div style={{ paddingBottom: 4 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.done ? INK : "#A6AEBB" }}>{t.label}</p>
                        {t.time && <p style={{ margin: "1px 0 0", fontSize: 11.5, color: SLATE }}>{new Date(t.time).toLocaleString("en-IN")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: 20, borderTop: `1px solid ${LINE}`, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={`https://wa.me/91${selected.phone}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 8, background: "#25D366", color: "#fff", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <a href={`tel:${selected.phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 8, background: COLORS.navy, color: "#fff", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
                  <Phone size={15} /> Call
                </a>
              </div>
              <button onClick={() => { if (confirm(`Delete booking ${selected.booking_code}? This can't be undone.`)) deleteMutation.mutate(selected.id); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px", borderRadius: 8, border: `1px solid #F0B8B3`, background: ROSE_BG, color: ROSE, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Trash2 size={14} /> Delete booking
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Quick create modal ── */}
      {showQuickCreate && (
        <>
          <div onClick={() => setShowQuickCreate(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 60 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "92%", maxWidth: 440, background: COLORS.surface, borderRadius: 16, zIndex: 70, boxShadow: "0 24px 64px rgba(15,23,42,0.25)" }}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: INK, fontFamily: FONT_HEADING }}>New booking</p>
              <button onClick={() => setShowQuickCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: SLATE }}><X size={20} /></button>
            </div>
            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <p style={sectionLabelSt}>Patient name</p>
                <input value={quickCreateForm.patientName} onChange={(e) => setQuickCreateForm((f) => ({ ...f, patientName: e.target.value }))}
                  style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <p style={sectionLabelSt}>Phone</p>
                <input value={quickCreateForm.phone} onChange={(e) => setQuickCreateForm((f) => ({ ...f, phone: e.target.value }))}
                  style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <p style={sectionLabelSt}>Address</p>
                <input value={quickCreateForm.address} onChange={(e) => setQuickCreateForm((f) => ({ ...f, address: e.target.value }))}
                  style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={sectionLabelSt}>Service</p>
                  <input value={quickCreateForm.service} onChange={(e) => setQuickCreateForm((f) => ({ ...f, service: e.target.value }))}
                    style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div>
                  <p style={sectionLabelSt}>Date</p>
                  <input type="date" value={quickCreateForm.date} onChange={(e) => setQuickCreateForm((f) => ({ ...f, date: e.target.value }))}
                    style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 14, boxSizing: "border-box" }} />
                </div>
              </div>
              <div>
                <p style={sectionLabelSt}>Google Maps link (optional)</p>
                <input value={quickCreateForm.googleMapsLink} onChange={(e) => setQuickCreateForm((f) => ({ ...f, googleMapsLink: e.target.value }))}
                  style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ padding: 18, borderTop: `1px solid ${LINE}`, display: "flex", gap: 10 }}>
              <button onClick={() => setShowQuickCreate(false)} style={{ flex: 1, padding: "11px", borderRadius: 9, border: `1px solid ${LINE}`, background: "#fff", color: SLATE, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleQuickCreate} disabled={quickCreateSubmitting} style={{ flex: 2, padding: "11px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: quickCreateSubmitting ? 0.7 : 1 }}>
                {quickCreateSubmitting ? "Creating…" : "Create booking"}
              </button>
            </div>
          </div>
        </>
      )}

      {showPrescriptionForm && prescriptionForm && (
        <PrescriptionModal form={prescriptionForm} setForm={setPrescriptionForm} onClose={() => setShowPrescriptionForm(false)} onGenerate={handleGeneratePrescription} submitting={prescriptionSubmitting} />
      )}
      {showInvoiceForm && invoiceForm && (
        <InvoiceModal form={invoiceForm} setForm={setInvoiceForm} onClose={() => setShowInvoiceForm(false)} onGenerate={handleGenerateInvoice} submitting={invoiceSubmitting} />
      )}

      {/* ── Toasts ── */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10,
            background: t.type === "success" ? "#0F3D2E" : "#4A1414", color: "#fff", fontSize: 13, fontWeight: 600,
            boxShadow: "0 10px 30px rgba(15,23,42,0.25)", animation: "dah-toast-in 0.2s ease-out",
          }}>
            {t.type === "success" ? <CheckCircle2 size={16} color={COLORS.teal} /> : <XCircle size={16} color="#F87171" />}
            {t.message}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dah-sidebar-desktop { display: none !important; }
          .dah-table-desktop { display: none !important; }
          .dah-cards-mobile { display: flex !important; }
          .dah-menu-mobile { display: flex !important; }
          .dah-collapse-desktop { display: none !important; }
          .dah-analytics-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes dah-toast-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminCRM;