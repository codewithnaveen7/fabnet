const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

async function getAccessToken({ tenantId, clientId, clientSecret }) {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: GRAPH_SCOPE,
    grant_type: 'client_credentials',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Token fetch failed: ${data.error_description || JSON.stringify(data)}`);
  }

  return data.access_token;
}

/**
 * Send email via Microsoft Graph API.
 * Azure App Registration needs Mail.Send (Application) + admin consent.
 */
async function sendMail({
  tenantId,
  clientId,
  clientSecret,
  fromEmail,
  toEmail,
  subject,
  body,
  bodyType = 'HTML',
  cc = [],
  saveToSentItems = true,
}) {
  const accessToken = await getAccessToken({ tenantId, clientId, clientSecret });

  const toRecipients = (Array.isArray(toEmail) ? toEmail : [toEmail])
    .filter(Boolean)
    .map((email) => ({
      emailAddress: { address: email },
    }));

  if (!toRecipients.length) {
    throw new Error('At least one recipient email is required');
  }

  const ccRecipients = (Array.isArray(cc) ? cc : [])
    .filter(Boolean)
    .map((email) => ({
      emailAddress: { address: email },
    }));

  const payload = {
    message: {
      subject,
      body: {
        contentType: bodyType,
        content: body,
      },
      toRecipients,
      ...(ccRecipients.length > 0 ? { ccRecipients } : {}),
    },
    saveToSentItems,
  };

  const response = await fetch(
    `${GRAPH_BASE_URL}/users/${encodeURIComponent(fromEmail)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Send mail failed (${response.status}): ${errorText}`);
  }

  return { success: true, from: fromEmail, to: toEmail, subject };
}

module.exports = {
  sendMail,
  getAccessToken,
};
