// Decision assistant: situation, scenarios, preview = actual allocation, flexibility handling.
import {spawn} from 'node:child_process';import os from 'node:os';import path from 'node:path';import fs from 'node:fs';
const P=3105,DB=path.join(os.tmpdir(),'gb-dec.db');for(const x of [DB,DB+'-wal',DB+'-shm'])fs.rmSync(x,{force:true});
const srv=spawn('node',['server.js'],{env:{...process.env,PORT:P,SPEED:20,DB},stdio:'ignore'}),sleep=ms=>new Promise(r=>setTimeout(r,ms));let bad=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)bad++};
const call=async(p,b,t)=>(await (await fetch(`http://localhost:${P}/api/${p}`,{method:b?'POST':'GET',headers:{authorization:'Bearer '+t},body:b&&JSON.stringify(b)})).json());
const tok=async u=>(await call('login',{user:u,pass:'demo'})).token;await sleep(4000);const [dn,ia]=await Promise.all(['dn','ind_a'].map(tok));
let z=await call('situation',{demand:4500,gen:4500,ic:0,trip:280},dn);ok(z.deficit==280&&z.plus30>280&&z.j1peak>=280,`deficit = demand - (generation - outage) - interconnections = ${z.deficit} MW, +30 min ${z.plus30} MW, J-1 peak ${z.j1peak} MW`);
let r=await call('scenarios',{},dn);ok(r.scenarios.length==3&&r.recommended=='A'&&r.scenarios[1].same,'without flexibility the recommendation is A and B equals A');
const sum=r.scenarios[0].bcc.reduce((a,x)=>a+x.mw,0);ok(Math.abs(sum-280)<.2&&Math.abs(r.scenarios[0].north-182)<.2,`reference split matches the official table (North ${r.scenarios[0].north}, Σ BCC ${sum.toFixed(1)})`);
await call('flex/request',{id:'ind_a'},dn);await call('flex/respond',{accept:true},ia);r=await call('scenarios',{},dn);
ok(r.recommended=='B'&&r.scenarios[1].flexMW==12&&r.scenarios[1].conventional==268,'after flexibility is accepted B is recommended and deducts 12 MW');
const C=r.scenarios[2];await call('orders',{mw:r.deficit,am:C.am,useFlex:C.useFlex,cause:'Scenario C'},dn);const st=await call('state',null,dn),al=Object.fromEntries(st.alloc.map(x=>[x.name,x.mw]));
ok(C.bcc.every(x=>Math.abs(al[x.bcc]-x.mw)<.11),'the previewed scenario equals the order actually created');
await call('close',{},dn);for(let i=0;i<14;i++){await sleep(500);if((await call('state',null,dn)).order.status=='Done')break}
await call('flex/request',{id:'ind_a'},dn);await call('flex/respond',{accept:true},ia);await call('orders',{mw:280,am:'STEG',useFlex:false,cause:'Scenario A'},dn);const s2=await call('state',null,dn);ok(s2.order.flex==0&&s2.flex.find(x=>x.id=='ind_a').state=='Accepted','an order without flexibility leaves accepted flexibility untouched');
const h=await call('report',null,dn);ok(h.events.some(e=>e.action=='Situation updated'&&e.actor=='dn'),'the situation assumptions are recorded in the audit trail');
srv.kill();console.log(bad?`${bad} failed`:'All decision checks passed');process.exit(bad?1:0);
