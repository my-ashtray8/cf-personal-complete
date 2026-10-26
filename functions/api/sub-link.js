import {authorized,json} from '../_lib/auth.js';
export async function onRequestGet({request,env}){
 if(!await authorized(request,env.SESSION_SECRET))return json({error:'未登录'},401);
 const missing=[];
 if(!env.VLESS_UUID)missing.push('VLESS_UUID');
 if(!env.SUB_TOKEN)missing.push('SUB_TOKEN');
 if(missing.length)return json({error:'当前部署缺少配置：'+missing.join('、')+'。请检查 Production/Preview 与部署时间。'},503);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(env.VLESS_UUID))return json({error:'VLESS_UUID 格式不正确'},503);
 if(env.SUB_TOKEN.length<24)return json({error:'SUB_TOKEN 长度建议至少 24 字符'},503);
 const url=new URL(request.url);
 return json({url:`${url.origin}/api/subscription?token=${encodeURIComponent(env.SUB_TOKEN)}`});
}
