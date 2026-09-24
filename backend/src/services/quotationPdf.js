const PDFDocument = require('pdfkit');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

const NAVY = '#1B2A4A';
const ORANGE = '#E07A2F';
const GREY = '#666666';
const LGREY = '#F2F2F2';
const BORDER = '#CCCCCC';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dash(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s ? s : '—';
}

function formatQuoteDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}

function formatMoney(value, currency = 'USD') {
  const n = Number(value);
  const amount = Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';
  return `${currency} ${amount}`;
}

function quotationNumberFromRfq(rfqNumber) {
  const m = String(rfqNumber || '').match(/RFQ-(\d{4}-\d+)/i);
  if (m) return `FN-QT-${m[1]}`;
  return `FN-QT-${rfqNumber || 'DRAFT'}`;
}

function leadTimeLabel(requiredDeliveryDate) {
  if (!requiredDeliveryDate) return '—';
  const due = requiredDeliveryDate instanceof Date ? requiredDeliveryDate : new Date(requiredDeliveryDate);
  if (Number.isNaN(due.getTime())) return '—';
  const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
  if (days <= 0) return 'On request';
  const weeks = Math.max(1, Math.round(days / 7));
  return `${weeks} wk${weeks === 1 ? '' : 's'}`;
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return value ? String(value) : '';
}

function buildQuotationModel(rfq) {
  const company = config.company;
  const currency = rfq.currency || 'USD';
  const qty = Number(rfq.quantity);
  const quantity = Number.isFinite(qty) && qty > 0 ? qty : 1;
  const processes = rfq.processServices || [];
  const quotes = rfq.quotes || [];
  const awards = rfq.awards || [];
  const awardByService = Object.fromEntries(awards.map((a) => [a.serviceId, a]));

  const lineItems = processes.map((row, index) => {
    const serviceId = row.serviceId || row.service?.id;
    const award = awardByService[serviceId];
    const quote = quotes.find(
      (q) => q.serviceId === serviceId && q.supplierId === award?.supplierId
    );
    const ext = Number(quote?.price) || 0;
    const unit = quantity ? ext / quantity : ext;
    const serviceName = row.service?.name || 'Process';
    const description = [serviceName, rfq.partName, rfq.materialSpecification]
      .filter(Boolean)
      .join(' — ');
    const partNo = [rfq.partNumber, rfq.revisionLevel].filter(Boolean).join(' / ');
    return {
      ln: index + 1,
      partNo,
      description,
      qty: quantity,
      uom: rfq.unitOfMeasure || 'EA',
      unitPrice: unit,
      extPrice: ext,
      leadTime: leadTimeLabel(rfq.requiredDeliveryDate),
    };
  });

  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.extPrice || 0), 0);
  const buyerContact = [rfq.clientEmail, rfq.clientPhone].filter(Boolean).join(' / ');
  const sellerContact = [company.email, company.phone].filter(Boolean).join(' / ');
  const certs = asList(rfq.requiredCertifications);
  const special = asList(rfq.specialProcesses);
  const notes = [
    rfq.toleranceNotes,
    special ? `Special processes: ${special}` : '',
    'Pricing is based on the stated quantity and the selected process categories.',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    fileName: `${quotationNumberFromRfq(rfq.rfqNumber)}.pdf`,
    quotationNo: quotationNumberFromRfq(rfq.rfqNumber),
    quotationDate: formatQuoteDate(new Date()),
    rfqNumber: dash(rfq.rfqNumber),
    rfqIssueDate: formatQuoteDate(rfq.dateCreated),
    validity: `${company.quoteValidityDays} days from quote date`,
    currency,
    incoterms: dash(rfq.incoterms),
    paymentTerms: dash(rfq.paymentTerms),
    company: {
      name: company.name,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
    },
    buyer: {
      companyName: dash(rfq.clientProjectName),
      contactPerson: dash(rfq.clientContactPerson),
      emailPhone: dash(buyerContact),
      project: dash(rfq.title),
    },
    quotedBy: {
      companyName: company.name,
      contactPerson: dash(company.contactName),
      emailPhone: dash(sellerContact),
      vendorCode: '—',
    },
    lineItems,
    subtotal,
    tax: 0,
    taxPct: 0,
    freight: 0,
    total: subtotal,
    terms: [
      ['Minimum Order Qty (MOQ)', 'As stated / if applicable'],
      ['Tooling / NRE Cost (if any)', 'None unless specified in notes'],
      ['Warranty', 'As per standard terms / acceptance'],
      ['Quality Certification', dash(certs)],
      ['Material Traceability', 'Certificates of conformance as required'],
      [
        'ITAR / Export Control Status',
        rfq.itarExportControl ? 'ITAR / export controlled' : 'Non-controlled',
      ],
      ['Country of Origin', dash(rfq.countryOfOriginRestriction)],
      ['Packaging Standard', 'Standard export packing'],
      ['Delivery Location (Incoterm point)', dash(rfq.incoterms)],
    ],
    notes,
    preparedBy: dash(rfq.requestedBy?.name || rfq.requestedBy?.email),
    footer:
      "This quotation is issued subject to FabNet Systems' standard terms and conditions and the buyer's RFQ terms where not superseded above.",
  };
}

