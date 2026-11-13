const fs=require('fs');const d=require('./load.js');
const esc=s=>String(s);
const GX=new Function('esc',fs.readFileSync(__dirname+'/../src/b/gestures-art.js','utf8')+'\n'+fs.readFileSync(__dirname+'/../src/b/gestures.js','utf8')+';return GX;')(esc);
let tot=0,hit=0;const cnt={},miss=[],ex={};
for(const id in d.DETAILS){ for(const s of d.DETAILS[id].steps){ tot++; const k=GX.match(s); if(k){hit++;cnt[k]=(cnt[k]||0)+1;(ex[k]=ex[k]||[]).push(s);} else miss.push(s);} }
console.log('gestes',GX.keys.length,'couverture',tot,hit,(hit/tot*100).toFixed(1)+'%');
console.log(Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(x=>x.join(':')).join(' '));
console.log('non utilisés:',GX.keys.filter(k=>!cnt[k]).join(','));
if(process.argv[2]==='ex'){for(const k in ex){console.log('\n##',k);ex[k].sort(()=>Math.random()-.5).slice(0,4).forEach(s=>console.log('  ',s.slice(0,100)));}}
if(process.argv[2]==='miss') miss.slice(0,30).forEach(s=>console.log(' -',s.slice(0,110)));
if(process.argv[2]==='html'){
  const h='<!doctype html><meta charset=utf-8><style>body{margin:0;padding:16px;font-family:sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;background:#fff}figure{margin:0;border:1px solid #eee;border-radius:16px;overflow:hidden}figure svg{width:100%;height:150px;display:block}figcaption{padding:6px 10px;font-weight:700}</style>'+GX.keys.map(k=>'<figure>'+GX.art(k,'200 °C')+'<figcaption>'+k+' · '+GX.G[k].t+'</figcaption></figure>').join('');
  fs.writeFileSync(process.argv[3],h);
}
