import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, HeartHandshake, Clock, ShieldCheck,
  Stethoscope, UserRound, Syringe, Activity, Microscope, Pill,
  Dumbbell, HeartPulse, ChevronDown, Check
} from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "Doctor Consultation",
    desc: "Qualified doctors visit your home for consultations, diagnosis, and treatment.",
    gradient: "from-blue-400 via-blue-500 to-indigo-600",
    bg: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-500",
    subServices: [
      "Doctor Home Visit",
      "General Physician at Home",
      "Family Doctor Visit",
      "Elderly Care Doctor Visit",
      "Emergency Doctor Visit",
      "Follow-up Home Consultation",
      "Chronic Disease Management",
      "Palliative Care Consultation",
    ],
  },
  {
    icon: UserRound,
    title: "Nursing Services",
    desc: "Trained nurses provide professional care including wound dressing and post-surgery support.",
    gradient: "from-violet-400 via-purple-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    iconBg: "bg-purple-500",
    subServices: [
      "Home Nursing Care",
      "ICU Nursing at Home",
      "Trained Attendant Services",
      "Caregiver Services",
      "Bedridden Patient Care",
      "Post-Surgery Nursing Care",
      "Elderly Nursing Care",
      "Injection Administration",
    ],
  },
  {
    icon: Activity,
    title: "Diagnostic & Procedures",
    desc: "Convenient diagnostic services including ECG, blood tests and vitals at your home.",
    gradient: "from-[#0A2558] via-[#1a56b0] to-[#14B8A6]",
    bg: "from-slate-50 to-blue-50",
    iconBg: "bg-[#0A2558]",
    subServices: [
      "Blood Sample Collection at Home",
      "ECG at Home",
      "Vital Monitoring",
      "Blood Pressure Monitoring",
      "Blood Sugar Monitoring",
      "Catheterization Services",
      "Ryle's Tube Insertion",
      "IV Cannulation",
      "IV Fluid Administration",
      "Nebulization at Home",
    ],
  },
  {
    icon: HeartHandshake,
    title: "Wound & Dressing Care",
    desc: "Professional wound care and dressing services by trained medical staff.",
    gradient: "from-pink-400 via-rose-500 to-red-500",
    bg: "from-pink-50 to-rose-50",
    iconBg: "bg-pink-500",
    subServices: [
      "Wound Dressing",
      "Bed Sore Dressing",
      "Diabetic Foot Dressing",
      "Surgical Dressing",
      "Suture Removal",
      "Pressure Ulcer Management",
    ],
  },
  {
    icon: UserRound,
    title: "Elderly Care",
    desc: "Dedicated care for senior citizens including health monitoring and mobility assistance.",
    gradient: "from-violet-400 via-purple-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    iconBg: "bg-purple-500",
    subServices: [
      "Geriatric Care",
      "Dementia Patient Care",
      "Parkinson's Patient Care",
      "Mobility Assistance",
      "Fall Risk Assessment",
    ],
  },
  {
    icon: HeartPulse,
    title: "Respiratory Care",
    desc: "Specialized respiratory services including oxygen support and COPD management at home.",
    gradient: "from-red-400 via-orange-500 to-amber-500",
    bg: "from-red-50 to-orange-50",
    iconBg: "bg-red-500",
    subServices: [
      "Oxygen Support at Home",
      "COPD Management",
      "Nebulization Therapy",
      "Pulse Oximetry Monitoring",
      "Respiratory Assessment",
    ],
  },
  {
    icon: Syringe,
    title: "Mother & Child Care",
    desc: "Comprehensive care for mothers and newborns including postnatal and lactation support.",
    gradient: "from-pink-400 via-rose-500 to-red-500",
    bg: "from-pink-50 to-rose-50",
    iconBg: "bg-pink-500",
    subServices: [
      "Pregnancy Consultation at Home",
      "Postnatal Care",
      "Newborn Care Guidance",
      "Lactation Support",
    ],
  },
  {
    icon: Dumbbell,
    title: "Physiotherapy",
    desc: "Expert physiotherapists provide rehabilitation sessions for recovery and pain relief.",
    gradient: "from-orange-400 via-amber-500 to-yellow-500",
    bg: "from-orange-50 to-yellow-50",
    iconBg: "bg-orange-500",
    subServices: [
      "Physiotherapy at Home",
      "Post-Stroke Rehabilitation",
      "Orthopedic Physiotherapy",
      "Knee Replacement Rehabilitation",
      "Back Pain Physiotherapy",
    ],
  },
  {
    icon: Pill,
    title: "Medical Equipment",
    desc: "Rental and support for medical equipment including oxygen concentrators and hospital beds.",
    gradient: "from-emerald-400 via-green-500 to-teal-600",
    bg: "from-emerald-50 to-green-50",
    iconBg: "bg-emerald-500",
    subServices: [
      "Oxygen Concentrator Rental",
      "Hospital Bed Rental",
      "Wheelchair Rental",
      "BiPAP/CPAP Support",
      "Suction Machine Support",
    ],
  },
  {
    icon: Microscope,
    title: "Specialized Care",
    desc: "Expert management of chronic and complex conditions including diabetes, heart disease and more.",
    gradient: "from-[#14B8A6] via-teal-500 to-cyan-500",
    bg: "from-teal-50 to-cyan-50",
    iconBg: "bg-[#14B8A6]",
    subServices: [
      "Diabetes Management",
      "Hypertension Management",
      "Thyroid Disorder Follow-up",
      "Heart Disease Follow-up",
      "Cancer Patient Support Care",
      "Stroke Patient Care",
    ],
  },
];

