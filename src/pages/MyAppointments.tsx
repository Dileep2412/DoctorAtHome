import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Stethoscope, User, PlusCircle, Inbox } from "lucide-react";

export default function MyAppointments() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setChecking(false);
    };
    getUser();
  }, []);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["myAppointments"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return { background: "#DCFCE7", color: "#16A34A", label: "Confirmed" };
      case "completed":
        return { background: "#EFF6FF", color: "#2563EB", label: "Completed" };
      case "cancelled":
        return { background: "#FEE2E2", color: "#DC2626", label: "Cancelled" };
      default:
        return { background: "#FEF9C3", color: "#CA8A04", label: "Pending" };
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (checking || isLoading) {
    return (
      <Layout>
        <div style={{ background: "#F0F4F8", minHeight: "100vh" }}>
          <div style={{ background: "#0A2558", padding: "40px 24px 56px", textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 40, background: "#F0F4F8", borderRadius: "50% 50% 0 0 / 40px 40px 0 0" }} />
            <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              My <span style={{ color: "#14B8A6" }}>Appointments</span>
            </h1>
          </div>
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

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <Layout>
        <div style={{ background: "#F0F4F8", minHeight: "100vh" }}>
          <div style={{ background: "#0A2558", padding: "40px 24px 56px", textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 40, background: "#F0F4F8", borderRadius: "50% 50% 0 0 / 40px 40px 0 0" }} />
            <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              My <span style={{ color: "#14B8A6" }}>Appointments</span>
            </h1>
          </div>
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
                Please sign in to view your appointment history.
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

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div style={{ background: "#F0F4F8", minHeight: "100vh", paddingBottom: 64 }}>

        {/* Hero */}
        <div style={{
          background: "#0A2558", padding: "40px 24px 56px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 40, background: "#F0F4F8", borderRadius: "50% 50% 0 0 / 40px 40px 0 0" }} />
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)", marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(255,255,255,0.2)" }} />
            Doctor At Home
            <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(255,255,255,0.2)" }} />
          </p>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 8 }}>
            My <span style={{ color: "#14B8A6" }}>Appointments</span>
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", marginBottom: 0 }}>
            Track and manage all your booked visits
          </p>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 0" }}>

          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
              {appointments?.length || 0} appointment{appointments?.length !== 1 ? "s" : ""} found
            </p>
            <Link to="/appointment">
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#0A2558", border: "none", borderRadius: 10,
                color: "#fff", fontSize: 13, fontWeight: 700,
                padding: "9px 16px", cursor: "pointer", fontFamily: "inherit",
                transition: "background 0.2s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0d2f6e")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0A2558")}
              >
                <PlusCircle size={15} />
                Book New
              </button>
            </Link>
          </div>

          {/* Empty state */}
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

          {/* Appointment cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {appointments?.map((a: any, index: number) => {
              const status = getStatusStyle(a.status);
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
                  {/* Card top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Stethoscope size={18} color="#0EA5E9" />
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#0A2558", marginBottom: 2 }}>{a.service}</p>
                        <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>Home Visit</p>
                      </div>
                    </div>
                    {/* Status badge */}
                    <span style={{
                      background: status.background, color: status.color,
                      fontSize: 11.5, fontWeight: 700, padding: "4px 12px",
                      borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: "#F1F5F9", marginBottom: 14 }} />

                  {/* Card details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CalendarDays size={14} color="#94A3B8" />
                      <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{a.date}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <User size={14} color="#94A3B8" />
                      <span style={{ fontSize: 13, color: a.assigned_doctor ? "#475569" : "#94A3B8", fontWeight: 500, fontStyle: a.assigned_doctor ? "normal" : "italic" }}>
                        {a.assigned_doctor || "Doctor not assigned yet"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </Layout>
  );
}