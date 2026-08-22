const C=document.getElementById('c'),X=C.getContext('2d');
let W,H,running=false,G=null,shopOpen=false,invOpen=false,chatFocused=false,paused=false;
let K={},MX=0,MY=0,mouseDown=false,playerName='';
const MP_SERVER_URL='';
const DPR=Math.min(window.devicePixelRatio||1,2);
let lastT=0,dt=1;
function resize(){W=innerWidth;H=innerHeight;C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);C.style.width=W+'px';C.style.height=H+'px';X.setTransform(DPR,0,0,DPR,0,0)}
addEventListener('resize',resize);resize();
addEventListener('keydown',e=>{
  K[e.key.toLowerCase()]=1;
  if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();
  if(e.key==='Escape'){if(shopOpen)closeShop();else if(invOpen)invOpen=false;else if(chatFocused)chatFocused=false;else togglePause()}
  if(e.key.toLowerCase()==='tab'){e.preventDefault();if(!shopOpen)invOpen=!invOpen}
  if(e.key==='Enter'&&chatFocused){sendChat();e.preventDefault();return}
});
addEventListener('keyup',e=>{K[e.key.toLowerCase()]=0});
C.addEventListener('mousemove',e=>{MX=e.clientX;MY=e.clientY});
C.addEventListener('mousedown',e=>{if(e.button===0)mouseDown=true});
C.addEventListener('mouseup',e=>{if(e.button===0)mouseDown=false});
C.addEventListener('contextmenu',e=>e.preventDefault());
function dst(a,b,c,d){return Math.hypot(c-a,d-b)}
function rn(a,b){return Math.random()*(b-a)+a}
function rI(a,b){return Math.floor(rn(a,b+1))}
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
function lerp(a,b,t){return a+(b-a)*Math.min(1,Math.max(0,t))}
function saveData(d){try{localStorage.setItem('pbSave',JSON.stringify(d))}catch(e){}}
function loadData(){try{return JSON.parse(localStorage.getItem('pbSave'))}catch(e){return null}}
function saveLB(e){try{let lb=JSON.parse(localStorage.getItem('pbLB')||'[]');const idx=lb.findIndex(x=>x.id===e.id);if(idx>=0){if(e.wave>lb[idx].wave||(e.wave===lb[idx].wave&&e.kills>lb[idx].kills))lb[idx]=e}else lb.push(e);lb.sort((a,b)=>b.wave-a.wave||b.kills-a.kills||b.lv-a.lv);localStorage.setItem('pbLB',JSON.stringify(lb.slice(0,20)))}catch(e){}}
function loadLB(){try{return JSON.parse(localStorage.getItem('pbLB')||'[]')}catch(e){return[]}}
function drawWarrior(ctx,x,y,frame,face,armor,wpn,atkF){
  const sk='#FFD5A0',skS='#E0A878',hr='#3A1F12',hrL='#5A3420';
  const ac=[['#2855AA','#1C3D7A','#3A6BD0'],['#4488BB','#336699','#5AA0D0'],['#AA3333','#882222','#CC4444']];
  const sc=armor>=0?ac[Math.min(armor,2)]:['#2855AA','#1C3D7A','#3A6BD0'];
  const ph=frame*1.0472,sw=Math.sin(ph),cw=Math.cos(ph);
  const bob=Math.abs(cw)*-2;
  const fl=face==='left'?-1:1;
  const cx=x+16,cy=y+26;
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(cx,y+52,17,6,0,0,Math.PI*2);ctx.fill();
  const legA=sw*5,legB=-sw*5,liftA=Math.max(0,sw)*2.5,liftB=Math.max(0,-sw)*2.5;
  const legG=(lx,ly)=>ctx.createLinearGradient(0,ly,0,ly+14);
  // pierna trasera
  const lg2=legG(0,0);lg2.addColorStop(0,'#4A3524');lg2.addColorStop(1,'#2A1C10');
  ctx.fillStyle=lg2;ctx.fillRect(x+6+legB,y+36+bob-liftB,8,14);
  ctx.fillStyle='#3E2A18';ctx.fillRect(x+6+legB,y+46+bob-liftB,9,6);
  ctx.fillStyle='#2A1C10';ctx.fillRect(x+6+legB,y+50+bob-liftB,9,3);
  // torso + armadura
  const bg=ctx.createLinearGradient(0,y+20,0,y+40);bg.addColorStop(0,sc[0]);bg.addColorStop(0.5,sc[1]);bg.addColorStop(1,'#14204a');
  ctx.fillStyle=bg;ctx.fillRect(x+3,y+20+bob,26,20);
  ctx.fillStyle='rgba(255,255,255,0.22)';ctx.fillRect(x+4,y+21+bob,24,3);
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(x+4,y+37+bob,24,3);
  ctx.fillStyle='#8B6914';ctx.fillRect(x+3,y+30+bob,26,4);
  ctx.fillStyle='#C9A227';ctx.fillRect(x+3,y+30+bob,26,1);
  ctx.fillStyle='#FFD700';ctx.fillRect(x+13,y+30+bob,6,4);
  // pecho placa
  ctx.fillStyle=sc[2];ctx.fillRect(x+10,y+24+bob,12,5);
  ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=1;ctx.strokeRect(x+3,y+20+bob,26,20);
  // hombreras
  ctx.fillStyle=sc[0];ctx.fillRect(x+1,y+21+bob,7,7);ctx.fillRect(x+24,y+21+bob,7,7);
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x+2,y+22+bob,5,2);ctx.fillRect(x+25,y+22+bob,5,2);
  // brazo trasero
  const armA=-sw*4;
  ctx.fillStyle=sk;ctx.fillRect(x+1,y+24+bob+armA*0.3,6,9);
  ctx.fillStyle='#B57B4A';ctx.fillRect(x+1,y+31+bob+armA*0.3,6,4);
  // pierna delantera
  const lg1=legG(0,0);lg1.addColorStop(0,'#5A4028');lg1.addColorStop(1,'#3A2714');
  ctx.fillStyle=lg1;ctx.fillRect(x+18+legA,y+36+bob-liftA,8,14);
  ctx.fillStyle='#4E3418';ctx.fillRect(x+18+legA,y+46+bob-liftA,9,6);
  ctx.fillStyle='#2A1C10';ctx.fillRect(x+18+legA,y+50+bob-liftA,9,3);
  // cabeza
  ctx.fillStyle=hr;ctx.fillRect(x+8,y-2+bob,16,8);
  ctx.fillStyle=hrL;ctx.fillRect(x+8,y-2+bob,16,2);
  const fg=ctx.createLinearGradient(0,y+4,0,y+16);fg.addColorStop(0,sk);fg.addColorStop(1,skS);
  ctx.fillStyle=fg;ctx.fillRect(x+7,y+4+bob,18,13);
  // ojos: blancos (2 ojos, dentro de la cara x+7..x+25)
  const exL=x+9,exR=x+18,ey=y+7+bob;
  ctx.fillStyle='#FFF';ctx.fillRect(exL,ey,5,5);ctx.fillRect(exR,ey,5,5);
  // pupilas se desplazan dentro de cada ojo segun direccion
  const pdx=fl>0?2:(fl<0?0:1);
  ctx.fillStyle='#2E1A0F';ctx.fillRect(exL+pdx,ey+1,2,4);ctx.fillRect(exR+pdx,ey+1,2,4);
  ctx.fillStyle='#FFF';ctx.fillRect(exL+pdx,ey+1,1,1);ctx.fillRect(exR+pdx,ey+1,1,1);
  ctx.fillStyle=hr;ctx.fillRect(exL,ey-1,5,1);ctx.fillRect(exR,ey-1,5,1);
  ctx.fillStyle='#CC8866';ctx.fillRect(x+13,y+14+bob,5,2);
  // nariz centrada en la cara
  ctx.fillStyle='#E0A878';ctx.fillRect(x+15,y+11+bob,2,2);
  // casco
  const hg2=ctx.createLinearGradient(0,y-8,0,y);hg2.addColorStop(0,'#7A6040');hg2.addColorStop(1,'#4A3E2F');
  ctx.fillStyle=hg2;ctx.fillRect(x+7,y-8+bob,18,7);
  ctx.fillStyle='#8B7334';ctx.fillRect(x+9,y-9+bob,14,2);
  ctx.fillStyle='#5A4A30';ctx.fillRect(x+6,y-6+bob,2,6);ctx.fillRect(x+24,y-6+bob,2,6);
  // brazo delantero
  const armF=sw*4;
  ctx.fillStyle=sk;ctx.fillRect(x+24,y+25+bob+armF*0.3,6,9);
  ctx.fillStyle='#B57B4A';ctx.fillRect(x+24,y+32+bob+armF*0.3,6,4);
  // arma
  if(wpn===0){
    if(atkF>0){
      const ang=G?Math.atan2(G.mwy-(y+32),G.mwx-(cx)):0;
      const sx=cx+Math.cos(ang)*22,sy=y+28+Math.sin(ang)*16;
      ctx.save();ctx.translate(sx,sy);ctx.rotate(ang-0.3);
      const bl=ctx.createLinearGradient(-2.5,0,2.5,0);bl.addColorStop(0,'#7A7A7A');bl.addColorStop(0.5,'#F0F0F0');bl.addColorStop(1,'#7A7A7A');
      ctx.fillStyle=bl;ctx.fillRect(-2.5,-22,5,22);ctx.fillStyle='#FFF';ctx.fillRect(-1.5,-25,3,5);
      ctx.fillStyle='#8B4513';ctx.fillRect(-5,-3,10,5);ctx.fillStyle='#C9A227';ctx.fillRect(-5,-3,10,1.5);
      ctx.fillStyle='#FFD700';ctx.fillRect(-1,-1,2,2);
      ctx.restore();
    }else{const bl2=ctx.createLinearGradient(0,0,5,0);bl2.addColorStop(0,'#8A8A8A');bl2.addColorStop(1,'#F0F0F0');ctx.fillStyle=bl2;ctx.fillRect(x+28,y+24+bob,5,18);ctx.fillStyle='#FFF';ctx.fillRect(x+29,y+20+bob,3,7);ctx.fillStyle='#8B4513';ctx.fillRect(x+27,y+22+bob,7,4);ctx.fillStyle='#C9A227';ctx.fillRect(x+27,y+22+bob,7,1)}
  }else if(wpn===1){
    ctx.strokeStyle='#5C3317';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x+6,y+26,16,0.3,2.8);ctx.stroke();
    ctx.strokeStyle='#8B5A2B';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x+6,y+26,16,0.3,2.8);ctx.stroke();
    ctx.strokeStyle='#F0F0F0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+6+Math.cos(0.3)*16,y+26+Math.sin(0.3)*16);ctx.lineTo(x+6+Math.cos(2.8)*16,y+26+Math.sin(2.8)*16);ctx.stroke();
  }else{
    ctx.fillStyle='#6B3A2A';ctx.fillRect(x+26,y+12+bob,4,32);
    const orbg=ctx.createRadialGradient(x+28,y+12,2,x+28,y+12,10);orbg.addColorStop(0,'#FFFFFF');orbg.addColorStop(0.4,'#CC66FF');orbg.addColorStop(1,'rgba(153,51,255,0)');
    ctx.fillStyle=orbg;ctx.beginPath();ctx.arc(x+28,y+12,10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#9933FF';ctx.beginPath();ctx.arc(x+28,y+12,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#CC66FF';ctx.beginPath();ctx.arc(x+28,y+12,3,0,Math.PI*2);ctx.fill();
  }
}
function drawGoblin(ctx,x,y,frame,hurt){
  const c=hurt?'#FF6666':'#3A8C3A',d=hurt?'#CC4444':'#2D6B2D',cL=hurt?'#FF8888':'#58B458';
  const ph=frame*1.0472,sw=Math.sin(ph),cw=Math.cos(ph);
  const bob=Math.abs(cw)*-1.5;
  const cx=x+12,cy=y+12;
  ctx.fillStyle='rgba(0,0,0,0.24)';ctx.beginPath();ctx.ellipse(cx,y+28,13,5,0,0,Math.PI*2);ctx.fill();
  // piernas
  ctx.fillStyle=d;ctx.fillRect(x+5+sw*3,y+22+bob,6,8);ctx.fillRect(x+13-sw*3,y+22+bob,6,8);
  ctx.fillStyle='#1E4A1E';ctx.fillRect(x+4+sw*3,y+28+bob,8,3);ctx.fillRect(x+12-sw*3,y+28+bob,8,3);
  // cuerpo
  const bg=ctx.createLinearGradient(0,y,0,y+22);bg.addColorStop(0,cL);bg.addColorStop(1,c);
  ctx.fillStyle=bg;ctx.fillRect(x+2,y+6+bob,20,18);
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(x+3,y+7+bob,18,2);
  ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(x+3,y+22+bob,18,2);
  // barriga
  ctx.fillStyle='#4A9C4A';ctx.fillRect(x+6,y+16+bob,12,8);
  // brazos colgantes balanceandose
  ctx.fillStyle=c;ctx.fillRect(x-2,y+7+bob-sw*2,5,8);ctx.fillRect(x+21,y+7+bob+sw*2,5,8);
  ctx.fillStyle=d;ctx.fillRect(x-2,y+13+bob-sw*2,5,3);ctx.fillRect(x+21,y+13+bob+sw*2,5,3);
  // orejas
  const earg=ctx.createLinearGradient(0,y-8,0,y);earg.addColorStop(0,d);earg.addColorStop(1,c);
  ctx.fillStyle=earg;ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x-2,y-9);ctx.lineTo(x+3,y-3);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(x+20,y);ctx.lineTo(x+26,y-9);ctx.lineTo(x+21,y-3);ctx.closePath();ctx.fill();
  // cabeza
  const hg=ctx.createLinearGradient(0,y-6,0,y+4);hg.addColorStop(0,cL);hg.addColorStop(1,c);
  ctx.fillStyle=hg;ctx.fillRect(x+4,y-4+bob,16,12);
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(x+5,y-3+bob,14,2);
  // ojos
  ctx.fillStyle='#FFE040';ctx.fillRect(x+6,y+1+bob,5,5);ctx.fillRect(x+13,y+1+bob,5,5);
  ctx.fillStyle='#C00';ctx.fillRect(x+7,y+2+bob,3,3);ctx.fillRect(x+14,y+2+bob,3,3);
  ctx.fillStyle='#600';ctx.fillRect(x+8,y+3+bob,1,1);ctx.fillRect(x+15,y+3+bob,1,1);
  // cejas enfadadas
  ctx.fillStyle='#1E4A1E';ctx.fillRect(x+5,y+bob,6,1.5);ctx.fillRect(x+13,y+bob,6,1.5);
  // boca con dientes
  ctx.fillStyle='#400';ctx.fillRect(x+8,y+8+bob,9,3);
  ctx.fillStyle='#FFF';ctx.fillRect(x+9,y+8+bob,2,2);ctx.fillRect(x+13,y+8+bob,2,2);
  ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=1;ctx.strokeRect(x+2,y+6+bob,20,18);
}
function drawKnight(ctx,x,y,frame,hurt,charging){
  const a=hurt?'#FF6666':'#8A8A8A',aS=hurt?'#FF9999':'#B8B8B8',aD=hurt?'#CC4444':'#5A5A5A';
  const ph=frame*1.0472,sw=Math.sin(ph),cw=Math.cos(ph);
  const bob=Math.abs(cw)*-1.5;
  const cx=x+13;
  ctx.fillStyle='rgba(0,0,0,0.28)';ctx.beginPath();ctx.ellipse(cx,y+48,16,6,0,0,Math.PI*2);ctx.fill();
  // piernas
  ctx.fillStyle='#444';ctx.fillRect(x+4+sw*3,y+34+bob,8,14);ctx.fillRect(x+15-sw*3,y+34+bob,8,14);
  ctx.fillStyle='#222';ctx.fillRect(x+3+sw*3,y+45+bob,10,4);ctx.fillRect(x+14-sw*3,y+45+bob,10,4);
  // cuerpo
  const mg=ctx.createLinearGradient(0,y+16,0,y+36);mg.addColorStop(0,aS);mg.addColorStop(0.5,a);mg.addColorStop(1,aD);
  ctx.fillStyle=mg;ctx.fillRect(x+1,y+16+bob,25,20);
  ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(x+2,y+17+bob,23,3);
  ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x+2,y+33+bob,23,3);
  // placas de armadura
  ctx.fillStyle='#666';for(let i=0;i<5;i++)for(let j=0;j<3;j++){ctx.fillRect(x+3+i*4,y+19+j*4+bob,3,3);ctx.fillStyle=(i+j)%2?'#666':'#777'}
  ctx.fillStyle='#8B6914';ctx.fillRect(x+1,y+29+bob,25,4);ctx.fillStyle='#C9A227';ctx.fillRect(x+1,y+29+bob,25,1);
  ctx.fillStyle='#FFD700';ctx.fillRect(x+10,y+29+bob,7,4);
  // hombreras
  ctx.fillStyle=mg;ctx.fillRect(x-5,y+16+bob,8,8);ctx.fillRect(x+24,y+16+bob,8,8);
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x-4,y+17+bob,6,2);ctx.fillRect(x+25,y+17+bob,6,2);
  // brazo con espada
  const armA=sw*3;
  ctx.fillStyle=a;ctx.fillRect(x-7,y+17+bob+armA*0.3,7,10);
  ctx.fillStyle='#8B4513';ctx.fillRect(x-8,y+15+bob+armA*0.3,9,4);
  ctx.fillStyle='#C9A227';ctx.fillRect(x-8,y+15+bob+armA*0.3,9,1);
  // espada grande
  ctx.fillStyle='#999';ctx.fillRect(x-8,y-4+bob+armA*0.3,3,20);
  ctx.fillStyle='#E8E8E8';ctx.fillRect(x-8,y-4+bob+armA*0.3,1,20);
  ctx.fillStyle='#8B4513';ctx.fillRect(x-10,y+14+bob+armA*0.3,7,5);
  ctx.fillStyle='#FFD700';ctx.fillRect(x-9,y+15+bob+armA*0.3,3,2);
  // cabeza / casco
  const hg=ctx.createLinearGradient(0,y-4,0,y+10);hg.addColorStop(0,'#C0C0C0');hg.addColorStop(1,'#8A8A8A');
  ctx.fillStyle=hg;ctx.fillRect(x+4,y-4+bob,19,15);ctx.fillRect(x+2,y+4+bob,23,7);
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x+5,y-3+bob,17,2);
  // visera
  ctx.fillStyle='#222';ctx.fillRect(x+6,y+5+bob,7,5);ctx.fillRect(x+17,y+5+bob,7,5);
  ctx.fillStyle='#000';ctx.fillRect(x+8,y+6+bob,3,3);ctx.fillRect(x+19,y+6+bob,3,3);
  ctx.fillStyle='#C22';ctx.fillRect(x+12,y+6+bob,4,2);
  // cresta del casco
  ctx.fillStyle='#666';ctx.fillRect(x+6,y-8+bob,15,6);ctx.fillRect(x+10,y-12+bob,7,5);
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x+6,y-8+bob,15,2);
  ctx.fillStyle='#CC0000';ctx.fillRect(x+12,y-16+bob,4,7);ctx.fillRect(x+13,y-19+bob,2,4);
  ctx.fillStyle='#8B0000';ctx.fillRect(x+13,y-14+bob,1,4);
  ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.lineWidth=1;ctx.strokeRect(x+1,y+16+bob,25,20);
  if(charging){ctx.globalAlpha=0.5;ctx.fillStyle='#FF4400';ctx.fillRect(x-5,y+10,34,5);ctx.globalAlpha=1}
}
function drawBoss(ctx,x,y,frame,hurt,phase){
  const a=hurt?'#FF6666':'#8B0000',b=hurt?'#CC4444':'#660000',aL=hurt?'#FF9999':'#C22';
  const ph=frame*1.0472,sw=Math.sin(ph),cw=Math.cos(ph);
  const bob=Math.abs(cw)*-1.5;
  const cx=x+19;
  ctx.fillStyle='rgba(0,0,0,0.32)';ctx.beginPath();ctx.ellipse(cx,y+56,22,7,0,0,Math.PI*2);ctx.fill();
  // piernas
  ctx.fillStyle='#440';ctx.fillRect(x+5+sw*3,y+52+bob,11,17);ctx.fillRect(x+24-sw*3,y+52+bob,11,17);
  ctx.fillStyle='#220';ctx.fillRect(x+4+sw*3,y+66+bob,13,5);ctx.fillRect(x+23-sw*3,y+66+bob,13,5);
  // cuerpo
  const bg=ctx.createLinearGradient(0,y+20,0,y+54);bg.addColorStop(0,aL);bg.addColorStop(0.5,a);bg.addColorStop(1,b);
  ctx.fillStyle=bg;ctx.fillRect(x,y+20+bob,38,34);
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(x+1,y+21+bob,36,3);
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(x+1,y+50+bob,36,4);
  // pectorales musculosos
  ctx.fillStyle='#990000';ctx.fillRect(x+3,y+24+bob,15,8);ctx.fillRect(x+20,y+24+bob,15,8);
  ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(x+4,y+25+bob,13,2);ctx.fillRect(x+21,y+25+bob,13,2);
  // cicatriz
  ctx.fillStyle='#440';ctx.fillRect(x+8,y+34+bob,12,2);ctx.fillRect(x+11,y+33+bob,2,3);
  // cinturon
  ctx.fillStyle='#FFD700';ctx.fillRect(x+2,y+40+bob,34,5);
  ctx.fillStyle='#B8860B';ctx.fillRect(x+2,y+42+bob,34,3);
  ctx.fillStyle='#FFD700';ctx.fillRect(x+15,y+40+bob,8,5);
  // corona/cuernos
  ctx.fillStyle='#FFD700';ctx.fillRect(x+4,y-8+bob,30,9);ctx.fillRect(x+7,y-16+bob,4,9);ctx.fillRect(x+27,y-16+bob,4,9);
  ctx.fillStyle='#FFC107';ctx.fillRect(x+4,y-8+bob,30,3);
  ctx.fillStyle='#B8860B';ctx.fillRect(x+4,y-2+bob,30,3);
  ctx.fillStyle='#F00';ctx.fillRect(x+12,y-5+bob,5,4);ctx.fillRect(x+21,y-5+bob,5,4);
  // cabeza
  ctx.fillStyle=a;ctx.fillRect(x+4,y-2+bob,30,17);
  ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(x+5,y-1+bob,28,3);
  // ojos llameantes
  ctx.fillStyle='#F00';ctx.fillRect(x+8,y+2+bob,7,6);ctx.fillRect(x+23,y+2+bob,7,6);
  ctx.fillStyle='#FFE040';ctx.fillRect(x+10,y+3+bob,4,4);ctx.fillRect(x+25,y+3+bob,4,4);
  ctx.fillStyle='#000';ctx.fillRect(x+11,y+4+bob,2,2);ctx.fillRect(x+26,y+4+bob,2,2);
  // cejas
  ctx.fillStyle='#400';ctx.fillRect(x+7,y+1+bob,9,2);ctx.fillRect(x+22,y+1+bob,9,2);
  // boca con colmillos
  ctx.fillStyle='#000';ctx.fillRect(x+8,y+12+bob,18,5);
  ctx.fillStyle='#FFF';ctx.fillRect(x+10,y+12+bob,3,3);ctx.fillRect(x+15,y+12+bob,3,3);ctx.fillRect(x+20,y+12+bob,3,3);
  ctx.fillStyle='#FFF';ctx.fillRect(x+8,y+10+bob,3,3);ctx.fillRect(x+25,y+10+bob,3,3);
  // brazos musculosos
  ctx.fillStyle=a;ctx.fillRect(x-7,y+22+bob+sw*2,9,22);ctx.fillRect(x+36,y+22+bob-sw*2,9,22);
  ctx.fillStyle=b;ctx.fillRect(x-7,y+22+bob+sw*2,9,4);ctx.fillRect(x+36,y+22+bob-sw*2,9,4);
  // puños
  ctx.fillStyle='#440';ctx.fillRect(x-8,y+42+bob+sw*2,11,6);ctx.fillRect(x+35,y+42+bob-sw*2,11,6);
  ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;ctx.strokeRect(x,y+20+bob,38,34);
  if(phase>0){ctx.globalAlpha=0.15+Math.sin(frame*0.1)*0.1;ctx.fillStyle=phase>=2?'#F00':'#F60';ctx.beginPath();ctx.arc(cx,y+30,45,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
}
function drawChestObj(ctx,x,y,open,t){
  if(open){ctx.fillStyle='#8B4513';ctx.fillRect(x-14,y-8,28,16);ctx.fillStyle='#5C3317';ctx.fillRect(x-12,y-12,24,6)}
  else{ctx.fillStyle='#8B4513';ctx.fillRect(x-14,y-14,28,16);ctx.fillStyle='#6B3410';ctx.fillRect(x-12,y-12,24,12);ctx.fillStyle='#FFD700';ctx.fillRect(x-3,y-2,6,6);ctx.fillRect(x-1,y+1,2,2);ctx.fillRect(x+2,y+1,2,2);
    if(Math.sin(t*0.08)>0){ctx.globalAlpha=0.3;ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(x,y,16,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
    ctx.fillStyle='#FFF';ctx.font='10px Courier New';ctx.textAlign='center';ctx.fillText('E',x,y-20);ctx.textAlign='left'}
}
function hash(n){const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)}
const BIOMES=[
 {name:'Bosque',sun:'#FFE9A0',sky:['#0B0B2A','#162447','#1F4068','#1a3a2a'],ground:['#3A6B1E','#274a12'],grass:'#5C9A2E',deco:'tree'},
 {name:'Desierto',sun:'#FFD080',sky:['#2a0f2a','#4a2040','#8a3a3a','#d99050'],ground:['#D0B060','#a88a48'],grass:'#E0C070',deco:'cactus'},
 {name:'Nieve',sun:'#E8F4FF',sky:['#0a1020','#1c2c44','#3a5068','#7a90a8'],ground:['#DCE8F0','#b8ccdc'],grass:'#F0F8FC',deco:'pine'},
 {name:'Caverna',sun:'#A0B0FF',sky:['#050505','#0a0a0c','#16161a','#242428'],ground:['#3c3c40','#2a2a2e'],grass:'#505058',deco:'crystal'},
 {name:'Infierno',sun:'#FF7040',sky:['#120000','#2a0a00','#4a1400','#7a2400'],ground:['#3a1a08','#281006'],grass:'#5a2a0c',deco:'lava'}
];
function drawSky(ctx,t,w,h,b){
  b=b||BIOMES[0];
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,b.sky[0]);g.addColorStop(0.3,b.sky[1]);g.addColorStop(0.6,b.sky[2]);g.addColorStop(1,b.sky[3]);
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  for(let i=0;i<90;i++){const sx=hash(i)*w,sy=hash(i+7)*h*0.32;const tw=Math.sin(t*0.03+i)*0.5+0.5;ctx.globalAlpha=0.25+tw*0.6;ctx.fillStyle='#FFF';ctx.fillRect(Math.floor(sx),Math.floor(sy),1+(i%3===0?1:0),1+(i%3===0?1:0));}
  ctx.globalAlpha=1;
  const sx=w-130,sy=72;
  const glow=ctx.createRadialGradient(sx,sy,8,sx,sy,95);
  glow.addColorStop(0,'rgba(255,255,225,0.9)');glow.addColorStop(0.35,b.sun+'88');glow.addColorStop(1,'rgba(255,255,210,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx,sy,95,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=b.sun;ctx.beginPath();ctx.arc(sx,sy,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.arc(sx-8,sy-8,8,0,Math.PI*2);ctx.fill();
  for(let i=0;i<7;i++){const cx=((t*0.12)+i*320+hash(i)*120)%(w+240)-120;const cy=50+hash(i+3)*130;ctx.fillStyle='rgba(255,255,255,0.09)';ctx.beginPath();ctx.ellipse(cx,cy,70,16,0,0,Math.PI*2);ctx.ellipse(cx+34,cy-9,46,13,0,0,Math.PI*2);ctx.ellipse(cx-30,cy-5,38,11,0,0,Math.PI*2);ctx.fill();}
}
function drawGround(ctx,w,h,gy,b,t){
  b=b||BIOMES[0];
  const g=ctx.createLinearGradient(0,gy,0,h);
  g.addColorStop(0,b.ground[0]);g.addColorStop(1,b.ground[1]);
  ctx.fillStyle=g;ctx.fillRect(0,gy,w,h-gy);
  // capa superior de hierba
  ctx.fillStyle=b.grass;ctx.fillRect(0,gy,w,7);
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(0,gy,w,2);
  ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(0,gy+5,w,2);
  // briznas de hierba
  for(let i=0;i<w;i+=10){const hh=3+hash(i)*5;ctx.fillStyle=b.grass;ctx.fillRect(i,gy-hh,2,hh);}
  for(let i=4;i<w;i+=10){const hh=2+hash(i+9)*4;ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(i,gy-hh,1,hh);}
}
function drawTree(ctx,x,y,sz){
  ctx.fillStyle='rgba(0,0,0,0.22)';ctx.beginPath();ctx.ellipse(x,y+4,sz*0.55,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6B4226';ctx.fillRect(x-sz*0.13,y-sz*0.62,sz*0.26,sz*0.66);
  ctx.fillStyle='#7A4E2D';ctx.fillRect(x-sz*0.13,y-sz*0.62,sz*0.09,sz*0.66);
  ctx.fillStyle='#4a2c18';ctx.fillRect(x+sz*0.02,y-sz*0.62,sz*0.11,sz*0.66);
  const lw=[sz*0.95,sz*0.78,sz*0.6],lh=sz*0.34;
  for(let ly=0;ly<3;ly++){
    const ww=lw[ly],yy=y-sz*0.62-lh*(ly+1);
    ctx.fillStyle=['#2D6B1E','#37822A','#3F9432'][ly];ctx.fillRect(x-ww/2,yy,ww,lh);
    ctx.fillStyle='rgba(255,255,255,0.14)';ctx.fillRect(x-ww/2,yy,ww,lh*0.32);
    ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x-ww/2,yy+lh-3,ww,3);
    ctx.fillStyle='#2D6B1E';ctx.fillRect(x-ww/2-2,yy+lh,ww+4,2);
  }
}
function drawStonePathH(ctx,x1,x2,y,w){
  const cols=['#777','#6A6A6A','#808080','#636363'];
  for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x+=10)for(let j=-w/2;j<=w/2;j+=10){const ci=Math.abs(Math.floor(x/10)+Math.floor((y+j)/10))%cols.length;ctx.fillStyle=cols[ci];ctx.fillRect(x-5,y+j-5,10,10);ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=0.5;ctx.strokeRect(x-5,y+j-5,10,10)}
}
function drawStonePathV(ctx,x,y1,y2,w){
  const cols=['#777','#6A6A6A','#808080','#636363'];
  for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y+=10)for(let j=-w/2;j<=w/2;j+=10){const ci=Math.abs(Math.floor((x+j)/10)+Math.floor(y/10))%cols.length;ctx.fillStyle=cols[ci];ctx.fillRect(x+j-5,y-5,10,10);ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=0.5;ctx.strokeRect(x+j-5,y-5,10,10)}
}
function drawHouse(ctx,x,y,w,h,wcol,rcol){
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(x+w/2,y+h+6,w*0.62,9,0,0,Math.PI*2);ctx.fill();
  const wg=ctx.createLinearGradient(0,y,0,y+h);wg.addColorStop(0,wcol);wg.addColorStop(1,'#3E2317');
  ctx.fillStyle=wg;ctx.fillRect(x,y,w,h);
  for(let i=0;i<w;i+=16)for(let j=0;j<h;j+=16){ctx.strokeStyle='rgba(0,0,0,0.14)';ctx.lineWidth=1;ctx.strokeRect(x+i,y+j,16,16)}
  ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fillRect(x,y,w,5);
  const rg=ctx.createLinearGradient(0,y-h*0.5,0,y);rg.addColorStop(0,rcol);rg.addColorStop(1,'#4a1508');
  ctx.fillStyle=rg;ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+w/2,y-h*0.5);ctx.lineTo(x+w+10,y);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.12)';ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+w/2,y-h*0.5);ctx.lineTo(x+w/2,y);ctx.closePath();ctx.fill();
  for(let i=0;i<w+20;i+=18){ctx.strokeStyle='rgba(0,0,0,0.15)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-10+i,y);ctx.lineTo(x-10+i+w/2,y-h*0.5);ctx.stroke()}
  ctx.fillStyle='#3E2723';ctx.fillRect(x+w/2-13,y+h-42,26,42);
  ctx.strokeStyle='#2A1A12';ctx.lineWidth=2;ctx.strokeRect(x+w/2-13,y+h-42,26,42);
  ctx.fillStyle='#C9A227';ctx.fillRect(x+w/2-2,y+h-24,4,4);
  ctx.fillStyle='#6B3410';ctx.fillRect(x+w/2-14,y+h-42,3,42);ctx.fillRect(x+w/2+11,y+h-42,3,42);
  const wgl=ctx.createLinearGradient(x+12,y+20,x+34,y+38);wgl.addColorStop(0,'#7FB0E8');wgl.addColorStop(0.5,'#4A6FA5');wgl.addColorStop(1,'#2c4a6e');
  if(w>140){ctx.fillStyle=wgl;ctx.fillRect(x+12,y+20,22,18);ctx.fillRect(x+w-34,y+20,22,18)}else{ctx.fillStyle=wgl;ctx.fillRect(x+w/2-10,y+20,20,18)}
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillRect(x+14,y+21,6,4);
  if(w>140)ctx.fillRect(x+w-32,y+21,6,4);else ctx.fillRect(x+w/2-8,y+21,6,4);
  ctx.fillStyle='#5C3317';ctx.fillRect(x+12,y+20,22,2);ctx.fillRect(x+22,y+20,2,18);ctx.fillRect(x+21,y+20,4,2);ctx.fillRect(x+21,y+36,4,2);
  if(w>140){ctx.fillRect(x+w-34,y+20,22,2);ctx.fillRect(x+w-24,y+20,2,18);ctx.fillRect(x+w-25,y+20,4,2);ctx.fillRect(x+w-25,y+36,4,2)}
  ctx.fillStyle='#8B6914';ctx.fillRect(x+w/2-8,y+h-46,w*0.16+16,4);
}
function drawFountain(ctx,x,y,t){
  ctx.fillStyle='#555';ctx.beginPath();ctx.ellipse(x,y+16,32,12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#666';ctx.fillRect(x-5,y-20,10,36);ctx.fillStyle='#777';ctx.beginPath();ctx.ellipse(x,y-20,16,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4488CC';ctx.globalAlpha=0.5;ctx.beginPath();ctx.ellipse(x,y+12,28,10,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  for(let i=0;i<4;i++){const wx=x+Math.sin(t*0.03+i)*12,wy=y+8+Math.sin(t*0.05+i*2)*2;ctx.fillStyle='#88BBFF';ctx.globalAlpha=0.4;ctx.fillRect(wx,wy,3,3);ctx.globalAlpha=1}
}
function drawSandbag(ctx,x,y){
  ctx.fillStyle='#C4A660';ctx.fillRect(x-10,y-8,20,16);ctx.fillRect(x-12,y-4,24,12);
  ctx.fillStyle='#A89050';ctx.fillRect(x-10,y-6,20,2);ctx.fillRect(x-10,y+2,20,2);
}
function drawTraining(ctx,x,y){
  ctx.fillStyle='#8B7340';ctx.fillRect(x,y,120,80);
  ctx.fillStyle='#A89050';for(let i=0;i<4;i++)for(let j=0;j<2;j++)ctx.fillRect(x+i*30+2,y+j*38+2,26,34);
  drawSandbag(ctx,x+15,y+20);drawSandbag(ctx,x+55,y+20);drawSandbag(ctx,x+95,y+20);
  drawSandbag(ctx,x+15,y+55);drawSandbag(ctx,x+55,y+55);drawSandbag(ctx,x+95,y+55);
  ctx.fillStyle='#5C3317';ctx.fillRect(x+55,y-30,4,30);ctx.fillRect(x+40,y-30,34,4);
  ctx.fillStyle='#8B4513';ctx.fillRect(x+40,y-28,34,3);ctx.fillStyle='#FFF';ctx.font='8px Courier New';ctx.fillText('ENTRENAMIENTO',x+42,y-18);
}
function drawPortal(ctx,x,y,t){
  ctx.save();
  ctx.globalAlpha=0.3+Math.sin(t*0.02)*0.1;ctx.fillStyle='#220033';ctx.beginPath();ctx.arc(x,y,55,0,Math.PI*2);ctx.fill();
  for(let i=6;i>=0;i--){ctx.globalAlpha=0.15+i*0.02;ctx.strokeStyle=['#9933FF','#6600CC','#CC66FF','#FF66FF','#9900CC','#CC00FF','#FF00FF'][i];ctx.lineWidth=2+Math.sin(t*0.03+i)*1;ctx.beginPath();ctx.arc(x,y,35+i*6,0,Math.PI*2);ctx.stroke()}
  const p=Math.sin(t*0.04)*0.3+0.7;ctx.globalAlpha=p;
  for(let i=0;i<12;i++){const a=t*0.025+i*(Math.PI*2/12),r=28+Math.sin(t*0.02+i*0.5)*8;const sz=3+Math.sin(t*0.05+i)*2;ctx.fillStyle=['#9933FF','#CC66FF','#FF66FF','#6600CC','#FF00FF','#CC00FF'][i%6];ctx.fillRect(x+Math.cos(a)*r-sz/2,y+Math.sin(a)*r-sz/2,sz,sz)}
  for(let i=0;i<6;i++){const a=-t*0.04+i*(Math.PI*2/6),r=18+Math.sin(t*0.03+i)*3;ctx.fillStyle='#FF66FF';ctx.globalAlpha=0.6+Math.sin(t*0.06+i)*0.3;ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,2,0,Math.PI*2);ctx.fill()}
  ctx.globalAlpha=0.08+Math.sin(t*0.015)*0.04;ctx.fillStyle='#AA44FF';ctx.beginPath();ctx.arc(x,y,48,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=0.25+Math.sin(t*0.06)*0.15;ctx.fillStyle='#6600CC';ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=0.6+Math.sin(t*0.08)*0.3;ctx.fillStyle='#CC88FF';ctx.beginPath();ctx.arc(x,y,6+Math.sin(t*0.1)*2,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;ctx.restore();
}
function drawShop(ctx,s,t){
  const roofC={weapon:'#8B0000',armor:'#555',potion:'#228B22',herrero:'#FF8C00'}[s.type];
  const bw=70,bh=52;
  ctx.fillStyle='#4A3728';ctx.fillRect(s.x,s.y,bw,bh);
  ctx.fillStyle='#5C3317';ctx.fillRect(s.x+2,s.y+2,bw-4,bh-4);
  for(let i=0;i<20;i++){ctx.fillStyle=roofC;ctx.fillRect(s.x+i*4-8,s.y-14,8,5);if(i%2===0)ctx.fillRect(s.x+i*4-8,s.y-20,8,7)}
  ctx.fillStyle='#3E2723';ctx.fillRect(s.x+bw/2-10,s.y+bh-28,20,28);
  ctx.fillStyle='#FFD700';ctx.fillRect(s.x+bw/2-1,s.y+bh-14,3,3);
  const icons={weapon:'\u2694',armor:'\uD83D\uDEE1',potion:'\uD83E\uDDEA',herrero:'\u2692'};
  ctx.fillStyle='#FFF';ctx.font='18px serif';ctx.fillText(icons[s.type]||'?',s.x+bw/2-9,s.y+22);
  if(s.type==='herrero'){ctx.globalAlpha=0.4+Math.sin(t*0.08)*0.3;ctx.fillStyle='#FF4500';ctx.beginPath();ctx.arc(s.x+bw-4,s.y+14,8,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  ctx.fillStyle='#FFF';ctx.font='9px Courier New';ctx.textAlign='center';
  ctx.fillText({weapon:'ARMAS',armor:'ARMADURA',potion:'POCIONES',herrero:'HERRERO'}[s.type],s.x+bw/2,s.y-24);ctx.textAlign='left';
}
function drawTorch(ctx,x,y,t){
  ctx.fillStyle='#5C3317';ctx.fillRect(x,y,6,24);
  const fl=Math.sin(t*0.1+x*0.1)*0.3+0.7;ctx.globalAlpha=fl;
  ctx.fillStyle='#FF6600';ctx.beginPath();ctx.arc(x+3,y-4,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFCC00';ctx.beginPath();ctx.arc(x+3,y-8,4,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=0.15;ctx.fillStyle='#FF8800';ctx.beginPath();ctx.arc(x+3,y-4,20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
class Part{
  constructor(x,y,col,life,vx,vy,sz){this.x=x;this.y=y;this.col=col;this.life=life||30;this.ml=this.life;this.vx=vx||rn(-2,2);this.vy=vy||rn(-2,2);this.sz=sz||3;this.alive=true}
  update(){this.x+=this.vx*dt;this.y+=this.vy*dt;this.vx*=.96;this.vy*=.96;this.vy+=.05;this.life--;if(this.life<=0)this.alive=false}
  draw(ctx){const a=this.life/this.ml;ctx.globalAlpha=a;ctx.fillStyle=this.col;const s=this.sz*(0.6+0.4*a);ctx.fillRect(Math.floor(this.x-s/2),Math.floor(this.y-s/2),Math.ceil(s),Math.ceil(s));ctx.globalAlpha=1}
}
class DmgN{
  constructor(x,y,t,c){this.x=x;this.y=y;this.t=t;this.c=c||'#FFF';this.life=50;this.ml=50;this.alive=true}
  update(){this.y-=1;this.life--;if(this.life<=0)this.alive=false}
  draw(ctx){ctx.globalAlpha=this.life/this.ml;ctx.font='bold 14px Courier New';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(this.t,this.x+1,this.y+1);ctx.fillStyle=this.c;ctx.fillText(this.t,this.x,this.y);ctx.textAlign='left';ctx.globalAlpha=1}
}
class ExpO{
  constructor(x,y){this.x=x;this.y=y;this.alive=true;this.ty=y+12+rn(0,8);this.falling=true;this.collected=false;this.cspd=0;this.life=600;this.t=Math.random()*100}
  update(p,g){this.life--;this.t++;if(this.life<=0){this.alive=false;return}if(this.falling){this.y+=1.5;if(this.y>=this.ty){this.falling=false;this.y=this.ty}}if(!this.falling&&!this.collected&&dst(this.x,this.y,p.x,p.y)<80)this.collected=true;
    if(this.collected){this.cspd+=.5;const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy);if(d>0){this.x+=dx/d*this.cspd*dt;this.y+=dy/d*this.cspd*dt}if(d<12){p.gainExp(1,g);this.alive=false;for(let i=0;i<5;i++)g.parts.push(new Part(this.x,this.y,'#0F8',20,undefined,undefined,3))}}}
  draw(ctx){if(this.life<60&&Math.floor(this.t/5)%2===0)return;const p=Math.sin(this.t*.1)*.3+.7;ctx.globalAlpha=p;ctx.fillStyle='#0F8';ctx.fillRect(Math.floor(this.x-3),Math.floor(this.y-3),6,6);ctx.fillStyle='#8FC';ctx.fillRect(Math.floor(this.x-1),Math.floor(this.y-1),2,2);ctx.globalAlpha=1}
}
class CoinO{
  constructor(x,y){this.x=x;this.y=y;this.alive=true;this.ty=y+15+rn(0,6);this.falling=true;this.collected=false;this.cspd=0;this.life=400;this.t=Math.random()*100}
  update(p,g){this.life--;this.t++;if(this.life<=0){this.alive=false;return}if(this.falling){this.y+=2;if(this.y>=this.ty){this.falling=false;this.y=this.ty}}if(!this.falling&&!this.collected&&dst(this.x,this.y,p.x,p.y)<55)this.collected=true;
    if(this.collected){this.cspd+=.6;const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy);if(d>0){this.x+=dx/d*this.cspd*dt;this.y+=dy/d*this.cspd*dt}if(d<10){p.coins++;this.alive=false}}}
  draw(ctx){const w=Math.sin(this.t*.15)*2;ctx.fillStyle='#DAA520';ctx.fillRect(Math.floor(this.x-3+w),Math.floor(this.y-3),6,6);ctx.fillStyle='#FFD700';ctx.fillRect(Math.floor(this.x-2+w),Math.floor(this.y-2),4,4)}
}
class Proj{
  constructor(x,y,dx,dy,dmg,type,spd){this.x=x;this.y=y;this.dx=dx;this.dy=dy;this.dmg=dmg;this.type=type||'arrow';this.spd=spd||10;this.alive=true;this.life=100}
  update(g){this.x+=this.dx*this.spd*dt;this.y+=this.dy*this.spd*dt;this.life--;if(this.life<=0){this.alive=false;return}
    g.enemies.forEach(e=>{if(!e.alive)return;if(dst(this.x,this.y,e.x,e.y)<22){e.hurt(this.dmg,g);this.alive=false;for(let i=0;i<4;i++)g.parts.push(new Part(this.x,this.y,'#F80',15))}});
    if(this.type==='arrow')g.parts.push(new Part(this.x,this.y,'#8B6914',5,0,0,2));else g.parts.push(new Part(this.x,this.y,'#F40',8,0,0,3))}
  draw(ctx){if(this.type==='arrow'){ctx.fillStyle='#8B4513';ctx.fillRect(Math.floor(this.x-2),Math.floor(this.y-2),4,4);ctx.fillStyle='#CCC';ctx.fillRect(Math.floor(this.x-1),Math.floor(this.y-6),2,6)}else{ctx.fillStyle='#F40';ctx.beginPath();ctx.arc(Math.floor(this.x),Math.floor(this.y),5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#FC0';ctx.beginPath();ctx.arc(Math.floor(this.x),Math.floor(this.y),2,0,Math.PI*2);ctx.fill()}}
}
class Chest{
  constructor(x,y){this.x=x;this.y=y;this.open=false;this.cost=rI(15,35)}
  loot(g){const r=Math.random();if(r<.3){g.player.coins+=8;g.dmgNums.push(new DmgN(this.x,this.y-20,'+8 Monedas','#FFD700'))}else if(r<.5){g.player.hp=Math.min(g.player.hp+35,g.player.mhp);g.dmgNums.push(new DmgN(this.x,this.y-20,'+35 HP','#0F0'))}else if(r<.7){g.player.pots=Math.min(g.player.pots+2,5);g.dmgNums.push(new DmgN(this.x,this.y-20,'+2 Pociones','#F88'))}else if(r<.85){if(!g.player.wup[1]){g.player.wup[1]=1;g.dmgNums.push(new DmgN(this.x,this.y-20,'\u00a1ARCO!','#FFD700'))}else if(!g.player.wup[2]){g.player.wup[2]=1;g.dmgNums.push(new DmgN(this.x,this.y-20,'\u00a1VARA!','#C6F'))}else{g.player.coins+=12;g.dmgNums.push(new DmgN(this.x,this.y-20,'+12 Monedas','#FFD700'))}}else{g.player.coins+=5;g.dmgNums.push(new DmgN(this.x,this.y-20,'+5 Monedas','#FFD700'))}for(let i=0;i<15;i++)g.parts.push(new Part(this.x+rn(-20,20),this.y+rn(-20,20),['#FFD700','#FA0','#FF0'][i%3],35))}
  draw(ctx,t){drawChestObj(ctx,this.x,this.y,this.open,t)}
}
class Player{
  constructor(x,y){this.x=x;this.y=y;this.spd=3.2;this.bSpd=3.2;this.vx=0;this.vy=0;this.kbX=0;this.kbY=0;this.hp=100;this.mhp=100;this.wpn=0;this.wup=[0,0,0];this.arm=-1;this.aUnl=[0,0,0];this.coins=0;this.exp=0;this.lv=1;this.face='down';this.mov=false;this.aFrame=0;this.aTimer=0;this.atkF=0;this.atkCD=0;this.dashF=0;this.dashCD=0;this.dashD={x:0,y:0};this.inv=0;this.spdB=1;this.dmgB=1;this.bTimer=0;this.pots=3;
    const s=loadData();if(s){this.coins=s.coins||0;this.exp=s.exp||0;this.lv=s.lv||1;this.mhp=100+(this.lv-1)*12;this.hp=Math.min(s.hp||this.mhp,this.mhp);this.wup=s.wup||[0,0,0];this.aUnl=s.aUnl||[0,0,0];this.arm=s.arm!=null?s.arm:-1;this.pots=s.pots||3}
  }
  getSpd(){return this.bSpd*[1,.95,.88,.8][this.arm+1]*this.spdB}
  getDmg(b){return Math.floor(b*(1+(this.wup[this.wpn]||0)*.2)*this.dmgB)}
  update(g){
    if(this.bTimer>0){this.bTimer--;if(this.bTimer<=0){this.spdB=1;this.dmgB=1}}
    if(this.inv>0)this.inv--;if(this.atkCD>0)this.atkCD--;if(this.dashCD>0)this.dashCD--;
    if(this.atkF>0)this.atkF-=.5;
    if(this.dashF>0){this.x+=this.dashD.x*12*dt;this.y+=this.dashD.y*12*dt;this.clamp(g);this.dashF-=.5*dt;return}
    if(g.mwx!=null){const a=Math.atan2(g.mwy-this.y,g.mwx-this.x);if(a>-0.75&&a<0.75)this.face='right';else if(a>0.75&&a<2.36)this.face='down';else if(a<-0.75&&a>-2.36)this.face='up';else this.face='left'}
    let dx=0,dy=0;
    if(K.w||K.arrowup)dy=-1;if(K.s||K.arrowdown)dy=1;
    if(K.a||K.arrowleft)dx=-1;if(K.d||K.arrowright)dx=1;
    this.mov=dx!==0||dy!==0;
    if(this.mov){const l=Math.hypot(dx,dy);dx/=l;dy/=l}
    const acc=0.32,fr=0.82,ms=this.getSpd();
    this.vx+=dx*ms*acc*dt;this.vy+=dy*ms*acc*dt;
    if(!this.mov){this.vx*=Math.pow(fr,dt);this.vy*=Math.pow(fr,dt)}
    const sp=Math.hypot(this.vx,this.vy);
    if(sp>ms){this.vx=this.vx/sp*ms;this.vy=this.vy/sp*ms}
    this.x+=(this.vx+this.kbX)*dt;this.y+=(this.vy+this.kbY)*dt;
    this.kbX*=Math.pow(0.8,dt);this.kbY*=Math.pow(0.8,dt);
    this.clamp(g);
    if(this.mov){this.aTimer++;if(this.aTimer%6===0)this.aFrame=(this.aFrame+1)%6;if(this.aTimer%10===0)g.parts.push(new Part(this.x+rn(-8,8),this.y+20,'#8B7355',15,0,-1,3))}
    else{this.aTimer=0;if(this.aFrame>0)this.aFrame=Math.max(0,this.aFrame-1)}
    if((K[' ']||mouseDown)&&this.atkCD<=0)this.attack(g);
    if(K.shift&&this.dashCD<=0&&!g.inLobby)this.dash(g);
    if(K['1'])this.wpn=0;if(K['2']&&this.wup[1]>0)this.wpn=1;if(K['3']&&this.wup[2]>0)this.wpn=2;
    if(K.q&&this.pots>0&&this.hp<this.mhp){this.pots--;this.hp=Math.min(this.hp+35,this.mhp);g.dmgNums.push(new DmgN(this.x,this.y-20,'+35 HP','#0F0'));K.q=0}
    if(K.e){this.interact(g);K.e=0}
  }
  clamp(g){const a=g.inLobby?{w:1920,h:1080}:{w:2400,h:2400};this.x=cl(this.x,20,a.w-20);this.y=cl(this.y,20,a.h-20);
    if(g.inLobby){const cols=[...(g.houses||[]),...(g.shopCol||[])];for(const h of cols){if(this.x>h.x-10&&this.x<h.x+h.w+10&&this.y>h.y-10&&this.y<h.y+h.h+10){const dl=this.x-(h.x-10),dr=(h.x+h.w+10)-this.x,dt=this.y-(h.y-10),db=(h.y+h.h+10)-this.y;const m=Math.min(dl,dr,dt,db);if(m===dl)this.x=h.x-10;else if(m===dr)this.x=h.x+h.w+10;else if(m===dt)this.y=h.y-10;else this.y=h.y+h.h+10}}}
  }
  attack(g){
    const bd=[18,12,25][this.wpn],dm=this.getDmg(bd);this.atkF=10;this.atkCD=[18,30,22][this.wpn];
    const mwx=g.mwx!=null?g.mwx:this.x,mwy=g.mwy!=null?g.mwy:this.y;const ang=Math.atan2(mwy-this.y,mwx-this.x);
    if(this.wpn===0){g.enemies.forEach(e=>{if(!e.alive)return;if(dst(this.x,this.y,e.x,e.y)<60){const ea=Math.atan2(e.y-this.y,e.x-this.x);let diff=Math.abs(ang-ea);if(diff>Math.PI)diff=Math.PI*2-diff;if(diff<0.9)e.hurt(Math.floor(dm*1.4),g)}});for(let i=0;i<6;i++){const a=ang+rn(-.4,.4);g.parts.push(new Part(this.x+Math.cos(a)*30,this.y+Math.sin(a)*30,'#CCC',12,Math.cos(a)*2,Math.sin(a)*2,4))}}
    else if(this.wpn===1){const dx=Math.cos(ang),dy=Math.sin(ang);g.projs.push(new Proj(this.x+dx*15,this.y+dy*15,dx,dy,dm,'arrow'))}
    else if(this.wpn===2){g.enemies.forEach(e=>{if(!e.alive)return;if(dst(this.x,this.y,e.x,e.y)<130){e.hurt(dm,g);e.slow=100}});for(let i=0;i<16;i++){const a=(Math.PI*2/16)*i;g.parts.push(new Part(this.x+Math.cos(a)*50,this.y+Math.sin(a)*50,'#C6F',20,Math.cos(a)*1.5,Math.sin(a)*1.5,4))}g.shake=4}
  }
  dash(g){this.dashF=8;this.dashCD=50;this.inv=12;let dx=0,dy=0;if(this.face==='down')dy=1;else if(this.face==='up')dy=-1;else if(this.face==='right')dx=1;else dx=-1;this.dashD={x:dx,y:dy};for(let i=0;i<6;i++)g.parts.push(new Part(this.x+rn(-15,15),this.y+rn(-15,15),'#AAA',20,-dx*2+rn(-1,1),-dy*2+rn(-1,1),3))}
  interact(g){
    if(g.inLobby){if(dst(this.x,this.y,g.portal.x,g.portal.y)<70){saveData({coins:this.coins,exp:this.exp,lv:this.lv,hp:this.hp,wup:this.wup,aUnl:this.aUnl,arm:this.arm,pots:this.pots});g.inLobby=false;this.x=1200;this.y=1200;g.enterCombat();return}
      for(const s of g.shops)if(dst(this.x,this.y,s.x+35,s.y+52)<70){openShop(s.type);return}}
    for(const c of g.chests)if(!c.open&&dst(this.x,this.y,c.x,c.y)<60&&this.exp>=c.cost){this.exp-=c.cost;c.open=true;c.loot(g);return}
  }
  hurt(dmg,g,src){if(this.inv>0)return;const ad=[0,.15,.3,.5][this.arm+1],a=dmg*(1-ad);this.hp-=a;this.inv=50;g.shake=8;
    if(src){const kb=Math.atan2(this.y-src.y,this.x-src.x);this.kbX=Math.cos(kb)*7;this.kbY=Math.sin(kb)*7;}
    g.dmgNums.push(new DmgN(this.x,this.y-20,'-'+Math.ceil(a),'#F44'));for(let i=0;i<6;i++)g.parts.push(new Part(this.x+rn(-15,15),this.y+rn(-15,15),'#F00',25));if(this.hp<=0){this.hp=0;running=false;saveData({coins:this.coins,exp:this.exp,lv:this.lv,hp:0,wup:this.wup,aUnl:this.aUnl,arm:this.arm,pots:this.pots});const entry={id:getPlayerId(),name:playerName,wave:g.wave,kills:g.totalKills,lv:this.lv,date:Date.now()};saveLB(entry);const lb=loadLB();let html='Kills: '+g.totalKills+' | Oleadas: '+g.wave+' | Nivel: '+this.lv+'<br><br><b style="color:#FFD700">TABLERO DE LIDERES:</b><br>';lb.slice(0,10).forEach((e,i)=>{const mk=e.date===entry.date?'<span style="color:#FF0"> >> </span>':'    ';html+=mk+(i+1)+'. '+e.name+' - Oleada:'+e.wave+' Kills:'+e.kills+' Nv:'+e.lv+'<br>'});document.getElementById('dStats').innerHTML=html;document.getElementById('deathScreen').style.display='flex'}}
  gainExp(amt,g){this.exp+=amt;const n=this.lv*80;if(this.exp>=n){this.exp-=n;this.lv++;this.mhp+=12;this.hp=Math.min(this.hp+30,this.mhp);
    g.levelAnim=120;g.levelTxt='\u00a1NIVEL '+this.lv+'!';
    g.biome=(g.biome+1)%BIOMES.length;
    g.dmgNums.push(new DmgN(this.x,this.y-30,'\u00a1NIVEL '+this.lv+'!','#FFD700'));
    for(let i=0;i<60;i++){const a=(Math.PI*2/60)*i;g.parts.push(new Part(this.x+Math.cos(a)*rn(20,70),this.y+Math.sin(a)*rn(20,70),['#FFD700','#FFA500','#FF0','#FFF'][i%4],50,Math.cos(a)*2,Math.sin(a)*2,4))}
    g.shake=6;g.onLevelUp(this.lv);}}
  draw(ctx){if(this.inv>0&&Math.floor(this.inv/4)%2===0)ctx.globalAlpha=.4;
    drawWarrior(ctx,this.x-16,this.y-32,this.aFrame,this.face,this.arm,this.wpn,this.atkF);ctx.globalAlpha=1}
}
class Goblin{
  constructor(x,y){this.x=x;this.y=y;this.spd=1.4+rn(0,.4);this.hp=35;this.mhp=35;this.dmg=8;this.alive=true;this.hurtT=0;this.slow=0;this.atkCD=0;this.aFrame=0;this.aTimer=0;this.loot={exp:3,coins:rI(1,3)}}
  update(g){if(!this.alive)return;if(this.hurtT>0)this.hurtT--;if(this.atkCD>0)this.atkCD--;if(this.slow>0)this.slow--;this.aTimer++;if(this.aTimer%12===0)this.aFrame=(this.aFrame+1)%2;
    const s=this.slow>0?this.spd*.35:this.spd,dx=g.player.x-this.x,dy=g.player.y-this.y,d=Math.hypot(dx,dy);
    if(d>0){this.x+=dx/d*s*dt;this.y+=dy/d*s*dt}if(d<30&&this.atkCD<=0){g.player.hurt(this.dmg,g,this);this.atkCD=50}}
  hurt(dmg,g){this.hp-=dmg;this.hurtT=10;g.dmgNums.push(new DmgN(this.x,this.y-15,'-'+dmg,'#FFF'));for(let i=0;i<3;i++)g.parts.push(new Part(this.x+rn(-10,10),this.y+rn(-10,10),'#3A8C3A',20));
    if(this.hp<=0){this.alive=false;g.kills++;g.totalKills++;g.waveKills++;for(let i=0;i<this.loot.exp;i++)g.expOrbs.push(new ExpO(this.x+rn(-20,20),this.y+rn(-20,20)));for(let i=0;i<this.loot.coins;i++)g.coinOrbs.push(new CoinO(this.x+rn(-15,15),this.y+rn(-15,15)));if(Math.random()<0.1)g.chests.push(new Chest(this.x+rn(-25,25),this.y+rn(-25,25)));for(let i=0;i<10;i++)g.parts.push(new Part(this.x+rn(-15,15),this.y+rn(-15,15),['#3A8C3A','#5AB85A','#2D6B2D'][i%3],30))}}
  draw(ctx){drawGoblin(ctx,this.x-12,this.y-14,this.aFrame,this.hurtT>0);if(this.hp<this.mhp){ctx.fillStyle='#333';ctx.fillRect(this.x-15,this.y-20,30,4);ctx.fillStyle='#0C0';ctx.fillRect(this.x-15,this.y-20,30*(this.hp/this.mhp),4)}if(this.slow>0){ctx.globalAlpha=.5;ctx.fillStyle='#88F';ctx.fillRect(this.x-5,this.y+18,10,3);ctx.globalAlpha=1}}
}
class Knight{
  constructor(x,y){this.x=x;this.y=y;this.spd=.9;this.hp=90;this.mhp=90;this.dmg=18;this.alive=true;this.hurtT=0;this.slow=0;this.atkCD=0;this.aFrame=0;this.aTimer=0;this.chargeT=0;this.charging=false;this.chargeD={x:0,y:0};this.loot={exp:8,coins:rI(3,6)}}
  update(g){if(!this.alive)return;if(this.hurtT>0)this.hurtT--;if(this.atkCD>0)this.atkCD--;if(this.slow>0)this.slow--;this.aTimer++;if(this.aTimer%12===0)this.aFrame=(this.aFrame+1)%2;
    const s=this.slow>0?this.spd*.35:this.spd,dx=g.player.x-this.x,dy=g.player.y-this.y,d=Math.hypot(dx,dy);
    this.chargeT++;if(this.chargeT>150&&!this.charging&&d>80){this.charging=true;this.chargeT=0;if(d>0)this.chargeD={x:dx/d,y:dy/d}}
    if(this.charging){this.x+=this.chargeD.x*s*4*dt;this.y+=this.chargeD.y*s*4*dt;this.chargeT++;if(this.chargeT>25){this.charging=false;this.chargeT=0}}else{if(d>0){this.x+=dx/d*s*dt;this.y+=dy/d*s*dt}}
    if(d<35&&this.atkCD<=0){g.player.hurt(this.dmg,g,this);this.atkCD=80}}
  hurt(dmg,g){this.hp-=dmg;this.hurtT=10;g.dmgNums.push(new DmgN(this.x,this.y-15,'-'+dmg,'#FFF'));for(let i=0;i<4;i++)g.parts.push(new Part(this.x+rn(-10,10),this.y+rn(-10,10),'#888',25));
    if(this.hp<=0){this.alive=false;g.kills++;g.totalKills++;g.waveKills++;g.knightKills++;for(let i=0;i<this.loot.exp;i++)g.expOrbs.push(new ExpO(this.x+rn(-20,20),this.y+rn(-20,20)));for(let i=0;i<this.loot.coins;i++)g.coinOrbs.push(new CoinO(this.x+rn(-15,15),this.y+rn(-15,15)));if(Math.random()<0.15)g.chests.push(new Chest(this.x+rn(-25,25),this.y+rn(-25,25)));for(let i=0;i<15;i++)g.parts.push(new Part(this.x+rn(-20,20),this.y+rn(-20,20),['#777','#999','#555'][i%3],35))}}
  draw(ctx){drawKnight(ctx,this.x-14,this.y-16,this.aFrame,this.hurtT>0,this.charging);if(this.hp<this.mhp){ctx.fillStyle='#333';ctx.fillRect(this.x-18,this.y-24,36,5);ctx.fillStyle='#F80';ctx.fillRect(this.x-18,this.y-24,36*(this.hp/this.mhp),5)}}
}
class Boss{
  constructor(x,y,wave){this.x=x;this.y=y;this.spd=1.1;this.hp=350+wave*40;this.mhp=this.hp;this.dmg=28;this.alive=true;this.hurtT=0;this.slow=0;this.atkCD=0;this.aFrame=0;this.aTimer=0;this.specT=0;this.phase=0;this.loot={exp:35,coins:15};this.wave=wave}
  update(g){if(!this.alive)return;if(this.hurtT>0)this.hurtT--;if(this.atkCD>0)this.atkCD--;if(this.slow>0)this.slow--;this.aTimer++;if(this.aTimer%12===0)this.aFrame=(this.aFrame+1)%2;
    const hp=this.hp/this.mhp;this.phase=hp<.3?2:hp<.6?1:0;
    const s=this.slow>0?this.spd*.35:this.spd*(1+this.phase*.25),dx=g.player.x-this.x,dy=g.player.y-this.y,d=Math.hypot(dx,dy);
    this.specT++;if(this.specT>200-this.phase*50){this.specT=0;const cnt=8+this.phase*4;for(let i=0;i<cnt;i++){const a=(Math.PI*2/cnt)*i;g.projs.push(new Proj(this.x,this.y,Math.cos(a),Math.sin(a),this.dmg*.4,'fireball',6))}g.shake=10}
    if(d>50){this.x+=dx/d*s*dt;this.y+=dy/d*s*dt}if(d<45&&this.atkCD<=0){g.player.hurt(this.dmg,g,this);this.atkCD=60}}
  hurt(dmg,g){this.hp-=dmg;this.hurtT=10;g.dmgNums.push(new DmgN(this.x,this.y-20,'-'+dmg,'#F44'));for(let i=0;i<5;i++)g.parts.push(new Part(this.x+rn(-15,15),this.y+rn(-15,15),'#800',25));
    if(this.hp<=0){this.alive=false;g.kills++;g.totalKills++;g.waveKills++;g.bossActive=false;g.knightKills=0;for(let i=0;i<this.loot.exp;i++)g.expOrbs.push(new ExpO(this.x+rn(-30,30),this.y+rn(-30,30)));for(let i=0;i<this.loot.coins;i++)g.coinOrbs.push(new CoinO(this.x+rn(-20,20),this.y+rn(-20,20)));for(let i=0;i<3;i++)g.chests.push(new Chest(this.x+rn(-40,40),this.y+rn(-40,40)));for(let i=0;i<40;i++)g.parts.push(new Part(this.x+rn(-40,40),this.y+rn(-40,40),['#800','#FD0','#F40','#F00'][i%4],60));g.dmgNums.push(new DmgN(this.x,this.y-40,'\u00a1JEFE DERROTADO!','#FFD700'));g.shake=20}}
  draw(ctx){drawBoss(ctx,this.x-20,this.y-30,this.aFrame,this.hurtT>0,this.phase);const bw=60;ctx.fillStyle='#333';ctx.fillRect(this.x-bw/2,this.y-48,bw,7);ctx.fillStyle=this.phase>=2?'#F00':'#F80';ctx.fillRect(this.x-bw/2,this.y-48,bw*(this.hp/this.mhp),7);ctx.fillStyle='#FFF';ctx.font='bold 11px Courier New';ctx.textAlign='center';ctx.fillText('BOSS Fase '+(this.phase+1),this.x,this.y-52);ctx.textAlign='left'}
}
function openShop(t){if(shopOpen)return;shopOpen=true;renderShop(t);document.getElementById('shopUI').style.display='flex'}
function renderShop(t){const p=G.player;const n={weapon:'Tienda de Armas',armor:'Tienda de Armaduras',potion:'Tienda de Pociones',herrero:'Herrero'};document.getElementById('sTitle').textContent=n[t];const items=getItems(t,p);let h='';items.forEach((it,i)=>{h+='<div class="sItem '+(it.done&&!it.cons?'owned':'')+'" data-shop="'+t+'" data-idx="'+i+'"><div class="icon">'+it.ic+'</div><div class="info"><div class="name">'+it.n+'</div><div class="desc">'+it.d+'</div></div><div class="price">'+(it.done&&!it.cons?'OK':'$'+it.p)+'</div></div>'});document.getElementById('sItems').innerHTML=h;document.getElementById('sCoins').textContent='Monedas: '+p.coins}
document.getElementById('sItems').addEventListener('click',function(e){const el=e.target.closest('.sItem');if(!el||!G)return;buy(el.getAttribute('data-shop'),parseInt(el.getAttribute('data-idx')))});
function closeShop(){shopOpen=false;document.getElementById('shopUI').style.display='none'}
function getItems(t,p){
  if(t==='weapon')return[{n:'Espada Mejorada',d:'+20% dano',p:50,ic:'\u2694',done:p.wup[0]>=1},{n:'Espada Ardiente',d:'+40% dano, fuego',p:150,ic:'\uD83D\uDD25',done:p.wup[0]>=2},{n:'Arco Reforzado',d:'+30% dano arco',p:80,ic:'\uD83C\uDFF9',done:p.wup[1]>=1},{n:'Arco Hielo',d:'+50% dano, congela',p:200,ic:'\u2744',done:p.wup[1]>=2},{n:'Vara Arcana',d:'+25% dano vara',p:100,ic:'\uD83D\uDD2E',done:p.wup[2]>=1},{n:'Vara Oscura',d:'+50% dano, drena',p:250,ic:'\uD83D\uDC9C',done:p.wup[2]>=2}];
  if(t==='armor')return[{n:'Armadura Ligera',d:'-5% vel, +15% def',p:40,ic:'\uD83D\uDEE1',done:p.aUnl[0]},{n:'Armadura Media',d:'-10% vel, +30% def',p:120,ic:'\uD83D\uDEE1',done:p.aUnl[1]},{n:'Armadura Pesada',d:'-18% vel, +50% def',p:220,ic:'\uD83D\uDEE1',done:p.aUnl[2]}];
  if(t==='potion')return[{n:'Pocion Vida',d:'Cura 35 HP',p:15,ic:'\u2764',done:false,cons:1},{n:'Pocion Mayor',d:'Cura 70 HP',p:35,ic:'\u2764',done:false,cons:1},{n:'Pocion Velocidad',d:'+30% vel 10s',p:25,ic:'\u26A1',done:false,cons:1},{n:'Pocion Fuerza',d:'+50% dano 10s',p:30,ic:'\uD83D\uDC80',done:false,cons:1}];
  return[{n:'Subir Nivel',d:'+10% dano permanente',p:65,ic:'\u2B06',done:false,cons:1},{n:'Subir Nivel x2',d:'+20% dano permanente',p:120,ic:'\u2B06',done:false,cons:1}]
}
function buy(t,i){const p=G.player;const items=getItems(t,p);const it=items[i];if((it.done&&!it.cons)||p.coins<it.p)return;p.coins-=it.p;
  if(t==='potion'){if(i===0)p.hp=Math.min(p.hp+35,p.mhp);if(i===1)p.hp=Math.min(p.hp+70,p.mhp);if(i===2){p.spdB=1.3;p.bTimer=600}if(i===3){p.dmgB=1.5;p.bTimer=600}}
  else if(t==='herrero'){p.wup[p.wpn]=(p.wup[p.wpn]||0)+1}
  else if(t==='weapon'){const m={0:[0,1],1:[0,2],2:[1,1],3:[1,2],4:[2,1],5:[2,2]};const[wl,l]=m[i];p.wup[wl]=Math.max(p.wup[wl]||0,l)}
  else if(t==='armor'){p.aUnl[i]=true;p.arm=i}
  saveData({coins:p.coins,exp:p.exp,lv:p.lv,hp:p.hp,wup:p.wup,aUnl:p.aUnl,arm:p.arm,pots:p.pots});renderShop(t)}
function drawHUD(ctx,p,g){
  const hpW=240,hpH=18;
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(10,10,hpW+20,hpH+28);
  ctx.strokeStyle='#8B4513';ctx.lineWidth=2;ctx.strokeRect(10,10,hpW+20,hpH+28);
  ctx.fillStyle='#333';ctx.fillRect(18,16,hpW,hpH);
  ctx.fillStyle='#C00';ctx.fillRect(18,16,hpW*(p.hp/p.mhp),hpH);
  ctx.fillStyle='#F66';ctx.fillRect(18,16,hpW*(p.hp/p.mhp)-2,5);
  ctx.fillStyle='#FFF';ctx.font='bold 11px Courier New';ctx.fillText('HP: '+Math.ceil(p.hp)+'/'+p.mhp,20,16+13);
  ctx.fillStyle='#FFF';ctx.font='10px Courier New';ctx.fillText('Nv.'+p.lv,18,52);ctx.fillText('$ '+p.coins,80,52);ctx.fillText('Poc: '+p.pots,150,52);
  const wn=['Espada','Arco','Vara'];
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(W-190,10,180,30);ctx.strokeStyle='#8B4513';ctx.lineWidth=2;ctx.strokeRect(W-190,10,180,30);
  ctx.fillStyle='#FFD700';ctx.font='bold 12px Courier New';ctx.fillText(wn[p.wpn],W-182,30);
  const an=['Sin armadura','Ligera','Media','Pesada'];
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(10,H-92,160,22);ctx.strokeStyle='#8B4513';ctx.strokeRect(10,H-92,160,22);
  ctx.fillStyle='#FFF';ctx.font='10px Courier New';ctx.fillText('Arm: '+an[p.arm+1],18,H-76);
  const sc2=[p.wpn===0?'#FD0':'#555',p.wpn===1?'#FD0':'#555',p.wpn===2?'#FD0':'#555'];
  ['1:Espada','2:Arco','3:Vara'].forEach((t,i)=>{ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(180+i*80,H-92,74,22);ctx.strokeStyle=sc2[i];ctx.strokeRect(180+i*80,H-92,74,22);ctx.fillStyle=sc2[i];ctx.font='10px Courier New';ctx.fillText(t,184+i*80,H-76)});
  if(!g.inLobby){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(W-160,H-92,150,22);ctx.strokeStyle='#8B4513';ctx.strokeRect(W-160,H-92,150,22);ctx.fillStyle='#FFF';ctx.font='10px Courier New';ctx.fillText('Oleada: '+g.wave+' / Kills: '+g.kills,W-152,H-76);
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(W-160,H-118,150,22);ctx.strokeStyle=p.dashCD>0?'#C00':'#0C0';ctx.strokeRect(W-160,H-118,150,22);ctx.fillStyle='#FFF';ctx.font='9px Courier New';ctx.fillText(p.dashCD>0?'Dash: CD':'SHIFT: Dash',W-152,H-102);
    if(g.waveState==='countdown'&&g.countdownTimer>0){const secs=Math.ceil(g.countdownTimer/60);ctx.fillStyle='#FFD700';ctx.font='bold 48px Courier New';ctx.textAlign='center';ctx.fillText('OLEADA '+(g.wave+1)+' EN '+secs+'...',W/2,H/2-40);ctx.textAlign='left'}
    if(g.waveState==='announce'&&g.announceTimer>0){const alpha=Math.min(1,g.announceTimer/30);ctx.globalAlpha=alpha;ctx.fillStyle='#FFD700';ctx.font='bold 64px Courier New';ctx.textAlign='center';ctx.fillText('OLEADA '+g.wave,W/2,H/2-20);ctx.textAlign='left';ctx.globalAlpha=1}}
  else{ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(W-180,H-92,170,22);ctx.strokeStyle='#666';ctx.strokeRect(W-180,H-92,170,22);ctx.fillStyle='#888';ctx.font='10px Courier New';ctx.fillText('TAB - Inventario',W-172,H-76)}
  const expMax=p.lv*80,expPct=p.exp/expMax;
  ctx.fillStyle='#222';ctx.fillRect(0,H-16,W,16);
  ctx.fillStyle='#333';ctx.fillRect(0,H-16,W,16);ctx.fillStyle='#2266CC';ctx.fillRect(0,H-16,W*expPct,16);
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(0,H-16,W*expPct,6);
  ctx.fillStyle='#FFF';ctx.font='bold 10px Courier New';ctx.textAlign='center';ctx.fillText('EXP: '+p.exp+' / '+expMax+'  (Nivel '+p.lv+')',W/2,H-4);ctx.textAlign='left';
}
function drawInventory(ctx,p){
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,W,H);
  const bx=W/2-200,by=H/2-200,bw=400,bh=400;
  ctx.fillStyle='#1a0f0a';ctx.fillRect(bx,by,bw,bh);ctx.strokeStyle='#8B4513';ctx.lineWidth=4;ctx.strokeRect(bx,by,bw,bh);
  ctx.fillStyle='#FFD700';ctx.font='bold 20px Courier New';ctx.textAlign='center';ctx.fillText('INVENTARIO',W/2,by+30);ctx.textAlign='left';
  ctx.fillStyle='#FFF';ctx.font='bold 14px Courier New';ctx.fillText('ARMAS:',bx+20,by+60);
  const wpns=[{n:'Espada',idx:0,unl:true},{n:'Arco',idx:1,unl:p.wup[1]>0},{n:'Vara',idx:2,unl:p.wup[2]>0}];
  wpns.forEach((w,i)=>{const wx=bx+20+i*120,wy=by+75;
    ctx.fillStyle=w.unl?(p.wpn===w.idx?'#2a4a1a':'#2C1810'):'#1a1a1a';ctx.fillRect(wx,wy,110,50);
    ctx.strokeStyle=w.unl?(p.wpn===w.idx?'#FFD700':'#5C3317'):'#333';ctx.lineWidth=2;ctx.strokeRect(wx,wy,110,50);
    ctx.fillStyle=w.unl?'#FFD700':'#666';ctx.font='12px Courier New';ctx.textAlign='center';ctx.fillText(w.n,wx+55,wy+20);
    if(p.wpn===w.idx){ctx.fillStyle='#0F0';ctx.font='9px Courier New';ctx.fillText('EQUIPADO',wx+55,wy+38)}else if(w.unl){ctx.fillStyle='#AAA';ctx.font='9px Courier New';ctx.fillText('Listo',wx+55,wy+38)}else ctx.textAlign='left'});
  ctx.textAlign='left';
  ctx.fillStyle='#FFF';ctx.font='bold 14px Courier New';ctx.fillText('ARMADURA:',bx+20,by+150);
  const arms=[{n:'Ninguna',idx:-1,unl:true},{n:'Ligera',idx:0,unl:p.aUnl[0]},{n:'Media',idx:1,unl:p.aUnl[1]},{n:'Pesada',idx:2,unl:p.aUnl[2]}];
  arms.forEach((a,i)=>{const wx=bx+20+i*93,wy=by+165;
    ctx.fillStyle=a.unl?(p.arm===a.idx?'#2a4a1a':'#2C1810'):'#1a1a1a';ctx.fillRect(wx,wy,86,50);
    ctx.strokeStyle=a.unl?(p.arm===a.idx?'#FFD700':'#5C3317'):'#333';ctx.lineWidth=2;ctx.strokeRect(wx,wy,86,50);
    ctx.fillStyle=a.unl?'#FFD700':'#666';ctx.font='11px Courier New';ctx.textAlign='center';ctx.fillText(a.n,wx+43,wy+20);
    if(p.arm===a.idx){ctx.fillStyle='#0F0';ctx.font='9px Courier New';ctx.fillText('EQUIPADO',wx+43,wy+38)}else if(a.unl){ctx.fillStyle='#AAA';ctx.font='9px Courier New';ctx.fillText('Owned',wx+43,wy+38)}else ctx.textAlign='left'});
  ctx.textAlign='left';
  const cpx=bx+20,cpy=by+240;
  ctx.fillStyle='#1a1a2a';ctx.fillRect(cpx,cpy,120,130);ctx.strokeStyle='#5C3317';ctx.lineWidth=2;ctx.strokeRect(cpx,cpy,120,130);
  ctx.fillStyle='#FFF';ctx.font='10px Courier New';ctx.textAlign='center';ctx.fillText('Preview',cpx+60,cpy-5);ctx.textAlign='left';
  ctx.save();ctx.translate(cpx+30,cpy+10);drawWarrior(ctx,-8,0,2,p.face,p.arm,p.wpn,0);ctx.restore();
  const ix=bx+170,iy=by+240;
  ctx.fillStyle='#FFF';ctx.font='12px Courier New';
  ctx.fillText('Nivel: '+p.lv,ix,iy+20);ctx.fillText('HP: '+Math.ceil(p.hp)+'/'+p.mhp,ix,iy+40);
  ctx.fillText('Monedas: '+p.coins,ix,iy+60);ctx.fillText('Pociones: '+p.pots,ix,iy+80);
  const dm=Math.floor(18*(1+(p.wup[p.wpn]||0)*.2));
  ctx.fillText('Dano base: '+dm,ix,iy+100);
  ctx.fillStyle='#888';ctx.font='10px Courier New';ctx.textAlign='center';ctx.fillText('Presiona TAB o ESC para cerrar',W/2,by+bh-15);ctx.textAlign='left';
}
class Game{
  constructor(){
    this.time=0;this.player=new Player(960,620);this.enemies=[];this.projs=[];this.expOrbs=[];this.coinOrbs=[];this.chests=[];this.parts=[];this.dmgNums=[];this.inLobby=true;this.shake=0;
    this.portal={x:960,y:500};
    this.shops=[{type:'weapon',x:160,y:750},{type:'armor',x:540,y:750},{type:'potion',x:1210,y:750},{type:'herrero',x:1590,y:750}];
    this.houses=[{x:100,y:440,w:170,h:115},{x:350,y:450,w:150,h:105},{x:590,y:445,w:160,h:110},{x:1170,y:440,w:170,h:115},{x:1420,y:450,w:150,h:105},{x:1660,y:445,w:160,h:110}];
    this.shopCol=[{x:160,y:750,w:70,h:52},{x:540,y:750,w:70,h:52},{x:1210,y:750,w:70,h:52},{x:1590,y:750,w:70,h:52}];
    this.wave=0;this.waveKills=0;this.waveKillTarget=0;this.waveTotalEnemies=0;this.waveEnemiesSpawned=0;this.spawnTimer=0;
    this.totalKills=0;this.kills=0;this.knightKills=0;this.bossActive=false;
    this.waveState='announce';this.announceTimer=120;this.countdownTimer=0;
    this.camX=this.player.x;this.camY=this.player.y;
    this.biome=0;this.levelAnim=0;this.levelTxt='';
    this.ambient=[];this.ambientTimer=0;
  }
  enterCombat(){this.wave=0;this.waveKills=0;this.totalKills=0;this.kills=0;this.knightKills=0;this.bossActive=false;this.waveState='announce';this.announceTimer=120;this.countdownTimer=0;this.startNextWave()}
  onLevelUp(lv){
    this.enemies=[];this.projs=[];
    this.expOrbs=this.expOrbs.filter(o=>o.collected);
    this.chests=[];this.bossActive=false;
    this.wave=0;this.waveKills=0;this.kills=0;this.knightKills=0;
    this.waveTotalEnemies=0;this.waveEnemiesSpawned=0;this.spawnTimer=0;
    this.startNextWave();
  }
  startNextWave(){this.wave++;this.waveKills=0;this.kills=0;this.waveTotalEnemies=5+(this.wave-1)*20;this.waveKillTarget=Math.min(this.waveTotalEnemies,10+Math.min(Math.floor((this.wave-1)/2),2));this.waveEnemiesSpawned=0;this.spawnTimer=0;this.waveState='announce';this.announceTimer=120;this.bossActive=false}
  loop(){if(!running)return;const t=performance.now();dt=lastT?Math.min((t-lastT)/16.667,3):1;lastT=t;this.update();this.draw();requestAnimationFrame(()=>this.loop())}
  update(){
    this.time++;if(this.shake>0)this.shake-=.5;if(this.levelAnim>0)this.levelAnim--;if(shopOpen||invOpen||paused)return;

    if(!isHost&&ws&&ws.readyState===1){
      mpSendInput();
      if(mpGameState)mpApplyState(mpGameState);
      return;
    }

    if(this.inLobby){const sx=W/1920,sy=H/1080,sc=Math.min(sx,sy);this.mwx=(MX-(W-1920*sc)/2)/sc;this.mwy=(MY-(H-1080*sc)/2)/sc}
    else{this.mwx=this.camX-W/2+MX;this.mwy=this.camY-H/2+MY}
    this.player.update(this);
    if(!this.inLobby){
      mpSimulateRemotePlayers();
      if(this.waveState==='announce'){this.announceTimer--;if(this.announceTimer<=0)this.waveState='active'}
      else if(this.waveState==='active'){
        this.spawnTimer++;if(this.spawnTimer>=30&&this.waveEnemiesSpawned<this.waveTotalEnemies){this.spawnTimer=0;const batch=Math.min(3,this.waveTotalEnemies-this.waveEnemiesSpawned);for(let i=0;i<batch;i++){const sp=this.getSpawnPos();const kChance=Math.min(.5,.15+this.wave*.03);if(Math.random()<kChance)this.enemies.push(new Knight(sp.x,sp.y));else this.enemies.push(new Goblin(sp.x,sp.y));this.waveEnemiesSpawned++}}
        if(this.waveKills>=this.waveKillTarget){this.waveState='countdown';this.countdownTimer=180}
        if(this.knightKills>=5&&!this.bossActive){this.bossActive=true;const sp=this.getSpawnPos();this.enemies.push(new Boss(sp.x,sp.y,this.wave));this.shake=12}
      }
      else if(this.waveState==='countdown'){this.countdownTimer--;if(this.countdownTimer<=0){this.startNextWave()}}
    }
    this.enemies.forEach(e=>e.update(this));this.projs.forEach(p=>p.update(this));
    this.expOrbs.forEach(o=>o.update(this.player,this));this.coinOrbs.forEach(c=>c.update(this.player,this));
    this.parts.forEach(p=>p.update());this.dmgNums.forEach(d=>d.update());
    this.enemies=this.enemies.filter(e=>e.alive);this.projs=this.projs.filter(p=>p.alive);
    this.expOrbs=this.expOrbs.filter(o=>o.alive);this.coinOrbs=this.coinOrbs.filter(c=>c.alive);
    this.chests=this.chests.filter(c=>!c.open);this.parts=this.parts.filter(p=>p.alive);this.dmgNums=this.dmgNums.filter(d=>d.alive);
    this.updateAmbient();
    if(ws&&ws.readyState===1&&isHost&&this.time%2===0)mpSendState(this.player);
  }
  updateAmbient(){
    this.ambientTimer++;
    const b=BIOMES[this.biome];
    if(this.inLobby){this.ambient=[];return}
    if(this.ambientTimer%3===0&&this.ambient.length<120){
      const vx=this.camX-W/2,vy=this.camY-H/2;
      const wx=vx+rn(0,W),wy=vy+rn(0,H);
      if(b.deco==='pine')this.ambient.push({x:wx,y:wy,vx:rn(-.4,.2),vy:rn(.4,1.1),col:'#FFFFFF',sz:rn(1,3),life:300,fl:rn(0,6.28)});
      else if(b.deco==='cactus')this.ambient.push({x:wx,y:vy,vx:rn(.5,1.6),vy:rn(-.3,.3),col:'#E8D090',sz:rn(1,2),life:200,fl:0});
      else if(b.deco==='lava')this.ambient.push({x:wx,y:vy,vx:rn(-.4,.4),vy:rn(-1.6,-.5),col:Math.random()<.5?'#FF6A00':'#FFB020',sz:rn(1,3),life:180,fl:rn(0,6.28)});
      else if(b.deco==='crystal')this.ambient.push({x:wx,y:vy,vx:rn(-.3,.3),vy:rn(-.2,.2),col:'#88CCFF',sz:rn(1,2),life:240,fl:rn(0,6.28)});
      else this.ambient.push({x:wx,y:vy,vx:rn(-.6,.2),vy:rn(.2,.9),col:Math.random()<.5?'#7AC04A':'#C9E28A',sz:rn(1,3),life:280,fl:rn(0,6.28)});
    }
    this.ambient.forEach(a=>{a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt;});
    this.ambient=this.ambient.filter(a=>a.life>0);
  }
  drawAmbient(){
    this.ambient.forEach(a=>{
      const p=Math.min(1,a.life/60);
      X.globalAlpha=p*(a.fl?0.4+Math.sin(a.fl+this.time*0.05)*0.3:0.7);
      X.fillStyle=a.col;X.fillRect(Math.floor(a.x),Math.floor(a.y),a.sz,a.sz);
    });
    X.globalAlpha=1;
  }
  getSpawnPos(){const px=this.player.x,py=this.player.y,s=rI(0,3);if(s===0)return{x:-30,y:py+rn(-400,400)};if(s===1)return{x:2430,y:py+rn(-400,400)};if(s===2)return{x:px+rn(-400,400),y:-30};return{x:px+rn(-400,400),y:2430}}
  drawLevelUp(){
    const p=this.levelAnim/120;
    if(p>0.7){X.globalAlpha=(1-p)*3;X.fillStyle='#FFF';X.fillRect(0,0,W,H);X.globalAlpha=1;}
    const scale=1+Math.max(0,(p-0.75))*4;
    X.save();X.translate(W/2,H/2-40);X.scale(scale,scale);
    X.globalAlpha=Math.min(1,p*3);
    X.fillStyle='#000';X.font='bold 72px Courier New';X.textAlign='center';
    X.fillText(this.levelTxt,4,4);X.fillStyle='#FFD700';X.fillText(this.levelTxt,0,0);
    X.font='bold 26px Courier New';X.fillStyle='#FFF';
    X.fillText('Nuevo mapa: '+BIOMES[this.biome].name,0,40);
    X.restore();X.globalAlpha=1;
  }
  draw(){
    X.fillStyle='#000';X.fillRect(0,0,W,H);X.save();
    if(this.shake>0)X.translate(rn(-this.shake,this.shake),rn(-this.shake,this.shake));
    if(this.inLobby){
      const sx=W/1920,sy=H/1080,sc=Math.min(sx,sy);X.translate((W-1920*sc)/2,(H-1080*sc)/2);X.scale(sc,sc);
      drawSky(X,this.time,1920,1080,BIOMES[0]);drawGround(X,1920,1080,380,BIOMES[0],this.time);
      drawStonePathH(X,195,1625,800,32);drawStonePathV(X,960,530,800,32);
      drawHouse(X,100,440,170,115,'#5C3317','#8B0000');drawHouse(X,350,450,150,105,'#4A2E1A','#6B3410');
      drawHouse(X,590,445,160,110,'#5C3317','#333');drawHouse(X,1170,440,170,115,'#4A2E1A','#228B22');
      drawHouse(X,1420,450,150,105,'#5C3317','#8B0000');drawHouse(X,1660,445,160,110,'#4A2E1A','#6B3410');
      drawTree(X,30,400,30);drawTree(X,810,405,28);drawTree(X,1090,403,30);drawTree(X,1880,400,26);
      drawTree(X,280,408,24);drawTree(X,770,402,26);drawTree(X,1120,406,25);drawTree(X,1400,404,28);drawTree(X,1840,402,24);
      drawFountain(X,960,520,this.time);
      drawTorch(X,900,420,this.time);drawTorch(X,1020,420,this.time);
      drawTraining(X,1700,830);
      this.shops.forEach(s=>drawShop(X,s,this.time));
      drawPortal(X,this.portal.x,this.portal.y,this.time);
      this.chests.forEach(c=>c.draw(X,this.time));
      this.player.draw(X);
      const pd=dst(this.player.x,this.player.y,this.portal.x,this.portal.y);
      if(pd<70){X.fillStyle='#FD0';X.font='12px Courier New';X.textAlign='center';X.fillText('Presiona E para entrar al portal',this.portal.x,this.portal.y-45);X.textAlign='left'}
      for(const s of this.shops){if(dst(this.player.x,this.player.y,s.x+35,s.y+52)<70){X.fillStyle='#FD0';X.font='11px Courier New';X.textAlign='center';X.fillText('E - Tienda',s.x+35,s.y-28);X.textAlign='left'}}
      for(const c of this.chests)if(!c.open&&dst(this.player.x,this.player.y,c.x,c.y)<60){X.fillStyle='#FFF';X.font='10px Courier New';X.textAlign='center';X.fillText(this.player.exp>=c.cost?'E ('+c.cost+' exp)':'Necesitas '+c.cost+' exp',c.x,c.y-22);X.textAlign='left'}
    }else{
      this.camX=lerp(this.camX,this.player.x,0.12*dt);this.camY=lerp(this.camY,this.player.y,0.12*dt);
      const cx=this.camX-W/2,cy=this.camY-H/2;X.translate(-cx,-cy);
      drawSky(X,this.time,2400,2400,BIOMES[this.biome]);drawGround(X,2400,2400,200,BIOMES[this.biome],this.time);
      this.drawAmbient();
      this.chests.forEach(c=>c.draw(X,this.time));this.expOrbs.forEach(o=>o.draw(X));this.coinOrbs.forEach(c=>c.draw(X));
      this.enemies.forEach(e=>e.draw(X));this.projs.forEach(p=>p.draw(X));this.player.draw(X);
      remotePlayers.forEach((rp,id)=>{
        ctx=X;ctx.globalAlpha=rp.alpha||0.8;
        drawWarrior(ctx,rp.x-16,rp.y-32,rp.aFrame||0,rp.face||'down',rp.arm||-1,rp.wpn||0,rp.atkF?10:0);
        ctx.globalAlpha=1;
        ctx.fillStyle='#4AF';ctx.font='bold 10px Courier New';ctx.textAlign='center';
        ctx.fillText(rp.name||'',rp.x,rp.y-40);ctx.textAlign='left';
        if(rp.hp!==undefined&&rp.hp<rp.mhp){ctx.fillStyle='#333';ctx.fillRect(rp.x-15,rp.y-48,30,4);ctx.fillStyle='#4AF';ctx.fillRect(rp.x-15,rp.y-48,30*(rp.hp/rp.mhp),4)}
      });
      this.dmgNums.forEach(d=>d.draw(X));this.parts.forEach(p=>p.draw(X));
    }
    X.restore();
    if(this.levelAnim>0){this.drawLevelUp()}
    drawHUD(X,this.player,this);
    if(invOpen)drawInventory(X,this.player);
  }
}
function getPlayerId(){let id=localStorage.getItem('pb_id');if(!id){id='p'+Date.now()+Math.random().toString(36).substr(2,6);localStorage.setItem('pb_id',id)}return id}
function getPlayerName(){return localStorage.getItem('pb_name')||''}
function setPlayerName(n){localStorage.setItem('pb_name',n)}
function saveGame(){
  if(!G)return;
  const p=G.player;
  saveData({coins:p.coins,exp:p.exp,lv:p.lv,hp:p.hp,wup:p.wup,aUnl:p.aUnl,arm:p.arm,pots:p.pots});
  const el=document.getElementById('saveMsg');
  if(el){el.textContent='Partida guardada '+new Date().toLocaleTimeString();el.style.display='block';setTimeout(()=>{el.style.display='none'},2000);}
}
function loadGame(){
  const s=loadData();
  if(!s){const el=document.getElementById('saveMsg');if(el){el.textContent='No hay partida guardada';el.style.display='block';setTimeout(()=>{el.style.display='none'},2000);}return}
  if(!G)return;
  const p=G.player;
  p.coins=s.coins||0;p.exp=s.exp||0;p.lv=s.lv||1;p.mhp=100+(p.lv-1)*12;
  p.hp=Math.min(s.hp||p.mhp,p.mhp);p.wup=s.wup||[0,0,0];p.aUnl=s.aUnl||[0,0,0];
  p.arm=s.arm!=null?s.arm:-1;p.pots=s.pots||3;
  const el=document.getElementById('saveMsg');
  if(el){el.textContent='Partida cargada';el.style.display='block';setTimeout(()=>{el.style.display='none'},2000);}
}
function togglePause(){
  if(!running||!G)return;
  paused=!paused;
  const el=document.getElementById('pauseMenu');
  if(el)el.style.display=paused?'flex':'none';
}
function resumeGame(){paused=false;const el=document.getElementById('pauseMenu');if(el)el.style.display='none'}
function exitToMenu(){
  paused=false;running=false;
  saveGame();
  const el=document.getElementById('pauseMenu');if(el)el.style.display='none';
  document.getElementById('startScreen').style.display='flex';
  document.getElementById('deathScreen').style.display='none';
  document.getElementById('mpChatBox').style.display='none';
  if(ws){try{ws.close()}catch(e){}ws=null}
  G=null;
}
function exitGame(){
  saveGame();
  try{window.close()}catch(e){}
  document.body.innerHTML='<div style="position:fixed;inset:0;background:#000;color:#FFD700;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Courier New;text-align:center;padding:40px"><h1 style="font-size:34px">PIXEL BLADE</h1><p style="margin:20px 0">Partida guardada. Ya puedes cerrar esta pestaña.</p><p style="color:#888;font-size:13px">Si la pestaña no se cerró sola, ciérrala manualmente (Ctrl+W).</p></div>';
}
function startGame(){
  const pid=getPlayerId();
  let name=getPlayerName();
  if(!name){name=prompt('Ingresa tu nombre de guerrero:');if(!name||!name.trim())return;name=name.trim();setPlayerName(name)}
  playerName=name;
  document.getElementById('startScreen').style.display='none';
  document.getElementById('deathScreen').style.display='none';
  const urlParams=new URLSearchParams(window.location.search);
  const roomCode=urlParams.get('room');
  if(roomCode&&roomCode.length===4){
    document.getElementById('mpLobby').style.display='none';
    document.getElementById('mpWait').style.display='flex';
    document.getElementById('mpRoomCode').textContent=roomCode;
    document.getElementById('mpWaitStatus').textContent='Conectando a sala '+roomCode+'...';
    running=true;G=new Game();G.loop();
    mpJoin(roomCode);
  }else{
    running=true;G=new Game();G.loop();
  }
}

let ws=null,isHost=false,mpCode='',mpSelfId='',roomRefreshTimer=null;
let remotePlayers=new Map();
let remoteInputs=new Map();
let mpGameState=null;
let playerPing=0;
let chatMessages=[];
let mpMaxPlayers=4;
let mpPlayers=[];

function showMP(){document.getElementById('startScreen').style.display='none';document.getElementById('mpLobby').style.display='flex';loadRoomList();loadOnlineLeaderboard();roomRefreshTimer=setInterval(loadRoomList,4000)}
function hideMP(){clearInterval(roomRefreshTimer);roomRefreshTimer=null;document.getElementById('mpLobby').style.display='none';document.getElementById('mpWait').style.display='none';document.getElementById('startScreen').style.display='flex';document.getElementById('mpChatBox').style.display='none'}
function showJoinUI(){document.getElementById('mpJoinCode').focus()}
function mpJoinFromInput(){
  const n=document.getElementById('mpName').value.trim()||'Jugador';
  playerName=n;
  const code=document.getElementById('mpJoinCode').value.trim();
  if(!code||code.length!==4){alert('Introduce un codigo de 4 digitos');return}
  mpJoin(code);
}
function startMPGame(){
  document.getElementById('mpWait').style.display='none';
  document.getElementById('startScreen').style.display='none';
  document.getElementById('deathScreen').style.display='none';
  document.getElementById('mpChatBox').style.display='block';
  running=true;G=new Game();G.loop();
}
function mpConnect(url,onMsg,onOpen){
  ws=new WebSocket(url);
  ws.onopen=()=>{document.getElementById('mpStatus').textContent='Conectado!';if(onOpen)onOpen()};
  ws.onmessage=onMsg;
  ws.onerror=()=>{document.getElementById('mpStatus').innerHTML='<span style="color:#F44">No hay servidor.<br>Despliega en Render.com</span>';ws=null};
  ws.onclose=()=>{if(running&&!shopOpen&&mpCode){mpLeave()}};
  return ws;
}
function getServerUrl(){
  if(MP_SERVER_URL)return MP_SERVER_URL;
  const loc=location;
  if(loc.hostname==='localhost'||loc.hostname==='127.0.0.1')return 'ws://localhost:3000';
  const proto=loc.protocol==='https:'?'wss:':'ws:';
  return proto+'//'+loc.host;
}
function getGameUrl(code){
  const loc=location;
  const proto=loc.protocol==='https:'?'https:':'http:';
  return proto+'//'+loc.host+'/?room='+code;
}
function mpCreate(){
  const n=document.getElementById('mpName').value.trim()||'Jugador';
  const customCode=document.getElementById('mpCustomCode').value.trim();
  if(!customCode||customCode.length!==4||!/^\d{4}$/.test(customCode)){alert('Introduce un codigo de 4 numeros (ej: 1234)');return}
  playerName=n;
  document.getElementById('mpStatus').textContent='Conectando...';
  clearInterval(roomRefreshTimer);roomRefreshTimer=null;
  mpConnect(getServerUrl(),e=>{
    const msg=JSON.parse(e.data);
    if(msg.type==='created'){
      isHost=true;mpCode=msg.code;mpSelfId='host';mpMaxPlayers=msg.maxPlayers||4;
      document.getElementById('mpLobby').style.display='none';
      document.getElementById('mpWait').style.display='flex';
      document.getElementById('mpRoomCode').textContent=msg.code;
      const link=getGameUrl(msg.code);
      document.getElementById('mpWaitStatus').innerHTML='Esperando jugadores...<br><br><span style="color:#4AF;font-size:13px">Comparte este link:<br><a href="'+link+'" style="color:#4AF;word-break:break-all" target="_blank">'+link+'</a></span>';
      document.getElementById('mpPlayerCount').textContent='1/'+mpMaxPlayers;
    }
    if(msg.type==='gameStart'){mpPlayers=msg.players||[];startMPGame()}
    if(msg.type==='error'){document.getElementById('mpStatus').innerHTML='<span style="color:#F44">'+msg.msg+'</span>';ws=null}
    if(msg.type==='playerJoined'){
      mpPlayers=msg.players||[];
      const count=mpPlayers.length;
      document.getElementById('mpPlayerCount').textContent=count+'/'+mpMaxPlayers;
      let names=mpPlayers.map(p=>p.name).join(', ');
      document.getElementById('mpWaitStatus').innerHTML='<span style="color:#0F0">'+count+' jugadores conectados</span><br><span style="color:#AAA;font-size:12px">'+names+'</span>';
      if(isHost){document.getElementById('startGameBtn').style.display='inline-block';document.getElementById('startGameBtn').textContent='INICIAR ('+count+'/'+mpMaxPlayers+')'}
    }
    if(msg.type==='remoteInput'){remoteInputs.set(msg.playerId,msg.data)}
    if(msg.type==='gameState'){mpGameState=msg.data;mpApplyState(msg.data)}
    if(msg.type==='chat'){addChatMessage(msg.from,msg.text)}
    if(msg.type==='ping'){playerPing=Date.now()-msg.t;const el=document.getElementById('mpPing');if(el)el.textContent=playerPing+'ms'}
    if(msg.type==='playerLeft'){remotePlayers.delete(msg.playerId);remoteInputs.delete(msg.playerId);addChatMessage('Sistema',msg.name+' se desconecto')}
  },()=>{ws.send(JSON.stringify({type:'create',code:customCode,name:n}))});
}
function mpJoin(code){
  const n=playerName||'Jugador';
  document.getElementById('mpStatus').textContent='Conectando a sala '+code+'...';
  clearInterval(roomRefreshTimer);roomRefreshTimer=null;
  mpConnect(getServerUrl(),e=>{
    const msg=JSON.parse(e.data);
    if(msg.type==='joined'){
      isHost=false;mpCode=msg.code;mpSelfId=msg.playerId;mpMaxPlayers=msg.maxPlayers||4;mpPlayers=msg.players||[];
      document.getElementById('mpLobby').style.display='none';
      document.getElementById('mpWait').style.display='flex';
      document.getElementById('mpRoomCode').textContent=msg.code;
      document.getElementById('mpPlayerCount').textContent=mpPlayers.length+'/'+mpMaxPlayers;
      document.getElementById('mpWaitStatus').textContent='Conectado! Esperando inicio...';
    }
    if(msg.type==='gameStart'){mpPlayers=msg.players||[];startMPGame()}
    if(msg.type==='gameState'){mpGameState=msg.data;mpApplyState(msg.data)}
    if(msg.type==='error'){document.getElementById('mpStatus').innerHTML='<span style="color:#F44">'+msg.msg+'</span>';ws=null}
    if(msg.type==='hostLeft'){addChatMessage('Sistema','El host se desconecto');setTimeout(mpLeave,2000)}
    if(msg.type==='playerLeft'){remotePlayers.delete(msg.playerId);remoteInputs.delete(msg.playerId);addChatMessage('Sistema',msg.name+' se desconecto')}
    if(msg.type==='chat'){addChatMessage(msg.from,msg.text)}
    if(msg.type==='ping'){playerPing=Date.now()-msg.t;const el=document.getElementById('mpPing');if(el)el.textContent=playerPing+'ms'}
  },()=>{ws.send(JSON.stringify({type:'join',code,name:n}))});
}
function mpLeave(){
  if(ws){try{ws.send(JSON.stringify({type:'leave'}))}catch(e){}ws.close();ws=null}
  isHost=false;mpCode='';remotePlayers.clear();remoteInputs.clear();mpPlayers=[];
  document.getElementById('mpWait').style.display='none';
  document.getElementById('mpLobby').style.display='none';
  document.getElementById('mpChatBox').style.display='none';
  document.getElementById('startScreen').style.display='flex';
  chatMessages=[];updateChatUI();
}
function showLB(){
  const lb=loadLB();
  if(!lb.length){alert('Aun no hay registros.');return}
  let html='<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:200;display:flex;justify-content:center;align-items:center" onclick="this.remove()"><div style="background:#1a0f0a;border:3px solid #8B4513;padding:30px;min-width:400px;max-height:80vh;overflow-y:auto" onclick="event.stopPropagation()"><h2 style="color:#FFD700;text-align:center;margin-bottom:20px">TABLERO DE LIDERES</h2>';
  lb.slice(0,15).forEach((e,i)=>{const gold=i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#AAA';html+='<div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #333;color:'+gold+'"><span>'+(i+1)+'. '+e.name+'</span><span>Oleada:'+e.wave+' Kills:'+e.kills+' Nv:'+e.lv+'</span></div>'});
  html+='</div></div>';document.body.insertAdjacentHTML('beforeend',html);
}
function changeName(){const n=prompt('Nuevo nombre de guerrero:');if(n&&n.trim()){setPlayerName(n.trim());alert('Nombre cambiado a: '+n.trim())}}
function showGuide(){document.getElementById('startScreen').style.display='none';document.getElementById('guideScreen').style.display='block'}
function hideGuide(){document.getElementById('guideScreen').style.display='none';document.getElementById('startScreen').style.display='flex'}

function sendChat(){
  const input=document.getElementById('mpChatInput');
  if(!input||!input.value.trim())return;
  const text=input.value.trim();input.value='';
  if(ws&&ws.readyState===1)ws.send(JSON.stringify({type:'chat',text}));
  addChatMessage(playerName,text);
}
function addChatMessage(from,text){
  chatMessages.push({from,text,time:Date.now()});
  if(chatMessages.length>50)chatMessages.shift();
  updateChatUI();
}
function updateChatUI(){
  const el=document.getElementById('mpChatMessages');if(!el)return;
  el.innerHTML=chatMessages.map(m=>{
    const col=m.from===playerName?'#4AF':m.from==='Sistema'?'#F80':'#0F0';
    return '<div style="color:'+col+';font-size:11px;padding:2px 0"><b>'+m.from+':</b> '+m.text+'</div>';
  }).join('');el.scrollTop=el.scrollHeight;
}
function mpStartGame(){if(ws&&ws.readyState===1&&isHost)ws.send(JSON.stringify({type:'startGame'}))}
function getHttpBase(){
  const su=getServerUrl();
  if(su.indexOf('wss://')===0)return 'https://'+su.slice(6);
  if(su.indexOf('ws://')===0)return 'http://'+su.slice(5);
  return location.origin;
}
function loadRoomList(){
  const base=getHttpBase();
  fetch(base+'/api/rooms').then(r=>r.json()).then(list=>{
    const el=document.getElementById('mpRoomList');if(!el)return;
    if(!list.length){el.innerHTML='<div style="color:#888;text-align:center;padding:10px">No hay salas activas</div>';return}
    el.innerHTML=list.map(r=>'<div class="roomItem" onclick="mpJoin(\''+r.code+'\')"><span style="color:#FFD700">'+r.code+'</span><span style="color:#888">'+r.host+'</span><span style="color:'+(r.state==='lobby'?'#0F0':'#F80')+'">'+r.players+'/'+r.maxPlayers+'</span></div>').join('');
  }).catch(()=>{const el=document.getElementById('mpRoomList');if(el)el.innerHTML='<div style="color:#888;text-align:center">Servidor offline</div>'});
}
function loadOnlineLeaderboard(){
  const base=getHttpBase();
  fetch(base+'/api/leaderboard').then(r=>r.json()).then(lb=>{
    const el=document.getElementById('onlineLB');if(!el)return;
    if(!lb.length){el.innerHTML='<div style="color:#888;text-align:center;padding:10px">Sin registros</div>';return}
    el.innerHTML=lb.slice(0,20).map((e,i)=>{
      const gold=i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#AAA';
      return '<div style="display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #222;color:'+gold+'"><span>'+(i+1)+'. '+e.name+'</span><span>O:'+e.wave+' K:'+e.kills+' Nv:'+e.lv+'</span></div>';
    }).join('');
  }).catch(()=>{});
}

function mpSendState(p){
  if(!ws||ws.readyState!==1||!G||!isHost)return;
  const s=G;
  const enemies=s.enemies.filter(e=>e.alive).map(e=>({x:Math.round(e.x),y:Math.round(e.y),hp:e.hp,mhp:e.mhp,hurtT:e.hurtT,slow:e.slow,face:e instanceof Knight?(e.charging?1:0):0,type:e instanceof Boss?2:e instanceof Knight?1:0,phase:e.phase||0,aFrame:e.aFrame}));
  const projs=s.projs.filter(p=>p.alive).map(p=>({x:Math.round(p.x),y:Math.round(p.y),type:p.type}));
  const players={};
  players.host={x:Math.round(p.x),y:Math.round(p.y),face:p.face,wpn:p.wpn,arm:p.arm,atkF:p.atkF>0,aFrame:p.aFrame,hp:p.hp,mhp:p.mhp,exp:p.exp,lv:p.lv,coins:p.coins,pots:p.pots,name:playerName};
  remoteInputs.forEach((inp,pid)=>{
    if(remotePlayers.has(pid)){
      const rp=remotePlayers.get(pid);
      players[pid]={x:Math.round(rp.x),y:Math.round(rp.y),face:rp.face,wpn:rp.wpn,arm:rp.arm,atkF:rp.atkF>0,aFrame:rp.aFrame,hp:rp.hp,mhp:rp.mhp,name:rp.name||''};
    }
  });
  ws.send(JSON.stringify({type:'gameState',data:{players,enemies,projs,wave:s.wave,waveState:s.waveState,totalKills:s.totalKills,inLobby:s.inLobby,time:s.time,shake:s.shake,biome:s.biome}}));
}

function mpSendInput(){
  if(!ws||ws.readyState!==1||isHost)return;
  ws.send(JSON.stringify({type:'input',data:{keys:K,mx:MX,my:MY,mouseDown}}));
}

function mpApplyState(data){
  if(!G)return;mpGameState=data;
  if(data.players){
    const selfData=isHost?data.players.host:data.players[mpSelfId];
    if(selfData){
      G.player.x=lerp(G.player.x,selfData.x,0.3);G.player.y=lerp(G.player.y,selfData.y,0.3);
      G.player.face=selfData.face;G.player.wpn=selfData.wpn;G.player.arm=selfData.arm;
      G.player.atkF=selfData.atkF?10:0;G.player.aFrame=selfData.aFrame;
      G.player.hp=selfData.hp;G.player.mhp=selfData.mhp;
    }
    if(selfData){G.wave=data.wave;G.waveState=data.waveState;G.totalKills=data.totalKills;G.biome=data.biome||0}
    Object.keys(data.players).forEach(pid=>{
      if(pid===(isHost?'host':mpSelfId))return;
      const pd=data.players[pid];
      if(remotePlayers.has(pid)){
        const rp=remotePlayers.get(pid);
        rp.x=lerp(rp.x,pd.x,0.3);rp.y=lerp(rp.y,pd.y,0.3);
        rp.targetX=pd.x;rp.targetY=pd.y;rp.name=pd.name;
        rp.face=pd.face;rp.wpn=pd.wpn;rp.arm=pd.arm;
        rp.atkF=pd.atkF?10:0;rp.aFrame=pd.aFrame;
        rp.hp=pd.hp;rp.mhp=pd.mhp;rp.alpha=1;
      }else{
        remotePlayers.set(pid,{x:pd.x,y:pd.y,targetX:pd.x,targetY:pd.y,face:pd.face||'down',wpn:pd.wpn||0,arm:pd.arm||-1,atkF:pd.atkF?10:0,aFrame:pd.aFrame||0,hp:pd.hp||100,mhp:pd.mhp||100,name:pd.name||'Jugador',alpha:1});
      }
    });
    remotePlayers.forEach((rp,pid)=>{
      if(!data.players[pid]){rp.alpha=(rp.alpha||1)-0.05;if(rp.alpha<=0)remotePlayers.delete(pid)}
    });
  }
  G.enemies=data.enemies.map(e=>{
    if(e.type===2)return Object.assign(new Boss(e.x,e.y,G.wave),{hp:e.hp,x:e.x,y:e.y,hurtT:e.hurtT,slow:e.slow,phase:e.phase,aFrame:e.aFrame});
    if(e.type===1)return Object.assign(new Knight(e.x,e.y),{hp:e.hp,x:e.x,y:e.y,hurtT:e.hurtT,slow:e.slow,charging:e.face===1,aFrame:e.aFrame});
    return Object.assign(new Goblin(e.x,e.y),{hp:e.hp,x:e.x,y:e.y,hurtT:e.hurtT,slow:e.slow,aFrame:e.aFrame});
  });
  G.projs=data.projs.map(p=>Object.assign(new Proj(p.x,p.y,0,0,0,p.type),{x:p.x,y:p.y,alive:true}));
}

function mpSimulateRemotePlayers(){
  if(!G||G.inLobby)return;
  remoteInputs.forEach((inp,pid)=>{
    if(!inp||!inp.keys)return;
    let rp=remotePlayers.get(pid);
    if(!rp){rp={x:1200,y:1200,targetX:1200,targetY:1200,face:'down',wpn:0,arm:-1,aFrame:0,atkF:0,atkCD:0,hp:100,mhp:100,bSpd:3.2,name:'Jugador',alpha:1};remotePlayers.set(pid,rp)}
    if(rp.atkF>0)rp.atkF-=.5;
    if(rp.atkCD>0)rp.atkCD--;
    if(isHost){
      const dx=inp.mx-(W/2),dy=inp.my-(H/2);
      if(Math.abs(dx)>10||Math.abs(dy)>10){const a=Math.atan2(dy,dx);if(a>-0.75&&a<0.75)rp.face='right';else if(a>0.75&&a<2.36)rp.face='down';else if(a<-0.75&&a>-2.36)rp.face='up';else rp.face='left'}
      let mx=0,my=0;const k=inp.keys;
      if(k.w||k.arrowup)my=-1;if(k.s||k.arrowdown)my=1;
      if(k.a||k.arrowleft)mx=-1;if(k.d||k.arrowright)mx=1;
      if(mx!==0||my!==0){const l=Math.hypot(mx,my);mx/=l;my/=l}
      rp.x+=mx*rp.bSpd;rp.y+=my*rp.bSpd;rp.x=cl(rp.x,20,2400);rp.y=cl(rp.y,20,2400);
      if(mx!==0||my!==0){rp.aFrame=(rp.aFrame+1)%6}
      if(inp.mouseDown&&rp.atkCD<=0){rp.atkF=10;rp.atkCD=20;G.enemies.forEach(e=>{if(!e.alive)return;if(dst(rp.x,rp.y,e.x,e.y)<60)e.hurt(18,G)})}
    }else{
      rp.x=lerp(rp.x,rp.targetX,0.25);rp.y=lerp(rp.y,rp.targetY,0.25);
    }
  });
}
