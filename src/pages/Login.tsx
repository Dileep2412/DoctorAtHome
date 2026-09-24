import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Clock, BadgeCheck, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "../assets/doctor-home-logo.png";
import heroPhoto from "@/assets/gallery3.png";

const SUPABASE_FUNCTIONS_URL = "https://aukzwkiowsfkvhehyfpu.supabase.co/functions/v1";
const SESSION_KEY = "dah_patient_session_token";
const RESEND_SECONDS = 30;

// TODO: flip this to true once WhatsApp OTP delivery is wired up and tested.
// While false, the mobile+OTP form is skipped entirely and only Google Sign-In is shown.
const OTP_LOGIN_ENABLED = false;

const FONT_ID = "dah-auth-font";
const HEADING = "'Poppins', system-ui, sans-serif";
const BODY = "'Inter', system-ui, sans-serif";

type OtpPhase = "enter_mobile" | "enter_otp";

const Spinner = ({ dark = false }: { dark?: boolean }) => (
  <span
    className={`inline-block h-4 w-4 rounded-full border-2 animate-spin ${
      dark ? "border-slate-300 border-t-slate-600" : "border-white/40 border-t-white"
    }`}
    aria-hidden
  />
);

const GoogleIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l0.003-0.002l6.19,5.238 C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<OtpPhase>("enter_mobile");
  const [mobile, setMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Fonts (shared id so they load once)
  useEffect(() => {
    if (document.getElementById(FONT_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  // Already signed in → go straight to appointments
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session || localStorage.getItem(SESSION_KEY)) {
        navigate("/my-appointments");
      }
    };
    checkSession();
  }, [navigate]);

  // Resend countdown (OTP flow — inactive while OTP_LOGIN_ENABLED is false)
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/my-appointments` },
      });
      if (error) throw error;
      // On success the browser redirects to Google, so we stay in the loading state here.
    } catch (err: any) {
      setGoogleError(err.message || "Could not start Google sign-in. Please try again.");
      setGoogleLoading(false);
    }
  };

  // ── OTP flow — kept intact for when WhatsApp OTP delivery is ready. Not rendered while OTP_LOGIN_ENABLED is false. ──
  const requestOtp = async (digits: string) => {
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: digits }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send OTP");
  };

  const handleSendOtp = async () => {
    setOtpError(null);
    const digits = mobile.replace(/\D/g, "");
    if (digits.length !== 10) {
      setOtpError("Enter a valid 10-digit mobile number");
      return;
    }
    setOtpLoading(true);
    try {
      await requestOtp(digits);
      setPhase("enter_otp");
      setResendIn(RESEND_SECONDS);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err: any) {
      setOtpError(err.message || "Something went wrong. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || otpLoading) return;
    setOtpError(null);
    setOtpLoading(true);
    try {
      await requestOtp(mobile.replace(/\D/g, ""));
      setOtpDigits(["", "", "", "", "", ""]);
      setResendIn(RESEND_SECONDS);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err: any) {
      setOtpError(err.message || "Could not resend the code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyOtp();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code");
      return;
    }
    setOtpLoading(true);
    try {
      const digits = mobile.replace(/\D/g, "");
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: digits, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      localStorage.setItem(SESSION_KEY, data.token);
      navigate("/my-appointments");
    } catch (err: any) {
      setOtpError(err.message || "Something went wrong. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const changeNumber = () => {
    setPhase("enter_mobile");
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    setResendIn(0);
  };
  // ── End OTP flow ──

  const primaryBtn =
    "w-full h-12 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14B8A6]/30";
  const primaryStyle = {
    background: "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
    boxShadow: "0 10px 24px rgba(14,165,233,0.30)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12"
      style={{
        fontFamily: BODY,
        background:
          "radial-gradient(1100px 560px at 8% -8%, rgba(20,184,166,0.16), transparent 60%), radial-gradient(900px 520px at 100% 108%, rgba(14,165,233,0.14), transparent 60%), #F3F7FB",
      }}
    >
      <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] rounded-[28px] overflow-hidden bg-white shadow-[0_30px_80px_rgba(10,37,88,0.18)]">

        {/* ── Brand / photo panel ── */}
        <div className="relative min-h-[210px] lg:min-h-[680px] flex flex-col justify-between p-5 lg:p-9 text-white">
          <img
            src={heroPhoto}
            alt="Doctor examining a patient at home"
            className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
            style={{ filter: "contrast(1.06) saturate(1.08) brightness(1.02)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,37,88,0.45) 0%, rgba(10,37,88,0.10) 38%, rgba(7,27,69,0.94) 100%)",
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/95 pl-2 pr-4 py-1.5 shadow-lg">
              <img src={logo} alt="" className="h-9 w-9 object-contain" />
              <span className="font-extrabold text-[#0A2558] text-[15px] tracking-tight" style={{ fontFamily: HEADING }}>
                DoctorAtHome
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <h1
              className="text-2xl lg:text-[2.1rem] font-extrabold leading-[1.15] tracking-tight"
              style={{ fontFamily: HEADING }}
            >
              Healthcare that<br />comes home.
            </h1>
            <p className="hidden lg:block mt-4 text-[15px] leading-relaxed text-white/75 max-w-[360px]">
              Sign in to book a home visit, order a lab test, or check on an appointment that's already on the way.
            </p>
            <ul className="hidden lg:flex flex-wrap gap-2 mt-7">
              {[
                { icon: Star, label: "4.9 Google rating", fill: true },
                { icon: Clock, label: "24×7 emergency support" },
                { icon: BadgeCheck, label: "Certified doctors" },
              ].map((c) => (
                <li
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-white/12 border border-white/20 backdrop-blur-sm"
                >
                  <c.icon className={`h-3.5 w-3.5 ${c.fill ? "text-yellow-400 fill-yellow-400" : "text-[#5eead4]"}`} />
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Form panel ── */}
        <div className="flex flex-col p-6 sm:p-10 lg:p-12">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0A2558] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/60"
          >
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>

          <div className="flex-1 flex items-center">
            <div className="w-full max-w-[380px] mx-auto py-8">
              <h2
                className="text-[1.7rem] font-extrabold text-[#0A2558] tracking-tight"
                style={{ fontFamily: HEADING }}
              >
                {!OTP_LOGIN_ENABLED
                  ? "Welcome back"
                  : phase === "enter_mobile" ? "Welcome back" : "Enter your code"}
              </h2>
              <p className="mt-2 text-[14.5px] text-slate-500 leading-relaxed">
                {!OTP_LOGIN_ENABLED ? (
                  "Sign in to book a home visit, order a lab test, or check your appointments."
                ) : phase === "enter_mobile" ? (
                  "Sign in with your mobile number. We'll text you a one-time code."
                ) : (
                  <>
                    We sent a 6-digit code to <span className="font-semibold text-slate-700">+91 {mobile}</span>.{" "}
                    <button
                      type="button"
                      onClick={changeNumber}
                      className="font-semibold text-[#0d9488] hover:underline underline-offset-2"
                    >
                      Change
                    </button>
                  </>
                )}
              </p>

              {/* ── Google Sign-In ── */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full h-12 rounded-xl text-[15px] font-bold text-slate-700 inline-flex items-center justify-center gap-3 border border-slate-200 bg-white transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14B8A6]/25"
                >
                  {googleLoading ? <Spinner dark /> : <GoogleIcon />}
                  {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
                </button>

                {googleError && (
                  <p role="alert" className="mt-3 flex items-start gap-2 text-[13px] text-red-600">
                    <AlertCircle className="h-4 w-4 mt-px flex-shrink-0" /> {googleError}
                  </p>
                )}
              </div>

              {/* ── OTP flow (mobile number + WhatsApp code) — temporarily hidden.
                     Flip OTP_LOGIN_ENABLED to true above once WhatsApp OTP delivery is ready. ── */}
              {OTP_LOGIN_ENABLED && (
                <>
                  <div className="flex items-center gap-3 my-6">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-400">OR</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  {phase === "enter_mobile" ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}
                      noValidate
                    >
                      <label htmlFor="mobile" className="block text-[13px] font-semibold text-slate-700 mb-2">
                        Mobile number
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-[#14B8A6] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14B8A6]/15">
                        <span className="h-[52px] px-4 flex items-center text-[15px] font-semibold text-slate-500 border-r border-slate-200">
                          +91
                        </span>
                        <input
                          id="mobile"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          maxLength={10}
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                          placeholder="98XXXXXXXX"
                          className="flex-1 min-w-0 h-[52px] px-4 bg-transparent text-[16px] font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none"
                        />
                      </div>

                      {otpError && (
                        <p role="alert" className="mt-3 flex items-start gap-2 text-[13px] text-red-600">
                          <AlertCircle className="h-4 w-4 mt-px flex-shrink-0" /> {otpError}
                        </p>
                      )}

                      <button type="submit" disabled={otpLoading} className={`${primaryBtn} mt-6`} style={primaryStyle}>
                        {otpLoading ? <><Spinner /> Sending code…</> : <>Send code <ArrowRight className="h-4 w-4" /></>}
                      </button>
                    </form>
                  ) : (
                    <div>
                      <div className="flex gap-2" role="group" aria-label="6-digit verification code">
                        {otpDigits.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => (otpRefs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            autoComplete={i === 0 ? "one-time-code" : "off"}
                            maxLength={1}
                            value={digit}
                            aria-label={`Digit ${i + 1}`}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            onPaste={handleOtpPaste}
                            className={`flex-1 min-w-0 h-14 text-center text-xl font-bold text-[#0A2558] rounded-xl border bg-slate-50 outline-none transition focus:bg-white focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/15 ${
                              digit ? "border-[#14B8A6]" : "border-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      {otpError && (
                        <p role="alert" className="mt-3 flex items-start gap-2 text-[13px] text-red-600">
                          <AlertCircle className="h-4 w-4 mt-px flex-shrink-0" /> {otpError}
                        </p>
                      )}

                      <button type="button" onClick={handleVerifyOtp} disabled={otpLoading} className={`${primaryBtn} mt-6`} style={primaryStyle}>
                        {otpLoading ? <><Spinner /> Verifying…</> : <>Verify and continue <ArrowRight className="h-4 w-4" /></>}
                      </button>

                      <p className="mt-5 text-center text-[13.5px] text-slate-500">
                        Didn't get the code?{" "}
                        {resendIn > 0 ? (
                          <span className="font-semibold text-slate-400">Resend in {resendIn}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResend}
                            disabled={otpLoading}
                            className="font-semibold text-[#0d9488] hover:underline underline-offset-2 disabled:opacity-60"
                          >
                            Resend code
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}

              <p className="mt-10 text-center text-xs text-slate-400 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link to="/terms-of-service" className="font-semibold text-slate-500 hover:text-[#0A2558] hover:underline underline-offset-2">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="font-semibold text-slate-500 hover:text-[#0A2558] hover:underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}