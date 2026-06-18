import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, MapPin, Lock, Phone, Home, MessageCircle } from "lucide-react";
import { services } from "@/lib/services-data";

const schema = z.object({
  patient_name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  service: z.string().min(1, "Select a service"),
  date: z.string().min(1, "Select a date"),
  address: z.string().trim().max(500).optional(),
  google_maps_link: z.string().trim().min(5, "Google Maps location link is required").max(500),
});

type FormData = z.infer<typeof schema>;

const Appointment = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_name: "", phone: "", service: "",
      date: "", address: "", google_maps_link: "",
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem("appointment_form");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      (Object.keys(parsed) as (keyof FormData)[]).forEach((key) => {
        form.setValue(key, parsed[key]);
      });
      localStorage.removeItem("appointment_form");
    }
  }, [form]);

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
    const { data: { user } } = await supabase.auth.getUser();

    console.log("USER =", user);

    if (!user) {
      localStorage.setItem("appointment_form", JSON.stringify(data));
      localStorage.setItem("redirect_after_login", "/appointment");
      toast({ title: "Login required", description: "Please sign in to book an appointment" });
      setLoading(false);
      navigate("/login");
      return;
    }

    //@ts-ignore
    const { error } = await supabase.from("appointments").insert([
      {
        user_id: user?.id,
        patient_name: data.patient_name,
        phone: data.phone,
        service: data.service,
        date: data.date,
        address: data.address || null,
        google_maps_link: data.google_maps_link,
      },
    ]);
    setLoading(false);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit. Please try again." });
      return;
    }
   
    const response = await supabase.functions.invoke("send-email", {
      body: {
        to: user.email,
        subject: "Appointment Request Received | Doctor At Home",
        html: `
<div style="
max-width:600px;
margin:auto;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
background:#F4F7FB;
padding:40px 20px;
">

  <div style="
  background:#fff;
  border-radius:28px;
  overflow:hidden;
  box-shadow:
    0 20px 50px rgba(10,37,88,0.10),
    0 4px 20px rgba(10,37,88,0.06);
  ">

    <!-- Header -->

    <div style="
    background:linear-gradient(135deg,#0A2558,#0EA5E9);
    padding:42px;
    text-align:center;
    ">

      <div style="
      width:75px;
      height:75px;
      margin:auto;
      border-radius:22px;
      background:rgba(255,255,255,0.15);
      line-height:75px;
      font-size:34px;
      ">
      🩺
      </div>

      <h1 style="
      color:#fff;
      margin:24px 0 8px;
      font-size:32px;
      font-weight:800;
      ">
        Doctor At Home
      </h1>

      <p style="
      color:rgba(255,255,255,0.85);
      margin:0;
      font-size:15px;
      ">
        Healthcare at Your Doorstep
      </p>

    </div>

    <!-- Body -->

    <div style="padding:40px;">

      <h2 style="
      color:#0A2558;
      margin-top:0;
      font-size:28px;
      ">
        Hello ${data.patient_name} 👋
      </h2>

      <p style="
      color:#475569;
      line-height:1.8;
      font-size:16px;
      ">
        Thank you for choosing
        <b>Doctor At Home</b>
        for your healthcare needs.
      </p>

      <p style="
      color:#475569;
      line-height:1.8;
      font-size:16px;
      ">
        Your appointment request has been received successfully and our team is reviewing it.
      </p>

      <!-- Appointment Card -->

      <div style="
      background:#F8FAFC;
      border:1px solid #E2E8F0;
      border-radius:22px;
      padding:28px;
      margin:35px 0;
      ">

        <h3 style="
        margin-top:0;
        color:#0A2558;
        font-size:22px;
        ">
          Appointment Details
        </h3>

        <p style="font-size:16px">
          <b>🩺 Service:</b>
          ${data.service}
        </p>

        <p style="font-size:16px">
          <b>📅 Date:</b>
          ${data.date}
        </p>

      </div>

      <!-- Success Box -->

      <div style="
      background:#ECFDF5;
      border-left:5px solid #14B8A6;
      padding:22px;
      border-radius:16px;
      ">

        <p style="
        margin:0;
        color:#065F46;
        font-weight:700;
        font-size:17px;
        ">
          ✅ Thank you for choosing Doctor At Home
        </p>

        <p style="
        margin-top:10px;
        color:#065F46;
        line-height:1.7;
        ">
          Our team will contact you shortly to confirm your appointment and ensure you receive the best care possible.
        </p>

      </div>

      <!-- Button -->

      <div style="
      text-align:center;
      margin-top:36px;
      ">

        <a
        href="tel:9203634407"
        style="
        display:inline-block;
        background:#0A2558;
        color:white;
        text-decoration:none;
        padding:15px 32px;
        border-radius:14px;
        font-weight:700;
        ">
        📞 Call Us
        </a>

      </div>

    </div>

    <!-- Footer -->

    <div style="
    background:#F8FAFC;
    text-align:center;
    padding:30px;
    ">

      <div style="
      font-size:20px;
      font-weight:700;
      color:#0A2558;
      ">
        Doctor At Home
      </div>

      <div style="
      color:#94A3B8;
      margin-top:8px;
      ">
        Healthcare at Your Doorstep
      </div>

      <div style="
      margin-top:18px;
      color:#CBD5E1;
      font-size:13px;
      ">
        📞 9203634407

        <br><br>

        Thank you for trusting us with your healthcare ❤️
      </div>

    </div>

  </div>

</div>
`
      },
    });

    await supabase.functions.invoke("send-email", {
      body: {
      to: [
      "deelipparihar2405@gmail.com",
      "doctorathome@gmail.com",
      "mohitgurjar2369@gmail.com",
      "priyanshuchouhan342@gmail.com"
    ],
        subject: `🩺 New Appointment - ${data.patient_name}`,
      html: `
<div style="
max-width:650px;
margin:auto;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
background:#F4F7FB;
padding:40px 20px;
">

  <!-- Main Card -->

  <div style="
  background:#ffffff;
  border-radius:28px;
  overflow:hidden;
  box-shadow:
    0 20px 50px rgba(10,37,88,0.10),
    0 4px 20px rgba(10,37,88,0.06);
  ">

    <!-- Header -->

    <div style="
    background:linear-gradient(135deg,#0A2558,#0EA5E9);
    padding:40px;
    text-align:center;
    ">

      <div style="
      width:70px;
      height:70px;
      margin:auto;
      border-radius:20px;
      background:rgba(255,255,255,0.15);
      line-height:70px;
      font-size:34px;
      ">
        🩺
      </div>

      <h1 style="
      color:white;
      margin:22px 0 8px;
      font-size:30px;
      font-weight:800;
      ">
        New Appointment Received
      </h1>

      <p style="
      color:rgba(255,255,255,0.8);
      margin:0;
      font-size:15px;
      ">
        Doctor At Home • Admin Notification
      </p>

    </div>

    <!-- Body -->

    <div style="padding:40px;">

      <p style="
      color:#64748B;
      font-size:15px;
      margin-bottom:24px;
      ">
      A new patient has booked an appointment.
      </p>

      <!-- Patient Card -->

      <div style="
      background:#F8FAFC;
      border:1px solid #E2E8F0;
      border-radius:22px;
      padding:28px;
      ">

        <div style="margin-bottom:18px;">
          <div style="font-size:13px;color:#94A3B8;">Patient Name</div>

          <div style="
          font-size:24px;
          font-weight:700;
          color:#0F172A;
          margin-top:6px;
          ">
            👤 ${data.patient_name}
          </div>
        </div>

        <hr style="border:none;border-top:1px solid #E2E8F0;">

        <div style="padding:18px 0;">
          <b>📞 Phone:</b>
          <span style="color:#334155">
            ${data.phone}
          </span>
        </div>

        <hr style="border:none;border-top:1px solid #E2E8F0;">

        <div style="padding:18px 0;">
          <b>🩺 Service:</b>
          <span style="color:#334155">
            ${data.service}
          </span>
        </div>

        <hr style="border:none;border-top:1px solid #E2E8F0;">

        <div style="padding:18px 0;">
          <b>📅 Appointment Date:</b>
          <span style="color:#334155">
            ${data.date}
          </span>
        </div>

        ${data.address ? `
        <hr style="border:none;border-top:1px solid #E2E8F0;">

        <div style="padding-top:18px;">

          <div style="
          font-size:13px;
          color:#94A3B8;
          margin-bottom:10px;
          ">
            Address
          </div>

          <div style="
          background:white;
          padding:18px;
          border-radius:14px;
          border:1px solid #E2E8F0;
          color:#334155;
          line-height:1.7;
          ">
            ${data.address}
          </div>

        </div>
        ` : ""}

      </div>

      <!-- Buttons -->

      <div style="
      text-align:center;
      margin-top:35px;
      ">

        <a
        href="tel:${data.phone}"
        style="
        display:inline-block;
        background:#0A2558;
        color:white;
        text-decoration:none;
        padding:14px 24px;
        border-radius:14px;
        font-weight:700;
        margin:8px;
        ">
        📞 Call Patient
        </a>

        <a
        href="https://wa.me/91${data.phone}"
        style="
        display:inline-block;
        background:#25D366;
        color:white;
        text-decoration:none;
        padding:14px 24px;
        border-radius:14px;
        font-weight:700;
        margin:8px;
        ">
        💬 WhatsApp
        </a>

        <a
        href="${data.google_maps_link}"
        style="
        display:inline-block;
        background:#0EA5E9;
        color:white;
        text-decoration:none;
        padding:14px 24px;
        border-radius:14px;
        font-weight:700;
        margin:8px;
        ">
        📍 Open Maps
        </a>

      </div>

    </div>

    <!-- Footer -->

    <div style="
    background:#F8FAFC;
    text-align:center;
    padding:28px;
    ">

      <div style="
      font-size:18px;
      font-weight:700;
      color:#0A2558;
      ">
        Doctor At Home
      </div>

      <div style="
      color:#94A3B8;
      margin-top:8px;
      font-size:14px;
      ">
        Healthcare at Your Doorstep
      </div>

      <div style="
      margin-top:18px;
      color:#CBD5E1;
      font-size:12px;
      ">
        This is an automated notification email.
      </div>

    </div>

  </div>

</div>
`
      },
    });

    console.log("EMAIL RESPONSE =", response);

    setSubmitted(true);
  };

  // ─── Success ──────────────────────────────────────────────────────────────────
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
              Request Received!
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.75, marginBottom: 28 }}>
              Your appointment has been submitted. Our team will assign a doctor and contact you shortly.
            </p>

            <div style={{
              background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0",
              padding: "16px 20px", marginBottom: 24, textAlign: "left",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              {[
                { icon: <Phone size={15} color="#0EA5E9" />, text: "Our team will call you within 30 minutes" },
                { icon: <Home size={15} color="#0EA5E9" />, text: "Doctor will arrive at your scheduled time" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 500, lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => navigate("/my-appointments")}
                style={{
                  width: "100%", padding: "13px", background: "#0A2558",
                  border: "none", borderRadius: 12, color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  letterSpacing: "0.02em", fontFamily: "inherit", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0d2f6e")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0A2558")}
              >
                View My Appointments →
              </button>

              <a
                href="https://wa.me/919203634407"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "100%", padding: "13px", background: "#25D366",
                  border: "none", borderRadius: 12, color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s", boxSizing: "border-box",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1ebe5d")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#25D366")}
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>

              <button
                onClick={() => navigate("/")}
                style={{
                  width: "100%", padding: "13px", background: "#fff",
                  border: "1.5px solid #E2E8F0", borderRadius: 12, color: "#64748B",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0EA5E9"; e.currentTarget.style.color = "#0EA5E9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#64748B"; }}
              >
                Back to Home
              </button>
            </div>

            <p style={{ fontSize: 12, color: "#B8C4D0", marginTop: 24 }}>
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

  return (
    <Layout>
      <div style={{ background: "#F0F4F8", minHeight: "100vh", paddingBottom: 64 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
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
            Fill in the details below and our team will get back to you promptly.
          </p>
        </div>

        {/* ── Form ─────────────────────────────────────────────────────────── */}
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

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <FormLabel style={labelSt}>Phone number</FormLabel>
                        <FormControl>
                          <Input
                            className="focus-visible:ring-[#0EA5E9] focus-visible:border-[#0EA5E9] placeholder:text-[#C8D4DE]"
                            style={inputSt}
                            placeholder="Enter your phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Service */}
                  <FormField control={form.control} name="service" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={labelSt}>Service required</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            style={inputSt}
                            className="focus:ring-[#0EA5E9] focus:border-[#0EA5E9] data-[placeholder]:text-[#C8D4DE]"
                          >
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.title} value={s.title}>{s.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Date only (time removed) */}
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={labelSt}>Preferred date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className="focus-visible:ring-[#0EA5E9] focus-visible:border-[#0EA5E9]"
                          style={inputSt}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Address — optional */}
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={labelSt}>
                        Home address{" "}
                        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
                      </FormLabel>
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

                  {/* Divider */}
                  <div style={{ height: 1, background: "#F1F5F9" }} />

                  {/* Location */}
                  <FormField control={form.control} name="google_maps_link" render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ ...labelSt, display: "flex", alignItems: "center", gap: 5 }}>
                        <MapPin size={12} color="#0EA5E9" />
                        Share your location
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
                        <Button
                          type="button"
                          variant="outline"
                          onClick={detectLocation}
                          className="hover:bg-[#E0F2FE] shrink-0"
                          style={{
                            background: "#F0F9FF",
                            border: "1.5px solid #BAE6FD",
                            borderRadius: 10,
                            color: "#0EA5E9",
                            fontSize: 12,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            transition: "background 0.15s",
                          }}
                        >
                          Auto Detect
                        </Button>
                      </div>
                      <p style={{ fontSize: 11.5, color: "#C8D4DE", marginTop: 4 }}>
                        Or click Auto Detect to share your live location
                      </p>
                      <FormMessage />
                    </FormItem>
                  )} />

                </div>

                {/* Submit Button */}
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
                    {loading ? "Submitting..." : "Submit Appointment Request →"}
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