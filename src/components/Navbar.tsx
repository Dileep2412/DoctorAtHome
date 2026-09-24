import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Phone, ChevronRight, ChevronDown, MessageCircle, CalendarDays,
  Stethoscope, UserRound, Dumbbell, Microscope, LogOut, ShieldCheck,
  ClipboardList, User, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import logo from "../assets/doctor-home-logo.png";

const SESSION_KEY = "dah_patient_session_token";
const PHONE_TEL = "tel:+919203634407";
const PHONE_DISPLAY = "+91 92036 34407";
const WHATSAPP_URL = "https://wa.me/919203634407";

type NavUser = { id?: string; email?: string; name?: string; otp?: boolean };

// Main links. `menu: true` renders the Services dropdown on desktop.
const mainLinks: { to: string; label: string; menu?: boolean }[] = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services", menu: true },
  { to: "/doctors", label: "Doctors" },
  { to: "/contact", label: "Contact" },
];

// TODO: if the Services page has section ids, point each `to` at them (e.g. "/services#elder-care").
const serviceMenu = [
  { to: "/services", label: "Doctor Home Visit", desc: "Consultation & treatment at home",  icon: Stethoscope, accent: "#2563eb", iconBg: "rgba(59,130,246,0.1)" },
  { to: "/services", label: "Elder Care",        desc: "Regular monitoring for seniors",    icon: UserRound,   accent: "#7c3aed", iconBg: "rgba(139,92,246,0.1)" },
  { to: "/services", label: "Physiotherapy",     desc: "Recovery and pain relief sessions", icon: Dumbbell,    accent: "#ea580c", iconBg: "rgba(249,115,22,0.1)" },
  { to: "/services", label: "Lab Tests at Home", desc: "Sample collection at your door",    icon: Microscope,  accent: "#0d9488", iconBg: "rgba(20,184,166,0.1)" },
];

// Admin is decided on the server (Supabase), never from the client.
// Assumes a `user_roles` table with (user_id, role). Fails closed: any error/missing table = not admin.
// TODO: adjust table/column names if your project identifies admins differently.
const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return !error && !!data;
  } catch {
    return false;
  }
};

