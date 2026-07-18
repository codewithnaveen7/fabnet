const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_BYTES = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES, files: 12 },
});

const supplierUploadFields = upload.fields([
  { name: 'cert_AS9100', maxCount: 1 },
  { name: 'cert_ISO9001', maxCount: 1 },
  { name: 'capabilityProfile', maxCount: 5 },
  { name: 'brochures', maxCount: 5 },
]);

/** Parse multipart `payload` JSON field into req.body; keep JSON body as-is. */
function parseSupplierPayload(req, _res, next) {
  if (req.is('multipart/form-data') && typeof req.body?.payload === 'string') {
    try {
      const parsed = JSON.parse(req.body.payload);
      req.body = { ...parsed, eventType: req.body.eventType || parsed.eventType };
    } catch {
      next(ApiError.badRequest('Invalid JSON in payload field'));
      return;
    }
  }
  next();
}

module.exports = {
  supplierUploadFields,
  parseSupplierPayload,
  ALLOWED_MIME,
  MAX_BYTES,
};
