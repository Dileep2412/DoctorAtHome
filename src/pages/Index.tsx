import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Shield, Clock, Home, Star, Phone,
  CheckCircle, Zap, Heart, Users, MessageCircle,
  Stethoscope, UserRound, Dumbbell, Microscope,
  CalendarDays, PhoneCall, ClipboardList,
} from "lucide-react";
import Layout from "@/components/Layout";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import gallery1 from "@/assets/gallery1.png";
import gallery2 from "@/assets/gallery2.png";
import gallery3 from "@/assets/gallery3.png";
import gallery4 from "@/assets/gallery4.png";
import gallery5 from "@/assets/gallery5.png";
import gallery6 from "@/assets/gallery6.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

const testimonials = [
  { name: "Pushpa Singh",   location: "Bhopal", text: "Mera beta subah se bahut beemar tha aur lagatar vomiting ho rahi thi. Doctor At Home ki team ne turant response diya. Doctor ghar aaye aur proper treatment diya. Kuch hi samay me uski tabiyat me kaafi sudhaar aa gaya.", rating: 5 },
  { name: "Gaurav Singh",   location: "Bhopal", text: "I had an excellent experience with Doctor At Home. The doctors were professional, punctual, and explained everything clearly. The entire process was smooth and hassle-free.", rating: 5 },
  { name: "Subham Yadav",   location: "Bhopal", text: "Mere pitaji ko achanak saans lene me dikkat hone lagi thi. Doctor turant ghar aaye aur emergency oxygen support diya. Team ki quick response ne hume bahut confidence diya.", rating: 5 },
  { name: "Vivek Gupta",    location: "Bhopal", text: "Doctor At Home ki service bahut reliable hai. Doctor ne time par visit kiya aur patient ko proper time diya. Staff ka behaviour bhi bahut polite aur professional tha.", rating: 5 },
  { name: "Shivangi Rawat", location: "Bhopal", text: "Doctor At Home provides exceptional healthcare services. The doctor treated me with great care and patience. The treatment was effective and all my concerns were addressed properly.", rating: 5 },
  { name: "Anita Verma",    location: "Bhopal", text: "Meri maa ki umar zyada hai aur unhe baar-baar hospital le jana mushkil tha. Doctor At Home ki Elder Care service ne hamari bahut help ki. Doctors aur staff dono experienced hain.", rating: 5 },
  { name: "Rahul Sharma",   location: "Bhopal", text: "Doctor ghar par time se aaye aur pura checkup bahut patiently kiya. Hume hospital jaane ki zarurat nahi padi. Overall experience bahut smooth raha.", rating: 5 },
  { name: "Priya Mehta",    location: "Bhopal", text: "Booking process bahut simple tha aur team ne jaldi response diya. Doctor bahut polite the aur meri maa ko ghar par hi proper treatment mila.", rating: 5 },
  { name: "Neha Patel",     location: "Bhopal", text: "Lab test booking ghar baithe ho gayi aur sample collection bhi time par hua. Reports jaldi mil gayi aur pura process bahut convenient raha.", rating: 5 },
  { name: "Suresh Tiwari",  location: "Bhopal", text: "Emergency situation me Doctor At Home ne bahut jaldi response diya. Team experienced hai aur patient ki condition ko calmly handle karti hai.", rating: 5 },
];

