import {json} from '../_lib/auth.js';
export async function onRequestGet({request,env}) {
 const u=new URL(request.url), token=u.searchParams.get('token');
 if(!env.SUB_TOKEN||!env.VLESS_UUID||!token||token!==env.SUB_TOKEN)return json({error:'Not found'},404);
 if(!env.CF_PERSONAL_KV)return json({error:'KV not bound'},503);
 const cfg=await env.CF_PERSONAL_KV.get('settings:v1','json')||{entries:[]};
 const host=u.hostname;
 const entries=(cfg.entries||[]).filter(x=>x.host&&x.port);
 if(!entries.length)return new Response('No entries configured',{status:400,headers:{'Cache-Control':'no-store'}});
 const lines=entries.map((x,i)=>{
  const params=new URLSearchParams({encryption:'none',security:'tls',sni:host,type:'ws',host,path:'/connect'});
  return `vless://${env.VLESS_UUID}@${x.host}:${x.port}?${params}#${encodeURIComponent(x.label||'CF Personal '+(i+1))}`;
 });
 const bytes=new TextEncoder().encode(lines.join('\n'));
 let str='';for(const b of bytes)str+=String.fromCharCode(b);
 return new Response(btoa(str),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
}
