const enc = new TextEncoder();
const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
async function signature(secret, message) {
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return b64(await crypto.subtle.sign('HMAC',key,enc.encode(message)));
}
export async function issue(secret) {
 const exp=Math.floor(Date.now()/1000)+8*3600;
 const body=`v1.${exp}`;
 return `${body}.${await signature(secret,body)}`;
}
export async function authorized(request,secret) {
 if(!secret) return false;
 const cookie=request.headers.get('Cookie')||'';
 const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('cfp_session='))?.slice(12);
 if(!token || !/^v1\.\d+\.[\w-]+$/.test(token)) return false;
 const [v,e,s]=token.split('.');
 if(Number(e)<Date.now()/1000) return false;
 const expected=await signature(secret,`${v}.${e}`);
 if(s.length!==expected.length)return false;
 let diff=0;for(let i=0;i<s.length;i++)diff|=s.charCodeAt(i)^expected.charCodeAt(i);
 return diff===0;
}
export const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function sameOrigin(request) {
 const origin=request.headers.get('Origin');
 return origin===new URL(request.url).origin;
}