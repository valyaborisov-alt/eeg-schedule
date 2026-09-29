const CLIENT='7594138844-8nbveq6j7v7s4a88e0ikcp5tcgc2oi0u.apps.googleusercontent.com';
const SCOPES='https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets.readonly';
const te=new TextEncoder(),td=new TextDecoder();
function b64(a){return btoa(String.fromCharCode(...new Uint8Array(a))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function ub64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function key(secret){return crypto.subtle.importKey('raw',te.encode(secret),'AES-GCM',false,['encrypt','decrypt'])}
async function seal(text,secret){let iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(secret),te.encode(text));return b64(iv)+'.'+b64(ct)}
async function open(v,secret){let [a,b]=String(v||'').split('.');if(!a||!b)return'';try{return td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(a)},await key(secret),ub64(b)))}catch{return''}}
function cookie(req,n){let m=(req.headers.get('Cookie')||'').match(new RegExp('(?:^|;\\s*)'+n+'=([^;]+)'));return m?decodeURIComponent(m[1]):''}
function json(x,s=200,h={}){return new Response(JSON.stringify(x),{status:s,headers:{'content-type':'application/json;charset=utf-8',...h}})}
export default {
 async fetch(request,env){
  let u=new URL(request.url),origin=u.origin,redirect=origin+'/api/google/callback';
  if(u.pathname==='/api/google/login'){
   if(!env.GOOGLE_CLIENT_SECRET||!env.COOKIE_SECRET)return new Response('OAuth secrets are not configured',{status:503});
   let state=crypto.randomUUID(),auth=new URL('https://accounts.google.com/o/oauth2/v2/auth');
   auth.search=new URLSearchParams({client_id:CLIENT,redirect_uri:redirect,response_type:'code',scope:SCOPES,access_type:'offline',prompt:'consent',include_granted_scopes:'true',state}).toString();
   return new Response(null,{status:302,headers:{Location:auth.toString(),'Set-Cookie':'eeg_oauth_state='+state+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600'}});
  }
  if(u.pathname==='/api/google/callback'){
   if(u.searchParams.get('state')!==cookie(request,'eeg_oauth_state'))return new Response('Invalid OAuth state',{status:400});
   let code=u.searchParams.get('code');if(!code)return new Response('Google authorization was cancelled',{status:400});
   let r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:CLIENT,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:redirect,grant_type:'authorization_code'})}),j=await r.json();
   if(!r.ok||!j.refresh_token)return json({error:j.error||'no_refresh_token',details:j.error_description||''},400);
   let enc=await seal(j.refresh_token,env.COOKIE_SECRET);
   return new Response(null,{status:302,headers:{Location:'/?google=connected','Set-Cookie':'eeg_google_refresh='+encodeURIComponent(enc)+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=15552000'}});
  }
  if(u.pathname==='/api/google/token'){
   if(!env.GOOGLE_CLIENT_SECRET||!env.COOKIE_SECRET)return json({connected:false,error:'server_not_configured'},503);
   let enc=cookie(request,'eeg_google_refresh'),refresh=await open(enc,env.COOKIE_SECRET);if(!refresh)return json({connected:false},401);
   let r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:CLIENT,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:refresh,grant_type:'refresh_token'})}),j=await r.json();
   if(!r.ok)return json({connected:false,error:j.error||'refresh_failed'},401);
   return json({connected:true,access_token:j.access_token,expires_in:j.expires_in});
  }
  if(u.pathname==='/api/google/logout')return json({ok:true},200,{'Set-Cookie':'eeg_google_refresh=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'});
  return env.ASSETS.fetch(request);
 }
};