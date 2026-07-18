const HEADER_MAP = {
  name: 'name',
  email: 'email',
  password: 'password',
  phone: 'phone',
  company_name: 'companyName',
  companyname: 'companyName',
  company: 'companyName',
  contact_person: 'contactPerson',
  contactperson: 'contactPerson',
  contact: 'contactPerson',
  address: 'address',
  services: 'services',
};

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

/** Pipe/semicolon-separated service names (e.g. Design|Manufacturing). */
function parseServices(value) {
  if (!value || !String(value).trim()) return [];
  return String(value)
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function mapRow(headers, values) {
  const row = {};
  headers.forEach((header, index) => {
    const key = HEADER_MAP[normalizeHeader(header)];
    if (!key) return;
    const value = (values[index] || '').replace(/^"|"$/g, '').trim();
    if (key === 'services') {
      row.services = parseServices(value);
    } else {
      row[key] = value;
    }
  });
  return row;
}

function parseSupplierCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const headers = parseCsvLine(lines[0]);
  const required = ['name', 'email', 'companyname', 'contactperson'];
  const normalizedHeaders = headers.map(normalizeHeader);
  const missing = required.filter((col) => !normalizedHeaders.includes(col));

  if (missing.length) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }

  return lines.slice(1).map((line, index) => ({
    row: index + 2,
    ...mapRow(headers, parseCsvLine(line)),
  }));
}

function getCsvTemplate() {
  return [
    'name,email,password,phone,company_name,contact_person,address,services',
    'John Doe,john@example.com,Supplier@123,+1-555-0100,Acme Manufacturing,John Doe,123 Main St,Design|Manufacturing',
  ].join('\n');
}

module.exports = {
  parseSupplierCsv,
  getCsvTemplate,
};