function assertQuotationReady(rfq) {
  const processes = rfq?.processServices || [];
  if (!processes.length) {
    throw ApiError.badRequest('This RFQ has no process categories to quote');
  }
  const awards = rfq.awards || [];
  const awardByService = Object.fromEntries(awards.map((a) => [a.serviceId, a]));
  const missing = processes.filter((row) => {
    const serviceId = row.serviceId || row.service?.id;
    return !awardByService[serviceId];
  });
  if (missing.length) {
    throw ApiError.badRequest(
      'Select a supplier for every category before sending the quotation'
    );
  }
}

function pageContentWidth(doc) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function ensureSpace(doc, needed) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) {
    doc.addPage();
  }
}

function sectionBar(doc, title) {
  ensureSpace(doc, 24);
  const x = doc.page.margins.left;
  const w = pageContentWidth(doc);
  const y = doc.y + 6;
  doc.save();
  doc.rect(x, y, w, 16).fill(NAVY);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5).text(title, x + 8, y + 4, {
    width: w - 16,
  });
  doc.restore();
  doc.y = y + 20;
}

function fieldBlock(doc, x, y, label, value, colWidth) {
  doc.fillColor(GREY).font('Helvetica-Bold').fontSize(7.5).text(label, x, y, { width: 118 });
  doc.fillColor('#111111').font('Helvetica').fontSize(8.5).text(dash(value), x + 120, y, {
    width: colWidth - 120,
  });
  return Math.max(12, doc.heightOfString(dash(value), { width: colWidth - 120 }) + 3);
}

function drawHeader(doc, model) {
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  const top = doc.y;

  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(18).text(model.company.name, left, top);
  const infoLines = [
    model.company.address,
    [model.company.phone, model.company.email, model.company.website].filter(Boolean).join('  |  '),
  ].filter(Boolean);
  doc.fillColor(GREY).font('Helvetica').fontSize(8);
  let infoY = top + 24;
  for (const line of infoLines) {
    doc.text(line, left, infoY, { width: width * 0.62 });
    infoY = doc.y + 2;
  }

  const rightWidth = width * 0.34;
  const rightX = left + width - rightWidth;
  doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(18).text('QUOTATION', rightX, top, {
    width: rightWidth,
    align: 'right',
  });
  doc.fillColor(GREY).font('Helvetica').fontSize(8).text('In response to RFQ', rightX, top + 24, {
    width: rightWidth,
    align: 'right',
  });

  const lineY = Math.max(infoY, top + 40) + 8;
  doc.save();
  doc.moveTo(left, lineY).lineTo(left + width, lineY).lineWidth(2).strokeColor(ORANGE).stroke();
  doc.restore();
  doc.y = lineY + 12;
}

function drawMeta(doc, model) {
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  const gap = 28;
  const colW = (width - gap) / 2;
  const startY = doc.y;
  const leftFields = [
    ['Quotation No.', model.quotationNo],
    ['Quotation Date', model.quotationDate],
    ['RFQ Reference No.', model.rfqNumber],
    ['RFQ Issue Date', model.rfqIssueDate],
  ];
  const rightFields = [
    ['Validity of Offer', model.validity],
    ['Currency', model.currency],
    ['Incoterms', model.incoterms],
    ['Payment Terms', model.paymentTerms],
  ];
  let yL = startY;
  let yR = startY;
  for (const [label, value] of leftFields) {
    yL += fieldBlock(doc, left, yL, label, value, colW);
  }
  for (const [label, value] of rightFields) {
    yR += fieldBlock(doc, left + colW + gap, yR, label, value, colW);
  }
  doc.y = Math.max(yL, yR) + 4;
}

function drawParty(doc, party) {
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  const fields = [
    ['Company Name', party.companyName],
    ['Contact Person', party.contactPerson],
    ['Email / Phone', party.emailPhone],
    ['Project / Program', party.project],
  ].filter((row) => row[0] !== 'Project / Program' || party.project);
  let y = doc.y;
  for (const [label, value] of fields) {
    y += fieldBlock(doc, left, y, label, value, width * 0.7);
  }
  doc.y = y + 2;
}

