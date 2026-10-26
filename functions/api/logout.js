import {json,sameOrigin} from '../_lib/auth.js';
export function onRequestPost({request}) {
 if(!sameOrigin(request))return json({error:'来源不匹配'},403);
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':'cfp_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'}});
}