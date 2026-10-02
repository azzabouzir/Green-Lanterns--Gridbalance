// Traceability, protected sites, audit integrity and learning checks.
import {spawn} from 'node:child_process';import {DatabaseSync} from 'node:sqlite';import os from 'node:os';import path from 'node:path';import fs from 'node:fs';
const P=3101,DB=path.join(os.tmpdir(),'gb-trace.db');for(const x of [DB,DB+'-wal',DB+'-shm'])fs.rmSync(x,{force:true});
const env={...process.env,PORT:P,SPEED:20,DB},srv=spawn('node',['server.js'],{env,stdio:'ignore'}),sim=spawn('node',['scada-sim.js'],{env:{...env,API:'http://localhost:'+P},stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let bad=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)bad++};
const call=async(p,b,t)=>{const r=await fetch(`http://localhost:${P}/api/${p}`,{method:b?'POST':'GET',headers:{authorization:'Bearer '+t},body:b&&JSON.stringify(b)});return{s:r.status,j:await r.json()}};
const tok=async u=>(await call('login',{user:u,pass:'demo'})).j.token;
await sleep(2500);const [dn,cn,so,ad]=await Promise.all(['dn','crc_north','bcc_sousse','admin'].map(tok));
async function cycle(first){await call('orders',{mw:120},dn);
 if(first){ok((await call('execute',{},so)).s==409,'BCC cannot execute before the CRC acknowledges and the BCC accepts');ok((await call('accept',{},so)).s==409,'BCC cannot accept before the CRC acknowledges')}
 await call('accept',{},cn);await call('accept',{},so);const ex=await call('execute',{},so);ok(ex.s==200,'BCC executes after acceptance');for(let i=0;i<20;i++){await sleep(500);if((await call('state',null,so)).j.kpi.open>0)break}await sleep(1500);
 const st=(await call('state',null,dn)).j,f=st.flow;ok(f.created.by=='dn'&&f.ack[0].by=='crc_north'&&f.accepted[0].by=='bcc_sousse'&&f.executed[0].by=='bcc_sousse','chain records who set, acknowledged, accepted, executed');
 await call('close',{},dn);for(let i=0;i<14;i++){await sleep(500);if((await call('state',null,dn)).j.order.status=='Done')break}}
await cycle(true);
const bs=(await call('state',null,so)).j,crit=bs.feeders.find(f=>f.crit);
let r=await call('command',{id:crit.id,cmd:'OPEN'},so);ok(r.s==403&&/Protected/.test(r.j.error),'manual cut on a protected feeder is blocked and names the site');
ok(bs.sites.length>=3&&bs.sites.some(x=>x.type=='Hospital'),'protected sites registry is visible');
ok((await call('sites',{name:'X',type:'Hospital',feeder:'F-101'},so)).s==403,'a BCC cannot register protected sites');
ok((await call('sites/remove',{id:1,reason:''},ad)).s==400,'removing protection requires a written reason');
ok((await call('sites',{name:'New Clinic',type:'Hospital',feeder:'F-101'},ad)).s==200&&(await call('state',null,ad)).j.feeders.find(f=>f.id=='F-101').crit==1,'admin can protect a new site and its feeder becomes protected');
await cycle(false);
const L=(await call('state',null,dn)).j.learn.bcc.find(x=>x.bcc=='Sousse');ok(L.orders>=2&&L.factor>=.85&&L.factor<=1.15,`learning rows recorded (orders ${L.orders}, plan error ${L.planErr} MW, factor ${L.factor})`);
let v=(await call('audit/verify',null,dn)).j;ok(v.ok&&v.checked>20,`audit chain intact (${v.checked} records)`);
const h=(await call('history',null,dn)).j;ok(h.orders[0].created.by=='dn'&&h.orders[0].accepted[0].by=='bcc_sousse','history lists who set and accepted each order');
const d=new DatabaseSync(DB);d.exec("update events set detail='tampered' where id=5");d.close();v=(await call('audit/verify',null,dn)).j;ok(v.ok===false&&v.brokenAt==5,'tampering with a past record is detected');
srv.kill();sim.kill();console.log(bad?`${bad} failed`:'All traceability checks passed');process.exit(bad?1:0);
