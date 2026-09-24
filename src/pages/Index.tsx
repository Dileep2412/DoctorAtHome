import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Shield, Clock, Home, Star, Phone,
  CheckCircle, Zap, Heart, Users, MessageCircle,
  Stethoscope, UserRound, Dumbbell, Microscope,
  CalendarDays, PhoneCall, ClipboardList, BadgeCheck, Play,
} from "lucide-react";
import Layout from "@/components/Layout";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import gallery1 from "@/assets/gallery1.png";
import gallery2 from "@/assets/gallery2.png";
import gallery3 from "@/assets/gallery3.png";
import gallery4 from "@/assets/gallery4.png";
import gallery5 from "@/assets/gallery5.png";
import gallery6 from "@/assets/gallery6.png";

// Gallery item types:
//  - "image":     src = photo import
//  - "video":     src = direct .mp4 URL (Supabase Storage / public folder)
//  - "instagram": src = Instagram reel URL (played via embed iframe in lightbox)
type GalleryItem = {
  type: "image" | "video" | "instagram";
  src: string;
  poster?: string; // optional thumbnail for video / instagram
  caption: string;
  sub: string;
};

const getInstagramEmbedUrl = (url: string) => {
  const m = url.match(/instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : "";
};

// Silent looping preview inside a gallery slide.
// Plays only while on screen (saves data/battery), pauses otherwise.
const GalleryVideo = ({ src, poster }: { src: string; poster?: string }) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      className="w-full h-full object-cover pointer-events-none"
      style={{ objectPosition: "center 12%" }} // portrait video: keep faces in the landscape slide
    />
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  }),
};

const GoogleGIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l0.003-0.002l6.19,5.238 C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

const GOOGLE_RATING = "4.9";
const GOOGLE_REVIEW_COUNT = 120;
// TODO: replace with the exact Google Maps / Business place link
const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=Doctor+At+Home+Bhopal+reviews";

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
  { icon: Home,   title: "Home Comfort",          desc: "Recover stress-free in your own comfortable space.",        glowColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.1)", iconColor: "#7c3aed", badge: "At Home", badgeBg: "rgba(139,92,246,0.08)",  badgeColor: "#6d28d9", badgeBorder: "rgba(139,92,246,0.2)"  },
  { icon: Shield, title: "Trusted by Families",   desc: "Thousands of families in Bhopal rely on us daily.",        badge: "Trusted",    stat: "5★ rated service",   glowColor: "#10b981", iconBg: "rgba(16,185,129,0.1)", iconColor: "#059669", badgeBg: "rgba(16,185,129,0.08)",  badgeColor: "#047857", badgeBorder: "rgba(16,185,129,0.2)"  },
];

const previewServices = [
  { title: "Doctor Home Visit", desc: "Certified doctors at your doorstep for consultation & treatment.",       icon: Stethoscope, accent: "#2563eb", iconBg: "rgba(59,130,246,0.1)"  },
  { title: "Elder Care",        desc: "Dedicated care for senior citizens with regular health monitoring.",      icon: UserRound,   accent: "#7c3aed", iconBg: "rgba(139,92,246,0.1)"  },
  { title: "Physiotherapy",     desc: "Expert physiotherapy sessions for recovery and pain relief.",            icon: Dumbbell,    accent: "#ea580c", iconBg: "rgba(249,115,22,0.1)"  },
  { title: "Lab Tests at Home", desc: "Sample collection at your doorstep with fast, accurate results.",       icon: Microscope,  accent: "#0d9488", iconBg: "rgba(20,184,166,0.1)"  },
];