const whyUs = [
  { icon: Users,  title: "Experienced Doctors",  desc: "Board-certified doctors with years of home visit expertise.", badge: "Verified",    stat: "Certified doctors",  glowColor: "#3b82f6", iconBg: "rgba(59,130,246,0.1)",  iconColor: "#2563eb", badgeBg: "rgba(59,130,246,0.08)",  badgeColor: "#1d4ed8", badgeBorder: "rgba(59,130,246,0.2)"  },
  { icon: Clock,  title: "24/7 Availability",    desc: "Round-the-clock support and emergency services, anytime.",  badge: "Always On",  stat: "Never closed",       glowColor: "#14b8a6", iconBg: "rgba(20,184,166,0.1)",  iconColor: "#0d9488", badgeBg: "rgba(20,184,166,0.08)",  badgeColor: "#0f766e", badgeBorder: "rgba(20,184,166,0.2)"  },
  { icon: Zap,    title: "Fast Response",         desc: "Doctor at your doorstep within 2 hours of booking.",       badge: "Fast",       stat: "2hr guarantee",      glowColor: "#f97316", iconBg: "rgba(249,115,22,0.1)",  iconColor: "#ea580c", badgeBg: "rgba(249,115,22,0.08)",  badgeColor: "#c2410c", badgeBorder: "rgba(249,115,22,0.2)"  },
  { icon: Heart,  title: "Affordable Care",       desc: "Transparent pricing with zero hidden charges.",             badge: "Affordable", stat: "No hidden fees",     glowColor: "#ec4899", iconBg: "rgba(236,72,153,0.1)",  iconColor: "#db2777", badgeBg: "rgba(236,72,153,0.08)",  badgeColor: "#be185d", badgeBorder: "rgba(236,72,153,0.2)"  },
  { icon: Home,   title: "Home Comfort",          desc: "Recover stress-free in your own comfortable space.",        badge: "At Home",    stat: "Zero travel stress", glowColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.1)", iconColor: "#7c3aed", badgeBg: "rgba(139,92,246,0.08)",  badgeColor: "#6d28d9", badgeBorder: "rgba(139,92,246,0.2)"  },
  { icon: Shield, title: "Trusted by Families",   desc: "Thousands of families in Bhopal rely on us daily.",        badge: "Trusted",    stat: "5★ rated service",   glowColor: "#10b981", iconBg: "rgba(16,185,129,0.1)", iconColor: "#059669", badgeBg: "rgba(16,185,129,0.08)",  badgeColor: "#047857", badgeBorder: "rgba(16,185,129,0.2)"  },
];

const previewServices = [
  { title: "Doctor Home Visit", desc: "Certified doctors at your doorstep for consultation & treatment.",       icon: Stethoscope, gradient: "from-blue-500 to-indigo-600",   iconBg: "bg-blue-500"    },
  { title: "Elder Care",        desc: "Dedicated care for senior citizens with regular health monitoring.",      icon: UserRound,   gradient: "from-purple-500 to-purple-700", iconBg: "bg-purple-500"  },
  { title: "Physiotherapy",     desc: "Expert physiotherapy sessions for recovery and pain relief.",            icon: Dumbbell,    gradient: "from-orange-400 to-orange-600", iconBg: "bg-orange-500"  },
  { title: "Lab Tests at Home", desc: "Sample collection at your doorstep with fast, accurate results.",       icon: Microscope,  gradient: "from-[#14B8A6] to-teal-600",   iconBg: "bg-[#14B8A6]"  },
];

const howItWorks = [
  {
    step: 1,
    icon: CalendarDays,
    title: "Book an Appointment",
    desc: "Fill out the appointment form on our website, or contact us via call or WhatsApp.",
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
  },
  {
    step: 2,
    icon: PhoneCall,
    title: "We Confirm Your Request",
    desc: "Our team reviews your request and contacts you to confirm the appointment details.",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
  },
  {
    step: 3,
    icon: Stethoscope,
    title: "Healthcare Professional Visits",
    desc: "A qualified doctor, nurse, or physiotherapist visits your home at the scheduled time.",
    color: "#14B8A6",
    bg: "rgba(20,184,166,0.08)",
  },
  {
    step: 4,
    icon: ClipboardList,
    title: "Get Treatment & Reports",
    desc: "Receive quality healthcare at home along with prescriptions, reports, and follow-up support.",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
  },
];

