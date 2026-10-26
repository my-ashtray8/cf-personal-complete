const $=id=>document.getElementById(id);
let config={entries:[],proxyIPs:[]};
async function call(path,options={}){const r=await fetch('/api/'+path,{credentials:'same-origin',...options});const d=await r.json();if(!r.ok)throw Error(d.error||'请求失败');return d}
function el(tag,attrs={}){const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='text')e.textContent=v;else if(k==='class')e.className=v;else e.setAttribute(k,v)}return e}
function field(value,placeholder,type='text'){const e=el('input',{placeholder,type});e.value=value;return e}
function render(){
 $('entries').replaceChildren();config.entries.forEach((x,i)=>{const r=el('div',{class:'grid'}),h=field(x.host,'入口 IP 或域名'),p=field(x.port,'端口','number'),l=field(x.label,'备注'),b=el('button',{class:'secondary',text:'删除'});h.oninput=()=>x.host=h.value.trim();p.oninput=()=>x.port=Number(p.value);l.oninput=()=>x.label=l.value;b.onclick=()=>{config.entries.splice(i,1);render()};r.append(h,p,l,b);$('entries').append(r)});
 $('proxies').replaceChildren();config.proxyIPs.forEach((x,i)=>{const r=el('div',{class:'proxy'}),h=field(x,'ProxyIP 域名或 IP'),b=el('button',{class:'secondary',text:'删除'});h.oninput=()=>config.proxyIPs[i]=h.value.trim();b.onclick=()=>{config.proxyIPs.splice(i,1);render()};r.append(h,b);$('proxies').append(r)});
}
async function load(){try{config=await call('config');$('login').classList.add('hidden');$('app').classList.remove('hidden');$('logout').classList.remove('hidden');render()}catch{$('login').classList.remove('hidden');$('app').classList.add('hidden')}}
$('loginForm').onsubmit=async e=>{e.preventDefault();try{await call('login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('password').value})});$('password').value='';await load()}catch(err){alert(err.message)}};
$('addEntry').onclick=()=>{config.entries.push({host:'',port:443,label:''});render()};
$('addProxy').onclick=()=>{config.proxyIPs.push('');render()};
$('save').onclick=async()=>{try{await call('config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(config)});$('status').textContent='✓ 已保存'}catch(e){$('status').textContent='保存失败：'+e.message}};
$('logout').onclick=async()=>{await call('logout',{method:'POST'});location.reload()};
load();

$('getSub').onclick=async()=>{try{const d=await call('sub-link');$('subUrl').value=d.url}catch(e){alert(e.message)}};
$('copySub').onclick=async()=>{if(!$('subUrl').value)return;try{await navigator.clipboard.writeText($('subUrl').value);alert('已复制')}catch{ $('subUrl').select();alert('请手动复制选中的链接')}};

$('diagnose').onclick=async()=>{try{const d=await call('diagnostics');$('diagResult').textContent='当前域名：'+d.host+'\n'+Object.entries(d.environment).map(([k,v])=>k+'：'+(v?'✓ 正常':'✗ 缺失或格式错误')).join('\n')}catch(e){$('diagResult').textContent='检查失败：'+e.message}};
