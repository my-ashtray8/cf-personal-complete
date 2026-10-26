import {issue,json,sameOrigin} from '../_lib/auth.js';
export async function onRequestPost({request,env}) {
 if(!sameOrigin(request))return json({error:'来源不匹配'},403);
 if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET)return json({error:'请先配置后台密钥'},503);
 let body;try{body=await request.json()}catch{return json({error:'请求格式错误'},400)}
 if(typeof body.password!=='string'||body.password!==env.ADMIN_PASSWORD)return json({error:'密码错误'},401);
 const token=await issue(env.SESSION_SECRET);
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':`cfp_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`}});
}