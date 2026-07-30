const config = require('../config/env');
const logger = require('../utils/logger');
const { sendMail } = require('../lib/mail');
const { getPresignedGetUrl } = require('../lib/s3');

/** Presigned download links in email — 7 days */
const EMAIL_FILE_EXPIRES_IN = 60 * 60 * 24 * 7;

function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function display(value) {
  if (value == null || value === '') return '—';
  if (Array.isArray(value)) {
    const list = value.filter(Boolean);
    return list.length ? escapeHtml(list.join(', ')) : '—';
  }
  return escapeHtml(value);
}

function row(label, valueHtml) {
  return `<tr>
    <td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;width:38%;vertical-align:top;"><strong>${escapeHtml(label)}</strong></td>
    <td style="padding:8px 12px;border:1px solid #e2e8f0;vertical-align:top;">${valueHtml}</td>
  </tr>`;
}

function section(title, rowsHtml) {
  return `
    <h3 style="margin:22px 0 8px;font-size:15px;color:#0f172a;">${escapeHtml(title)}</h3>
    <table style="border-collapse:collapse;width:100%;max-width:640px;font-size:14px;color:#0f172a;">
      ${rowsHtml}
    </table>
  `;
}

function renderDocumentLinks(documents = []) {
  const withLinks = (documents || []).filter((doc) => doc?.fileName && doc?.url);
  if (!withLinks.length) return '—';

  return withLinks
    .map((doc) => {
      const name = escapeHtml(doc.fileName);
      const href = escapeHtml(doc.url);
      return `<div style="margin:0 0 6px;">
        <a href="${href}" style="color:#0f766e;text-decoration:underline;" target="_blank" rel="noopener noreferrer">${name}</a>
        <span style="color:#64748b;font-size:12px;"> — Download</span>
      </div>`;
    })
    .join('');
}

/**
 * Full RFQ details email for invited suppliers (sent on RFQ create/submit).
 * @param {object} rfq
 * @param {string} supplierName
 * @param {{ fileName: string, url: string }[]} documentLinks
 */
