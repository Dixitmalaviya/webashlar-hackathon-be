import crypto from 'crypto';

export function sha256OfObject(obj) {
  const json = JSON.stringify(obj, Object.keys(obj).sort());
  return '0x' + crypto.createHash('sha256').update(json).digest('hex');
}