const Index = () => {
  return (
    <Layout>

      {/* ══ HERO ══ */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden text-center"
        style={{ background: "linear-gradient(160deg, #0E3178 0%, #1145A8 45%, #0D3D8F 100%)" }}
      >
        {/* Center glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full opacity-25 blur-3xl"
            style={{
              width: "900px", height: "600px",
              background: "radial-gradient(ellipse, #14B8A6 0%, #0EA5E9 30%, transparent 68%)",
              top: "50%", left: "50%", transform: "translate(-50%, -52%)",
            }} />
          {/* Corner accent */}
          <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(circle, #38bdf8, transparent)", bottom: "-60px", right: "-60px" }} />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }} />

        <div className="w-full max-w-[860px] mx-auto px-6 md:px-10 py-24 relative z-10 flex flex-col items-center">

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-3 text-[#5eead4] text-xs font-bold uppercase tracking-[0.28em] mb-7">
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-[#14B8A6]" />
              Bhopal's Trusted Home Healthcare
              <span className="w-8 h-px bg-gradient-to-l from-transparent to-[#14B8A6]" />
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6"
          >
            Expert Healthcare,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] via-[#22d3c8] to-[#38bdf8]">
              Delivered To Your Door.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/65 text-base md:text-lg leading-relaxed mb-10 max-w-xl"
          >
            Trusted doctors, nursing care, physiotherapy and diagnostics —
            delivered safely and conveniently at your home across{" "}
            <span className="text-[#5eead4] font-semibold">Bhopal.</span>
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.55 }}
            className="flex flex-wrap gap-4 justify-center mb-14"
          >
            <Link to="/appointment">
              <button
                className="group inline-flex items-center gap-2.5 font-bold px-8 py-4 rounded-2xl text-base text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
                  boxShadow: "0 4px 20px rgba(14,165,233,0.45), 0 0 0 1px rgba(255,255,255,0.1)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(14,165,233,0.6), 0 0 0 1px rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(14,165,233,0.45), 0 0 0 1px rgba(255,255,255,0.1)"; }}
              >
                <CalendarDays className="h-5 w-5 group-hover:rotate-6 transition-transform duration-300" />
                Book Appointment
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
            <a href="tel:+919203634407">
              <button
                className="group inline-flex items-center gap-2.5 font-bold px-8 py-4 rounded-2xl text-base text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              >
                <Phone className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Call Now
              </button>
            </a>
          </motion.div>

          {/* Trust pills — premium */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: CheckCircle, text: "Verified Doctors",  iconColor: "#14B8A6", borderColor: "rgba(20,184,166,0.35)",  bg: "rgba(20,184,166,0.1)"  },
              { icon: Home,        text: "Home Visits",       iconColor: "#38bdf8", borderColor: "rgba(56,189,248,0.35)",  bg: "rgba(56,189,248,0.1)"  },
              { icon: Clock,       text: "24×7 Support",      iconColor: "#c084fc", borderColor: "rgba(192,132,252,0.35)", bg: "rgba(192,132,252,0.1)" },
              { icon: Zap,         text: "Response in 2 hrs", iconColor: "#fb923c", borderColor: "rgba(251,146,60,0.35)",  bg: "rgba(251,146,60,0.1)"  },
            ].map((pill) => (
              <div
                key={pill.text}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white/85 text-xs font-semibold transition-all duration-200 hover:scale-105 cursor-default"
                style={{ background: pill.bg, border: `1px solid ${pill.borderColor}` }}
              >
                <pill.icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: pill.iconColor }} />
                {pill.text}
              </div>
            ))}
          </motion.div>

        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 54" className="w-full" preserveAspectRatio="none">
            <path d="M0,27 C360,54 1080,0 1440,27 L1440,54 L0,54 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-24 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #e8f4fd 0%, #f0f0ff 35%, #e6faf5 70%, #fce8f8 100%)"
      }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, rgba(20,184,166,0.22), transparent 70%)", top: "-120px", right: "-100px" }} />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)", bottom: "-100px", left: "-80px" }} />
        </div>
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">Why Choose Us</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-4">Why Choose DoctorAtHome?</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-xl mx-auto text-lg">Medical expertise meets genuine compassion — healthcare that truly feels like family.</motion.p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {whyUs.map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} whileHover={{ y: -6 }}
                className="relative rounded-[22px] p-5 md:p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl"
                style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.78)" }}
              >
                <div className="absolute -top-10 -right-8 w-[130px] h-[130px] rounded-full pointer-events-none opacity-25"
                  style={{ background: `radial-gradient(circle, ${item.glowColor}, transparent)` }} />
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                    <item.icon className="h-5 w-5" style={{ color: item.iconColor }} />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                    style={{ background: item.badgeBg, color: item.badgeColor, borderColor: item.badgeBorder }}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-[#0A2558] text-base md:text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">{item.desc}</p>
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#0A2558]/[0.07]">
                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: item.iconColor }} />
                  <span className="text-[11px] font-bold" style={{ color: item.iconColor }}>{item.stat}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">Simple Process</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-4">How DoctorAtHome Works</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-xl mx-auto text-lg">Quality healthcare delivered to your doorstep in just 4 simple steps</motion.p>
            {/* teal line */}
            <div className="flex items-center justify-center gap-1 mt-4">
              <div className="w-8 h-0.5 rounded-full bg-[#14B8A6]" />
              <div className="w-2 h-2 rounded-full bg-[#14B8A6]" />
              <div className="w-8 h-0.5 rounded-full bg-[#14B8A6]" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center">

                {/* dotted arrow between steps — desktop only */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:flex absolute top-[52px] left-[calc(50%+52px)] right-[calc(-50%+52px)] items-center z-10">
                    <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                    <ArrowRight className="h-4 w-4 text-slate-300 -ml-1 flex-shrink-0" />
                  </div>
                )}

                <motion.div
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i} variants={fadeUp}
                  className="w-full flex flex-col items-center text-center"
                >
                  {/* Step number badge */}
                  <div className="relative mb-5">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: step.bg, border: `2px solid ${step.color}20` }}
                    >
                      <step.icon className="h-10 w-10" style={{ color: step.color }} />
                    </div>
                    {/* number badge */}
                    <div
                      className="absolute -top-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-md"
                      style={{ background: step.color }}
                    >
                      {step.step}
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className="w-full rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    style={{ background: "#F8FAFC", borderColor: `${step.color}20`, borderTopColor: step.color, borderTopWidth: 3 }}
                  >
                    <h3 className="font-extrabold text-[#0A2558] text-base mb-2">{step.title}</h3>
                    <div className="w-8 h-0.5 rounded-full mx-auto mb-3" style={{ background: step.color }} />
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* CTA below */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mt-12"
          >
            <Link to="/appointment">
              <button className="inline-flex items-center gap-2 bg-[#14B8A6] hover:bg-[#0f9d93] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#14B8A6]/25 hover:scale-105 active:scale-95 transition-all duration-200">
                Book Your Appointment Now <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES PREVIEW ── */}
      <section className="py-24" style={{ background: "#F1F5F9" }}>
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <p className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">What We Offer</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-4">Our Services</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">Comprehensive homecare services tailored to your needs.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {previewServices.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradient} rounded-t-3xl`} />
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-[0.08]`} />
                <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-extrabold text-[#0A2558] text-base mb-2 group-hover:text-[#14B8A6] transition-colors duration-300">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#14B8A6] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services">
              <button className="inline-flex items-center gap-2 bg-[#0A2558] hover:bg-[#0d2f6e] text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200">
                View All Services <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="py-24 bg-[#F8FAFC] overflow-hidden">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 mb-14">
          <div className="text-center">
            <p className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">Real Moments</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-4">Our Home Visit Gallery</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">Real moments of care, compassion and professional healthcare delivered at home.</p>
          </div>
        </div>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20} slidesPerView="auto" centeredSlides loop speed={600}
          autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          className="gallery-swiper pb-12"
        >
          {[gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, gallery1, gallery2, gallery3, gallery4, gallery5, gallery6].map((img, i) => (
            <SwiperSlide key={i} style={{ width: "360px", maxWidth: "80vw" }}>
              <div className="rounded-[24px] overflow-hidden shadow-xl" style={{ height: "260px" }}>
                <img src={img} alt="Doctor At Home" className="w-full h-full object-cover" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <p className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">Patient Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-4">Trusted by Families Across Bhopal</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">Real stories from real patients who experienced care at home.</p>
          </div>
          <div className="relative overflow-hidden group"
            style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
            <div className="flex gap-5 group-hover:[animation-play-state:paused]"
              style={{ animation: "marqueeScroll 40s linear infinite", width: "max-content" }}>
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="w-[320px] flex-shrink-0 flex flex-col rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
                  style={{ background: "#F8FAFC", minHeight: "200px" }}>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />)}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-2.5 pt-3 mt-3 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0A2558, #14B8A6)" }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0A2558] text-xs">{t.name}</p>
                      <p className="text-slate-400 text-[10px]">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EMERGENCY CTA ── */}
      <section className="py-6 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #071B45 0%, #0A2558 55%, #0e3272 100%)"
      }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.10]"
            style={{ background: "radial-gradient(circle, #14B8A6, transparent)", top: "-150px", right: "-80px" }} />
        </div>
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1">Need Urgent Care?</h3>
              <p className="text-white/60 text-sm md:text-base">Our emergency homecare team is available 24/7. Call us now.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a href="tel:+919203634407">
                <button className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "#EF4444", color: "#fff", boxShadow: "0 4px 16px rgba(239,68,68,0.35)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#DC2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#EF4444")}>
                  <Phone className="h-4 w-4" /> Call Emergency
                </button>
              </a>
              <a href="https://wa.me/919203634407" target="_blank" rel="noopener noreferrer">
                <button className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "#25D366", color: "#fff", boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1ebe5d")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#25D366")}>
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .gallery-swiper .swiper-pagination-bullet {
          background: #0A2558; opacity: 0.25; width: 8px; height: 8px;
        }
        .gallery-swiper .swiper-pagination-bullet-active {
          background: #14B8A6; opacity: 1; width: 24px;
          border-radius: 4px; transition: width 0.3s ease;
        }
      `}</style>

    </Layout>
  );
};

export default Index;