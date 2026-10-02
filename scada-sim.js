// RTU/SCADA simulator: polls commands, operates breakers, sends telemetry. Stops sending when the link is cut.
const API=process.env.API||'http://localhost:3000',H={'content-type':'application/json','x-api-key':process.env.SCADA_KEY||'scada-demo-key'},br={};
setInterval(async()=>{try{const r=await(await fetch(API+'/api/scada/commands',{headers:H})).json();
 r.cmds.forEach(c=>br[c.id]=c.cmd=='OPEN'?'OPEN':'CLOSED');if(!r.link)return;
 await fetch(API+'/api/scada/telemetry',{method:'POST',headers:H,body:JSON.stringify(r.feeders.map(f=>({id:f.id,breaker:br[f.id]||'CLOSED',mw:Math.round(f.mw*(.85+((parseInt(f.id.slice(2))*37)%31)/100)*(.97+Math.random()*.06)*10)/10})))})}catch(e){console.error('API unreachable',e.message)}},1000);
console.log('SCADA simulator running');
