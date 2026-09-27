import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Clock,
  ArrowUpRight,
} from "lucide-react";

const Contact = () => {
  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#0A2558] via-[#0e3272] to-[#0A2558] overflow-hidden">
        {/* single teal glow — the one accent, not a scatter of blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.22),transparent_55%)]" />
        {/* subtle grain — gives the flat navy some material texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05] mix-blend-overlay pointer-events-none">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
            {/* Left — headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex gap-6"
            >
              <div className="hidden md:block w-px bg-gradient-to-b from-[#14B8A6] via-[#14B8A6]/40 to-transparent mt-2" />
              <div>
                <h1 className="font-serif text-4xl md:text-6xl text-white leading-[1.08] tracking-tight">
                  Care that comes
                  <br />
                  to your door.
                </h1>
                <p className="text-white/70 text-base md:text-lg mt-6 max-w-md leading-[1.7]">
                  Talk to our team about appointments, home visits or anything
                  else — we pick up around the clock.
                </p>

                <div className="flex flex-wrap gap-3 mt-8">
                  <a
                    href="tel:+919203634407"
                    className="inline-flex items-center gap-2 bg-[#14B8A6] text-[#0A2558] font-bold px-6 py-3.5 rounded-xl hover:bg-[#5eead4] transition-colors duration-200"
                  >
                    <Phone className="h-4 w-4" />
                    Call +91 92036 34407
                  </a>
                  <a
                    href="https://wa.me/919203634407"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/15 transition-colors duration-200"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message on WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right — availability panel: the one bold moment on the page */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              className="bg-white/[0.06] border border-white/15 rounded-2xl p-7 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-[#5eead4] text-sm font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5eead4] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5eead4]" />
                </span>
                Taking home-visit requests now
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-white/50 text-xs">Response time</p>
                  <p className="text-white text-xl font-bold mt-0.5">Within 30 minutes</p>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <p className="text-white/50 text-xs">Serving</p>
                  <p className="text-white text-xl font-bold mt-0.5">Bhopal &amp; Indore</p>
                </div>
                <div className="h-px bg-white/10" />
                <div>
                  <p className="text-white/50 text-xs">Hours</p>
                  <p className="text-white text-xl font-bold mt-0.5">Open 24/7</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Reach us + Map ── */}
      <section className="py-16 md:py-24 bg-[#F7F9FC]">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Left — directory list, not repeated identical cards */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl md:text-3xl text-[#0A2558]">Reach us directly</h2>
              <div className="mt-6 border-t border-slate-200">
                {[
                  { icon: Phone, label: "Phone", value: "+91 9203634407", href: "tel:+919203634407" },
                  { icon: MessageCircle, label: "WhatsApp", value: "Chat with our team", href: "https://wa.me/919203634407", external: true },
                  { icon: Mail, label: "Email", value: "doctorathome@gmail.com", href: "mailto:doctorathome@gmail.com" },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="flex items-center justify-between gap-4 py-5 border-b border-slate-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="h-5 w-5 text-[#14B8A6]" strokeWidth={2} />
                      <div>
                        <p className="text-slate-400 text-xs">{item.label}</p>
                        <p className="text-[#0A2558] font-bold text-base">{item.value}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[#14B8A6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-8">
                {[
                  { icon: Facebook, href: "https://www.facebook.com/people/Doctor-At-Home-Bhopal/61589456907901/" },
                  { icon: Instagram, href: "https://www.instagram.com/doctor_at_home_bhopal/" },
                  { icon: Linkedin, href: "https://www.linkedin.com/company/doctorathome-bhopal?trk=feed-detail_main-feed-card_feed-actor-name" },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors duration-200"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right — Map with a real info overlay, not separate stat cards */}
            <div className="lg:col-span-3">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3664.555422618888!2d77.42349709999999!3d23.2955985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c69347fe59ebd%3A0x3d5533f81e6a9987!2sDoctor_at_Home%20_Bhopal!5e0!3m2!1sen!2sin!4v1773353258744!5m2!1sen!2sin"
                  width="100%"
                  height="440"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Doctor at Home Bhopal Location"
                />
                <div className="absolute bottom-4 left-4 right-4 md:right-auto bg-white rounded-xl p-4 shadow-lg flex items-center gap-4 max-w-sm">
                  <div className="w-10 h-10 rounded-lg bg-[#0A2558] flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0A2558] font-bold text-sm leading-snug">
                      Shubh Business Zone, Ayodhya Bypass, Bhopal
                    </p>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/wjN7cM2s2jqfngTx9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#14B8A6] flex-shrink-0"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* quiet strip — plain text, no card chrome */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6 px-1">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4 text-[#14B8A6]" />
                  Open every day, 24 hours
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-[#14B8A6]" />
                  Serving Bhopal &amp; Indore
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;