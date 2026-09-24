import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays, Stethoscope, User, PlusCircle, Inbox, LogOut, FileText, Receipt,
  Phone, ArrowRight, AlertCircle,
} from "lucide-react";

const SESSION_KEY = "dah_patient_session_token";

export default function MyAppointments() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // ── Link-phone form (Google-login users only, first time) ──
  const [linkPhone, setLinkPhone] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setSessionToken(localStorage.getItem(SESSION_KEY));
      setChecking(false);
    };
    getUser();
  }, []);

  // Is this a Google-login user (not the OTP session token flow)?
  const isGoogleUser = !!user && !sessionToken;

  // Look up the phone number this Google account has been linked to, if any.
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["patientProfile", user?.id],
    enabled: isGoogleUser,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("patient_profiles")
        .select("phone")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as { phone: string } | null;
    },
  });

  const needsPhoneLink = isGoogleUser && !profileLoading && !profile?.phone;

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["myAppointments", sessionToken, user?.id, profile?.phone],
    enabled: !!sessionToken || (isGoogleUser && !!profile?.phone),
    queryFn: async () => {
      if (sessionToken) {
        const { data, error } = await supabase.rpc("get_my_bookings", { p_token: sessionToken });
        if (error) throw error;
        return data;
      }
      // Google-login user with a linked phone number
      const { data, error } = await (supabase as any).rpc("get_my_google_bookings");
      if (error) throw error;
      return data;
    },
  });

  // Look up prescriptions for all the bookings shown above, keyed by booking_id
  const { data: prescriptionMap } = useQuery({
    queryKey: ["myPrescriptions", appointments?.map((a: any) => a.id).join(",")],
    enabled: !!appointments && appointments.length > 0,
    queryFn: async () => {
      const ids = appointments!.map((a: any) => a.id);
      const { data, error } = await supabase
        .from("prescriptions")
        .select("booking_id, pdf_url, created_at")
        .in("booking_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => {
        if (!map[p.booking_id]) map[p.booking_id] = p.pdf_url; // keep the latest one (already sorted desc)
      });
      return map;
    },
  });

  // Look up invoices for all the bookings shown above, keyed by booking_id
  const { data: invoiceMap } = useQuery({
    queryKey: ["myInvoices", appointments?.map((a: any) => a.id).join(",")],
    enabled: !!appointments && appointments.length > 0,
    queryFn: async () => {
      const ids = appointments!.map((a: any) => a.id);
      const { data, error } = await supabase
        .from("invoices")
        .select("booking_id, pdf_url, created_at")
        .in("booking_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((inv: any) => {
        if (!map[inv.booking_id]) map[inv.booking_id] = inv.pdf_url; // keep the latest one (already sorted desc)
      });
      return map;
    },
  });

  const handleLogout = async () => {
    localStorage.removeItem(SESSION_KEY);
    await supabase.auth.signOut();
    setSessionToken(null);
    setUser(null);
  };

  const handleLinkPhone = async () => {
    setLinkError(null);
    const digits = linkPhone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setLinkError("Enter a valid 10-digit mobile number");
      return;
    }
    setLinkLoading(true);
    try {
      const { error } = await (supabase as any)
        .from("patient_profiles")
        .upsert({ user_id: user.id, phone: digits }, { onConflict: "user_id" });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["patientProfile", user.id] });
    } catch (err: any) {
      setLinkError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLinkLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "assigned":
        return { background: "#DCFCE7", color: "#16A34A", label: status };
      case "completed":
        return { background: "#EFF6FF", color: "#2563EB", label: status };
      case "cancelled":
        return { background: "#FEE2E2", color: "#DC2626", label: status };
      default:
        return { background: "#FEF9C3", color: "#CA8A04", label: status || "Pending" };
    }
  };

  const pageHeader = (subtitle?: string) => (
    <div style={{ background: "#0A2558", padding: "40px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 40, background: "#F0F4F8", borderRadius: "50% 50% 0 0 / 40px 40px 0 0" }} />
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: subtitle ? 8 : 0 }}>
        My <span style={{ color: "#14B8A6" }}>Appointments</span>
      </h1>
      {subtitle && <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", marginBottom: 0 }}>{subtitle}</p>}
    </div>
  );

  // ── Loading ──
  if (checking || (isGoogleUser && profileLoading) || (isLoading && (sessionToken || (isGoogleUser && profile?.phone)))) {
    return (
      <Layout>
        <div style={{ background: "#F0F4F8", minHeight: "100vh" }}>
          {pageHeader()}
          <div style={{ maxWidth: 680, margin: "24px auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                borderRadius: 16, border: "1px solid #E2E8F0",
                padding: "24px", height: 110,
                background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
              }} />
            ))}
          </div>
          <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
      </Layout>
    );
  }

  // ── Not logged in ──
  if (!user && !sessionToken) {
    return (
      <Layout>
        <div style={{ background: "#F0F4F8", minHeight: "100vh" }}>
          {pageHeader()}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
            <div style={{
              background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0",
              boxShadow: "0 4px 24px rgba(10,37,88,0.08)", padding: "48px 36px",
              textAlign: "center", maxWidth: 380, width: "100%",
            }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <User size={28} color="#0EA5E9" />
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0A2558", marginBottom: 8 }}>Sign in to continue</h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
                Please sign in to view your booking history.
              </p>
              <Link to="/login">
                <Button style={{ background: "#0A2558", color: "#fff", width: "100%", borderRadius: 12, height: 46, fontWeight: 700, fontSize: 14 }}>
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Google user, first time: ask them to confirm the number they booked with ──
  if (needsPhoneLink) {
    return (
      <Layout>
        <div style={{ background: "#F0F4F8", minHeight: "100vh" }}>
          {pageHeader()}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
            <div style={{
              background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0",
              boxShadow: "0 4px 24px rgba(10,37,88,0.08)", padding: "40px 32px",
              textAlign: "center", maxWidth: 400, width: "100%",
            }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <Phone size={26} color="#0EA5E9" />
              </div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0A2558", marginBottom: 8 }}>One quick step</h2>
              <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.7, marginBottom: 22, textAlign: "left" }}>
                Enter the mobile number you used when booking, so we can show your appointments here.
              </p>

              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #E2E8F0", borderRadius: 12, background: "#FAFBFC", overflow: "hidden", textAlign: "left" }}>
                <span style={{ padding: "0 14px", fontSize: 14.5, color: "#64748B", borderRight: "1.5px solid #E2E8F0", height: 48, display: "flex", alignItems: "center" }}>
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={linkPhone}
                  onChange={(e) => setLinkPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98XXXXXXXX"
                  style={{ flex: 1, height: 48, padding: "0 14px", border: "none", background: "transparent", fontSize: 15, color: "#0F172A", outline: "none", minWidth: 0 }}
                />
              </div>

              {linkError && (
                <p style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12.5, color: "#DC2626", marginTop: 10, textAlign: "left" }}>
                  <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} /> {linkError}
                </p>
              )}

              <button
                onClick={handleLinkPhone}
                disabled={linkLoading}
                style={{
                  width: "100%", height: 48, marginTop: 18, background: "#0A2558",
                  border: "none", borderRadius: 12, color: "#fff", fontSize: 14.5, fontWeight: 700,
                  cursor: linkLoading ? "not-allowed" : "pointer", opacity: linkLoading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "inherit",
                }}
              >
                {linkLoading ? "Saving…" : <>Continue <ArrowRight size={16} /></>}
              </button>

              <button
                onClick={handleLogout}
                style={{ width: "100%", marginTop: 14, background: "none", border: "none", fontSize: 12.5, color: "#94A3B8", fontWeight: 600, cursor: "pointer" }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Main ──
  return (
    <Layout>
      <div style={{ background: "#F0F4F8", minHeight: "100vh", paddingBottom: 64 }}>

        {pageHeader("Track and manage all your booked visits")}

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 0" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 10, flexWrap: "wrap" }}>
            <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
              {appointments?.length || 0} appointment{appointments?.length !== 1 ? "s" : ""} found
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/appointment">
                <button style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#0A2558", border: "none", borderRadius: 10,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  padding: "9px 16px", cursor: "pointer", fontFamily: "inherit",
                }}>
                  <PlusCircle size={15} />
                  Book New
                </button>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10,
                  color: "#64748B", fontSize: 13, fontWeight: 700,
                  padding: "9px 16px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>

          {appointments?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#fff", borderRadius: 20, border: "1px solid #E2E8F0",
                boxShadow: "0 2px 16px rgba(10,37,88,0.06)",
                padding: "56px 32px", textAlign: "center",
              }}
            >
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Inbox size={32} color="#0EA5E9" />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0A2558", marginBottom: 8 }}>No appointments yet</h3>
              <p style={{ fontSize: 13.5, color: "#94A3B8", lineHeight: 1.7, marginBottom: 28 }}>
                You haven't booked any appointments yet.<br />Book your first home visit today.
              </p>
              <Link to="/appointment">
                <button style={{
                  background: "#0A2558", border: "none", borderRadius: 12,
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  padding: "13px 32px", cursor: "pointer", fontFamily: "inherit",
                }}>
                  Book an Appointment →
                </button>
              </Link>
            </motion.div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {appointments?.map((a: any, index: number) => {
              const status = getStatusStyle(a.status);
              const prescriptionUrl = prescriptionMap?.[a.id];
              const invoiceUrl = invoiceMap?.[a.id];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  style={{
                    background: "#fff", borderRadius: 16,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 2px 16px rgba(10,37,88,0.05)",
                    padding: "20px 24px",
                    borderLeft: "4px solid #0EA5E9",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Stethoscope size={18} color="#0EA5E9" />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#0A2558", marginBottom: 2 }}>
                          {a.booking_code || a.service || "Booking"}
                        </p>
                        <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>Home Visit</p>
                      </div>
                    </div>
                    <span style={{
                      background: status.background, color: status.color,
                      fontSize: 11.5, fontWeight: 700, padding: "4px 12px",
                      borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {status.label}
                    </span>
                  </div>

                  <div style={{ height: 1, background: "#F1F5F9", marginBottom: 14 }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {a.date && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CalendarDays size={14} color="#94A3B8" />
                        <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{a.date}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <User size={14} color="#94A3B8" />
                      <span style={{ fontSize: 13, color: a.assigned_doctor && a.assigned_doctor !== "Not Assigned" ? "#475569" : "#94A3B8", fontWeight: 500, fontStyle: a.assigned_doctor && a.assigned_doctor !== "Not Assigned" ? "normal" : "italic" }}>
                        {a.assigned_doctor && a.assigned_doctor !== "Not Assigned" ? a.assigned_doctor : "Doctor not assigned yet"}
                      </span>
                    </div>
                  </div>

                  {(prescriptionUrl || invoiceUrl) && (
                    <>
                      <div style={{ height: 1, background: "#F1F5F9", margin: "14px 0" }} />
                      <div style={{ display: "flex", gap: 10 }}>
                        {prescriptionUrl && (
                          <a
                            href={prescriptionUrl} target="_blank" rel="noopener noreferrer"
                            style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                              padding: "10px", borderRadius: 10, border: "1.5px solid #14B8A6",
                              background: "#F0FDFA", color: "#0F766E", fontSize: 13, fontWeight: 700,
                              textDecoration: "none", whiteSpace: "nowrap",
                            }}
                          >
                            <FileText size={15} /> Prescription
                          </a>
                        )}
                        {invoiceUrl && (
                          <a
                            href={invoiceUrl} target="_blank" rel="noopener noreferrer"
                            style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                              padding: "10px", borderRadius: 10, border: "1.5px solid #0A2558",
                              background: "#EFF6FF", color: "#0A2558", fontSize: 13, fontWeight: 700,
                              textDecoration: "none", whiteSpace: "nowrap",
                            }}
                          >
                            <Receipt size={15} /> Invoice
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </Layout>
  );
}