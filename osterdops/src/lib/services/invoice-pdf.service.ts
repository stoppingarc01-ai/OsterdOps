/**
 * OsterdOps — Minimalist Client PDF Invoice Generator Service
 *
 * Implements clean, Swiss-minimalist typography and layout:
 * - Pure vector graphics with zero external image/font dependencies (serverless-safe).
 * - Standard PDF Helvetica & Helvetica-Bold typography.
 * - Geometric header rule, tracked INVOICE title, line items table, and financial summary block.
 */

import PDFDocument from "pdfkit";

export interface InvoiceLineItemPdf {
  description: string;
  unitPrice: number;
  qty: number | string;
  total: number;
}

export interface InvoicePdfPayload {
  id: string;
  date?: string;
  dueDate?: string;
  clientName?: string;
  companyName?: string;
  orgName?: string;
  address?: string;
  taxId?: string;
  items: InvoiceLineItemPdf[];
  subtotal: number;
  taxRate?: string;
  taxAmount?: number;
  total: number;
  status?: string;
  currency?: string;
  paymentMethod?: string;
}

/**
 * Generates an executive, print-ready PDF invoice buffer using PDFKit.
 */
export async function generateInvoicePdf(invoice: InvoicePdfPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      compress: false,
      info: {
        Title: `Invoice ${invoice.id}`,
        Author: "OsterdOps AI FinOps",
        Subject: `Invoice ${invoice.id}`,
        Keywords: "invoice, osterdops, ai gateway, finops",
        CreationDate: new Date(),
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    // -------------------------------------------------------------------------
    // 0. Dynamic Live Dates (Net-30 Standard)
    // -------------------------------------------------------------------------
    const now = new Date();
    const issueDate =
      invoice.date ||
      now
        .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
        .replace(/\//g, ".");

    const due = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dueDate =
      invoice.dueDate ||
      due
        .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
        .replace(/\//g, ".");

    // -------------------------------------------------------------------------
    // 1. Header decorative line & tracked Title
    // -------------------------------------------------------------------------
    doc.moveTo(50, 75).lineTo(340, 75).lineWidth(1).strokeColor("#9CA3AF").stroke();

    doc
      .font("Helvetica")
      .fontSize(26)
      .fillColor("#111827")
      .text("INVOICE", 360, 62, {
        characterSpacing: 5,
        align: "right",
      });

    // -------------------------------------------------------------------------
    // 2. Metadata & Addresses Layout (Starting at Y=180)
    // -------------------------------------------------------------------------
    let curY = 180;

    // Left Block: ISSUED TO
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#111827").text("ISSUED TO:", 50, curY);
    curY += 14;
    doc.font("Helvetica").fontSize(8.5).fillColor("#374151");
    doc.text(invoice.clientName || "Valued Client", 50, curY);
    curY += 12;
    doc.text(invoice.companyName || invoice.orgName || "Organization", 50, curY);
    curY += 12;
    doc.text(invoice.address || "Registered Business Address", 50, curY, { width: 280 });
    curY = doc.y + 4;
    if (invoice.taxId) {
      doc.text(`Tax ID / GSTIN: ${invoice.taxId}`, 50, curY);
      curY = doc.y + 12;
    } else {
      curY += 12;
    }

    curY = Math.max(curY, 250);

    // Right-hand Meta Block (X=350 to 545)
    const metaY = 180;
    const metaLabelX = 350;
    const metaValX = 420;

    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#111827");
    doc.text("INVOICE NO:", metaLabelX, metaY);
    doc.text("DATE:", metaLabelX, metaY + 14);
    doc.text("DUE DATE:", metaLabelX, metaY + 28);
    if (invoice.status) {
      doc.text("STATUS:", metaLabelX, metaY + 42);
    }

    doc.font("Helvetica").fillColor("#374151");
    doc.text(invoice.id, metaValX, metaY, { align: "right", width: 125 });
    doc.text(issueDate, metaValX, metaY + 14, { align: "right", width: 125 });
    doc.text(dueDate, metaValX, metaY + 28, { align: "right", width: 125 });
    if (invoice.status) {
      doc.font("Helvetica-Bold").fillColor(invoice.status.toUpperCase() === "PAID" ? "#059669" : "#111827");
      doc.text(invoice.status.toUpperCase(), metaValX, metaY + 42, { align: "right", width: 125 });
    }

    // PAY TO Block
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#111827").text("PAY TO:", 50, curY);
    curY += 14;
    doc.font("Helvetica").fontSize(8.5).fillColor("#374151");
    doc.text("OsterdOps Technologies Inc.", 50, curY);
    curY += 12;
    doc.text("Account: OsterdOps Operating / Stripe Merchant", 50, curY);
    curY += 12;
    doc.text("EIN/Tax ID: XX-XXXXXXX | Delaware, USA", 50, curY);

    // -------------------------------------------------------------------------
    // 3. Line Items Table
    // -------------------------------------------------------------------------
    const tableTop = Math.max(340, curY + 25);

    // Header top rule
    doc.moveTo(50, tableTop - 10).lineTo(545, tableTop - 10).lineWidth(1).strokeColor("#9CA3AF").stroke();

    // Table column headers
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#111827");
    doc.text("DESCRIPTION", 50, tableTop);
    doc.text("UNIT PRICE", 300, tableTop, { align: "right", width: 70 });
    doc.text("QTY", 400, tableTop, { align: "right", width: 40 });
    doc.text("TOTAL", 485, tableTop, { align: "right", width: 60 });

    // Header bottom rule
    doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).lineWidth(1).strokeColor("#D1D5DB").stroke();

    // -------------------------------------------------------------------------
    // 4. Line Items Rows
    // -------------------------------------------------------------------------
    let itemY = tableTop + 26;
    doc.font("Helvetica").fontSize(8.5).fillColor("#374151");

    const items = invoice.items && invoice.items.length > 0
      ? invoice.items
      : [
          {
            description: "OsterdOps Platform Subscription",
            unitPrice: invoice.subtotal || 49.0,
            qty: 1,
            total: invoice.subtotal || 49.0,
          },
        ];

    items.forEach((item) => {
      doc.text(item.description, 50, itemY, { width: 240 });
      doc.text(`$${Number(item.unitPrice || 0).toFixed(2)}`, 300, itemY, { align: "right", width: 70 });
      doc.text(String(item.qty ?? 1), 400, itemY, { align: "right", width: 40 });
      doc.text(`$${Number(item.total || 0).toFixed(2)}`, 485, itemY, { align: "right", width: 60 });
      itemY += 24;
    });

    // -------------------------------------------------------------------------
    // 5. Summary Block
    // -------------------------------------------------------------------------
    const summaryY = itemY + 15;

    // Divider rule above summary
    doc.moveTo(50, summaryY - 8).lineTo(545, summaryY - 8).lineWidth(1).strokeColor("#9CA3AF").stroke();

    // Subtotal
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#111827").text("SUBTOTAL", 50, summaryY);
    doc.font("Helvetica").fontSize(8.5).fillColor("#111827");
    doc.text(`$${Number(invoice.subtotal || 0).toFixed(2)}`, 485, summaryY, { align: "right", width: 60 });

    // Tax
    const taxRateStr = invoice.taxRate || "0.0%";
    const taxAmount = typeof invoice.taxAmount === "number"
      ? invoice.taxAmount
      : (invoice.total && invoice.subtotal ? Math.max(0, invoice.total - invoice.subtotal) : 0);

    doc.font("Helvetica").fontSize(8.5).fillColor("#4B5563");
    doc.text(`Tax (${taxRateStr})`, 380, summaryY + 16, { align: "right", width: 60 });
    doc.text(`$${taxAmount.toFixed(2)}`, 485, summaryY + 16, { align: "right", width: 60 });

    // Grand Total
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827");
    doc.text("TOTAL", 400, summaryY + 32, { align: "right", width: 40 });
    doc.text(`$${Number(invoice.total || 0).toFixed(2)}`, 485, summaryY + 32, { align: "right", width: 60 });

    // Double rule below total
    doc.moveTo(400, summaryY + 46).lineTo(545, summaryY + 46).lineWidth(0.5).strokeColor("#9CA3AF").stroke();

    // -------------------------------------------------------------------------
    // 6. Homepage-Matching Footer Branding (Osterd FinOps)
    // -------------------------------------------------------------------------
    const footerY = 760;
    doc.moveTo(50, footerY - 12).lineTo(545, footerY - 12).lineWidth(0.75).strokeColor("#E5E7EB").stroke();

    // Brand text matching the signature homepage header
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text("Osterd FinOps", 50, footerY, {
      characterSpacing: 1.5,
      align: "center",
    });

    doc.font("Helvetica").fontSize(7.5).fillColor("#9CA3AF").text("ENTERPRISE AI GATEWAY & RUNTIME GOVERNANCE", 50, footerY + 14, {
      characterSpacing: 1.2,
      align: "center",
    });

    doc.end();
  });
}
