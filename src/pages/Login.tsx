import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "../assets/doctor-home-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const redirect = localStorage.getItem("redirect_after_login");
        if (redirect) { navigate(redirect); setTimeout(() => localStorage.removeItem("redirect_after_login"), 1000); }
        else navigate("/my-appointments");
      }
    };
    checkSession();
  }, [navigate]);

  const login = async () => {
    if (!email || !password) { alert("Please enter email and password"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { alert(error.message); return; }
    const redirect = localStorage.getItem("redirect_after_login");
    if (redirect) { localStorage.removeItem("redirect_after_login"); navigate(redirect); }
    else navigate("/my-appointments");
  };

  const signup = async () => {
    if (!email || !password) { alert("Please enter email and password"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { alert(error.message); return; }
    alert("Account created successfully!");
    const redirect = localStorage.getItem("redirect_after_login");
    if (redirect) { localStorage.removeItem("redirect_after_login"); navigate(redirect); }
    else navigate("/my-appointments");
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl">

        {/* ── Left Panel — Fluid Blob ── */}
        <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden" style={{background: "linear-gradient(135deg, #0A2558 0%, #1a3a7a 25%, #0e5c8a 50%, #0d8a7a 75%, #14B8A6 100%)"}}>

          {/* Animated blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-3xl animate-pulse" style={{background: "radial-gradient(circle, #14B8A6, transparent)", top: "-100px", left: "-100px", animationDuration: "4s"}} />
            <div className="absolute w-[350px] h-[350px] rounded-full opacity-20 blur-3xl" style={{background: "radial-gradient(circle, #38bdf8, transparent)", bottom: "-80px", right: "-80px", animation: "pulse 6s ease-in-out infinite"}} />
            <div className="absolute w-[250px] h-[250px] rounded-full opacity-15 blur-2xl" style={{background: "radial-gradient(circle, #5eead4, transparent)", top: "40%", right: "10%", animation: "pulse 5s ease-in-out infinite 1s"}} />
            <div className="absolute w-[200px] h-[200px] rounded-full opacity-20 blur-2xl" style={{background: "radial-gradient(circle, #0ea5e9, transparent)", bottom: "30%", left: "5%", animation: "pulse 7s ease-in-out infinite 2s"}} />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold mb-10 text-white/90">
              <span className="h-2 w-2 rounded-full bg-[#14B8A6] animate-pulse" />
              DoctorAtHome • Bhopal
            </div>

            <h1 className="text-4xl font-extrabold leading-tight mb-5 text-white">
              Healthcare at<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5eead4] to-[#38bdf8]">Your Doorstep</span>
            </h1>

            <p className="text-white/65 text-base leading-7 max-w-sm">
              Book trusted doctors, nursing care, lab tests, and home healthcare services with ease.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {["Certified doctors at home", "24/7 emergency support", "Easy online booking"].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-5 h-5 rounded-full bg-[#14B8A6]/30 border border-[#14B8A6]/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="relative z-10 grid grid-cols-3 gap-3">
            {[{ num: "24/7", label: "Support" }, { num: "100%", label: "Secure" }, { num: "Fast", label: "Booking" }].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
                <p className="text-2xl font-bold text-white">{s.num}</p>
                <p className="text-xs text-white/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="p-8 sm:p-12 flex items-center justify-center bg-white">
          <div className="w-full max-w-md">

            <div className="text-center mb-8">
              <div className="flex justify-center mb-5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-sm">
                  <img src={logo} alt="DoctorAtHome" className="h-16 w-16 object-contain" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-[#0A2558]">Welcome Back</h1>
              <p className="text-slate-400 text-sm mt-1">Sign in to access your account</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-[#14B8A6] focus-visible:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-[#14B8A6] focus-visible:bg-white transition-colors"
                />
              </div>

              <button
                onClick={login}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0A2558] to-[#14B8A6] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <button
                onClick={signup}
                disabled={loading}
                className="w-full h-12 rounded-xl border-2 border-slate-200 text-[#0A2558] font-bold text-sm hover:border-[#0A2558] hover:bg-[#0A2558] hover:text-white transition-all duration-200 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Sign Up"}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">OR</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                onClick={signInWithGoogle}
                className="w-full h-12 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold text-sm shadow-sm flex items-center justify-center gap-3 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.35 1.53 7.81 2.82l5.76-5.76C34.14 3.44 29.46 1.5 24 1.5 14.73 1.5 6.79 6.98 3.29 14.44l6.88 5.34C12.06 13.39 17.57 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.5 24.5c0-1.63-.15-3.2-.43-4.72H24v9h12.63c-.54 2.9-2.18 5.36-4.66 7.02l7.19 5.59C43.74 37.26 46.5 31.37 46.5 24.5z" />
                  <path fill="#FBBC05" d="M10.17 28.28a14.5 14.5 0 010-8.56l-6.88-5.34A23.94 23.94 0 000 24c0 3.85.92 7.5 2.55 10.62l7.62-6.34z" />
                  <path fill="#34A853" d="M24 46.5c6.48 0 11.92-2.14 15.89-5.82l-7.19-5.59c-2 1.35-4.56 2.16-8.7 2.16-6.43 0-11.94-3.89-13.83-9.28l-7.62 6.34C6.79 41.02 14.73 46.5 24 46.5z" />
                </svg>
                Continue with Google
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}