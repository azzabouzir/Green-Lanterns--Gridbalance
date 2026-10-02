// Verifies the allocation against the official tables (STEG "Délestage manuel": CRC Nord/Sud tables).
import {spawn} from 'node:child_process';
const P=3100,srv=spawn('node',['server.js'],{env:{...process.env,PORT:P,SPEED:20,DB:':memory:'},stdio:'ignore'}),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const call=async(p,b,t)=>(await fetch(`http://localhost:${P}/api/${p}`,{method:b?'POST':'GET',headers:{authorization:'Bearer '+t},body:b&&JSON.stringify(b)})).json();
const T=[[120,78,42,[31.2,31.2,15.6,0],[14.7,14.7,12.6]],[180,117,63,[46.8,46.8,23.4,0],[22.05,22.05,18.9]],[200,130,70,[52,52,26,0],[24.5,24.5,21]],
 [280,182,98,[65,67.5,33.8,15.6],[35.7,35.7,26.6]],[420,273,147,[87.75,94.9,47.45,42.9],[55.3,55.3,36.4]],[500,325,175,[100.75,110.5,55.25,58.5],[66.5,66.5,42]]];
let bad=0;await sleep(1500);const dn=(await call('login',{user:'dn',pass:'demo'})).token;
for(const [mw,n,s,N,S] of T){await call('orders',{mw},dn);const st=await call('state',null,dn),a=Object.fromEntries(st.alloc.map(x=>[x.name,x.mw]));
 const exp={North:n,South:s,Grombalia:N[0],Sousse:N[1],Beja:N[2],Tunis:N[3],Sfax:S[0],Gabes:S[1],Gafsa:S[2]};
 for(const k in exp)if(Math.abs((a[k]??-99)-exp[k])>.2){bad++;console.log(`FAIL ${mw} MW ${k}: got ${a[k]}, expected ${exp[k]}`)}
 console.log(`${mw} MW: North ${a.North} / South ${a.South} | Tunis ${a.Tunis} Grombalia ${a.Grombalia} Sousse ${a.Sousse} Beja ${a.Beja} | Gafsa ${a.Gafsa} Sfax ${a.Sfax} Gabes ${a.Gabes}`);
 await call('close',{},dn);for(let i=0;i<12;i++){await sleep(500);if((await call('state',null,dn)).order.status=='Done')break}}
srv.kill();console.log(bad?`${bad} mismatches`:'All allocations match the official tables');process.exit(bad?1:0);
