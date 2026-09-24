import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { X, Trash2, Plus, FileText } from "lucide-react";
import {
  COLORS, FONT_HEADING, NAVY, TEAL,
  inputSt, labelSt, quickPickSt,
  drawGradientRect, drawDocHeader, drawDocFooter, drawSectionHeader,
  type Appointment,
} from "./pdfShared";

// Standard advice checkboxes shown on every prescription
export const ADVICE_OPTIONS = [
  "Take a balanced diet and adequate fluids",
  "Get proper rest and sleep",
  "Do light physical activity as tolerated",
  "Maintain a positive mindset and stay connected with family and friends",
  "Follow up if symptoms persist or worsen",
  "Avoid self-medication",
  "Stay hydrated, drink plenty of water",
  "Maintain hygiene at the injection/wound site",
];

// Common chief complaints doctors can tick instead of typing
export const COMMON_COMPLAINTS = [
  "Fever", "Body ache", "Headache", "Cough", "Cold",
  "Vomiting", "Loose motions", "Weakness", "Breathlessness", "Abdominal pain",
];

// Quick-pick medicine names (autocomplete suggestions, doctor can still type any name)
export const COMMON_MEDICINES = [
  "Tab. Paracetamol 650mg", "Tab. Pantop 40mg", "Tab. Zerodol-SP", "Tab. Azithromycin 500mg",
  "Tab. Cetirizine 10mg", "Tab. Metrogyl 400mg", "Tab. Zincovit", "Syrup Ascoril",
];

export const DOSE_OPTIONS = [
  "1 tablet OD", "1 tablet BD", "1 tablet TDS", "1 tablet QID",
  "2 tablets OD", "1 tablet SOS", "1 capsule BD", "5ml syrup TDS",
];

export const DURATION_OPTIONS = ["1 day", "2 days", "3 days", "5 days", "7 days", "10 days", "15 days", "1 month"];

export const ROUTE_OPTIONS = [
  "After food", "Before food", "Empty stomach, 30 min before food",
  "With water", "At bedtime", "SOS (as needed)",
];

export const FOLLOWUP_OPTIONS = [
  "Review after 3 days or earlier if symptoms worsen",
  "Review after 5 days",
  "Review after 7 days",
  "No follow-up needed unless symptoms worsen",
];

// Vitals field -> unit shown inside the input
export const VITALS_UNITS: Record<string, string> = { rbs: "mg/dL", bp: "mmHg", pr: "/min", spo2: "%", temp: "°F" };

export const WARNING_SIGNS = [
  "High grade fever",
  "Severe or worsening body pain",
  "Persistent vomiting",
  "Breathing difficulty",
  "Severe weakness or inability to carry out daily activities",
  "Worsening mood, suicidal thoughts or self-harm ideation",
  "Any other concerning symptoms",
];

export interface Medicine {
  name: string;
  dose: string;
  duration: string;
  notes: string;
}

export interface PrescriptionForm {
  patientName: string;
  ageSex: string;
  address: string;
  date: string;
  chiefComplaints: string;
  clinicalAssessment: string;
  rbs: string;
  bp: string;
  pr: string;
  spo2: string;
  temp: string;
  pastHistory: string;
  cns: string;
  cvs: string;
  rs: string;
  pa: string;
  othersExam: string;
  medicines: Medicine[];
  investigations: string;
  adviceChecked: string[];
  adviceCustom: string;
  followUp: string;
}

export const emptyPrescriptionForm = (a: Appointment): PrescriptionForm => ({
  patientName: a.patient_name || "",
  ageSex: "",
  address: a.address || "",
  date: new Date().toISOString().slice(0, 10),
  chiefComplaints: "",
  clinicalAssessment: "",
  rbs: "",
  bp: "",
  pr: "",
  spo2: "",
  temp: "",
  pastHistory: "No significant past history mentioned.",
  cns: "Conscious",
  cvs: "S1 S2 +",
  rs: "NAD",
  pa: "Soft, Non-tender",
  othersExam: "No abnormality detected",
  medicines: [{ name: "", dose: "", duration: "", notes: "" }],
  investigations: "As clinically indicated",
  adviceChecked: [],
  adviceCustom: "",
  followUp: "Review after 3 days or earlier if symptoms worsen",
});

