import {connect} from 'cloudflare:sockets';
import {parseVless} from './_lib/vless.js';
export async function onRequest({request,env}) {
 if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
 if(!env.VLESS_UUID||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(env.VLESS_UUID))return new Response('Server not configured',{status:503});
 const pair=new WebSocketPair(),client=pair[0],ws=pair[1];ws.accept();
 let started=false,closed=false,writer;
 const close=()=>{if(closed)return;closed=true;try{writer?.releaseLock()}catch{}try{ws.close()}catch{}};
 ws.addEventListener('message',async ev=>{
  try{
   const data=ev.data instanceof ArrayBuffer?new Uint8Array(ev.data):new Uint8Array(await ev.data.arrayBuffer());
   if(!started){
    started=true;
    if(data.byteLength>65536)throw Error('Initial frame too large');
    const h=parseVless(data,env.VLESS_UUID);
    const socket=connect({hostname:h.address,port:h.port},{allowHalfOpen:false});
    writer=socket.writable.getWriter();
    await socket.opened;
    ws.send(new Uint8Array([h.version,0]));
    if(h.payload.length)await writer.write(h.payload);
    (async()=>{const reader=socket.readable.getReader();try{while(true){const {done,value}=await reader.read();if(done)break;if(ws.readyState!==1)break;ws.send(value)}}catch{}finally{reader.releaseLock();close()}})();
    socket.closed.catch(()=>{}).finally(close);
   }else if(writer){await writer.write(data)}
  }catch{close()}
 });
 ws.addEventListener('close',close);ws.addEventListener('error',close);
 return new Response(null,{status:101,webSocket:client});
}