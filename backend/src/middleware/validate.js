/**
 * Lightweight request validators for sensitive write surfaces.
 * Returns clear field-level errors and never performs partial writes.
 */

function requireFields(fields = []) {
  return (req, res, next) => {
    const missing = [];
    const invalid = [];
    for (const field of fields) {
      const name = typeof field === 'string' ? field : field.name;
      const type = typeof field === 'string' ? null : field.type;
      const value = req.body?.[name];
      if (value === undefined || value === null || value === '') {
        missing.push(name);
        continue;
      }
      if (type === 'number' && Number.isNaN(Number(value))) {
        invalid.push({ field: name, message: 'Must be a number' });
      }
      if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        invalid.push({ field: name, message: 'Invalid email format' });
      }
      if (type === 'pin' && !/^\d{4,6}$/.test(String(value))) {
        invalid.push({ field: name, message: 'PIN must be 4–6 digits' });
      }
    }
    if (missing.length || invalid.length) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed. No changes were written.',
        errors: {
          missing,
          invalid,
        },
      });
    }
    next();
  };
}

function sanitizeString(value, maxLen = 500) {
  if (value == null) return null;
  return String(value).trim().slice(0, maxLen);
}

module.exports = {
  requireFields,
  sanitizeString,
};
