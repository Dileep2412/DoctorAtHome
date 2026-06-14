import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logo from "../assets/doctor-home-logo.png";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
  { to: "/appointment", label: "Book Appointment" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = user
    ? [...baseLinks, { to: "/my-appointments", label: "My Appointments" }]
    : baseLinks;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(10,37,88,0.10)]"
          : "bg-white/90 backdrop-blur-lg shadow-sm"
      } border-b border-slate-100`}
    >
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between h-[70px] px-4 xl:px-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src={logo} alt="DoctorAtHome" className="h-12 w-auto" />
          {/* Brand name — always visible */}
          <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-[#0A2558] via-[#1a56b0] to-[#14B8A6] bg-clip-text text-transparent">
            DoctorAtHome
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-full px-1.5 py-1 flex-shrink-0">
          {!loading && navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-[#0A2558] to-[#14B8A6] text-white shadow-md shadow-cyan-200/40"
                    : "text-slate-600 hover:text-[#0A2558] hover:bg-white hover:shadow-sm"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right Actions Desktop ── */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
          <a
            href="tel:+919203634407"
            className="group flex items-center gap-1.5 text-[13px] font-bold text-white bg-gradient-to-r from-red-600 to-red-500 px-3.5 py-2 rounded-full shadow-md shadow-red-200 transition-all duration-200 hover:from-red-700 hover:to-red-600 hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Phone className="h-3.5 w-3.5 animate-pulse" />
            Emergency
          </a>

          {!loading && (
            user ? (
              <button
                onClick={logout}
                className="text-[13px] font-semibold text-[#0A2558] border-2 border-[#0A2558]/20 px-4 py-1.5 rounded-full transition-all duration-200 hover:border-[#0A2558] hover:bg-[#0A2558] hover:text-white hover:shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login">
                <button className="text-[13px] font-semibold text-[#0A2558] border-2 border-[#0A2558]/20 px-4 py-1.5 rounded-full transition-all duration-200 hover:border-[#0A2558] hover:bg-[#0A2558] hover:text-white hover:shadow-md hover:scale-105 active:scale-95 whitespace-nowrap">
                  Sign In
                </button>
              </Link>
            )
          )}

          <Link to="/admin">
            <button className="text-[13px] font-bold text-white bg-gradient-to-r from-[#0A2558] to-[#14B8A6] px-4 py-2 rounded-full shadow-md shadow-blue-200 transition-all duration-200 hover:from-[#0c2d6e] hover:to-[#0ea5a0] hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap">
              Admin
            </button>
          </Link>
        </div>

        {/* ── Mobile Right ── */}
        <div className="lg:hidden flex items-center gap-2">
          <a
            href="tel:+919203634407"
            className="flex items-center justify-center w-9 h-9 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full shadow-md shadow-red-200 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Phone className="h-4 w-4" />
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-5 w-5 text-slate-700" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="h-5 w-5 text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-slate-100 bg-white"
          >
            <nav className="flex flex-col p-4 gap-1">
              {!loading && navLinks.map((link, i) => {
                const isActive = location.pathname === link.to;
                return (
                  <motion.div key={link.to} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <Link
                      to={link.to}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#0A2558] to-[#14B8A6] text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#0A2558]"
                      }`}
                    >
                      {link.label}
                      {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="my-2 border-t border-slate-100" />

              <a
                href="tel:+919203634407"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 shadow-md shadow-red-100 transition-all duration-200 active:scale-98"
              >
                <Phone className="h-4 w-4" />
                Call Emergency
              </a>

              {!loading && (
                user ? (
                  <button onClick={logout} className="py-3 rounded-xl text-sm font-semibold text-[#0A2558] border-2 border-[#0A2558]/20 transition-all duration-200 hover:bg-[#0A2558] hover:text-white">
                    Sign Out
                  </button>
                ) : (
                  <Link to="/login">
                    <button className="w-full py-3 rounded-xl text-sm font-semibold text-[#0A2558] border-2 border-[#0A2558]/20 transition-all duration-200 hover:bg-[#0A2558] hover:text-white">
                      Sign In
                    </button>
                  </Link>
                )
              )}

              <Link to="/admin">
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0A2558] to-[#14B8A6] shadow-md shadow-blue-100 transition-all duration-200 active:scale-98">
                  Admin Panel
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;