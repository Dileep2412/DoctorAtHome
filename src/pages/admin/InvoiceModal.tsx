import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { X, Trash2, Plus, Receipt } from "lucide-react";
import {
  COLORS, FONT_HEADING, NAVY, TEAL,
  inputSt, labelSt, quickPickSt,
  drawGradientRect, drawDocHeader, drawDocFooter, numberToWordsINR,
  type Appointment,
} from "./pdfShared";

// Quick-pick charge particulars for invoices — label + a default rate (doctor can still type/edit any value)
export const INVOICE_PARTICULARS: { label: string; rate: number }[] = [
  { label: "Nursing Charge (Morning)", rate: 299 },
  { label: "Nursing Charge (Evening)", rate: 299 },
  { label: "Nursing Charge (Morning & Evening)", rate: 598 },
  { label: "Doctor Visit Charge", rate: 500 },
  { label: "Injection Charge (per visit)", rate: 100 },
  { label: "IV Fluid Charge", rate: 350 },
  { label: "Wound Dressing Charge", rate: 250 },
  { label: "Blood Sample Collection", rate: 150 },
  { label: "Physiotherapy Session", rate: 400 },
  { label: "Neomol", rate: 450 },
  { label: "Inj. Monocef 1gm", rate: 55 },
];

export const PAYMENT_MODE_OPTIONS = ["UPI", "Cash", "Card", "Net Banking"];
export const PAYMENT_STATUS_OPTIONS = ["Paid", "Unpaid"];

export interface ChargeItem {
  particulars: string;
  qty: string;
  rate: string;
}

export interface InvoiceForm {
  patientName: string;
  ageSex: string;
  address: string;
  billNo: string;
  date: string;
  serviceProvided: string;
  billingPeriod: string;
  items: ChargeItem[];
  advanceReceived: string;
  paymentMode: string;
  paymentStatus: string;
  notes: string;
}

// Generates a bill number in the DAH/DDMMYY/XXX format shown on the reference invoice
export const generateBillNo = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const rand = Math.floor(100 + Math.random() * 900);
  return `DAH/${dd}${mm}${yy}/${rand}`;
};

export const emptyInvoiceForm = (a: Appointment): InvoiceForm => ({
  patientName: a.patient_name || "",
  ageSex: "",
  address: a.address || "",
  billNo: generateBillNo(),
  date: new Date().toISOString().slice(0, 10),
  serviceProvided: a.service || "",
  billingPeriod: new Date().toISOString().slice(0, 10),
  items: [{ particulars: "", qty: "1", rate: "" }],
  advanceReceived: "0",
  paymentMode: "UPI",
  paymentStatus: "Unpaid",
  notes: "This invoice includes charges for nursing care, medicines and procedures performed at home. Please contact us for any queries.",
});

// Sample data used by the "Fill Sample Data" button in the modal
export const sampleInvoiceData = (prev: InvoiceForm): InvoiceForm => ({
  ...prev,
  ageSex: "80 Years / Female",
  serviceProvided: "Doctor at Home Visit + Procedures (Morning & Evening)",
  items: [
    { particulars: "Nursing Charge (Morning & Evening)", qty: "2", rate: "299" },
    { particulars: "Neomol", qty: "1", rate: "450" },
    { particulars: "Inj. Monocef 1gm (Morning & Evening)", qty: "2", rate: "55" },
  ],
  advanceReceived: "0",
  paymentMode: "UPI",
  paymentStatus: "Paid",
});