function drawQuotedBy(doc, party) {
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  const fields = [
    ['Company Name', party.companyName],
    ['Contact Person', party.contactPerson],
    ['Email / Phone', party.emailPhone],
    ['Supplier / Vendor Code', party.vendorCode],
  ];
  let y = doc.y;
  for (const [label, value] of fields) {
    y += fieldBlock(doc, left, y, label, value, width * 0.7);
  }
  doc.y = y + 2;
}

function columnLayout(left, width) {
  const weights = [28, 88, 132, 36, 36, 62, 62, 50];
  const total = weights.reduce((a, b) => a + b, 0);
  const cols = [];
  let x = left;
  for (const w of weights) {
    const colW = (w / total) * width;
    cols.push({ x, w: colW });
    x += colW;
  }
  return cols;
}

function drawItemsTable(doc, model) {
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  const headers = ['Ln', 'Part No. / Drawing Rev', 'Description', 'Qty', 'UOM', 'Unit Price', 'Ext. Price', 'Lead Time'];
  const aligns = ['center', 'left', 'left', 'center', 'center', 'right', 'right', 'center'];
  const cols = columnLayout(left, width);
  const headerH = 20;

  const drawHeaderRow = () => {
    ensureSpace(doc, headerH + 24);
    const y = doc.y;
    doc.save();
    doc.rect(left, y, width, headerH).fill(NAVY);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5);
    headers.forEach((h, i) => {
      doc.text(h, cols[i].x + 3, y + 6, { width: cols[i].w - 6, align: aligns[i] });
    });
    doc.restore();
    doc.y = y + headerH;
  };

  drawHeaderRow();

  model.lineItems.forEach((item, idx) => {
    const values = [
      String(item.ln),
      dash(item.partNo),
      dash(item.description),
      String(item.qty),
      dash(item.uom),
      formatMoney(item.unitPrice, model.currency),
      formatMoney(item.extPrice, model.currency),
      dash(item.leadTime),
    ];
    doc.font('Helvetica').fontSize(8);
    const heights = values.map((val, i) =>
      doc.heightOfString(val, { width: cols[i].w - 6 }) + 10
    );
    const rowH = Math.max(22, ...heights);
    const bottom = doc.page.height - doc.page.margins.bottom;
    if (doc.y + rowH > bottom) {
      doc.addPage();
      drawHeaderRow();
    }
    const y = doc.y;
    if (idx % 2 === 1) {
      doc.save();
      doc.rect(left, y, width, rowH).fill(LGREY);
      doc.restore();
    }
    doc.save();
    doc.lineWidth(0.5).strokeColor(BORDER).rect(left, y, width, rowH).stroke();
    for (let i = 1; i < cols.length; i += 1) {
      doc.moveTo(cols[i].x, y).lineTo(cols[i].x, y + rowH).stroke();
    }
    doc.restore();
    doc.fillColor('#111111').font('Helvetica').fontSize(8);
    values.forEach((val, i) => {
      doc.text(val, cols[i].x + 3, y + 6, { width: cols[i].w - 6, align: aligns[i] });
    });
    doc.y = y + rowH;
  });
}

function drawTotals(doc, model) {
  const width = 220;
  const left = doc.page.margins.left + pageContentWidth(doc) - width;
  ensureSpace(doc, 70);
  doc.y += 8;
  const rows = [
    ['Subtotal', formatMoney(model.subtotal, model.currency)],
    [`Tax / VAT (${model.taxPct}%)`, formatMoney(model.tax, model.currency)],
    ['Freight / Packing', formatMoney(model.freight, model.currency)],
  ];
  doc.font('Helvetica').fontSize(9).fillColor('#111111');
  for (const [label, value] of rows) {
    const y = doc.y;
    doc.text(label, left, y, { width: width - 90 });
    doc.text(value, left + width - 110, y, { width: 110, align: 'right' });
    doc.y = y + 14;
  }
  const y = doc.y + 2;
  doc.save();
  doc.moveTo(left, y).lineTo(left + width, y).lineWidth(2).strokeColor(ORANGE).stroke();
  doc.restore();
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11);
  doc.text('Total Quoted Value', left, y + 8, { width: width - 110 });
  doc.text(formatMoney(model.total, model.currency), left + width - 110, y + 8, {
    width: 110,
    align: 'right',
  });
  doc.y = y + 28;
}

