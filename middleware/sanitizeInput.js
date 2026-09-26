// Small dependency-free protection against Mongo operator/prototype injection.
// It removes object keys that begin with "$", contain ".", or target prototype keys.
const blockedKeys = new Set(['__proto__', 'prototype', 'constructor']);

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (!value || typeof value !== 'object') return value;

  const output = {};
  for (const [key, nested] of Object.entries(value)) {
    if (blockedKeys.has(key) || key.startsWith('$') || key.includes('.')) continue;
    output[key] = clean(nested);
  }
  return output;
}

export function sanitizeInput(req, _res, next) {
  if (req.body && typeof req.body === 'object') req.body = clean(req.body);
  // Express query is getter-backed in newer versions, so mutate safely in place.
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (blockedKeys.has(key) || key.startsWith('$') || key.includes('.')) delete req.query[key];
    }
  }
  next();
}
