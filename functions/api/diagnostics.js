import {authorized,json} from '../_lib/auth.js';
export async function onRequestGet({request,env}){
 if(!await authorized(request,env.SESSION_SECRET))return json({error:'未登录'},401);
 const uuid=typeof env.VLESS_UUID==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(env.VLESS_UUID);
 const token=typeof env.SUB_TOKEN==='string'&&env.SUB_TOKEN.length>=24;
 return json({environment:{adminPassword:!!env.ADMIN_PASSWORD,sessionSecret:!!env.SESSION_SECRET,kv:!!env.CF_PERSONAL_KV,vlessUuid:uuid,subToken:token},host:new URL(request.url).host,notes:'只返回配置状态，不返回密钥内容'});
}