function drawTerms(doc, model) {
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  const labelW = width * 0.34;
  for (const [label, value] of model.terms) {
    doc.font('Helvetica').fontSize(8.5);
    const h = Math.max(
      20,
      doc.heightOfString(dash(value), { width: width - labelW - 16 }) + 10
    );
    ensureSpace(doc, h);
    const y = doc.y;
    doc.save();
    doc.rect(left, y, labelW, h).fill(LGREY);
    doc.lineWidth(0.6).strokeColor('#DDDDDD').rect(left, y, width, h).stroke();
    doc.moveTo(left + labelW, y).lineTo(left + labelW, y + h).stroke();
    doc.restore();
    doc.fillColor(GREY).font('Helvetica-Bold').fontSize(8).text(label, left + 8, y + 6, {
      width: labelW - 16,
    });
    doc.fillColor('#111111').font('Helvetica').fontSize(8.5).text(dash(value), left + labelW + 8, y + 6, {
      width: width - labelW - 16,
    });
    doc.y = y + h;
  }
}

function drawNotes(doc, model) {
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  doc.font('Helvetica').fontSize(9);
  const textH = doc.heightOfString(model.notes || '—', { width: width - 20 });
  const h = Math.max(56, textH + 16);
  ensureSpace(doc, h + 4);
  const y = doc.y;
  doc.save();
  doc.lineWidth(0.8).strokeColor(BORDER).rect(left, y, width, h).stroke();
  doc.restore();
  doc.fillColor('#555555').text(model.notes || '—', left + 10, y + 8, { width: width - 20 });
  doc.y = y + h + 4;
}

function drawAuth(doc, model) {
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  const gap = 40;
  const colW = (width - gap) / 2;
  ensureSpace(doc, 58);
  const y = doc.y + 4;
  doc.fillColor(GREY).font('Helvetica-Bold').fontSize(8).text('Prepared By', left, y);
  doc.text('Approved By', left + colW + gap, y);
  const lineY = y + 32;
  doc.save();
  doc.moveTo(left, lineY).lineTo(left + colW, lineY).strokeColor(GREY).lineWidth(0.8).stroke();
  doc
    .moveTo(left + colW + gap, lineY)
    .lineTo(left + width, lineY)
    .stroke();
  doc.restore();
  doc.fillColor(GREY).font('Helvetica').fontSize(8).text(`${model.preparedBy} / Signature / Date`, left, lineY + 5, {
    width: colW,
  });
  doc.text('Name / Title / Signature / Date', left + colW + gap, lineY + 5, { width: colW });
  doc.y = lineY + 20;
}

function drawFooter(doc, model) {
  ensureSpace(doc, 36);
  const left = doc.page.margins.left;
  const width = pageContentWidth(doc);
  const y = doc.y + 8;
  doc.save();
  doc.moveTo(left, y).lineTo(left + width, y).strokeColor(BORDER).lineWidth(0.8).stroke();
  doc.restore();
  doc.fillColor(GREY).font('Helvetica').fontSize(8).text(model.footer, left, y + 8, { width });
}

function renderQuotationPdf(model) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 32, bottom: 32, left: 36, right: 36 },
      info: {
        Title: `Quotation ${model.quotationNo}`,
        Author: 'FabNet Systems',
        Subject: `Quotation in response to ${model.rfqNumber}`,
      },
    });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawHeader(doc, model);
    drawMeta(doc, model);
    sectionBar(doc, 'BUYER / RFQ ISSUED BY');
    drawParty(doc, model.buyer);
    sectionBar(doc, 'QUOTED BY (FABNET SYSTEMS)');
    drawQuotedBy(doc, model.quotedBy);
    sectionBar(doc, 'LINE ITEM DETAILS');
    drawItemsTable(doc, model);
    drawTotals(doc, model);
    sectionBar(doc, 'COMMERCIAL & COMPLIANCE TERMS');
    drawTerms(doc, model);
    sectionBar(doc, 'NOTES, ASSUMPTIONS & EXCLUSIONS');
    drawNotes(doc, model);
    sectionBar(doc, 'AUTHORIZATION');
    drawAuth(doc, model);
    drawFooter(doc, model);
    doc.end();
  });
}

async function generateQuotationPdf(rfq) {
  assertQuotationReady(rfq);
  const model = buildQuotationModel(rfq);
  const buffer = await renderQuotationPdf(model);
  return { buffer, fileName: model.fileName, model };
}

module.exports = {
  generateQuotationPdf,
  buildQuotationModel,
  assertQuotationReady,
  quotationNumberFromRfq,
  formatMoney,
};
