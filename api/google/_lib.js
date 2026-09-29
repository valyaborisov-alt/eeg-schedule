import crypto from 'node:crypto';
export const CLIENT='7594138844-8nbveq6j7v7s4a88e0ikcp5tcgc2oi0u.apps.googleusercontent.com';
export const SCOPES='https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets.readonly';
export function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2))}
export function seal(s){let iv=crypto.randomBytes(12),k=crypto.createHash('sha256').update(process.env.COOKIE_SECRET).digest(),c=crypto.createCipheriv('aes-256-gcm',k,iv),ct=Buffer.concat([c.update(s,'utf8'),c.final()]),tag=c.getAuthTag();return Buffer.concat([iv,tag,ct]).toString('base64url')}
export function open(v){try{let b=Buffer.from(v,'base64url'),iv=b.subarray(0,12),tag=b.subarray(12,28),ct=b.subarray(28),k=crypto.createHash('sha256').update(process.env.COOKIE_SECRET).digest(),d=crypto.createDecipheriv('aes-256-gcm',k,iv);d.setAuthTag(tag);return Buffer.concat([d.update(ct),d.final()]).toString()}catch{return''}}
export function base(req){return 'https://'+req.headers.host}