// Builds the Tax Invoice / Bill PDF, matching the reference design and reusing the shared header/footer
export const buildInvoicePdf = (form: InvoiceForm, logoDataUrl: string) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const marginL = 12;
  const marginR = 198;
  const fullW = marginR - marginL;

  const LABEL_SIZE = 10.5;
  const BODY_SIZE = 10;

  // ── Header ──
  drawDocHeader(doc, logoDataUrl, marginL, marginR);

  // ── TAX INVOICE / BILL gradient banner ──
  drawGradientRect(doc, 0, 42, pageWidth, 10, NAVY, TEAL);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TAX INVOICE / BILL", pageWidth / 2, 48.7, { align: "center", charSpace: 1 });

  doc.setTextColor(20, 20, 20);
  let y = 58;

  // ── Patient info + Date / Bill No. box ──
  const infoColSplit = marginL + fullW * 0.62;
  const addrLines = form.address ? doc.splitTextToSize(form.address, infoColSplit - marginL - 30) : [];
  const patientBoxH = 8 + 5 + Math.max(addrLines.length, 1) * 4.3 + 5;
  doc.setDrawColor(205, 213, 224);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginL, y, fullW, patientBoxH, 2, 2, "FD");
  doc.setDrawColor(220, 220, 220);
  doc.line(infoColSplit, y + 3, infoColSplit, y + patientBoxH - 3);

  let py = y + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(LABEL_SIZE);
  doc.setTextColor(10, 37, 88);
  doc.text(`Patient Name: ${form.patientName}`, marginL + 4, py);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(40, 40, 40);
  let py2 = py + 6;
  doc.text(`Age / Gender: ${form.ageSex || "-"}`, marginL + 4, py2);
  py2 += 5.5;
  if (addrLines.length) {
    doc.text(`Address: `, marginL + 4, py2);
    doc.text(addrLines, marginL + 4, py2 + 4.6);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(10, 37, 88);
  doc.text(`Date: ${form.date}`, infoColSplit + 4, py);
  doc.text(`Bill No.: ${form.billNo}`, infoColSplit + 4, py + 6.5);
  y += patientBoxH + 4;

  // ── Service Provided / Billing Period strip ──
  doc.setDrawColor(205, 213, 224);
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(marginL, y, fullW, 15, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(10, 37, 88);
  doc.text("Service Provided:", marginL + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.text(form.serviceProvided || "-", marginL + 44, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(10, 37, 88);
  doc.text("Billing Period:", marginL + 4, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.text(form.billingPeriod || "-", marginL + 44, y + 12);
  y += 15 + 6;

  // ── CHARGE DETAILS table ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(10, 37, 88);
  doc.text("Charge Details", marginL, y);
  y += 3;

  const validItems = form.items.filter((it) => it.particulars.trim());
  const rows = validItems.map((it, i) => {
    const qty = parseFloat(it.qty) || 0;
    const rate = parseFloat(it.rate) || 0;
    const amount = qty * rate;
    return [String(i + 1), it.particulars, String(qty), rate.toFixed(0), amount.toFixed(0)];
  });
  const grandTotal = validItems.reduce((sum, it) => sum + (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0), 0);

  autoTable(doc, {
    startY: y,
    head: [["S.No.", "Particulars", "Qty", "Rate (Rs.)", "Amount (Rs.)"]],
    body: rows.length ? rows : [["-", "-", "-", "-", "-"]],
    headStyles: { fillColor: [10, 37, 88], textColor: 255, fontSize: 9.5, fontStyle: "bold" },
    bodyStyles: { fontSize: 9.3, textColor: [30, 30, 30] },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { fontStyle: "bold" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 28, halign: "right" },
    },
    margin: { left: marginL, right: marginL },
    theme: "grid",
  });
  y = (doc as any).lastAutoTable.finalY + 2;

  // Total / Grand total bar
  doc.setFillColor(241, 245, 249);
  doc.rect(marginL, y, fullW, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(`TOTAL AMOUNT`, marginR - 60, y + 5, { align: "left" });
  doc.text(`Rs. ${grandTotal.toFixed(0)}/-`, marginR - 4, y + 5, { align: "right" });
  y += 7;
  drawGradientRect(doc, marginL, y, fullW, 8, NAVY, TEAL);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("GRAND TOTAL", marginR - 60, y + 5.5, { align: "left" });
  doc.text(`Rs. ${grandTotal.toFixed(0)}/-`, marginR - 4, y + 5.5, { align: "right" });
  doc.setTextColor(20, 20, 20);
  y += 8 + 6;

  // ── 3-column bottom boxes: Payment Details | Notes | Payment ──
  const advance = parseFloat(form.advanceReceived) || 0;
  const payable = grandTotal - advance;
  const colGap = 4;
  const colW3 = (fullW - colGap * 2) / 3;
  const col2X3 = marginL + colW3 + colGap;
  const col3X3 = col2X3 + colW3 + colGap;
  const noteLines = doc.splitTextToSize(form.notes || "-", colW3 - 8);
  const boxH3 = Math.max(40, noteLines.length * 4.6 + 22);

  // Payment Details box
  doc.setDrawColor(205, 213, 224);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginL, y, colW3, boxH3, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.3);
  doc.setTextColor(10, 37, 88);
  doc.text("PAYMENT DETAILS", marginL + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(40, 40, 40);
  let pdY = y + 12;
  doc.text("Total Amount", marginL + 4, pdY);
  doc.text(`Rs. ${grandTotal.toFixed(0)}/-`, marginL + colW3 - 4, pdY, { align: "right" });
  pdY += 6;
  doc.text("Advance Received", marginL + 4, pdY);
  doc.text(`Rs. ${advance.toFixed(0)}/-`, marginL + colW3 - 4, pdY, { align: "right" });
  pdY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110);
  doc.text("Amount Payable", marginL + 4, pdY);
  doc.text(`Rs. ${payable.toFixed(0)}/-`, marginL + colW3 - 4, pdY, { align: "right" });

  // Notes box
  doc.setDrawColor(205, 213, 224);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col2X3, y, colW3, boxH3, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.3);
  doc.setTextColor(10, 37, 88);
  doc.text("NOTES", col2X3 + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.3);
  doc.setTextColor(40, 40, 40);
  doc.text(noteLines, col2X3 + 4, y + 11.5);

  // Payment box
  doc.setDrawColor(205, 213, 224);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col3X3, y, colW3, boxH3, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.3);
  doc.setTextColor(10, 37, 88);
  doc.text("PAYMENT", col3X3 + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(40, 40, 40);
  doc.text(`Payment Mode: ${form.paymentMode}`, col3X3 + 4, y + 13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(form.paymentStatus === "Paid" ? 21 : 185, form.paymentStatus === "Paid" ? 128 : 28, form.paymentStatus === "Paid" ? 61 : 28);
  doc.text(`Payment Status: ${form.paymentStatus}`, col3X3 + 4, y + 20);
  doc.setTextColor(20, 20, 20);
  y += boxH3 + 6;

  // ── Final Bill Summary box ──
  const summaryH = 26;
  doc.setDrawColor(205, 213, 224);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginL, y, fullW, summaryH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.8);
  doc.setTextColor(10, 37, 88);
  doc.text("FINAL BILL SUMMARY", marginL + 4, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Amount: Rs. ${grandTotal.toFixed(0)}/-`, marginL + 4, y + 12.5);
  doc.text(`Advance Received: Rs. ${advance.toFixed(0)}/-`, marginL + 4, y + 17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110);
  doc.text(`Amount Payable: Rs. ${payable.toFixed(0)}/-`, marginL + 4, y + 22);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.8);
  doc.setTextColor(90, 90, 90);
  const wordsLine = doc.splitTextToSize(`In Words: Rupees ${numberToWordsINR(payable)} Only`, fullW - 90);
  doc.text(wordsLine, marginL + 100, y + 12.5);

  // Signature line removed per request — the "(Doctor's Signature) / Doctor at Home"
  // block that used to sit at the bottom-right of this box is gone.

  // ── Footer band ──
  drawDocFooter(doc, pageWidth);

  return doc;
};

interface InvoiceModalProps {
  form: InvoiceForm;
  setForm: React.Dispatch<React.SetStateAction<InvoiceForm | null>>;
  onClose: () => void;
  onGenerate: () => void;
  submitting: boolean;
}

// The invoice form modal — all field editing lives here via setForm
export const InvoiceModal = ({ form, setForm, onClose, onGenerate, submitting }: InvoiceModalProps) => {
  const updateField = (field: keyof InvoiceForm, value: any) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const updateItem = (index: number, field: keyof ChargeItem, value: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const pickItemParticular = (index: number, label: string) => {
    const preset = INVOICE_PARTICULARS.find((p) => p.label === label);
    setForm((prev) => {
      if (!prev) return prev;
      const items = [...prev.items];
      items[index] = { ...items[index], particulars: label, rate: preset ? String(preset.rate) : items[index].rate };
      return { ...prev, items };
    });
  };

  const addItemRow = () => {
    setForm((prev) => prev ? { ...prev, items: [...prev.items, { particulars: "", qty: "1", rate: "" }] } : prev);
  };

  const removeItemRow = (index: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: items.length ? items : [{ particulars: "", qty: "1", rate: "" }] };
    });
  };

  const fillSampleData = () => setForm((prev) => prev ? sampleInvoiceData(prev) : prev);

  const grandTotal = form.items.reduce((sum, it) => sum + (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0), 0);
  const balancePayable = grandTotal - (parseFloat(form.advanceReceived || "0") || 0);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 60 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "94%", maxWidth: 660, maxHeight: "90vh", background: COLORS.surface, borderRadius: 16,
        zIndex: 70, boxShadow: "0 24px 64px rgba(15,23,42,0.25)", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `linear-gradient(135deg, ${COLORS.navy}, #0d3a8a)`, borderRadius: "16px 16px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Receipt size={18} color="#fff" />
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: "#fff", fontFamily: FONT_HEADING }}>Generate Invoice</p>
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

          {/* Patient + bill info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>Patient Name</label>
              <input style={inputSt} value={form.patientName} onChange={(e) => updateField("patientName", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Age / Gender</label>
              <input style={inputSt} placeholder="e.g. 80 Years / Female" value={form.ageSex} onChange={(e) => updateField("ageSex", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelSt}>Address</label>
              <input style={inputSt} value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Bill No.</label>
              <input style={inputSt} value={form.billNo} onChange={(e) => updateField("billNo", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Date</label>
              <input type="date" style={inputSt} value={form.date} onChange={(e) => updateField("date", e.target.value)} />
            </div>
          </div>

          <div style={{ height: 1, background: COLORS.border }} />

          {/* Service + billing period */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>Service Provided</label>
              <input style={inputSt} placeholder="e.g. Doctor at Home Visit + Procedures" value={form.serviceProvided} onChange={(e) => updateField("serviceProvided", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Billing Period</label>
              <input type="date" style={inputSt} value={form.billingPeriod} onChange={(e) => updateField("billingPeriod", e.target.value)} />
            </div>
          </div>

          <div style={{ height: 1, background: COLORS.border }} />

          {/* Charge details */}
          <div>
            <label style={labelSt}>Charge Details</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {form.items.map((item, i) => {
                const qty = parseFloat(item.qty) || 0;
                const rate = parseFloat(item.rate) || 0;
                const amount = qty * rate;
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 0.9fr 0.9fr auto", gap: 6, alignItems: "start", padding: 8, background: "#FAFBFC", borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                    <div>
                      <select
                        style={quickPickSt} value=""
                        onChange={(e) => { if (e.target.value) pickItemParticular(i, e.target.value); }}
                      >
                        <option value="">Quick pick...</option>
                        {INVOICE_PARTICULARS.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
                      </select>
                      <input style={inputSt} placeholder="Particulars" value={item.particulars} onChange={(e) => updateItem(i, "particulars", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ ...labelSt, fontSize: 10, marginBottom: 4 }}>Qty</label>
                      <input style={inputSt} type="number" min="0" value={item.qty} onChange={(e) => updateItem(i, "qty", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ ...labelSt, fontSize: 10, marginBottom: 4 }}>Rate (₹)</label>
                      <input style={inputSt} type="number" min="0" value={item.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ ...labelSt, fontSize: 10, marginBottom: 4 }}>Amount (₹)</label>
                      <div style={{ ...inputSt, background: "#F0FDFA", color: "#0F766E", fontWeight: 700, display: "flex", alignItems: "center" }}>
                        {amount ? amount.toFixed(0) : "0"}
                      </div>
                    </div>
                    <button onClick={() => removeItemRow(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 4, marginTop: 22 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={addItemRow}
              style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 12px", borderRadius: 7, border: `1px dashed ${COLORS.navy}`, background: "none", color: COLORS.navy, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
            >
              <Plus size={13} /> Add Charge
            </button>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, padding: "10px 14px", borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})` }}>
              <span style={{ color: "#fff", fontSize: 13.5, fontWeight: 700 }}>Grand Total: ₹{grandTotal.toFixed(0)}/-</span>
            </div>
          </div>

          <div style={{ height: 1, background: COLORS.border }} />

          {/* Payment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSt}>Advance Received (₹)</label>
              <input style={inputSt} type="number" min="0" value={form.advanceReceived} onChange={(e) => updateField("advanceReceived", e.target.value)} />
            </div>
            <div>
              <label style={labelSt}>Balance Payable (₹)</label>
              <div style={{ ...inputSt, background: "#F0FDFA", color: "#0F766E", fontWeight: 700, display: "flex", alignItems: "center" }}>
                {balancePayable.toFixed(0)}
              </div>
            </div>
            <div>
              <label style={labelSt}>Payment Mode</label>
              <select style={{ ...inputSt, background: "#FAFBFC" }} value={form.paymentMode} onChange={(e) => updateField("paymentMode", e.target.value)}>
                {PAYMENT_MODE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Payment Status</label>
              <select style={{ ...inputSt, background: "#FAFBFC" }} value={form.paymentStatus} onChange={(e) => updateField("paymentStatus", e.target.value)}>
                {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelSt}>Notes</label>
              <textarea style={{ ...inputSt, minHeight: 44, resize: "vertical" }} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
            </div>
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