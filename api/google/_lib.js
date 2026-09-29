import crypto from 'node:crypto';
export const CLIENT='7594138844-8nbveq6j7v7s4a88e0ikcp5tcgc2oi0u.apps.googleusercontent.com';
export const SCOPES='openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets.readonly';
export function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2))}
export function seal(s){let iv=crypto.randomBytes(12),k=crypto.createHash('sha256').update(process.env.COOKIE_SECRET).digest(),c=crypto.createCipheriv('aes-256-gcm',k,iv),ct=Buffer.concat([c.update(s,'utf8'),c.final()]),tag=c.getAuthTag();return Buffer.concat([iv,tag,ct]).toString('base64url')}
export function open(v){try{let b=Buffer.from(v,'base64url'),iv=b.subarray(0,12),tag=b.subarray(12,28),ct=b.subarray(28),k=crypto.createHash('sha256').update(process.env.COOKIE_SECRET).digest(),d=crypto.createDecipheriv('aes-256-gcm',k,iv);d.setAuthTag(tag);return Buffer.concat([d.update(ct),d.final()]).toString()}catch{return''}}
export function base(req){return 'https://'+req.headers.host}

export function allowedUsers(){try{return JSON.parse(process.env.ALLOWED_USERS||'{}')}catch{return{}}}
export async function userFromRefresh(refresh){if(!refresh)return null;let r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:CLIENT,client_secret:process.env.GOOGLE_CLIENT_SECRET,refresh_token:refresh,grant_type:'refresh_token'})}),j=await r.json();if(!r.ok||!j.access_token)return null;let u=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+j.access_token}}),p=await u.json();if(!u.ok||!p.email)return null;let users=allowedUsers(),role=users[String(p.email).toLowerCase()]||null;return{email:p.email,name:p.name||p.email,picture:p.picture||'',role,access_token:j.access_token}}
