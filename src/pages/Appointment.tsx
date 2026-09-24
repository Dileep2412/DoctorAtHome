import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Lock, Copy, MapPin } from "lucide-react";

// TODO: confirm these are the right inboxes for new-booking alerts.
// Add or remove addresses here — every booking alert goes to all of them.
const ADMIN_EMAILS = [
  "doctorathomebhopal@gmail.com",
  "deelipparihar2405@gmail.com", 
  "mohitgurjar2369@gmail.com",
  "priyanshuchouhan342@gmail.com",
];
const SEND_EMAIL_URL = "https://aukzwkiowsfkvhehyfpu.supabase.co/functions/v1/send-email";

const schema = z.object({
  patient_name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(10, "Valid 10-digit mobile number required").max(15),
  address: z.string().trim().min(5, "Address is required").max(500),
  google_maps_link: z.string().trim().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

// Temporary admin alert email — stands in for WhatsApp admin alerts until
// the WhatsApp Business number is verified. Sent only to the clinic, not the patient.
const adminAlertEmail = (data: FormData, bookingCode: string) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background: #F0F4F8;">
    <div style="background: linear-gradient(135deg, #0A2558, #0d3168); padding: 28px 24px; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 20px; letter-spacing: -0.01em;">DoctorAtHome</h1>
      <p style="color: rgba(255,255,255,0.55); margin: 4px 0 0; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">
        Admin Alert
      </p>
    </div>
    <div style="background: #fff; padding: 28px 24px;">
      <h2 style="color: #0A2558; font-size: 19px; margin: 0 0 12px;">🔔 New Booking Received</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13.5px;">
        <tr><td style="padding: 6px 0; color: #64748B;">Booking ID</td><td style="padding: 6px 0; font-weight: 700; color: #0A2558;">${bookingCode}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748B;">Patient</td><td style="padding: 6px 0; color: #1E293B;">${data.patient_name}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748B;">Mobile</td><td style="padding: 6px 0; color: #1E293B;"><a href="tel:${data.phone}" style="color:#0EA5E9;">${data.phone}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #64748B; vertical-align: top;">Address</td><td style="padding: 6px 0; color: #1E293B;">${data.address}</td></tr>
        ${data.google_maps_link ? `<tr><td style="padding: 6px 0; color: #64748B;">Location</td><td style="padding: 6px 0;"><a href="${data.google_maps_link}" style="color:#0EA5E9;">Open in Maps</a></td></tr>` : ""}
      </table>
      <p style="color: #64748B; font-size: 12.5px; margin-top: 16px;">Assign a doctor from the admin dashboard.</p>
    </div>
    <div style="background: #0A2558; padding: 16px 24px; text-align: center;">
      <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 0;">
        Doctor At Home · Bhopal, Madhya Pradesh · 9203634407
      </p>
    </div>
  </div>
`;

const Appointment = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { patient_name: "", phone: "", address: "", google_maps_link: "" },
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Location not supported", description: "Your browser does not support location detection" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const googleLink = `https://www.google.com/maps?q=${lat},${lng}`;
        form.setValue("google_maps_link", googleLink);
        toast({ title: "Location detected", description: "You can still edit it if needed" });
      },
      () => {
        toast({ title: "Location access denied", description: "Please allow location access or paste manually" });
      }
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    //@ts-ignore
    const { data: newBookingCode, error } = await supabase.rpc("create_public_booking", {
      p_patient_name: data.patient_name,
      p_phone: data.phone,
      p_address: data.address,
      p_google_maps_link: data.google_maps_link || "",
    });

    setLoading(false);

    if (error || !newBookingCode) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit. Please try again." });
      return;
    }

    setBookingCode(newBookingCode);
    setSubmitted(true);

    // Send WhatsApp notifications (patient confirmation + admin alerts)
    fetch("https://aukzwkiowsfkvhehyfpu.supabase.co/functions/v1/notify-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_name: data.patient_name,
        phone: data.phone,
        address: data.address,
        booking_code: newBookingCode,
        google_maps_link: data.google_maps_link || "",
      }),
    }).catch((err) => console.error("Notify booking (WhatsApp) failed:", err));

    // TEMPORARY: also email every admin address about the new booking, since the
    // WhatsApp Business number isn't verified yet. Remove/disable once
    // WhatsApp admin alerts are confirmed working.
    // Sent as one request per address so one bad/typo'd inbox can't block the others.
    ADMIN_EMAILS.forEach((adminEmail) => {
      fetch(SEND_EMAIL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: adminEmail,
          subject: `New Booking: ${data.patient_name} (${newBookingCode})`,
          html: adminAlertEmail(data, newBookingCode),
        }),
      }).catch((err) => console.error(`Admin alert email to ${adminEmail} failed:`, err));
    });
  };

  const copyBookingCode = () => {
    if (bookingCode) {
      navigator.clipboard.writeText(bookingCode);
      toast({ title: "Copied!", description: "Booking ID copied to clipboard" });
    }
  };

  // ─── Success ──────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Layout>
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.5; }
            70% { transform: scale(1.4); opacity: 0; }
            100% { transform: scale(1.4); opacity: 0; }
          }
        `}</style>
        <div style={{ background: "#F0F4F8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              background: "#fff",
              borderRadius: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 40px rgba(10,37,88,0.10)",
              padding: "48px 36px 40px",
              textAlign: "center",
              maxWidth: 420,
              width: "100%",
            }}
          >
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 28px" }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "#14B8A6", opacity: 0.12,
                animation: "pulse-ring 2s ease-out infinite",
              }} />
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #0A2558, #0EA5E9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", zIndex: 1,
              }}>
                <CheckCircle style={{ color: "#fff", width: 36, height: 36 }} />
              </div>
            </div>

            <h2 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#0A2558", marginBottom: 8, letterSpacing: "-0.01em" }}>
              Booking Confirmed!
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.75, marginBottom: 4 }}>
              Our team will assign a doctor and contact you shortly.
            </p>

            {/* Booking ID — subtle reference, not the hero */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "14px 0 22px" }}>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>Booking ID:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0A2558", letterSpacing: "0.01em" }}>{bookingCode}</span>
              <button
                onClick={copyBookingCode}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 2, display: "flex" }}
                aria-label="Copy booking ID"
              >
                <Copy size={13} />
              </button>
            </div>

            {/* What happens next — numbered steps */}
            <div style={{
              background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0",
              padding: "18px 20px", marginBottom: 24, textAlign: "left",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94A3B8", margin: 0 }}>
                What happens next
              </p>
              {[
                "Our team will call you within 10 minutes",
                "Doctor will visit as scheduled",
                "Prescription & invoice shared on WhatsApp after the visit",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: "#0A2558", color: "#fff", fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13.5, color: "#475569", fontWeight: 500, lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%", padding: "13px", background: "#0A2558",
                border: "none", borderRadius: 12, color: "#fff",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0d2f6e")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0A2558")}
            >
              Back to Home
            </button>

            <p style={{ fontSize: 12, color: "#B8C4D0", marginTop: 20 }}>
              Need help? Call us at{" "}
              <a href="tel:9203634407" style={{ color: "#0EA5E9", fontWeight: 600, textDecoration: "none" }}>
                9203634407
              </a>
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // ─── Form ───────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div style={{ background: "#F0F4F8", minHeight: "100vh", paddingBottom: 64 }}>

        <div style={{
          background: "#0A2558",
          padding: "40px 24px 56px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", bottom: -1, left: 0, right: 0,
            height: 40, background: "#F0F4F8",
            borderRadius: "50% 50% 0 0 / 40px 40px 0 0",
          }} />
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
            marginBottom: 12, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 10,
          }}>
            <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(255,255,255,0.2)" }} />
            Home Healthcare
            <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(255,255,255,0.2)" }} />
          </p>
          <h1 style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800,
            color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 10,
          }}>
            Book an <span style={{ color: "#14B8A6" }}>Appointment</span>
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", maxWidth: 360, margin: "0 auto", lineHeight: 1.7 }}>
            No login needed — just fill in your details below.
          </p>
        </div>

        <div style={{ maxWidth: 560, margin: "0 auto", padding: "8px 16px 0" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 24px rgba(10,37,88,0.07)",
              overflow: "hidden",
            }}
          >
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#94A3B8",
              padding: "22px 28px 0", marginBottom: 20,
            }}>
              Patient information
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

                  <FormField control={form.control} name="patient_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={labelSt}>Patient name</FormLabel>
                      <FormControl>
                        <Input
                          className="focus-visible:ring-[#0EA5E9] focus-visible:border-[#0EA5E9] placeholder:text-[#C8D4DE]"
                          style={inputSt}
                          placeholder="Enter your full name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={labelSt}>Mobile number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          className="focus-visible:ring-[#0EA5E9] focus-visible:border-[#0EA5E9] placeholder:text-[#C8D4DE]"
                          style={inputSt}
                          placeholder="10-digit mobile number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={labelSt}>Home address</FormLabel>
                      <FormControl>
                        <Textarea
                          className="focus-visible:ring-[#0EA5E9] focus-visible:border-[#0EA5E9] placeholder:text-[#C8D4DE]"
                          style={{ ...inputSt, minHeight: 76, resize: "none", lineHeight: 1.6 }}
                          placeholder="Enter your complete address for the home visit"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="google_maps_link" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ ...labelSt, display: "flex", alignItems: "center", gap: 5 }}>
                        <MapPin size={12} color="#0EA5E9" />
                        Share your location{" "}
                        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
                      </FormLabel>
                      <div style={{ display: "flex", gap: 8 }}>
                        <FormControl>
                          <Input
                            className="flex-1 focus-visible:ring-[#0EA5E9] focus-visible:border-[#0EA5E9] placeholder:text-[#C8D4DE]"
                            style={inputSt}
                            placeholder="Paste your Google Maps link here"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={detectLocation}
                          style={{
                            background: "#F0F9FF",
                            border: "1.5px solid #BAE6FD",
                            borderRadius: 10,
                            color: "#0EA5E9",
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            padding: "0 14px",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                        >
                          Auto Detect
                        </button>
                      </div>
                      <p style={{ fontSize: 11.5, color: "#C8D4DE", marginTop: 4 }}>
                        Enter your address, or use “Auto Detect” to find your location.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )} />

                </div>

                <div style={{ padding: "0 28px 28px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    style={{
                      width: "100%",
                      padding: "15px",
                      background: btnHover ? "#0d2f6e" : "#0A2558",
                      border: "none",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      letterSpacing: "0.02em",
                      transition: "background 0.2s, transform 0.15s, box-shadow 0.15s",
                      transform: btnHover ? "translateY(-2px)" : "translateY(0)",
                      boxShadow: btnHover
                        ? "0 8px 24px rgba(10,37,88,0.28)"
                        : "0 2px 8px rgba(10,37,88,0.12)",
                      opacity: loading ? 0.7 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    {loading ? "Submitting..." : "Book Now →"}
                  </button>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 6, marginTop: 12,
                  }}>
                    <Lock size={11} color="#B8C4D0" />
                    <span style={{ fontSize: 11.5, color: "#B8C4D0" }}>
                      Your information is 100% secure and encrypted
                    </span>
                  </div>
                </div>

              </form>
            </Form>
          </motion.div>
        </div>

      </div>
    </Layout>
  );
};

const labelSt: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#334155",
  letterSpacing: "0.01em",
};

const inputSt: React.CSSProperties = {
  padding: "12px 15px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  fontSize: 14,
  color: "#1E293B",
  background: "#FAFBFC",
};

export default Appointment;