const whyUs = [
  "Certified & experienced medical professionals",
  "No advance payment — pay after service",
  "Available 7 days a week",
  "Transparent pricing, no hidden charges",
  "Quick response within 2 hours",
  "Personalized care plans for every patient",
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Services = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <Layout>

      {/* ── Services Grid ── */}
      <section className="py-24 md:py-28">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">Everything You Need</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-5 leading-tight">
              Healthcare at Your<br className="hidden md:block" /> Doorstep
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              From routine checkups to specialized care — all at your home.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={cardVariants}
                className={`group relative bg-gradient-to-br ${s.bg} rounded-3xl border-2 ${openIndex === i ? "border-[#14B8A6]" : "border-white hover:border-[#0EA5E9]/40"} shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer`}
              >
                {/* Top gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradient} rounded-t-3xl`} />

                {/* Decorative circle */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-10`} />

                {/* Card content — clickable */}
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left p-6 flex flex-col flex-1 focus:outline-none"
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Title + chevron */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-extrabold text-[#0A2558] text-lg leading-snug group-hover:text-[#14B8A6] transition-colors duration-300">
                      {s.title}
                    </h3>
                    <motion.div
                      animate={{ rotate: openIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0 mt-0.5"
                    >
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    </motion.div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>

                  {/* Sub count + explore hint */}
                  <div className="flex items-center justify-between mt-4 gap-2">
                    <p className="text-xs text-slate-400 font-medium">
                      {s.subServices.length} services
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${s.gradient} shadow-sm`}>
                      {openIndex === i ? "Close ↑" : "Explore ↓"}
                    </span>
                  </div>
                </button>

                {/* Expandable sub-services */}
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      key="sub"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-white/60 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                          Included Services
                        </p>
                        <ul className="flex flex-col gap-2">
                          {s.subServices.map((sub) => (
                            <li key={sub} className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded-full ${s.iconBg} flex items-center justify-center shrink-0`}>
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                              <span className="text-sm text-slate-600 font-medium">{sub}</span>
                            </li>
                          ))}
                        </ul>
                        <Link to="/appointment">
                          <button className={`mt-5 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${s.gradient} hover:opacity-90 transition-opacity`}>
                            Book This Service →
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <p className="text-[#14B8A6] font-bold uppercase tracking-[0.2em] text-sm mb-3">Why Us</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A2558] mb-4">Why Choose DoctorAtHome?</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">We go beyond just healthcare — comfort, trust, and expertise at your home.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-[#14B8A6]/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A2558] to-[#14B8A6] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-[#0A2558] via-[#0e3272] to-[#14B8A6] rounded-3xl p-8 md:p-10 text-center overflow-hidden"
          >
            <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-white/5" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.2),transparent_70%)]" />

            <div className="relative z-10">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
                Available 24/7
              </motion.span>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
                Ready to Book a Home Visit?
              </h2>
              <p className="text-white/70 mb-6 max-w-lg mx-auto text-sm md:text-base">
                Schedule an appointment with one of our specialists today and experience healthcare at your comfort.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/appointment">
                  <button className="inline-flex items-center gap-3 bg-white text-[#0A2558] font-extrabold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-200 text-lg">
                    Book Appointment <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </Layout>
  );
};

export default Services;