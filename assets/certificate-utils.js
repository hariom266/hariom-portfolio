export function certificateFile(value) {
  if (typeof value !== 'string' || !/^\.\/assets\/certificates\/[a-zA-Z0-9_-]+\.(pdf|jpe?g|png|webp)$/i.test(value)) return null;
  return {path:value,pdf:/\.pdf$/i.test(value)};
}
export function verificationUrl(value) {
  if (!value) return '';
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