// Sample data used by the "Fill Sample Data" button in the modal
export const samplePrescriptionData = (prev: PrescriptionForm): PrescriptionForm => ({
  ...prev,
  ageSex: "45 Years / Male",
  chiefComplaints: "Fever since 2 days\nBody ache\nMild headache",
  clinicalAssessment: "Likely viral fever, no signs of complication",
  rbs: "110 mg/dL",
  bp: "120/80 mmHg",
  pr: "82/min",
  spo2: "98%",
  temp: "99.2°F",
  pastHistory: "No significant past history mentioned.",
  cns: "Conscious",
  cvs: "S1 S2 +",
  rs: "NAD",
  pa: "Soft, Non-tender",
  othersExam: "No abnormality detected",
  medicines: [
    { name: "Tab. Paracetamol 650mg", dose: "1 tablet TDS", duration: "3 days", notes: "After food" },
    { name: "Tab. Pantop 40mg", dose: "1 tablet OD", duration: "3 days", notes: "Empty stomach, 30 min before food" },
  ],
  adviceChecked: [ADVICE_OPTIONS[0], ADVICE_OPTIONS[1], ADVICE_OPTIONS[4]],
  followUp: "Review after 3 days or earlier if symptoms worsen",
});

// Builds the prescription PDF matching the reference design — boxed sections, single page
export const buildPrescriptionPdf = (form: PrescriptionForm, logoDataUrl: string) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const marginL = 12;
  const marginR = 198;
  const fullW = marginR - marginL;
  const colGap = 4;
  const colW = (fullW - colGap) / 2;
  const col2X = marginL + colW + colGap;

  const LABEL_SIZE = 10.5;
  const BODY_SIZE = 10;
  const LINE_H = 4.8;

  // ── Header ──
  drawDocHeader(doc, logoDataUrl, marginL, marginR);

  // ── PRESCRIPTION gradient banner ──
  drawGradientRect(doc, 0, 42, pageWidth, 10, NAVY, TEAL);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("PRESCRIPTION", pageWidth / 2, 48.7, { align: "center", charSpace: 1 });

  doc.setTextColor(20, 20, 20);
  let y = 58;

  // ── Patient info box ──
  const addrLines = form.address ? doc.splitTextToSize(`Address: ${form.address}`, fullW - 60) : [];
  const patientBoxH = 8 + 6 + 6 + Math.max(addrLines.length, 1) * 4.6 + 3;
  doc.setDrawColor(205, 213, 224);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginL, y, fullW, patientBoxH, 2, 2, "FD");
  let py = y + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(LABEL_SIZE);
  doc.setTextColor(10, 37, 88);
  doc.text(`Patient Name: ${form.patientName}`, marginL + 4, py);
  doc.text(`Date: ${form.date}`, marginR - 4, py, { align: "right" });
  py += 6.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(40, 40, 40);
  doc.text(`Age / Sex: ${form.ageSex || "-"}`, marginL + 4, py);
  py += 6;
  if (addrLines.length) {
    doc.text(addrLines, marginL + 4, py);
  }
  y += patientBoxH + 5;

  // ── Chief Complaints | Clinical Assessment (two boxes) ──
  const complaintLines = (form.chiefComplaints || "-").split("\n").filter(Boolean).map((l) => doc.splitTextToSize(`• ${l}`, colW - 8));
  const complaintTotalLines = complaintLines.reduce((a: number, l: string[]) => a + l.length, 0) || 1;
  const assessLines = doc.splitTextToSize(form.clinicalAssessment || "-", colW - 8);
  const leftContentH = complaintTotalLines * LINE_H;
  const rightContentH = assessLines.length * LINE_H + 12;
  const boxH = Math.max(leftContentH, rightContentH) + 15;

  let cy = drawSectionHeader(doc, marginL, y, colW, boxH, "Chief Complaints");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(30, 30, 30);
  complaintLines.forEach((lines: string[]) => {
    doc.text(lines, marginL + 4, cy);
    cy += lines.length * LINE_H;
  });

  let ay = drawSectionHeader(doc, col2X, y, colW, boxH, "Clinical Assessment");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  doc.text(assessLines, col2X + 4, ay);
  ay += assessLines.length * LINE_H + 3;
  doc.setFillColor(224, 246, 242);
  doc.roundedRect(col2X + 3, ay, colW - 6, 7.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.8);
  doc.setTextColor(15, 118, 110);
  doc.text(
    `RBS: ${form.rbs || "-"}  BP: ${form.bp || "-"}  PR: ${form.pr || "-"}  SpO2: ${form.spo2 || "-"}  Temp: ${form.temp || "-"}`,
    col2X + 5, ay + 5
  );
  doc.setTextColor(20, 20, 20);
  y += boxH + 5;

  // ── Past History | Examination (two boxes) ──
  const histLines = doc.splitTextToSize(form.pastHistory || "-", colW - 8);
  const examText = `CNS: ${form.cns || "-"}   CVS: ${form.cvs || "-"}   RS: ${form.rs || "-"}   P/A: ${form.pa || "-"}   Others: ${form.othersExam || "-"}`;
  const examLines = doc.splitTextToSize(examText, colW - 8);
  const boxH2 = Math.max(histLines.length, examLines.length) * LINE_H + 10;

  let hy = drawSectionHeader(doc, marginL, y, colW, boxH2, "Past History");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  doc.text(histLines, marginL + 4, hy);

  let ey = drawSectionHeader(doc, col2X, y, colW, boxH2, "Examination");
  doc.text(examLines, col2X + 4, ey);
  y += boxH2 + 6;

  // ── Medicines table with a slim "Rx" badge on the left ──
  const medRows = form.medicines.filter((m) => m.name.trim()).map((m, i) => [String(i + 1), m.name, m.dose, m.duration, m.notes]);
  const rxBadgeW = 15;
  const tableStartY = y;
  autoTable(doc, {
    startY: y,
    head: [["Sr.", "Medicine", "Dose & Frequency", "Duration", "Route / Notes"]],
    body: medRows.length ? medRows : [["-", "-", "-", "-", "-"]],
    headStyles: { fillColor: [10, 37, 88], textColor: 255, fontSize: 9.5, fontStyle: "bold" },
    bodyStyles: { fontSize: 9.3, textColor: [30, 30, 30] },
    columnStyles: { 1: { fontStyle: "bold" } },
    margin: { left: marginL + rxBadgeW, right: marginL },
    theme: "grid",
  });
  const tableEndY = (doc as any).lastAutoTable.finalY;
  drawGradientRect(doc, marginL, tableStartY, rxBadgeW - 2, tableEndY - tableStartY, NAVY, [13, 58, 138]);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(17);
  doc.text("Rx", marginL + (rxBadgeW - 2) / 2, tableStartY + (tableEndY - tableStartY) / 2, { align: "center" });
  doc.setTextColor(20, 20, 20);
  y = tableEndY + 5;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.3);
  doc.setTextColor(100, 116, 139);
  doc.text("Note: Take medicines as advised. Do not stop without consulting the doctor.", marginL, y);
  y += 6;

  // ── Investigations ──
  const investLines = doc.splitTextToSize(form.investigations || "As clinically indicated", fullW - 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(LABEL_SIZE);
  doc.setTextColor(10, 37, 88);
  doc.text("Investigations Advised:", marginL, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(30, 30, 30);
  doc.text(investLines, marginL + 48, y);
  y += investLines.length * LINE_H + 6;

  // ── Warning Signs (left) | Advice + Follow-up (right column) ──
  const advicePoints = [...form.adviceChecked, ...(form.adviceCustom.trim() ? [form.adviceCustom.trim()] : [])];
  const adviceLines = (advicePoints.length ? advicePoints : ["-"]).map((pt) => doc.splitTextToSize(`• ${pt}`, colW - 8));
  const adviceTotalLines = adviceLines.reduce((a: number, l: string[]) => a + l.length, 0);
  const adviceBoxH = adviceTotalLines * LINE_H + 11;

  const followLines = doc.splitTextToSize(`• ${form.followUp || "-"}`, colW - 8);
  const followBoxH = followLines.length * LINE_H + 11;

  const warnBoxH = 8 + WARNING_SIGNS.length * 4.8 + 4;
  const rightColH = adviceBoxH + followBoxH + 4;
  const bottomRowH = Math.max(warnBoxH, rightColH);

  // Warning box (left)
  doc.setDrawColor(220, 38, 38);
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(marginL, y, colW, warnBoxH, 2, 2, "FD");
  doc.setTextColor(185, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.8);
  doc.text("Warning Signs — Seek Immediate Attention", marginL + 4, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  let wy = y + 12.5;
  WARNING_SIGNS.forEach((w) => {
    doc.text(`• ${w}`, marginL + 6, wy);
    wy += 4.8;
  });

  // Advice box (right, top)
  doc.setDrawColor(20, 184, 166);
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(col2X, y, colW, adviceBoxH, 2, 2, "FD");
  doc.setTextColor(15, 118, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.8);
  doc.text("Advice", col2X + 4, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(30, 30, 30);
  let advY = y + 12.5;
  adviceLines.forEach((lines: string[]) => {
    doc.text(lines, col2X + 4, advY);
    advY += lines.length * LINE_H;
  });

  // Follow-up box (right, below advice)
  const followY = y + adviceBoxH + 4;
  doc.setDrawColor(10, 37, 88);
  doc.setFillColor(240, 246, 255);
  doc.roundedRect(col2X, followY, colW, followBoxH, 2, 2, "FD");
  doc.setTextColor(10, 37, 88);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.8);
  doc.text("Follow-up", col2X + 4, followY + 6.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(30, 30, 30);
  doc.text(followLines, col2X + 4, followY + 12.5);

  y += bottomRowH + 8;

  // ── Doctor signature placeholder ──
  doc.setDrawColor(205, 213, 224);
  doc.setLineWidth(0.3);
  doc.line(marginR - 55, y, marginR, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(100, 116, 139);
  doc.text("(Doctor's Signature)", marginR, y + 5, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(10, 37, 88);
  doc.text("Doctor at Home", marginR, y + 10, { align: "right" });

  // ── Footer band ──
  drawDocFooter(doc, pageWidth);

  return doc;
};

interface PrescriptionModalProps {
  form: PrescriptionForm;
  setForm: React.Dispatch<React.SetStateAction<PrescriptionForm | null>>;
  onClose: () => void;
  onGenerate: () => void;
  submitting: boolean;
}

// The prescription form modal — all field editing lives here via setForm
export const PrescriptionModal = ({ form, setForm, onClose, onGenerate, submitting }: PrescriptionModalProps) => {
  const updateField = (field: keyof PrescriptionForm, value: any) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const meds = [...prev.medicines];
      meds[index] = { ...meds[index], [field]: value };
      return { ...prev, medicines: meds };
    });
  };

  const addMedicineRow = () => {
    setForm((prev) => prev ? { ...prev, medicines: [...prev.medicines, { name: "", dose: "", duration: "", notes: "" }] } : prev);
  };

  const removeMedicineRow = (index: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const meds = prev.medicines.filter((_, i) => i !== index);
      return { ...prev, medicines: meds.length ? meds : [{ name: "", dose: "", duration: "", notes: "" }] };
    });
  };

  const toggleAdviceOption = (option: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const checked = prev.adviceChecked.includes(option)
        ? prev.adviceChecked.filter((o) => o !== option)
        : [...prev.adviceChecked, option];
      return { ...prev, adviceChecked: checked };
    });
  };

  // Toggles a common complaint in/out of the chiefComplaints textarea (one per line)
  const toggleComplaint = (item: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const lines = prev.chiefComplaints.split("\n").map((l) => l.trim()).filter(Boolean);
      const exists = lines.includes(item);
      const newLines = exists ? lines.filter((l) => l !== item) : [...lines, item];
      return { ...prev, chiefComplaints: newLines.join("\n") };
    });
  };

  const fillSampleData = () => setForm((prev) => prev ? samplePrescriptionData(prev) : prev);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 60 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "94%", maxWidth: 640, maxHeight: "90vh", background: COLORS.surface, borderRadius: 16,
        zIndex: 70, boxShadow: "0 24px 64px rgba(15,23,42,0.25)", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `linear-gradient(135deg, ${COLORS.navy}, #0d3a8a)`, borderRadius: "16px 16px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={18} color="#fff" />
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: "#fff", fontFamily: FONT_HEADING }}>Generate Prescription</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={fillSampleData}
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 7, color: "#fff", fontSize: 11.5, fontWeight: 600, padding: "6px 10px", cursor: "pointer" }}
            >
              Fill Sample Data
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 4 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: 22, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Patient info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>Patient Name</label>
              <input style={inputSt} value={form.patientName} onChange={(e) => updateField("patientName", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Age / Sex</label>
              <input style={inputSt} placeholder="e.g. 45 Years / Male" value={form.ageSex} onChange={(e) => updateField("ageSex", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelSt}>Address</label>
              <input style={inputSt} value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Date</label>
              <input type="date" style={inputSt} value={form.date} onChange={(e) => updateField("date", e.target.value)} />
            </div>
          </div>

          <div style={{ height: 1, background: COLORS.border }} />

          {/* Chief complaints */}
          <div>
            <label style={labelSt}>Chief Complaints</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {COMMON_COMPLAINTS.map((item) => {
                const active = form.chiefComplaints.split("\n").map((l) => l.trim()).includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleComplaint(item)}
                    style={{
                      padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: `1.5px solid ${active ? COLORS.teal : COLORS.border}`,
                      background: active ? "#F0FDFA" : "#fff",
                      color: active ? "#0F766E" : COLORS.textSecondary,
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <textarea
              style={{ ...inputSt, minHeight: 50, resize: "vertical" }}
              placeholder="Ticked items appear here — add more, one per line"
              value={form.chiefComplaints}
              onChange={(e) => updateField("chiefComplaints", e.target.value)}
            />
          </div>

          {/* Clinical assessment */}
          <div>
            <label style={labelSt}>Clinical Assessment</label>
            <textarea style={{ ...inputSt, minHeight: 44, resize: "vertical" }} value={form.clinicalAssessment} onChange={(e) => updateField("clinicalAssessment", e.target.value)} />
          </div>

          {/* Vitals */}
          <div>
            <label style={labelSt}>Vitals</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {(["rbs", "bp", "pr", "spo2", "temp"] as const).map((key) => (
                <div key={key} style={{ position: "relative" }}>
                  <input
                    style={{ ...inputSt, paddingRight: 40, textTransform: "uppercase" as const }}
                    placeholder={key.toUpperCase()}
                    value={form[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                  />
                  <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10.5, color: COLORS.textMuted, fontWeight: 600, pointerEvents: "none" }}>
                    {VITALS_UNITS[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Past history */}
          <div>
            <label style={labelSt}>Past History</label>
            <textarea style={{ ...inputSt, minHeight: 40, resize: "vertical" }} value={form.pastHistory} onChange={(e) => updateField("pastHistory", e.target.value)} />
          </div>

          {/* Examination */}
          <div>
            <label style={labelSt}>Examination</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              <input style={inputSt} placeholder="CNS" value={form.cns} onChange={(e) => updateField("cns", e.target.value)} />
              <input style={inputSt} placeholder="CVS" value={form.cvs} onChange={(e) => updateField("cvs", e.target.value)} />
              <input style={inputSt} placeholder="RS" value={form.rs} onChange={(e) => updateField("rs", e.target.value)} />
              <input style={inputSt} placeholder="P/A" value={form.pa} onChange={(e) => updateField("pa", e.target.value)} />
              <input style={inputSt} placeholder="Others" value={form.othersExam} onChange={(e) => updateField("othersExam", e.target.value)} />
            </div>
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Pre-filled with normal values — edit any field if different.</p>
          </div>

          <div style={{ height: 1, background: COLORS.border }} />

          {/* Medicines */}
          <div>
            <label style={labelSt}>Medicines</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {form.medicines.map((med, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.8fr 1.2fr auto", gap: 6, alignItems: "start", padding: 8, background: "#FAFBFC", borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                  <div>
                    <input
                      style={inputSt} placeholder="Medicine name" value={med.name}
                      list="common-medicines-list"
                      onChange={(e) => updateMedicine(i, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <select style={quickPickSt} value="" onChange={(e) => { if (e.target.value) updateMedicine(i, "dose", e.target.value); }}>
                      <option value="">Quick pick...</option>
                      {DOSE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <input style={inputSt} placeholder="Dose & freq." value={med.dose} onChange={(e) => updateMedicine(i, "dose", e.target.value)} />
                  </div>
                  <div>
                    <select style={quickPickSt} value="" onChange={(e) => { if (e.target.value) updateMedicine(i, "duration", e.target.value); }}>
                      <option value="">Quick pick...</option>
                      {DURATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <input style={inputSt} placeholder="Duration" value={med.duration} onChange={(e) => updateMedicine(i, "duration", e.target.value)} />
                  </div>
                  <div>
                    <select style={quickPickSt} value="" onChange={(e) => { if (e.target.value) updateMedicine(i, "notes", e.target.value); }}>
                      <option value="">Quick pick...</option>
                      {ROUTE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <input style={inputSt} placeholder="Route / notes" value={med.notes} onChange={(e) => updateMedicine(i, "notes", e.target.value)} />
                  </div>
                  <button onClick={() => removeMedicineRow(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 4, marginTop: 8 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <datalist id="common-medicines-list">
              {COMMON_MEDICINES.map((m) => <option key={m} value={m} />)}
            </datalist>
            <button
              onClick={addMedicineRow}
              style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 12px", borderRadius: 7, border: `1px dashed ${COLORS.teal}`, background: "none", color: "#0F766E", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
            >
              <Plus size={13} /> Add Medicine
            </button>
          </div>

          {/* Investigations */}
          <div>
            <label style={labelSt}>Investigations Advised</label>
            <input style={inputSt} value={form.investigations} onChange={(e) => updateField("investigations", e.target.value)} />
          </div>

          {/* Advice */}
          <div>
            <label style={labelSt}>Advice</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ADVICE_OPTIONS.map((opt) => (
                <label key={opt} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: COLORS.textPrimary, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.adviceChecked.includes(opt)}
                    onChange={() => toggleAdviceOption(opt)}
                    style={{ marginTop: 2 }}
                  />
                  {opt}
                </label>
              ))}
            </div>
            <input
              style={{ ...inputSt, marginTop: 8 }}
              placeholder="+ Add a custom advice point (optional)"
              value={form.adviceCustom}
              onChange={(e) => updateField("adviceCustom", e.target.value)}
            />
          </div>

          {/* Follow-up */}
          <div>
            <label style={labelSt}>Follow-up</label>
            <select
              style={quickPickSt}
              value=""
              onChange={(e) => { if (e.target.value) updateField("followUp", e.target.value); }}
            >
              <option value="">Quick pick...</option>
              {FOLLOWUP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input style={inputSt} placeholder="e.g. Review after 3 days or earlier if symptoms worsen" value={form.followUp} onChange={(e) => updateField("followUp", e.target.value)} />
          </div>
        </div>

        <div style={{ padding: 18, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "11px", borderRadius: 9, border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.textSecondary, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            disabled={submitting}
            style={{ flex: 2, padding: "11px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Generating..." : "Generate & Send"}
          </button>
        </div>
      </div>
    </>
  );
};