const howItWorks: {
  step: number; icon: typeof CalendarDays; title: string; desc: string;
  color: string; bg: string; points: string[]; cta?: boolean;
}[] = [
  { step: 1, icon: CalendarDays, title: "Book an Appointment", desc: "Fill out the appointment form on our website, or contact us via call or WhatsApp.", color: "#0EA5E9", bg: "rgba(14,165,233,0.08)", points: ["Website form", "Call", "WhatsApp"], cta: true },
  { step: 2, icon: PhoneCall, title: "We Confirm Your Request", desc: "Our team reviews your request and contacts you to confirm the appointment details.", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", points: ["Confirmation call", "Date & time", "Address details"] },
  { step: 3, icon: Stethoscope, title: "Healthcare Professional Visits", desc: "A qualified doctor, nurse, or physiotherapist visits your home at the scheduled time.", color: "#14B8A6", bg: "rgba(20,184,166,0.08)", points: ["Doctor", "Nurse", "Physiotherapist"] },
  { step: 4, icon: ClipboardList, title: "Get Treatment & Reports", desc: "Receive quality healthcare at home along with prescriptions, reports, and follow-up support.", color: "#10B981", bg: "rgba(16,185,129,0.08)", points: ["Prescription", "Reports", "Follow-up support"] },
];

const ProcessStackCard = ({
  step, i, photo,
}: {
  step: (typeof howItWorks)[number];
  i: number;
  photo: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.55]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, 10]);

  return (
    <div
      ref={ref}
      className="sticky mb-6"
      style={{ top: `${88 + i * 28}px`, zIndex: i + 1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ delay: i * 0.1, duration: 0.55, ease: "easeOut" }}
        style={{ scale, opacity, y: translateY }}
      >
        <div
          className="rounded-[28px] overflow-hidden bg-white"
          style={{
            boxShadow: "0 20px 50px rgba(10,37,88,0.18), 0 4px 14px rgba(10,37,88,0.08)",
            borderTop: `4px solid ${step.color}`,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
            <div className="relative h-40 md:h-auto">
              <img src={photo} alt={step.title} className="absolute inset-0 w-full h-full object-cover" />
              <div
                className="absolute top-3 left-3 w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                style={{ background: step.color }}
              >
                {step.step}
              </div>
            </div>
            <div className="p-5 md:p-7 md:min-h-[190px] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: step.bg }}>
                  <step.icon className="h-4.5 w-4.5" style={{ color: step.color }} />
                </div>
                <h3 className="font-extrabold text-[#0A2558] text-lg md:text-2xl">{step.title}</h3>
              </div>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl">{step.desc}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {step.points.map((pt) => (
                  <span
                    key={pt}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: step.bg, color: step.color }}
                  >
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {pt}
                  </span>
                ))}
              </div>

              {step.cta && (
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <Link
                    to="/appointment"
                    className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                    style={{ background: step.color, boxShadow: `0 6px 18px ${step.color}55` }}
                  >
                    <CalendarDays className="h-4 w-4" /> Book Appointment
                  </Link>
                  <a
                    href="https://wa.me/919203634407" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border transition-colors duration-200 hover:bg-slate-50"
                    style={{ color: "#0A2558", borderColor: "rgba(10,37,88,0.15)" }}
                  >
                    <MessageCircle className="h-4 w-4" style={{ color: "#25D366" }} /> WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Index = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const [showActionBar, setShowActionBar] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowActionBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // To make a reel autoplay in the slide (no thumbnail needed), swap its entry to an MP4:
  //   { type: "video", src: "/videos/reel1.mp4", caption: "...", sub: "..." }
  // (put the file in public/videos/ or use a Supabase Storage public URL)
  //
  // Gallery items — videos sit at positions 2, 4, 6 and 8.
  const galleryItems: GalleryItem[] = [
    { type: "image",     src: gallery1, caption: "Doctor Home Visit",     sub: "Certified doctors at your doorstep" },
    { type: "video",     src: "/videos/reel1.mp4", poster: "/videos/reel1.jpg", caption: "Patient Testimonial", sub: "In their own words: care at home" },
    { type: "image",     src: gallery2, caption: "Elder Care at Home",    sub: "Regular health monitoring for seniors" },
    { type: "video",     src: "/videos/reel2.mp4", poster: "/videos/reel2.jpg", caption: "Words from Our Patients", sub: "Hear their experience with Doctor At Home" },
    { type: "image",     src: gallery3, caption: "Nursing Care",          sub: "Professional at-home nursing support" },
    { type: "video",     src: "/videos/reel3.mp4", poster: "/videos/reel3.jpg", caption: "Patient Experience", sub: "A family's experience of care at home" },
    { type: "image",     src: gallery4, caption: "Post-Operative Care",   sub: "Recovery support after surgery" },
    { type: "video",     src: "/videos/reel4.mp4", poster: "/videos/reel4.jpg", caption: "Patient & Family Story", sub: "Their experience with Doctor At Home" },
    { type: "image",     src: gallery5, caption: "Vitals & Health Check", sub: "Routine monitoring in the comfort of home" },
    { type: "image",     src: gallery6, caption: "Physiotherapy Session", sub: "Expert physiotherapy for recovery and pain relief" },
  ];

  return (
    <Layout>
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(170deg, #0A2558 0%, #0d3168 55%, #0A2558 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.12]"
            style={{ background: "radial-gradient(circle, #14B8A6, transparent 70%)", top: "-140px", left: "-120px" }} />
          <div className="absolute w-[420px] h-[420px] rounded-full blur-3xl opacity-[0.10]"
            style={{ background: "radial-gradient(circle, #0EA5E9, transparent 70%)", bottom: "-120px", right: "10%" }} />
        </div>
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-10 pt-8 pb-16 md:pt-28 md:pb-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-5 relative">
                <a
                  href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
                  className="relative inline-flex items-center gap-3 pl-4 pr-9 py-2.5 rounded-2xl transition-all duration-200 hover:scale-[1.03]"
                  style={{
                    background: "rgba(255,255,255,0.09)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    boxShadow: "0 8px 28px rgba(20,184,166,0.22), 0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  <span
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
                  >
                    <GoogleGIcon className="h-3.5 w-3.5" />
                  </span>
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <div className="leading-tight text-left">
                    <p className="text-white font-extrabold text-sm">{GOOGLE_RATING} / 5.0 Rating</p>
                    <p className="text-white/55 text-[11px]">Verified Google Reviews · {GOOGLE_REVIEW_COUNT} ratings</p>
                  </div>
                </a>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
                <span className="inline-block text-[#5eead4] text-xs font-bold uppercase tracking-[0.24em] mb-6">
                  Bhopal's Trusted Home Healthcare
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7 }}
                className="font-sans text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6"
              >
                Expert Healthcare,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] via-[#22d3c8] to-[#38bdf8]">
                  Delivered To Your{" "}
                </span>
                <span
                  className="inline-block border-2 rounded-xl px-3 text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] via-[#22d3c8] to-[#38bdf8]"
                  style={{ borderColor: "#14B8A6" }}
                >
                  Door.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-white/65 text-base md:text-lg leading-relaxed mb-9 max-w-lg mx-auto lg:mx-0"
              >
                Trusted doctors, nursing care, physiotherapy and diagnostics —
                delivered safely and conveniently at your home across{" "}
                <span className="text-[#5eead4] font-semibold">Bhopal.</span>
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.55 }}
                className="flex flex-nowrap gap-3 sm:gap-4 mb-4 w-full sm:w-auto"
              >
                <Link to="/appointment" className="flex-1 sm:flex-none">
                  <button
                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 sm:gap-2.5 font-bold px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base text-white transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
                    style={{
                      background: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
                      boxShadow: "0 8px 32px rgba(14,165,233,0.55), 0 0 0 1px rgba(255,255,255,0.12)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 44px rgba(14,165,233,0.7), 0 0 0 1px rgba(255,255,255,0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(14,165,233,0.55), 0 0 0 1px rgba(255,255,255,0.12)"; }}
                  >
                    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 group-hover:rotate-6 transition-transform duration-300" />
                    <span className="sm:hidden">Book Now</span>
                    <span className="hidden sm:inline">Book Appointment</span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                <a
                  href="https://wa.me/919203634407?text=Hello%20DoctorAtHome%2C%20I%20would%20like%20to%20book%20a%20home%20visit."
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 sm:flex-none"
                >
                  <button
                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 sm:gap-2.5 font-bold px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base text-[#0A2558] bg-white transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-slate-50 whitespace-nowrap"
                    style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
                  >
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" style={{ color: "#25D366" }} />
                    WhatsApp
                  </button>
                </a>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="text-white/45 text-xs font-medium mb-10"
              >
                No hidden charges · Certified doctors only
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-[28px] overflow-hidden" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
                <img
                  src={gallery3}
                  alt="Doctor examining a patient at home"
                  className="w-full h-[340px] md:h-[440px] object-cover"
                />
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(180deg, rgba(10,37,88,0) 55%, rgba(10,37,88,0.55) 100%)",
                }} />
              </div>
              <div
                className="absolute -bottom-6 left-6 right-6 md:left-8 md:right-auto md:w-[280px] rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,0.18)" }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(20,184,166,0.12)" }}>
                  <BadgeCheck className="h-6 w-6" style={{ color: "#0d9488" }} />
                </div>
                <div>
                  <p className="text-[#0A2558] font-extrabold text-sm leading-tight">Verified Home Visits</p>
                  <p className="text-slate-400 text-xs mt-0.5">Doctors visit patients across Bhopal daily</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 54" className="w-full" preserveAspectRatio="none">
            <path d="M0,27 C360,54 1080,0 1440,27 L1440,54 L0,54 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* TODO: verify every stat below is a real number (no placeholder stats) */}
      <div className="overflow-hidden py-6 md:py-10" style={{ background: "linear-gradient(90deg, #0A2558, #0d3168)" }}>
        <div
          className="flex items-center gap-10 whitespace-nowrap"
          style={{ animation: "tickerScroll 22s linear infinite", width: "max-content" }}
        >
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-10">
              {[
                "★ 4.9/5 Google Rating",
                "🏠 500+ Home Visits Completed",
                "👨‍⚕️ Certified & Verified Doctors",
                "🚑 24×7 Emergency Support",
                "⏱ Under 2hr Response Time",
              ].map((item) => (
                <span key={item} className="text-white text-sm sm:text-base font-bold tracking-wide flex items-center gap-3">
                  {item}
                  <span className="text-[#14B8A6] mx-1">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

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
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: s.accent }} />
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.08]" style={{ background: s.accent }} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300" style={{ background: s.iconBg }}>
                  <s.icon className="h-7 w-7" style={{ color: s.accent }} />
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
          modules={[Autoplay, Pagination, Mousewheel]}
          spaceBetween={20} slidesPerView="auto" centeredSlides loop speed={600}
          grabCursor
          simulateTouch
          threshold={6}
          mousewheel={{ forceToAxis: true, sensitivity: 0.6 }}
          autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="gallery-swiper pb-12"
        >
          {[...galleryItems, ...galleryItems].map((item, i) => (
            <SwiperSlide key={i} style={{ width: "360px", maxWidth: "80vw" }}>
              <button
                onClick={() => setLightboxIndex(i % galleryItems.length)}
                className="group relative w-full rounded-[24px] overflow-hidden shadow-xl cursor-grab active:cursor-grabbing select-none"
                style={{ height: "260px" }}
              >
                {item.type === "image" && (
                  <img
                    src={item.src} alt={item.caption} draggable={false}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: "contrast(1.06) saturate(1.08) brightness(1.02)" }}
                  />
                )}

                {item.type === "video" && (
                  <GalleryVideo src={item.src} poster={item.poster} />
                )}

                {item.type === "instagram" && (
                  item.poster ? (
                    <img src={item.poster} alt={item.caption} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: "linear-gradient(135deg, #0A2558 0%, #0d3168 50%, #14B8A6 100%)" }}
                    />
                  )
                )}

                {/* Instagram embeds can't autoplay, so they keep the big play button */}
                {item.type === "instagram" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.35)" }}
                    >
                      <Play className="h-7 w-7 ml-1" style={{ color: "#0A2558" }} fill="#0A2558" />
                    </span>
                  </div>
                )}

                {item.type !== "image" && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/45 text-white backdrop-blur-sm">
                    <Play className="h-2.5 w-2.5" fill="currentColor" />
                    {item.type === "instagram" ? "Watch Reel" : "Tap for sound"}
                  </span>
                )}

                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                  background: "linear-gradient(180deg, rgba(10,37,88,0.05) 0%, rgba(10,37,88,0) 35%, rgba(10,37,88,0.75) 100%)",
                }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-extrabold text-sm">{item.caption}</p>
                  <p className="text-white/70 text-xs mt-0.5">{item.sub}</p>
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── GALLERY LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
            style={{ background: "rgba(10,10,20,0.9)" }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl"
            >
              ✕
            </button>
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length); }}
                className="absolute left-3 md:left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl"
              >
                ‹
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % galleryItems.length); }}
              className="absolute right-3 md:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-2xl"
            >
              ›
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full rounded-[24px] overflow-hidden ${
                galleryItems[lightboxIndex].type !== "image" ? "max-w-[420px]" : "max-w-3xl" // reels are portrait (9:16)
              }`}
              style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
            >
              {(() => {
                const item = galleryItems[lightboxIndex];

                if (item.type === "video") {
                  return (
                    <video
                      key={item.src} src={item.src} poster={item.poster}
                      controls autoPlay playsInline
                      className="w-full max-h-[70vh] bg-black"
                    />
                  );
                }

                if (item.type === "instagram") {
                  return (
                    <iframe
                      key={item.src}
                      src={getInstagramEmbedUrl(item.src)}
                      title={item.caption}
                      className="w-full border-0 bg-white"
                      style={{ height: "min(70vh, 640px)" }}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      scrolling="no"
                    />
                  );
                }

                return (
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full max-h-[70vh] object-cover"
                  />
                );
              })()}
              <div className="bg-white p-5">
                <p className="text-[#0A2558] font-extrabold text-lg">{galleryItems[lightboxIndex].caption}</p>
                <p className="text-slate-500 text-sm mt-1">{galleryItems[lightboxIndex].sub}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
            {whyUs.map((item, i) => {
              const spanClass = i === 0 || i === 1
                ? "md:col-span-3"
                : i === 5
                ? "md:col-span-6"
                : "md:col-span-2";
              return (
                <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} variants={fadeUp} whileHover={{ y: -6 }}
                  className={`relative rounded-[22px] p-5 md:p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl ${spanClass} ${i === 5 ? "flex items-center gap-6" : ""}`}
                  style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.78)" }}
                >
                  <div className="absolute -top-10 -right-8 w-[130px] h-[130px] rounded-full pointer-events-none opacity-25"
                    style={{ background: `radial-gradient(circle, ${item.glowColor}, transparent)` }} />
                  <div className={i === 5 ? "flex items-center gap-6 w-full relative z-10" : "relative z-10"}>
                    <div className="flex items-center gap-2 mb-4" style={i === 5 ? { marginBottom: 0, flexShrink: 0 } : undefined}>
                      <div className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                        <item.icon className="h-5 w-5" style={{ color: item.iconColor }} />
                      </div>
                      {i !== 5 && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                          style={{ background: item.badgeBg, color: item.badgeColor, borderColor: item.badgeBorder }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0A2558] text-base md:text-lg mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed">{item.desc}</p>
                      {i !== 5 && (
                        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#0A2558]/[0.07]">
                          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: item.iconColor }} />
                          <span className="text-[11px] font-bold" style={{ color: item.iconColor }}>{item.stat}</span>
                        </div>
                      )}
                    </div>
                    {i === 5 && (
                      <span className="ml-auto flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border"
                        style={{ background: item.badgeBg, color: item.badgeColor, borderColor: item.badgeBorder }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pt-24 pb-10 bg-white">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} custom={0} className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">Simple Process</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-4">How DoctorAtHome Works</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-500 max-w-xl mx-auto text-lg">Quality healthcare delivered to your doorstep in just 4 simple steps</motion.p>
            <div className="flex items-center justify-center gap-1 mt-4">
              <div className="w-8 h-0.5 rounded-full bg-[#14B8A6]" />
              <div className="w-2 h-2 rounded-full bg-[#14B8A6]" />
              <div className="w-8 h-0.5 rounded-full bg-[#14B8A6]" />
            </div>
          </motion.div>
          <div className="relative" style={{ paddingBottom: `${(howItWorks.length - 1) * 36 + 12}px` }}>
            {howItWorks.map((step, i) => {
              const photo = [gallery4, gallery5, gallery6, gallery1][i % 4];
              return <ProcessStackCard key={step.step} step={step} i={i} photo={photo} />;
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <p className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">Patient Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-4">Trusted by Families Across Bhopal</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg mb-6">Real stories from real patients who experienced care at home.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
                className="relative inline-flex items-center gap-4 px-6 py-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] cursor-pointer transition-all duration-200 hover:scale-[1.04] hover:shadow-lg hover:border-[#14B8A6]/40"
              >
                <span
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center"
                  style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
                >
                  <GoogleGIcon className="h-4 w-4" />
                </span>
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                <div className="leading-tight text-left pr-6">
                  <p className="text-[#0A2558] font-extrabold text-lg">{GOOGLE_RATING} / 5.0 Rating</p>
                  <p className="text-slate-400 text-xs mt-0.5">Verified Google Reviews · {GOOGLE_REVIEW_COUNT} ratings</p>
                </div>
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden group"
            style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
            <div className="flex gap-5 group-hover:[animation-play-state:paused]"
              style={{ animation: "marqueeScroll 40s linear infinite", width: "max-content" }}>
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="relative w-[320px] flex-shrink-0 flex flex-col rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
                  style={{ background: "#F8FAFC", minHeight: "200px" }}>
                  <span
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}
                  >
                    <GoogleGIcon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex gap-0.5 mb-3 pr-7">
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

      <section className="py-6 relative overflow-hidden hidden md:block" style={{
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

      <AnimatePresence>
        {showActionBar && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden fixed left-4 right-4 z-50"
            style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div
              className="flex items-center gap-2 p-2 rounded-full"
              style={{ background: "#0A2558", boxShadow: "0 14px 34px rgba(0,0,0,0.35)" }}
            >
              <a
                href="tel:+919203634407"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm bg-white"
                style={{ color: "#0A2558" }}
              >
                <Phone className="h-4 w-4" style={{ color: "#14B8A6" }} /> Call Clinic
              </a>
              <Link
                to="/appointment"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm text-white"
                style={{ background: "#14B8A6" }}
              >
                <CalendarDays className="h-4 w-4" /> Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .gallery-swiper {
          overflow: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .gallery-swiper::-webkit-scrollbar { display: none; }
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