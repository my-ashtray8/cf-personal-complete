export function parseVless(data, uuid) {
 const b=new Uint8Array(data);
 if(b.length<24)throw Error('Header too short');
 const hex=Array.from(b.slice(1,17),x=>x.toString(16).padStart(2,'0')).join('');
 const got=`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
 if(got.toLowerCase()!==uuid.toLowerCase())throw Error('Unauthorized');
 let n=18+b[17]; if(b.length<n+4)throw Error('Incomplete header');
 const cmd=b[n++];if(cmd!==1)throw Error('Only TCP is supported');
 const port=(b[n++]<<8)|b[n++],type=b[n++];
 let address;
 if(type===1){if(b.length<n+4)throw Error('Incomplete IPv4');address=Array.from(b.slice(n,n+4)).join('.');n+=4}
 else if(type===2){const len=b[n++];if(!len||b.length<n+len)throw Error('Incomplete domain');address=new TextDecoder('utf-8',{fatal:true}).decode(b.slice(n,n+len));n+=len}
 else if(type===3){throw Error('IPv6 is not supported in this version')}
 else throw Error('Invalid address type');
 if(![80,443,8080,8443,2052,2053,2082,2083,2086,2087,2095,2096,8880].includes(port))throw Error('Destination port not allowed');
 if(!/^[a-z0-9.-]{1,253}$/i.test(address)||address.includes('..')||address.endsWith('.'))throw Error('Invalid host');
 const a=address.toLowerCase();
 if(a==='localhost'||a.endsWith('.localhost')||a.endsWith('.local')||a.endsWith('.internal')||a.endsWith('.test')||a.endsWith('.invalid')||a.endsWith('.example')||a.endsWith('.onion'))throw Error('Host blocked');
 if(/^\d+\.\d+\.\d+\.\d+$/.test(a)){
 const q=a.split('.').map(Number);
 if(q.some(v=>v>255)||q[0]===0||q[0]===10||q[0]===127||q[0]>=224||q[0]===169&&q[1]===254||q[0]===172&&q[1]>=16&&q[1]<=31||q[0]===192&&q[1]===168||q[0]===100&&q[1]>=64&&q[1]<=127||q[0]===192&&q[1]===0||q[0]===198&&q[1]>=18&&q[1]<=19)throw Error('IP blocked');
 }
 return {version:b[0],address,port,payload:b.slice(n)};
}