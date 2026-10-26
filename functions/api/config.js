import {authorized,json,sameOrigin} from '../_lib/auth.js';
const KEY='settings:v1';
const defaults={entries:[],proxyIPs:[]};
export async function onRequestGet({request,env}) {
 if(!await authorized(request,env.SESSION_SECRET))return json({error:'未登录'},401);
 if(!env.CF_PERSONAL_KV)return json({error:'未绑定 KV'},503);
 return json(await env.CF_PERSONAL_KV.get(KEY,'json')||defaults);
}
export async function onRequestPut({request,env}) {
 if(!await authorized(request,env.SESSION_SECRET))return json({error:'未登录'},401);
 if(!sameOrigin(request))return json({error:'来源不匹配'},403);
 if(!env.CF_PERSONAL_KV)return json({error:'未绑定 KV'},503);
 let data;try{data=await request.json()}catch{return json({error:'JSON 格式错误'},400)}
 const validHost=s=>typeof s==='string'&&s.length<=253&&/^(?=.{1,253}$)[a-zA-Z0-9.:-]+$/.test(s)&&!s.includes('..');
 if(!data||!Array.isArray(data.entries)||!Array.isArray(data.proxyIPs)||data.entries.length>50||data.proxyIPs.length>20)return json({error:'数据数量不合法'},400);
 if(!data.entries.every(x=>x&&validHost(x.host)&&Number.isInteger(x.port)&&x.port>=1&&x.port<=65535&&typeof x.label==='string'&&x.label.length<=40))return json({error:'入口参数不合法'},400);
 if(!data.proxyIPs.every(validHost))return json({error:'ProxyIP 参数不合法'},400);
 const clean={entries:data.entries.map(({host,port,label})=>({host,port,label})),proxyIPs:data.proxyIPs};
 await env.CF_PERSONAL_KV.put(KEY,JSON.stringify(clean));
 return json({ok:true});
}