const isActivePath = (pathname: string, to: string) =>
  to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const servicesRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const adminCache = useRef<{ id: string; value: boolean } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── auth: Supabase session (Google/email) OR OTP localStorage token ── */
  const applySession = useCallback(async (session: Session | null) => {
    const otpToken = localStorage.getItem(SESSION_KEY);

    if (session?.user) {
      const u = session.user;
      setUser({
        id: u.id,
        email: u.email ?? undefined,
        name: (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || undefined,
      });
      if (adminCache.current?.id === u.id) {
        setIsAdmin(adminCache.current.value);
      } else {
        const value = await checkIsAdmin(u.id);
        adminCache.current = { id: u.id, value };
        setIsAdmin(value);
      }
    } else if (otpToken) {
      setUser({ otp: true });
      setIsAdmin(false);
    } else {
      setUser(null);
      setIsAdmin(false);
      adminCache.current = null;
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // defer: don't await Supabase calls directly inside this callback
      setTimeout(() => applySession(session), 0);
    });
    return () => subscription.unsubscribe();
  }, [applySession]);

  // Re-check on every route change (covers the OTP login redirect) and close menus
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => applySession(session));
    setMobileOpen(false);
    setServicesOpen(false);
    setAccountOpen(false);
  }, [location.pathname, applySession]);

  /* ── Escape + click outside ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setServicesOpen(false);
        setAccountOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (servicesRef.current && !servicesRef.current.contains(t)) setServicesOpen(false);
      if (accountRef.current && !accountRef.current.contains(t)) setAccountOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(SESSION_KEY);
    adminCache.current = null;
    setUser(null);
    setIsAdmin(false);
    setAccountOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const initial = (user?.name || user?.email || "").charAt(0).toUpperCase();
  const accountLabel = user?.name || user?.email || "Patient account";

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_24px_rgba(10,37,88,0.10)]" : "shadow-none"
      }`}
    >
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between h-[76px] px-4 xl:px-6">

        {/* Logo */}
        <Link to="/" className={`flex items-center gap-2.5 flex-shrink-0 rounded-lg ${focusRing}`}>
          <img src={logo} alt="DoctorAtHome" className="h-12 md:h-14 w-auto" />
          <span className="font-extrabold text-lg md:text-xl tracking-tight bg-gradient-to-r from-[#0A2558] via-[#1a56b0] to-[#14B8A6] bg-clip-text text-transparent">
            DoctorAtHome
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
          {mainLinks.map((link) => {
            const active = isActivePath(location.pathname, link.to);
            const linkClass = `group relative px-3.5 py-2 text-sm font-semibold whitespace-nowrap rounded-md transition-colors ${
              active ? "text-[#0A2558]" : "text-slate-600 hover:text-[#0A2558]"
            } ${focusRing}`;
            const underline = (
              <span
                className={`absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-[#14B8A6] origin-left transition-transform duration-200 ${
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            );

            if (!link.menu) {
              return (
                <Link key={link.to} to={link.to} className={linkClass} aria-current={active ? "page" : undefined}>
                  {link.label}
                  {underline}
                </Link>
              );
            }

            return (
              <div
                key={link.to}
                ref={servicesRef}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
                onFocus={() => setServicesOpen(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false);
                }}
              >
                <Link
                  to={link.to}
                  className={`${linkClass} inline-flex items-center gap-1`}
                  aria-haspopup="true"
                  aria-expanded={servicesOpen}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
                  {underline}
                </Link>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full pt-2 w-[340px] z-50"
                    >
                      <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-[0_20px_50px_rgba(10,37,88,0.16)]">
                        {serviceMenu.map((s) => (
                          <Link
                            key={s.label}
                            to={s.to}
                            onClick={() => setServicesOpen(false)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors ${focusRing}`}
                          >
                            <span
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: s.iconBg }}
                            >
                              <s.icon className="h-5 w-5" style={{ color: s.accent }} />
                            </span>
                            <span className="leading-tight">
                              <span className="block text-sm font-bold text-[#0A2558]">{s.label}</span>
                              <span className="block text-xs text-slate-500 mt-0.5">{s.desc}</span>
                            </span>
                          </Link>
                        ))}
                        <Link
                          to="/services"
                          onClick={() => setServicesOpen(false)}
                          className={`mt-1 flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-sm font-bold text-[#0A2558] transition-colors ${focusRing}`}
                        >
                          View all services
                          <ArrowRight className="h-4 w-4 text-[#14B8A6]" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <a
            href={PHONE_TEL}
            aria-label={`Call emergency ${PHONE_DISPLAY}`}
            className={`inline-flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2.5 rounded-full whitespace-nowrap bg-gradient-to-r from-red-600 to-red-500 shadow-md shadow-red-200 transition-all duration-200 hover:from-red-700 hover:to-red-600 hover:scale-[1.03] active:scale-95 ${focusRing}`}
          >
            <Phone className="h-4 w-4" />
            Emergency
          </a>

          <Link
            to="/appointment"
            className={`inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 hover:scale-[1.03] active:scale-95 ${focusRing}`}
            style={{
              background: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
              boxShadow: "0 6px 20px rgba(14,165,233,0.35)",
            }}
          >
            <CalendarDays className="h-4 w-4" />
            Book Appointment
          </Link>

          {/* Account */}
          {!authReady ? (
            <span className="w-[76px] h-9" aria-hidden />
          ) : user ? (
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Account menu"
                className={`flex items-center gap-1 rounded-full pl-1 pr-2 py-1 hover:bg-slate-50 transition-colors ${focusRing}`}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #0A2558, #14B8A6)" }}
                >
                  {initial || <User className="h-4 w-4" />}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-100 p-2 shadow-[0_20px_50px_rgba(10,37,88,0.16)]"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-[#0A2558] truncate">{accountLabel}</p>
                    </div>
                    <Link
                      to="/my-appointments"
                      role="menuitem"
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0A2558] transition-colors ${focusRing}`}
                    >
                      <ClipboardList className="h-4 w-4 text-[#14B8A6]" />
                      My Appointments
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0A2558] transition-colors ${focusRing}`}
                      >
                        <ShieldCheck className="h-4 w-4 text-[#0A2558]" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      role="menuitem"
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors ${focusRing}`}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className={`text-sm font-semibold text-[#0A2558] px-3 py-2 rounded-full hover:bg-slate-50 transition-colors whitespace-nowrap ${focusRing}`}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile right */}
        <div className="lg:hidden flex items-center gap-2">
          <a
            href={PHONE_TEL}
            aria-label="Call emergency"
            className={`flex items-center justify-center w-9 h-9 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full shadow-md shadow-red-200 active:scale-95 transition-transform ${focusRing}`}
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className={`flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 transition-colors ${focusRing}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
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

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-slate-100 bg-white"
          >
            <nav className="flex flex-col p-4 gap-1 max-h-[calc(100vh-76px)] overflow-y-auto" aria-label="Mobile">
              {(user ? [...mainLinks, { to: "/my-appointments", label: "My Appointments" }] : mainLinks).map((link, i) => {
                const active = isActivePath(location.pathname, link.to);
                return (
                  <motion.div key={link.to} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <Link
                      to={link.to}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        active
                          ? "bg-gradient-to-r from-[#0A2558] to-[#14B8A6] text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#0A2558]"
                      }`}
                    >
                      {link.label}
                      {active && <ChevronRight className="h-4 w-4 opacity-70" />}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="my-2 border-t border-slate-100" />

              <Link
                to="/appointment"
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)", boxShadow: "0 6px 20px rgba(14,165,233,0.3)" }}
              >
                <CalendarDays className="h-4 w-4" />
                Book Appointment
              </Link>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <a
                  href={PHONE_TEL}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500"
                >
                  <Phone className="h-4 w-4" />
                  Emergency
                </a>
                <a
                  href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border"
                  style={{ color: "#0A2558", borderColor: "rgba(10,37,88,0.15)" }}
                >
                  <MessageCircle className="h-4 w-4" style={{ color: "#25D366" }} />
                  WhatsApp
                </a>
              </div>

              {authReady && (
                user ? (
                  <button
                    onClick={logout}
                    className="mt-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="mt-1 flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-[#0A2558] border-2 border-[#0A2558]/15 hover:bg-slate-50 transition-colors"
                  >
                    Sign In
                  </Link>
                )
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-[#0A2558] hover:bg-slate-50 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;