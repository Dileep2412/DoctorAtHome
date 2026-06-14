import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Stethoscope, CheckCircle2 } from "lucide-react";

const Doctors = () => {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("doctors").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#0A2558] via-[#0e3272] to-[#14B8A6] py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(10,37,88,0.3),transparent_60%)]" />

        {/* Decorative dots pattern */}
        <div className="absolute right-10 top-4 opacity-10">
          <div className="grid grid-cols-5 gap-2">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
            ))}
          </div>
        </div>
        <div className="absolute left-10 bottom-4 opacity-10">
          <div className="grid grid-cols-5 gap-2">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
            ))}
          </div>
        </div>

        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">

            {/* Left — Text */}
            <div className="flex-1 text-left">
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold mb-5 uppercase tracking-[0.2em]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
                Patient-First Care
              </motion.span>

              <motion.h1
                className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Expert Care,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5eead4] to-[#38bdf8]">
                  Wherever
                </span>{" "}
                You Are
              </motion.h1>

              <motion.p
                className="text-white/65 max-w-md text-sm md:text-base leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Our team of certified doctors is dedicated to making quality healthcare accessible, convenient, and trustworthy.
              </motion.p>
            </div>

            {/* Right — Modern Floating Medical Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden md:flex relative w-72 h-48 flex-shrink-0"
            >
              {/* Big center card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute top-0 left-8 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-[#14B8A6] flex items-center justify-center text-xl shadow-md flex-shrink-0">
                  🩺
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Certified Doctors</p>
                  <p className="text-white/60 text-xs">Board approved</p>
                </div>
              </motion.div>

              {/* Middle card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
                className="absolute top-16 right-0 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0A2558] flex items-center justify-center text-xl shadow-md flex-shrink-0">
                  🏠
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Home Visits</p>
                  <p className="text-white/60 text-xs">At your doorstep</p>
                </div>
              </motion.div>

              {/* Bottom card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 left-4 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-xl shadow-md flex-shrink-0">
                  ❤️
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Trusted Care</p>
                  <p className="text-white/60 text-xs">100% safe</p>
                </div>
              </motion.div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Doctors Grid ── */}
      <section className="py-14 md:py-20 bg-[#f8fafc]">
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                  <Skeleton className="w-full h-72" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors?.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-[#14B8A6]/20 transition-all duration-300"
                >

                  {/* ── Image ── */}
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl m-3">
                    <img
                      src={doc.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop"}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                    />
                    {/* Specialization Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#14B8A6] text-white text-xs font-bold rounded-full shadow-lg">
                        <Stethoscope className="h-3 w-3" />
                        {doc.specialization}
                      </span>
                    </div>
                    {/* Experience Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0A2558] text-xs font-bold rounded-full shadow-md">
                        <Award className="h-3 w-3 text-[#14B8A6]" />
                        {doc.experience} yrs
                      </span>
                    </div>
                  </div>

                  {/* ── Content ── */}
                  <div className="px-5 pb-5 pt-3">
                    {/* Name with verified tick */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#0A2558] to-[#14B8A6]">
                        {doc.name}
                      </h3>
                      <CheckCircle2 className="h-5 w-5 text-[#14B8A6] flex-shrink-0" />
                    </div>

                    {/* Bio */}
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                      {doc.bio}
                    </p>
                  </div>

                </motion.div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!doctors || doctors.length === 0) && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <p className="text-slate-500 text-lg font-medium">No doctors found.</p>
            </div>
          )}

        </div>
      </section>

    </Layout>
  );
};

export default Doctors;