function buildRfqInviteHtml(rfq, supplierName, documentLinks = []) {
  const services = (rfq.processServices || [])
    .map((item) => item.service?.name)
    .filter(Boolean);

  const requestedBy = rfq.requestedBy?.name || rfq.requestedBy?.email || '—';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.5;">
      <p>Hello ${escapeHtml(supplierName || 'Supplier')},</p>
      <p>You have been invited to submit a quotation for the RFQ below. Complete details are included.</p>
      <p style="color:#64748b;font-size:13px;">Drawing / spec download links are valid for 7 days.</p>

      ${section(
        'RFQ header',
        [
          row('RFQ number', display(rfq.rfqNumber)),
          row('Title', display(rfq.title)),
          row('Client / project', display(rfq.clientProjectName)),
          row('Requested by', display(requestedBy)),
          row('Date created', display(formatDate(rfq.dateCreated))),
          row('Quote due date', display(formatDate(rfq.quoteDueDate))),
          row('Required delivery date', display(formatDate(rfq.requiredDeliveryDate))),
          row('Status', display(rfq.status)),
        ].join('')
      )}

      ${section(
        'Part details',
        [
          row('Part / assembly name', display(rfq.partName)),
          row('Part number / drawing number', display(rfq.partNumber)),
          row('Revision level', display(rfq.revisionLevel)),
          row('Drawing / spec files', renderDocumentLinks(documentLinks)),
        ].join('')
      )}

      ${section(
        'Technical requirements',
        [
          row('Process category (services)', display(services)),
          row('Material specification', display(rfq.materialSpecification)),
          row('Quantity', display(`${rfq.quantity ?? '—'} ${rfq.unitOfMeasure || ''}`.trim())),
          row('Unit of measure', display(rfq.unitOfMeasure)),
          row('Special process requirements', display(rfq.specialProcesses)),
          row('Tolerance / quality notes', display(rfq.toleranceNotes)),
        ].join('')
      )}

      ${section(
        'Compliance',
        [
          row('Required certifications', display(rfq.requiredCertifications)),
          row('ITAR / export control', display(rfq.itarExportControl ? 'Yes' : 'No')),
          row('Country of origin restriction', display(rfq.countryOfOriginRestriction)),
        ].join('')
      )}

      ${section(
        'Commercial',
        [
          row('Incoterms', display(rfq.incoterms)),
          row('Currency', display(rfq.currency)),
          row('Payment terms requested', display(rfq.paymentTerms)),
          row('Number of quotes required', display(rfq.quotesRequired)),
        ].join('')
      )}

      <p style="margin-top:24px;">Please reply with your quotation at your earliest convenience.</p>
      <p>Regards,<br/>FabNet Systems</p>
    </div>
  `.trim();
}

async function buildDocumentLinks(rfq) {
  const docs = rfq.documents || [];
  const links = [];

  for (const doc of docs) {
    if (!doc?.fileKey || !doc?.fileName) continue;
    try {
      const { url } = await getPresignedGetUrl(doc.fileKey, EMAIL_FILE_EXPIRES_IN);
      links.push({ fileName: doc.fileName, url });
    } catch (err) {
      logger.error(
        { err, rfqId: rfq.id, documentId: doc.id, fileName: doc.fileName },
        'Failed to create download link for RFQ email'
      );
      // Still show name without link if signing fails
      links.push({ fileName: doc.fileName, url: null });
    }
  }

  return links;
}

/**
 * On RFQ create/submit: email full RFQ details (with document download links)
 * to every included invitee.
 */
async function sendRfqInviteEmails(rfq) {
  const summary = { attempted: 0, sent: 0, skipped: 0, failures: [] };

  if (!config.mail.isConfigured) {
    logger.warn('RFQ invite mail skipped: Azure mail env is not configured');
    return { ...summary, skipped: 1, reason: 'mail_not_configured' };
  }

  const invites = (rfq.invites || []).filter((invite) => invite.included !== false);
  if (!invites.length) {
    return { ...summary, reason: 'no_invites' };
  }

  const documentLinks = await buildDocumentLinks(rfq);

  for (const invite of invites) {
    const toEmail = invite.supplier?.user?.email;
    const companyName = invite.supplier?.companyName || 'Supplier';
    if (!toEmail) {
      summary.skipped += 1;
      summary.failures.push({ supplierId: invite.supplierId, error: 'missing_email' });
      continue;
    }

    summary.attempted += 1;
    try {
      await sendMail({
        tenantId: config.mail.tenantId,
        clientId: config.mail.clientId,
        clientSecret: config.mail.clientSecret,
        fromEmail: config.mail.fromEmail,
        toEmail,
        subject: `RFQ ${rfq.rfqNumber}: ${rfq.title}`,
        body: buildRfqInviteHtml(rfq, companyName, documentLinks),
        bodyType: 'HTML',
      });
      summary.sent += 1;
      logger.info({ rfqId: rfq.id, toEmail, rfqNumber: rfq.rfqNumber }, 'RFQ details email sent');
    } catch (err) {
      summary.failures.push({ supplierId: invite.supplierId, toEmail, error: err.message });
      logger.error({ err, rfqId: rfq.id, toEmail }, 'RFQ details email failed');
    }
  }

  return summary;
}

/**
 * Notify FabNet when a supplier submits / updates a quote price.
 */
async function sendSupplierQuoteNotification({ rfq, quote, supplierEmail }) {
  if (!config.mail.isConfigured) {
    logger.warn('Supplier quote notification skipped: Azure mail env is not configured');
    return { sent: false, reason: 'mail_not_configured' };
  }

  const toEmail = config.mail.quoteNotifyEmail || 'info@fabnetsystems.com';
  const companyName = quote.supplier?.companyName || 'Supplier';
  const serviceName = quote.service?.name || '—';
  const currency = rfq.currency || 'USD';
  const priceLabel = `${currency} ${quote.price}`;

  const body = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.5;">
      <p>A supplier has submitted a quotation on FabNet.</p>
      ${section(
        'Quote details',
        [
          row('RFQ number', display(rfq.rfqNumber)),
          row('RFQ title', display(rfq.title)),
          row('Supplier', display(companyName)),
          row('Supplier email', display(supplierEmail)),
          row('Category', display(serviceName)),
          row('Quoted price', display(priceLabel)),
          row('Quoted at', display(formatDate(quote.updatedAt || new Date()))),
        ].join('')
      )}
      <p style="margin-top:24px;color:#64748b;font-size:13px;">Open the RFQ in FabNet to review and select a winner.</p>
    </div>
  `.trim();

  try {
    await sendMail({
      tenantId: config.mail.tenantId,
      clientId: config.mail.clientId,
      clientSecret: config.mail.clientSecret,
      fromEmail: config.mail.fromEmail,
      toEmail,
      subject: `Quote received — ${rfq.rfqNumber}: ${companyName} (${serviceName})`,
      body,
      bodyType: 'HTML',
    });
    logger.info(
      { rfqId: rfq.id, toEmail, supplierId: quote.supplierId, serviceId: quote.serviceId },
      'Supplier quote notification email sent'
    );
    return { sent: true, toEmail };
  } catch (err) {
    logger.error(
      { err, rfqId: rfq.id, toEmail, supplierId: quote.supplierId },
      'Supplier quote notification email failed'
    );
    return { sent: false, reason: err.message };
  }
}

module.exports = {
  sendRfqInviteEmails,
  sendSupplierQuoteNotification,
  buildRfqInviteHtml,
};
