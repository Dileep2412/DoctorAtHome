import type { CSSProperties } from "react";
import type jsPDF from "jspdf";

export interface Appointment {
  id: string;
  booking_code: string;
  patient_name: string;
  phone: string;
  address: string | null;
  service: string | null;
  date: string | null;
  google_maps_link: string | null;
  status: string;
  assigned_doctor: string;
  created_at: string;
}

// ── Design tokens ─────────────────────────────────────────────────────────
export const COLORS = {
  bg: "#F7F9FB",
  surface: "#FFFFFF",
  border: "#E5E9EF",
  navy: "#0A2558",
  teal: "#14B8A6",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
};

export const FONT_HEADING = "'Poppins', -apple-system, sans-serif";
export const FONT_BODY = "'Inter', -apple-system, sans-serif";

export const inputSt: CSSProperties = {
  width: "100%", padding: "9px 11px", borderRadius: 7, border: `1px solid ${COLORS.border}`,
  fontSize: 14, boxSizing: "border-box", background: "#FAFBFC", fontFamily: FONT_BODY,
};
export const labelSt: CSSProperties = {
  fontSize: 12.5, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase",
  letterSpacing: "0.03em", display: "block", marginBottom: 6,
};
export const quickPickSt: CSSProperties = {
  width: "100%", padding: "5px 6px", borderRadius: 6, border: `1px solid ${COLORS.border}`,
  fontSize: 11.5, boxSizing: "border-box", background: "#F7F9FB", color: COLORS.textSecondary,
  fontFamily: FONT_BODY, marginBottom: 4,
};

export const NAVY: [number, number, number] = [10, 37, 88];
export const TEAL: [number, number, number] = [20, 184, 166];

// Converts a rupee amount into words (Indian numbering: lakh/crore), e.g. 1158 -> "One Thousand One Hundred Fifty Eight"
export const numberToWordsINR = (num: number): string => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigits = (n: number): string => {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  };
  const threeDigits = (n: number): string => {
    if (n < 100) return twoDigits(n);
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
  };

  let n = Math.round(num);
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const hundred = n;

  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (hundred) parts.push(threeDigits(hundred));
  return parts.join(" ");
};

// Convert an imported image (bundler URL) to a base64 data URL so jsPDF can embed it
export const loadImageAsDataUrl = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });

// Draws a horizontal gradient rectangle by stepping through interpolated colors
export const drawGradientRect = (
  doc: jsPDF, x: number, y: number, w: number, h: number,
  colorStart: [number, number, number], colorEnd: [number, number, number], steps = 50
) => {
  const stepW = w / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = colorStart[0] + (colorEnd[0] - colorStart[0]) * t;
    const g = colorStart[1] + (colorEnd[1] - colorStart[1]) * t;
    const b = colorStart[2] + (colorEnd[2] - colorStart[2]) * t;
    doc.setFillColor(r, g, b);
    doc.rect(x + stepW * i, y, stepW + 0.3, h, "F");
  }
};

// Clean gradient title bar used for every content section — bold white text, small
// colored tick on the left. No hand-drawn icon glyphs (they don't render cleanly
// at this scale in jsPDF) — just solid, confident typography.
export const drawSectionHeader = (
  doc: jsPDF, x: number, y: number, w: number, h: number, title: string
) => {
  doc.setDrawColor(205, 213, 224);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  drawGradientRect(doc, x, y, w, 7.5, NAVY, TEAL);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.8);
  doc.text(title, x + 4, y + 5.3);
  doc.setTextColor(20, 20, 20);
  return y + 12;
};

// Draws the shared clinic header (logo, name, contact block) used by both prescription and invoice PDFs
export const drawDocHeader = (doc: jsPDF, logoDataUrl: string, marginL: number, marginR: number) => {
  const pageWidth = 210;

  // Soft background wash behind the whole header
  doc.setFillColor(248, 251, 253);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Logo — plain, no boxed background
  try { doc.addImage(logoDataUrl, "PNG", marginL, 6, 26, 26); } catch { /* ignore if logo fails to load */ }

  const textX = marginL + 30;
  doc.setTextColor(10, 37, 88);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.text("DoctorAtHome", textX, 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(15, 118, 110);
  doc.text("P R O F E S S I O N A L   H E A L T H C A R E   S E R V I C E S", textX, 22.8);

  // Punch line — plain centered small-caps text, no flanking rule lines
  // (the lines previously here sat too close to the letters and read as
  // cutting through the text, so they've been removed).
  const punch = "AT YOUR DOORSTEP";
  doc.setFontSize(7.3);
  doc.setTextColor(10, 37, 88);
  const punchSpaced = punch.split("").join(" ");
  doc.text(punchSpaced, textX, 27.8);

  // Right-side contact block — plain, clean typography, no icon glyphs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("FOR APPOINTMENTS & QUERIES", marginR, 9, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.setTextColor(10, 37, 88);
  doc.text("9203634407", marginR, 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("www.doctorathome247.com", marginR, 20, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(10, 37, 88);
  doc.text("Doctor at Home Clinic", marginR, 26, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("Shubh Business Zone, Ayodhya Bypass", marginR, 30.4, { align: "right" });
  doc.text("Bhopal, Madhya Pradesh", marginR, 34.4, { align: "right" });

  // Gradient accent line closing the header
  drawGradientRect(doc, 0, 39.2, pageWidth, 1, NAVY, TEAL);
};

// Draws the shared footer band used by both prescription and invoice PDFs
export const drawDocFooter = (doc: jsPDF, pageWidth: number) => {
  drawGradientRect(doc, 0, 282, pageWidth, 0.9, TEAL, NAVY);
  drawGradientRect(doc, 0, 283, pageWidth, 14, NAVY, [13, 58, 138]);

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.12);
  [52, 104, 156].forEach((lineX) => doc.line(lineX, 287, lineX, 293));

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("9203634407", 26, 289, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(186, 230, 253);
  doc.text("Call / WhatsApp", 26, 293, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("doctorathomebhopal@gmail.com", 78, 289, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(186, 230, 253);
  doc.text("Email", 78, 293, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("www.doctorathome247.com", 130, 289, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(186, 230, 253);
  doc.text("Website", 130, 293, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Care · Compassion", 182, 288, { align: "center" });
  doc.text("Convenience", 182, 292, { align: "center" });
};