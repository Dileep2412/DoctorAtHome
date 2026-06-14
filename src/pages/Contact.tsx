import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Linkedin, Clock, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Contact = () => {
  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#0A2558] via-[#0e3272] to-[#14B8A6] py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.18),transparent_60%)]" />
        <div className="absolute top-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-white/5" />
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold mb-5 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
              DoctorAtHome Support
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Contact & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5eead4] to-[#38bdf8]">Support</span>
            </h1>
            <p className="text-white/65 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              We're available 24/7 to assist you with appointments, home visits, healthcare services, and general inquiries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-14 md:py-20 bg-[#f8fafc]">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="grid lg:grid-cols-5 gap-8 items-start">

            {/* ── Left — Contact Info ── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="mb-6">
                <p className="text-[#14B8A6] font-bold uppercase tracking-widest text-xs mb-2">Get In Touch</p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A2558]">We're Here to Help</h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Contact our healthcare team for appointments, home visits, medical assistance, and general inquiries.
                </p>
              </div>

              {/* Phone */}
              <motion.a href="tel:+919203634407" custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-[#14B8A6]/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A2558] to-[#14B8A6] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Phone</p>
                  <p className="text-[#0A2558] font-bold text-base">+91 9203634407</p>
                </div>
              </motion.a>

              {/* WhatsApp */}
              <motion.a href="https://wa.me/919203634407" target="_blank" rel="noopener noreferrer" custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">WhatsApp</p>
                  <p className="text-[#0A2558] font-bold text-base">Chat with us</p>
                </div>
              </motion.a>

              {/* Email */}
              <motion.a href="mailto:doctorathome@gmail.com" custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-[#14B8A6]/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0ea5a0] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Email</p>
                  <p className="text-[#0A2558] font-bold text-base">doctorathome@gmail.com</p>
                </div>
              </motion.a>

              {/* Address */}
              <motion.a href="https://maps.app.goo.gl/wjN7cM2s2jqfngTx9" target="_blank" rel="noopener noreferrer" custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ x: 4 }}
                className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-[#14B8A6]/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Address</p>
                  <p className="text-[#0A2558] font-bold text-sm leading-snug">Shop No. 1, Chandan Nagar,<br />Bhopal, Madhya Pradesh</p>
                </div>
              </motion.a>

              {/* Google Maps Button */}
              <motion.a href="https://maps.app.goo.gl/wjN7cM2s2jqfngTx9" target="_blank" rel="noopener noreferrer" custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#0A2558] to-[#14B8A6] text-white font-bold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <MapPin className="h-4 w-4" />
                Open In Google Maps
              </motion.a>

              {/* Social */}
              <motion.div custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center gap-3 pt-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mr-1">Follow us</p>
                {[
                  { icon: Facebook, href: "https://www.facebook.com/people/Doctor-At-Home-Bhopal/61589456907901/", color: "hover:bg-blue-600" },
                  { icon: Instagram, href: "https://www.instagram.com/doctor_at_home_bhopal/", color: "hover:bg-pink-600" },
                  { icon: Linkedin, href: "https://www.linkedin.com/company/doctorathome-bhopal?trk=feed-detail_main-feed-card_feed-actor-name", color: "hover:bg-blue-500" },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-full bg-slate-100 ${s.color} hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110`}
                  >
                    <s.icon className="h-4 w-4 text-slate-600" />
                  </a>
                ))}
              </motion.div>
            </div>

            {/* ── Right — Map ── */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-3">
              <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3664.555422618888!2d77.42349709999999!3d23.2955985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c69347fe59ebd%3A0x3d5533f81e6a9987!2sDoctor_at_Home%20_Bhopal!5e0!3m2!1sen!2sin!4v1773353258744!5m2!1sen!2sin"
                  width="100%" height="480"
                  style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Doctor at Home Bhopal Location"
                />
              </div>

              {/* ── 3 Premium Cards ── */}
              <div className="grid grid-cols-3 gap-4 mt-5">
                {[
                  {
                    icon: Clock,
                    emoji: "🕐",
                    label: "Mon – Sun",
                    sub: "24/7 Available",
                    gradient: "from-[#0A2558] to-[#1a56b0]",
                    delay: 0,
                  },
                  {
                    icon: MapPin,
                    emoji: "📍",
                    label: "Bhopal | Indore",
                    sub: "Madhya Pradesh",
                    gradient: "from-[#14B8A6] to-[#0ea5a0]",
                    delay: 0.15,
                  },
                  {
                    icon: Zap,
                    emoji: "⚡",
                    label: "Quick Response",
                    sub: "Within 2 hours",
                    gradient: "from-orange-500 to-amber-500",
                    delay: 0.3,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: item.delay, duration: 0.5 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative group"
                  >
                    {/* Top gradient line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} rounded-t-2xl`} />

                    {/* Animated icon */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-3 shadow-md mt-2`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>

                    <p className="text-[#0A2558] font-extrabold text-sm">{item.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Contact;