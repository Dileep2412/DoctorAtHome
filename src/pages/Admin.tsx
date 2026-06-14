import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Trash2, Search, Filter, Download, Calendar, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import logo from "../assets/doctor-home-logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

const MONTHS = [
  { value: "all", label: "All Months" },
  { value: "01", label: "January" }, { value: "02", label: "February" },
  { value: "03", label: "March" }, { value: "04", label: "April" },
  { value: "05", label: "May" }, { value: "06", label: "June" },
  { value: "07", label: "July" }, { value: "08", label: "August" },
  { value: "09", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" },
];

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthed(false); setChecking(false); return; }
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin");
      if (!error && data && data.length > 0) { setAuthed(true); } else { setAuthed(false); }
      setChecking(false);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAuthed(false); return; }
      supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").then(({ data }) => { setAuthed(!!data?.length); });
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) { toast({ variant: "destructive", title: "Login Failed", description: error.message }); }
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
      return data;
    },
    enabled: authed,
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("name");
      if (error) throw error;
      return data;
    },
    enabled: authed,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, string> }) => {
      const { error } = await supabase.from("appointments").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-appointments"] }); toast({ title: "Updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-appointments"] }); toast({ title: "Deleted" }); },
  });

  // ── PDF Download ──
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(10, 37, 88);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DoctorAtHome - Appointments Report", 14, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const monthLabel = MONTHS.find(m => m.value === filterMonth)?.label || "All Months";
    const statusLabel = filterStatus === "all" ? "All Status" : filterStatus;
    doc.text(`Filter: ${monthLabel} | Status: ${statusLabel} | Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 22);

    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 34,
      head: [["Patient", "Phone", "Service", "Date", "Time", "Status", "Doctor"]],
      body: filtered?.map(a => [
        a.patient_name || "-",
        a.phone || "-",
        a.service || "-",
        a.date || "-",
        a.time || "-",
        a.status || "-",
        a.assigned_doctor || "Not Assigned",
      ]) || [],
      headStyles: {
        fillColor: [20, 184, 166],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 3 },
    });

    doc.save(`appointments-${filterMonth === "all" ? "all" : monthLabel}-${Date.now()}.pdf`);
    toast({ title: "PDF Downloaded!" });
  };

  // ── Checking ──
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#14B8A6] border-t-transparent animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Admin Login ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl">
          <div className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden" style={{background: "linear-gradient(135deg, #0A2558 0%, #1a3a7a 25%, #0e5c8a 50%, #0d8a7a 75%, #14B8A6 100%)"}}>
            {/* Animated blobs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-3xl animate-pulse" style={{background: "radial-gradient(circle, #14B8A6, transparent)", top: "-100px", left: "-100px", animationDuration: "4s"}} />
              <div className="absolute w-[350px] h-[350px] rounded-full opacity-20 blur-3xl" style={{background: "radial-gradient(circle, #38bdf8, transparent)", bottom: "-80px", right: "-80px", animation: "pulse 6s ease-in-out infinite"}} />
              <div className="absolute w-[250px] h-[250px] rounded-full opacity-15 blur-2xl" style={{background: "radial-gradient(circle, #5eead4, transparent)", top: "40%", right: "10%", animation: "pulse 5s ease-in-out infinite 1s"}} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold mb-10">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                DoctorAtHome • Admin Portal
              </div>
              <h1 className="text-4xl font-extrabold leading-tight mb-4">Manage Your<br /><span className="text-[#5eead4]">Healthcare Platform</span></h1>
              <p className="text-white/70 text-base leading-7 max-w-sm">View appointments, assign doctors, update statuses and manage your entire homecare operations.</p>
              <div className="mt-8 flex flex-col gap-3">
                {["View & manage all appointments", "Assign doctors to patients", "Track appointment status"].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-[#14B8A6]/30 border border-[#14B8A6]/50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-3 gap-3">
              {[{ num: "24/7", label: "Monitoring" }, { num: "100%", label: "Secure" }, { num: "Live", label: "Updates" }].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
                  <p className="text-2xl font-bold">{s.num}</p>
                  <p className="text-xs text-white/70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 sm:p-10 flex items-center justify-center bg-white">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <img src={logo} alt="DoctorAtHome" className="h-16 w-16 object-contain" />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold text-[#0A2558]">Admin Login</h1>
                <p className="text-slate-500 text-sm mt-1">Sign in to access the dashboard.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <Input type="email" placeholder="admin@doctorathome.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl border-slate-200 focus-visible:ring-[#14B8A6]" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl border-slate-200 focus-visible:ring-[#14B8A6]" required />
                </div>
                <button type="submit" disabled={loginLoading} className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0A2558] to-[#14B8A6] text-white font-bold text-sm shadow-md hover:from-[#0c2d6e] hover:to-[#0ea5a0] hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60">
                  {loginLoading ? "Signing in..." : "Login to Dashboard"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Filter ──
  const filtered = appointments?.filter((a) => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchSearch = searchTerm === "" || a.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone?.includes(searchTerm);
    const matchMonth = filterMonth === "all" || (a.date && a.date.includes(`-${filterMonth}-`) || a.date?.startsWith(`${filterMonth}/`) || a.date?.split("-")[1] === filterMonth || a.date?.split("/")[1] === filterMonth);
    return matchStatus && matchSearch && matchMonth;
  });

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-[#f0f4f8]">

      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-[#0A2558] to-[#0e3272] border-b border-white/10 px-6 py-4 sticky top-0 z-30 shadow-lg">
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1.5 shadow-md">
              <img src={logo} alt="DoctorAtHome" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg leading-none tracking-tight">DoctorAtHome</h1>
              <p className="text-[#14B8A6] text-xs mt-0.5 font-medium">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full transition-all duration-200">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 py-8">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: appointments?.length || 0, color: "from-[#0A2558] to-[#1a56b0]", icon: Users },
            { label: "Pending", value: appointments?.filter(a => a.status === "Pending").length || 0, color: "from-yellow-500 to-amber-400", icon: Clock },
            { label: "Confirmed", value: appointments?.filter(a => a.status === "Confirmed").length || 0, color: "from-blue-600 to-blue-500", icon: Calendar },
            { label: "Completed", value: appointments?.filter(a => a.status === "Completed").length || 0, color: "from-emerald-600 to-emerald-500", icon: CheckCircle },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-shadow duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white/80 font-medium">{s.label}</p>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className="text-xs text-white/60 mt-1">Appointments</p>
            </div>
          ))}
        </div>

        {/* ── Search + Filters + PDF ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-10 rounded-xl border-slate-200 bg-white focus-visible:ring-[#14B8A6]" />
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-40 h-10 rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-10 rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PDF Download */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0A2558] to-[#14B8A6] text-white font-bold text-sm px-5 h-10 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>

        {/* ── Results count ── */}
        <p className="text-xs text-slate-400 mb-3 font-medium">
          Showing {filtered?.length || 0} of {appointments?.length || 0} appointments
        </p>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50/50">
                  <th className="text-left px-4 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Patient</th>
                  <th className="text-left px-4 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Service</th>
                  <th className="text-left px-4 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Date/Time</th>
                  <th className="text-left px-4 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Doctor</th>
                  <th className="text-left px-4 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading appointments...</td></tr>
                ) : filtered?.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="h-8 w-8 text-slate-300" />
                      <p className="font-medium">No appointments found</p>
                    </div>
                  </td></tr>
                ) : (
                  filtered?.map((a, idx) => (
                    <tr key={a.id} className={`border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors duration-150 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-800">{a.patient_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{a.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">{a.service}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-700 font-semibold">{a.date}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Select value={a.status} onValueChange={(v) => updateMutation.mutate({ id: a.id, updates: { status: v } })}>
                          <SelectTrigger className="h-8 w-28 border-0 bg-transparent p-0">
                            <Badge variant="outline" className={statusColors[a.status] || ""}>{a.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3.5">
                        <Select value={a.assigned_doctor} onValueChange={(v) => updateMutation.mutate({ id: a.id, updates: { assigned_doctor: v } })}>
                          <SelectTrigger className="h-8 w-40 rounded-lg border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                            {doctors?.map((d) => (
                              <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm"
                            className="h-8 rounded-lg border-[#14B8A6]/30 text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white hover:border-[#14B8A6] transition-all font-semibold"
                            onClick={() => {
                              const message = ["New Home Visit Appointment", "", `Patient: ${a.patient_name}`, `Phone: ${a.phone}`, `Email: ${a.email}`, "", `Service: ${a.service}`, "", `Date: ${a.date}`, `Time: ${a.time}`, "", "Address:", a.address, "", "Location:", a.google_maps_link, "", "Problem:", a.problem || "Not provided"].join("\n");
                              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
                            }}
                          >
                            Share
                          </Button>
                          <Button variant="ghost" size="sm"
                            className="h-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => { if (confirm("Delete this appointment?")) deleteMutation.mutate(a.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;