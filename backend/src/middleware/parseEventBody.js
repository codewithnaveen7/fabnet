function parseEventBody(req, _res, next) {
  const { eventMessage } = req.body || {};
  if (
    eventMessage != null &&
    typeof eventMessage === 'object' &&
    !Array.isArray(eventMessage)
  ) {
    req.body = { ...eventMessage };
  }
  next();
}

module.exports = parseEventBody;
