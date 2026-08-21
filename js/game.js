const C=document.getElementById('c'),X=C.getContext('2d');
let W,H,running=false,G=null,shopOpen=false,invOpen=false;
let K={},MX=0,MY=0,mouseDown=false,playerName='';
function resize(){W=C.width=innerWidth;H=C.height=innerHeight}
addEventListener('resize',resize);resize();
addEventListener('keydown',e=>{
  K[e.key.toLowerCase()]=1;
  if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();
  if(e.key==='Escape'){if(shopOpen)closeShop();else if(invOpen)invOpen=false}
  if(e.key.toLowerCase()==='tab'){e.preventDefault();if(!shopOpen)invOpen=!invOpen}
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
function saveData(d){try{localStorage.setItem('pbSave',JSON.stringify(d))}catch(e){}}
function loadData(){try{return JSON.parse(localStorage.getItem('pbSave'))}catch(e){return null}}
function saveLB(e){try{let lb=JSON.parse(localStorage.getItem('pbLB')||'[]');const idx=lb.findIndex(x=>x.id===e.id);if(idx>=0){if(e.wave>lb[idx].wave||(e.wave===lb[idx].wave&&e.kills>lb[idx].kills))lb[idx]=e}else lb.push(e);lb.sort((a,b)=>b.wave-a.wave||b.kills-a.kills||b.lv-a.lv);localStorage.setItem('pbLB',JSON.stringify(lb.slice(0,20)))}catch(e){}}
function loadLB(){try{return JSON.parse(localStorage.getItem('pbLB')||'[]')}catch(e){return[]}}
function drawWarrior(ctx,x,y,frame,face,armor,wpn,atkF){
  const sk='#FFD5A0',hr='#6B3A2A';
  const ac=[['#2855AA','#1C3D7A'],['#4488BB','#336699'],['#AA3333','#882222']];
  const sc=armor>=0?ac[Math.min(armor,2)]:['#2855AA','#1C3D7A'];
  const f=frame%6,la=[0,-2,-3,-1,1,3][f],bob=[0,-1,-2,-1,0,1][f];
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(x+12,y+52,14,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3D2B1F';ctx.fillRect(x+4+la,y+36+bob,7,12);ctx.fillRect(x+13-la,y+36+bob,7,12);
  ctx.fillStyle='#2A1F14';ctx.fillRect(x+3+la,y+46+bob,9,5);ctx.fillRect(x+12-la,y+46+bob,9,5);
  ctx.fillStyle=sc[0];ctx.fillRect(x+1,y+20,22,18);
  ctx.fillStyle='#8B6914';ctx.fillRect(x+1,y+29,22,3);
  ctx.fillStyle=sc[1];ctx.fillRect(x+1,y+32,22,6);
  ctx.fillStyle=sk;ctx.fillRect(x-3,y+21,6,10);ctx.fillRect(x+21,y+21,6,10);
  ctx.fillStyle='#5C3317';ctx.fillRect(x-3,y+29,6,4);ctx.fillRect(x+21,y+29,6,4);
  ctx.fillStyle=sk;ctx.fillRect(x+8,y+16,8,5);
  ctx.fillStyle=hr;ctx.fillRect(x+2,y-4,20,6);ctx.fillRect(x+4,y-8,16,5);
  ctx.fillStyle=sk;ctx.fillRect(x+4,y+1,16,14);
  ctx.fillStyle='#FFF';ctx.fillRect(x+6,y+5,4,4);ctx.fillRect(x+14,y+5,4,4);
  ctx.fillStyle='#333';ctx.fillRect(x+8,y+6,2,3);ctx.fillRect(x+15,y+6,2,3);
  ctx.fillStyle=hr;ctx.fillRect(x+6,y+4,4,1);ctx.fillRect(x+14,y+4,4,1);
  ctx.fillStyle='#CC8866';ctx.fillRect(x+10,y+12,4,1);
  ctx.fillStyle='#5D4E37';ctx.fillRect(x+2,y-8,20,5);ctx.fillRect(x+4,y-12,16,5);ctx.fillRect(x+6,y-14,12,3);
  ctx.fillStyle='#4A3E2F';ctx.fillRect(x+6,y+1,12,2);
  if(wpn===0){
    if(atkF>0){
      const ang=G?Math.atan2(G.mwy-(y+32),G.mwx-(x+12)):0;
      const sx=x+12+Math.cos(ang)*20,sy=y+20+Math.sin(ang)*15;
      ctx.save();ctx.translate(sx,sy);ctx.rotate(ang-0.3);
      ctx.fillStyle='#AAA';ctx.fillRect(-2,-18,4,18);ctx.fillStyle='#DDD';ctx.fillRect(-1,-20,2,4);ctx.fillStyle='#8B4513';ctx.fillRect(-4,-2,8,4);ctx.restore();
    }else{ctx.fillStyle='#AAA';ctx.fillRect(x+22,y+22,4,16);ctx.fillStyle='#DDD';ctx.fillRect(x+23,y+18,2,6);ctx.fillStyle='#8B4513';ctx.fillRect(x+21,y+20,6,3)}
  }else if(wpn===1){
    ctx.strokeStyle='#8B4513';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x-2,y+24,14,0.3,2.8);ctx.stroke();
    ctx.strokeStyle='#DDD';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-2+Math.cos(0.3)*14,y+24+Math.sin(0.3)*14);ctx.lineTo(x-2+Math.cos(2.8)*14,y+24+Math.sin(2.8)*14);ctx.stroke();
  }else{
    ctx.fillStyle='#6B3A2A';ctx.fillRect(x+20,y+10,3,30);
    ctx.fillStyle='#9933FF';ctx.beginPath();ctx.arc(x+21,y+10,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#CC66FF';ctx.beginPath();ctx.arc(x+21,y+10,3,0,Math.PI*2);ctx.fill();
  }
}
function drawGoblin(ctx,x,y,frame,hurt){
  const c=hurt?'#FF6666':'#3A8C3A',d=hurt?'#CC4444':'#2D6B2D';
  ctx.fillStyle=c;ctx.fillRect(x+2,y+8,20,16);ctx.fillRect(x+4,y-2,16,12);ctx.fillRect(x+2,y+2,20,6);
  ctx.fillStyle=d;ctx.fillRect(x-2,y,4,6);ctx.fillRect(x+22,y,4,6);
  ctx.fillStyle='#FF0';ctx.fillRect(x+6,y+3,4,4);ctx.fillRect(x+14,y+3,4,4);
  ctx.fillStyle='#F00';ctx.fillRect(x+7,y+4,2,2);ctx.fillRect(x+15,y+4,2,2);
  ctx.fillStyle='#400';ctx.fillRect(x+8,y+9,8,2);ctx.fillStyle='#FFF';ctx.fillRect(x+9,y+9,2,1);ctx.fillRect(x+13,y+9,2,1);
  ctx.fillStyle=d;ctx.fillRect(x+4+frame*2,y+24,6,8);ctx.fillRect(x+14-frame*2,y+24,6,8);
  ctx.fillStyle='#333';ctx.fillRect(x+3+frame*2,y+30,8,3);ctx.fillRect(x+13-frame*2,y+30,8,3);
}
function drawKnight(ctx,x,y,frame,hurt,charging){
  const a=hurt?'#FF6666':'#777';
  ctx.fillStyle='#444';ctx.fillRect(x+4+frame*2,y+34,7,12);ctx.fillRect(x+15-frame*2,y+34,7,12);
  ctx.fillStyle='#333';ctx.fillRect(x+3+frame*2,y+44,9,4);ctx.fillRect(x+14-frame*2,y+44,9,4);
  ctx.fillStyle=a;ctx.fillRect(x+1,y+16,24,20);
  ctx.fillStyle='#999';for(let i=0;i<5;i++)for(let j=0;j<4;j++)ctx.fillRect(x+3+i*4,y+18+j*4,3,3);
  ctx.fillStyle='#8B6914';ctx.fillRect(x+1,y+30,24,3);
  ctx.fillStyle=a;ctx.fillRect(x-4,y+17,6,12);ctx.fillRect(x+24,y+17,6,12);
  ctx.fillStyle='#8B4513';ctx.fillRect(x-6,y+18,8,10);ctx.fillStyle='#AAA';ctx.fillRect(x-5,y+19,6,8);
  ctx.fillStyle='#AAA';ctx.fillRect(x+4,y-4,18,14);ctx.fillRect(x+2,y+4,22,6);
  ctx.fillStyle='#222';ctx.fillRect(x+6,y+5,6,4);ctx.fillRect(x+16,y+5,6,4);
  ctx.fillStyle='#000';ctx.fillRect(x+8,y+6,2,2);ctx.fillRect(x+18,y+6,2,2);
  ctx.fillStyle='#888';ctx.fillRect(x+6,y-8,14,6);ctx.fillRect(x+10,y-12,6,5);
  ctx.fillStyle='#CC0000';ctx.fillRect(x+11,y-16,4,6);ctx.fillRect(x+12,y-18,2,3);
  if(charging){ctx.globalAlpha=0.5;ctx.fillStyle='#FF4400';ctx.fillRect(x-4,y+10,32,4);ctx.globalAlpha=1}
}
function drawBoss(ctx,x,y,frame,hurt,phase){
  const a=hurt?'#FF6666':'#8B0000',b=hurt?'#CC4444':'#660000';
  ctx.fillStyle='#444';ctx.fillRect(x+4,y+52,10,16);ctx.fillRect(x+24,y+52,10,16);
  ctx.fillStyle=a;ctx.fillRect(x,y+20,38,34);
  ctx.fillStyle=b;ctx.fillRect(x+2,y+24,34,6);ctx.fillRect(x+2,y+36,34,6);
  ctx.fillStyle='#FFD700';ctx.fillRect(x+4,y-8,30,8);ctx.fillRect(x+6,y-14,4,8);ctx.fillRect(x+20,y-14,4,8);
  ctx.fillStyle=a;ctx.fillRect(x+4,y-2,30,16);
  ctx.fillStyle='#F00';ctx.fillRect(x+8,y+2,6,5);ctx.fillRect(x+20,y+2,6,5);
  ctx.fillStyle='#FFF';ctx.fillRect(x+9,y+3,3,3);ctx.fillRect(x+21,y+3,3,3);
  ctx.fillStyle='#000';ctx.fillRect(x+8,y+10,16,4);ctx.fillStyle='#FFF';for(let i=0;i<5;i++)ctx.fillRect(x+9+i*3,y+10,2,2);
  ctx.fillStyle=b;ctx.fillRect(x-6,y+22,8,20);ctx.fillRect(x+32,y+22,8,20);
  if(phase>0){ctx.globalAlpha=0.15+Math.sin(frame*0.1)*0.1;ctx.fillStyle=phase>=2?'#F00':'#F60';ctx.beginPath();ctx.arc(x+19,y+30,45,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
}
function drawChestObj(ctx,x,y,open,t){
  if(open){ctx.fillStyle='#8B4513';ctx.fillRect(x-14,y-8,28,16);ctx.fillStyle='#5C3317';ctx.fillRect(x-12,y-12,24,6)}
  else{ctx.fillStyle='#8B4513';ctx.fillRect(x-14,y-14,28,16);ctx.fillStyle='#6B3410';ctx.fillRect(x-12,y-12,24,12);ctx.fillStyle='#FFD700';ctx.fillRect(x-3,y-2,6,6);ctx.fillRect(x-1,y+1,2,2);ctx.fillRect(x+2,y+1,2,2);
    if(Math.sin(t*0.08)>0){ctx.globalAlpha=0.3;ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(x,y,16,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
    ctx.fillStyle='#FFF';ctx.font='10px Courier New';ctx.textAlign='center';ctx.fillText('E',x,y-20);ctx.textAlign='left'}
}
function drawSky(ctx,t,w,h){
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#0B0B2A');g.addColorStop(0.3,'#162447');g.addColorStop(0.6,'#1F4068');g.addColorStop(1,'#1a3a2a');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  for(let i=0;i<60;i++){const sx=(i*173+47)%w,sy=(i*127+23)%(h*0.35);ctx.globalAlpha=Math.sin(t*0.02+i)*0.3+0.6;ctx.fillStyle='#FFF';ctx.fillRect(sx,sy,1+(i%2),1+(i%2));ctx.globalAlpha=1}
  ctx.fillStyle='#FFFFCC';ctx.beginPath();ctx.arc(w-100,60,35,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#0B0B2A';ctx.beginPath();ctx.arc(w-88,55,30,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#FFFFCC';ctx.globalAlpha=0.1;ctx.beginPath();ctx.arc(w-100,60,50,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
function drawGround(ctx,w,h,gy){
  ctx.fillStyle='#3A6B1E';ctx.fillRect(0,gy,w,h-gy);
  ctx.fillStyle='#2D5016';ctx.fillRect(0,gy,w,4);
  for(let i=0;i<w;i+=48)for(let j=gy;j<h;j+=48){ctx.strokeStyle='rgba(255,255,255,0.02)';ctx.strokeRect(i,j,48,48)}
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
  ctx.fillStyle=wcol;ctx.fillRect(x,y,w,h);
  for(let i=0;i<w;i+=10)for(let j=0;j<h;j+=10){ctx.strokeStyle='rgba(0,0,0,0.12)';ctx.lineWidth=0.5;ctx.strokeRect(x+i,y+j,8,8)}
  ctx.fillStyle=rcol;ctx.beginPath();ctx.moveTo(x-8,y);ctx.lineTo(x+w/2,y-h*0.45);ctx.lineTo(x+w+8,y);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3E2723';ctx.fillRect(x+w/2-12,y+h-40,24,40);ctx.fillStyle='#FFD700';ctx.fillRect(x+w/2-2,y+h-22,4,4);
  ctx.fillStyle='#4A6FA5';ctx.globalAlpha=0.4;
  if(w>140){ctx.fillRect(x+12,y+20,22,18);ctx.fillRect(x+w-34,y+20,22,18)}else{ctx.fillRect(x+w/2-10,y+20,20,18)}
  ctx.globalAlpha=1;
  ctx.fillStyle='#5C3317';ctx.fillRect(x+12,y+20,22,2);ctx.fillRect(x+22,y+20,2,18);
  if(w>140){ctx.fillRect(x+w-34,y+20,22,2);ctx.fillRect(x+w-24,y+20,2,18)}
}
function drawTree(ctx,x,y,sz){
  ctx.fillStyle='#5C3317';ctx.fillRect(x-4,y,8,sz*0.6);
  const gs=['#1E4D2B','#2D5016','#3A6B1E'];
  for(let i=0;i<3;i++){ctx.fillStyle=gs[i];ctx.beginPath();ctx.arc(x,y-i*sz*0.18,sz-i*4,0,Math.PI*2);ctx.fill()}
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
  update(){this.x+=this.vx;this.y+=this.vy;this.vx*=.96;this.vy*=.96;this.vy+=.05;this.life--;if(this.life<=0)this.alive=false}
  draw(ctx){ctx.globalAlpha=this.life/this.ml;ctx.fillStyle=this.col;ctx.fillRect(Math.floor(this.x),Math.floor(this.y),this.sz,this.sz);ctx.globalAlpha=1}
}
class DmgN{
  constructor(x,y,t,c){this.x=x;this.y=y;this.t=t;this.c=c||'#FFF';this.life=50;this.ml=50;this.alive=true}
  update(){this.y-=1;this.life--;if(this.life<=0)this.alive=false}
  draw(ctx){ctx.globalAlpha=this.life/this.ml;ctx.font='bold 14px Courier New';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(this.t,this.x+1,this.y+1);ctx.fillStyle=this.c;ctx.fillText(this.t,this.x,this.y);ctx.textAlign='left';ctx.globalAlpha=1}
}
class ExpO{
  constructor(x,y){this.x=x;this.y=y;this.alive=true;this.ty=y+12+rn(0,8);this.falling=true;this.collected=false;this.cspd=0;this.life=600;this.t=Math.random()*100}
  update(p,g){this.life--;this.t++;if(this.life<=0){this.alive=false;return}if(this.falling){this.y+=1.5;if(this.y>=this.ty){this.falling=false;this.y=this.ty}}if(!this.falling&&!this.collected&&dst(this.x,this.y,p.x,p.y)<80)this.collected=true;
    if(this.collected){this.cspd+=.5;const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy);if(d>0){this.x+=dx/d*this.cspd;this.y+=dy/d*this.cspd}if(d<12){p.gainExp(1,g);this.alive=false;for(let i=0;i<5;i++)g.parts.push(new Part(this.x,this.y,'#0F8',20,undefined,undefined,3))}}}
  draw(ctx){if(this.life<60&&Math.floor(this.t/5)%2===0)return;const p=Math.sin(this.t*.1)*.3+.7;ctx.globalAlpha=p;ctx.fillStyle='#0F8';ctx.fillRect(Math.floor(this.x-3),Math.floor(this.y-3),6,6);ctx.fillStyle='#8FC';ctx.fillRect(Math.floor(this.x-1),Math.floor(this.y-1),2,2);ctx.globalAlpha=1}
}
class CoinO{
  constructor(x,y){this.x=x;this.y=y;this.alive=true;this.ty=y+15+rn(0,6);this.falling=true;this.collected=false;this.cspd=0;this.life=400;this.t=Math.random()*100}
  update(p,g){this.life--;this.t++;if(this.life<=0){this.alive=false;return}if(this.falling){this.y+=2;if(this.y>=this.ty){this.falling=false;this.y=this.ty}}if(!this.falling&&!this.collected&&dst(this.x,this.y,p.x,p.y)<55)this.collected=true;
    if(this.collected){this.cspd+=.6;const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy);if(d>0){this.x+=dx/d*this.cspd;this.y+=dy/d*this.cspd}if(d<10){p.coins++;this.alive=false}}}
  draw(ctx){const w=Math.sin(this.t*.15)*2;ctx.fillStyle='#DAA520';ctx.fillRect(Math.floor(this.x-3+w),Math.floor(this.y-3),6,6);ctx.fillStyle='#FFD700';ctx.fillRect(Math.floor(this.x-2+w),Math.floor(this.y-2),4,4)}
}
class Proj{
  constructor(x,y,dx,dy,dmg,type,spd){this.x=x;this.y=y;this.dx=dx;this.dy=dy;this.dmg=dmg;this.type=type||'arrow';this.spd=spd||10;this.alive=true;this.life=100}
  update(g){this.x+=this.dx*this.spd;this.y+=this.dy*this.spd;this.life--;if(this.life<=0){this.alive=false;return}
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
  constructor(x,y){this.x=x;this.y=y;this.spd=3.2;this.bSpd=3.2;this.hp=100;this.mhp=100;this.wpn=0;this.wup=[0,0,0];this.arm=-1;this.aUnl=[0,0,0];this.coins=0;this.exp=0;this.lv=1;this.face='down';this.mov=false;this.aFrame=0;this.aTimer=0;this.atkF=0;this.atkCD=0;this.dashF=0;this.dashCD=0;this.dashD={x:0,y:0};this.inv=0;this.spdB=1;this.dmgB=1;this.bTimer=0;this.pots=3;
    const s=loadData();if(s){this.coins=s.coins||0;this.exp=s.exp||0;this.lv=s.lv||1;this.mhp=100+(this.lv-1)*12;this.hp=Math.min(s.hp||this.mhp,this.mhp);this.wup=s.wup||[0,0,0];this.aUnl=s.aUnl||[0,0,0];this.arm=s.arm!=null?s.arm:-1;this.pots=s.pots||3}
  }
  getSpd(){return this.bSpd*[1,.95,.88,.8][this.arm+1]*this.spdB}
  getDmg(b){return Math.floor(b*(1+(this.wup[this.wpn]||0)*.2)*this.dmgB)}
  update(g){
    if(this.bTimer>0){this.bTimer--;if(this.bTimer<=0){this.spdB=1;this.dmgB=1}}
    if(this.inv>0)this.inv--;if(this.atkCD>0)this.atkCD--;if(this.dashCD>0)this.dashCD--;
    if(this.atkF>0)this.atkF-=.5;
    if(this.dashF>0){this.x+=this.dashD.x*12;this.y+=this.dashD.y*12;this.clamp(g);this.dashF-=.5;return}
    if(g.mwx!=null){const a=Math.atan2(g.mwy-this.y,g.mwx-this.x);if(a>-0.75&&a<0.75)this.face='right';else if(a>0.75&&a<2.36)this.face='down';else if(a<-0.75&&a>-2.36)this.face='up';else this.face='left'}
    let dx=0,dy=0;
    if(K.w||K.arrowup)dy=-1;if(K.s||K.arrowdown)dy=1;
    if(K.a||K.arrowleft)dx=-1;if(K.d||K.arrowright)dx=1;
    this.mov=dx!==0||dy!==0;
    if(this.mov){const l=Math.hypot(dx,dy);dx/=l;dy/=l}
    this.x+=dx*this.getSpd();this.y+=dy*this.getSpd();this.clamp(g);
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
  hurt(dmg,g){if(this.inv>0)return;const ad=[0,.15,.3,.5][this.arm+1],a=dmg*(1-ad);this.hp-=a;this.inv=50;g.shake=8;g.dmgNums.push(new DmgN(this.x,this.y-20,'-'+Math.ceil(a),'#F44'));for(let i=0;i<5;i++)g.parts.push(new Part(this.x+rn(-15,15),this.y+rn(-15,15),'#F00',20));if(this.hp<=0){this.hp=0;running=false;saveData({coins:this.coins,exp:this.exp,lv:this.lv,hp:0,wup:this.wup,aUnl:this.aUnl,arm:this.arm,pots:this.pots});const entry={id:getPlayerId(),name:playerName,wave:g.wave,kills:g.totalKills,lv:this.lv,date:Date.now()};saveLB(entry);const lb=loadLB();let html='Kills: '+g.totalKills+' | Oleadas: '+g.wave+' | Nivel: '+this.lv+'<br><br><b style="color:#FFD700">TABLERO DE LIDERES:</b><br>';lb.slice(0,10).forEach((e,i)=>{const mk=e.date===entry.date?'<span style="color:#FF0"> >> </span>':'    ';html+=mk+(i+1)+'. '+e.name+' - Oleada:'+e.wave+' Kills:'+e.kills+' Nv:'+e.lv+'<br>'});document.getElementById('dStats').innerHTML=html;document.getElementById('deathScreen').style.display='flex'}}
  gainExp(amt,g){this.exp+=amt;const n=this.lv*80;if(this.exp>=n){this.exp-=n;this.lv++;this.mhp+=12;this.hp=Math.min(this.hp+30,this.mhp);g.dmgNums.push(new DmgN(this.x,this.y-30,'\u00a1NIVEL '+this.lv+'!','#FFD700'));for(let i=0;i<20;i++)g.parts.push(new Part(this.x+rn(-30,30),this.y+rn(-30,30),['#FFD700','#FFA500','#FF0'][i%3],40))}}
  draw(ctx){if(this.inv>0&&Math.floor(this.inv/4)%2===0)ctx.globalAlpha=.4;
    drawWarrior(ctx,this.x-12,this.y-32,this.aFrame,this.face,this.arm,this.wpn,this.atkF);ctx.globalAlpha=1}
}
class Goblin{
  constructor(x,y){this.x=x;this.y=y;this.spd=1.4+rn(0,.4);this.hp=35;this.mhp=35;this.dmg=8;this.alive=true;this.hurtT=0;this.slow=0;this.atkCD=0;this.aFrame=0;this.aTimer=0;this.loot={exp:3,coins:rI(1,3)}}
  update(g){if(!this.alive)return;if(this.hurtT>0)this.hurtT--;if(this.atkCD>0)this.atkCD--;if(this.slow>0)this.slow--;this.aTimer++;if(this.aTimer%12===0)this.aFrame=(this.aFrame+1)%2;
    const s=this.slow>0?this.spd*.35:this.spd,dx=g.player.x-this.x,dy=g.player.y-this.y,d=Math.hypot(dx,dy);
    if(d>0){this.x+=dx/d*s;this.y+=dy/d*s}if(d<30&&this.atkCD<=0){g.player.hurt(this.dmg,g);this.atkCD=50}}
  hurt(dmg,g){this.hp-=dmg;this.hurtT=10;g.dmgNums.push(new DmgN(this.x,this.y-15,'-'+dmg,'#FFF'));for(let i=0;i<3;i++)g.parts.push(new Part(this.x+rn(-10,10),this.y+rn(-10,10),'#3A8C3A',20));
    if(this.hp<=0){this.alive=false;g.kills++;g.totalKills++;g.waveKills++;for(let i=0;i<this.loot.exp;i++)g.expOrbs.push(new ExpO(this.x+rn(-20,20),this.y+rn(-20,20)));for(let i=0;i<this.loot.coins;i++)g.coinOrbs.push(new CoinO(this.x+rn(-15,15),this.y+rn(-15,15)));if(Math.random()<0.1)g.chests.push(new Chest(this.x+rn(-25,25),this.y+rn(-25,25)));for(let i=0;i<10;i++)g.parts.push(new Part(this.x+rn(-15,15),this.y+rn(-15,15),['#3A8C3A','#5AB85A','#2D6B2D'][i%3],30))}}
  draw(ctx){drawGoblin(ctx,this.x-12,this.y-14,this.aFrame,this.hurtT>0);if(this.hp<this.mhp){ctx.fillStyle='#333';ctx.fillRect(this.x-15,this.y-20,30,4);ctx.fillStyle='#0C0';ctx.fillRect(this.x-15,this.y-20,30*(this.hp/this.mhp),4)}if(this.slow>0){ctx.globalAlpha=.5;ctx.fillStyle='#88F';ctx.fillRect(this.x-5,this.y+18,10,3);ctx.globalAlpha=1}}
}
class Knight{
  constructor(x,y){this.x=x;this.y=y;this.spd=.9;this.hp=90;this.mhp=90;this.dmg=18;this.alive=true;this.hurtT=0;this.slow=0;this.atkCD=0;this.aFrame=0;this.aTimer=0;this.chargeT=0;this.charging=false;this.chargeD={x:0,y:0};this.loot={exp:8,coins:rI(3,6)}}
  update(g){if(!this.alive)return;if(this.hurtT>0)this.hurtT--;if(this.atkCD>0)this.atkCD--;if(this.slow>0)this.slow--;this.aTimer++;if(this.aTimer%12===0)this.aFrame=(this.aFrame+1)%2;
    const s=this.slow>0?this.spd*.35:this.spd,dx=g.player.x-this.x,dy=g.player.y-this.y,d=Math.hypot(dx,dy);
    this.chargeT++;if(this.chargeT>150&&!this.charging&&d>80){this.charging=true;this.chargeT=0;if(d>0)this.chargeD={x:dx/d,y:dy/d}}
    if(this.charging){this.x+=this.chargeD.x*s*4;this.y+=this.chargeD.y*s*4;this.chargeT++;if(this.chargeT>25){this.charging=false;this.chargeT=0}}else{if(d>0){this.x+=dx/d*s;this.y+=dy/d*s}}
    if(d<35&&this.atkCD<=0){g.player.hurt(this.dmg,g);this.atkCD=80}}
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
    if(d>50){this.x+=dx/d*s;this.y+=dy/d*s}if(d<45&&this.atkCD<=0){g.player.hurt(this.dmg,g);this.atkCD=60}}
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
  ctx.save();ctx.translate(cpx+30,cpy+10);drawWarrior(ctx,0,0,2,p.face,p.arm,p.wpn,0);ctx.restore();
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
  }
  enterCombat(){this.wave=0;this.waveKills=0;this.totalKills=0;this.kills=0;this.knightKills=0;this.bossActive=false;this.waveState='announce';this.announceTimer=120;this.countdownTimer=0;this.startNextWave()}
  startNextWave(){this.wave++;this.waveKills=0;this.kills=0;this.waveTotalEnemies=5+(this.wave-1)*20;this.waveKillTarget=Math.min(this.waveTotalEnemies,10+Math.min(Math.floor((this.wave-1)/2),2));this.waveEnemiesSpawned=0;this.spawnTimer=0;this.waveState='announce';this.announceTimer=120;this.bossActive=false}
  loop(){if(!running)return;this.update();this.draw();requestAnimationFrame(()=>this.loop())}
  update(){
    this.time++;if(this.shake>0)this.shake-=.5;if(shopOpen||invOpen)return;
    if(this.inLobby){const sx=W/1920,sy=H/1080,sc=Math.min(sx,sy);this.mwx=(MX-(W-1920*sc)/2)/sc;this.mwy=(MY-(H-1080*sc)/2)/sc}
    else{this.mwx=this.player.x-W/2+MX;this.mwy=this.player.y-H/2+MY}
    this.player.update(this);
    if(!this.inLobby){
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
    if(ws&&ws.readyState===1&&this.time%3===0)mpSendState(this.player);
  }
  getSpawnPos(){const px=this.player.x,py=this.player.y,s=rI(0,3);if(s===0)return{x:-30,y:py+rn(-400,400)};if(s===1)return{x:2430,y:py+rn(-400,400)};if(s===2)return{x:px+rn(-400,400),y:-30};return{x:px+rn(-400,400),y:2430}}
  draw(){
    X.fillStyle='#000';X.fillRect(0,0,W,H);X.save();
    if(this.shake>0)X.translate(rn(-this.shake,this.shake),rn(-this.shake,this.shake));
    if(this.inLobby){
      const sx=W/1920,sy=H/1080,sc=Math.min(sx,sy);X.translate((W-1920*sc)/2,(H-1080*sc)/2);X.scale(sc,sc);
      drawSky(X,this.time,1920,1080);drawGround(X,1920,1080,380);
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
      const cx=this.player.x-W/2,cy=this.player.y-H/2;X.translate(-cx,-cy);
      drawSky(X,this.time,2400,2400);drawGround(X,2400,2400,200);
      this.chests.forEach(c=>c.draw(X,this.time));this.expOrbs.forEach(o=>o.draw(X));this.coinOrbs.forEach(c=>c.draw(X));
      this.enemies.forEach(e=>e.draw(X));this.projs.forEach(p=>p.draw(X));this.player.draw(X);drawRemotePlayer(X);
      this.dmgNums.forEach(d=>d.draw(X));this.parts.forEach(p=>p.draw(X));
    }
    X.restore();drawHUD(X,this.player,this);
    if(invOpen)drawInventory(X,this.player);
  }
}
function getPlayerId(){let id=localStorage.getItem('pb_id');if(!id){id='p'+Date.now()+Math.random().toString(36).substr(2,6);localStorage.setItem('pb_id',id)}return id}
function getPlayerName(){return localStorage.getItem('pb_name')||''}
function setPlayerName(n){localStorage.setItem('pb_name',n)}
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
    running=true;G=new Game();G.loop();
    setTimeout(()=>{mpJoin(roomCode)},500);
  }else{
    running=true;G=new Game();G.loop();
  }
}

let ws=null,isHost=false,remotePlayer=null,mpCode='';
function showMP(){document.getElementById('startScreen').style.display='none';document.getElementById('mpLobby').style.display='flex'}
function hideMP(){document.getElementById('mpLobby').style.display='none';document.getElementById('mpWait').style.display='none';document.getElementById('startScreen').style.display='flex'}
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
  running=true;G=new Game();G.loop();
}
function mpConnect(url,onMsg){
  ws=new WebSocket(url);
  ws.onopen=()=>{document.getElementById('mpStatus').textContent='Conectado!';console.log('Conectado al servidor')};
  ws.onmessage=onMsg;
  ws.onerror=()=>{document.getElementById('mpStatus').innerHTML='<span style="color:#F44">No hay servidor multiplayer.<br>Despliega el servidor en Render.com:<br><a href="https://render.com" style="color:#4AF" target="_blank">render.com</a></span>';ws=null};
  ws.onclose=()=>{if(running&&!shopOpen){mpLeave()}};
  return ws;
}
function getServerUrl(){
  const loc=location;
  if(loc.hostname==='localhost'||loc.hostname==='127.0.0.1')return 'ws://localhost:3000';
  const proto=loc.protocol==='https:'?'wss:':'ws:';
  return proto+'//'+loc.host;
}
function getGameUrl(code){return location.origin+location.pathname+'?room='+code}
function mpCreate(){
  const n=document.getElementById('mpName').value.trim()||'Jugador';
  const customCode=document.getElementById('mpCustomCode').value.trim();
  if(!customCode||customCode.length!==4||!/^\d{4}$/.test(customCode)){alert('Introduce un codigo de 4 numeros (ej: 1234)');return}
  playerName=n;
  document.getElementById('mpStatus').textContent='Conectando...';
  mpConnect(getServerUrl(),e=>{
    const msg=JSON.parse(e.data);
    if(msg.type==='created'){
      isHost=true;mpCode=msg.code;
      document.getElementById('mpLobby').style.display='none';
      document.getElementById('mpWait').style.display='flex';
      document.getElementById('mpRoomCode').textContent=msg.code;
      const link=getGameUrl(msg.code);
      document.getElementById('mpWaitStatus').innerHTML='Esperando jugador...<br><br><span style="color:#4AF;font-size:13px">Comparte este link:<br><a href="'+link+'" style="color:#4AF;word-break:break-all" target="_blank">'+link+'</a></span>';
    }
    if(msg.type==='error'){document.getElementById('mpStatus').innerHTML='<span style="color:#F44">'+msg.msg+'</span>';ws=null}
    if(msg.type==='playerJoined'){
      document.getElementById('mpWaitStatus').innerHTML='<span style="color:#0F0">'+msg.name+' se unio!</span>';
      setTimeout(()=>{ws.send(JSON.stringify({type:'startGame'}));startMPGame()},1000);
    }
    if(msg.type==='input'){
      if(!remotePlayer)remotePlayer={x:1200,y:1200,wpn:0,arm:-1,face:'down',aFrame:0};
      remotePlayer.x=msg.data.x;remotePlayer.y=msg.data.y;remotePlayer.face=msg.data.face;remotePlayer.wpn=msg.data.wpn;remotePlayer.arm=msg.data.arm;
      if(msg.data.atk&&G)remotePlayer.atkAnim=10;
    }
  });
  setTimeout(()=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify({type:'create',code:customCode}))},500);
}
function mpJoin(code){
  const n=playerName||'Jugador';
  document.getElementById('mpStatus').textContent='Conectando a sala '+code+'...';
  mpConnect(getServerUrl(),e=>{
    const msg=JSON.parse(e.data);
    if(msg.type==='joined'){
      isHost=false;mpCode=msg.code;
      document.getElementById('mpLobby').style.display='none';
      document.getElementById('mpWait').style.display='flex';
      document.getElementById('mpRoomCode').textContent=msg.code;
      document.getElementById('mpWaitStatus').textContent='Conectado! Esperando inicio...';
    }
    if(msg.type==='gameStart'){
      startMPGame();
      remotePlayer={x:1200,y:1200,wpn:0,arm:-1,face:'down',aFrame:0};
    }
    if(msg.type==='state'){
      if(G&&msg.data){
        if(msg.data.p2x!==undefined){if(!remotePlayer)remotePlayer={x:0,y:0,wpn:0,arm:-1,face:'down',aFrame:0};remotePlayer.x=msg.data.p2x;remotePlayer.y=msg.data.p2y;remotePlayer.face=msg.data.p2face;remotePlayer.wpn=msg.data.p2wpn;remotePlayer.arm=msg.data.p2arm;if(msg.data.p2atk)remotePlayer.atkAnim=10}
      }
    }
    if(msg.type==='error'){document.getElementById('mpStatus').innerHTML='<span style="color:#F44">'+msg.msg+'</span>';ws=null}
    if(msg.type==='hostLeft'){alert('El host se desconecto');mpLeave()}
    if(msg.type==='playerLeft'){remotePlayer=null}
  });
  setTimeout(()=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify({type:'join',code,name:n}))},500);
}
function mpLeave(){
  if(ws){try{ws.send(JSON.stringify({type:'leave'}))}catch(e){}ws.close();ws=null}
  isHost=false;mpCode='';remotePlayer=null;
  document.getElementById('mpWait').style.display='none';
  document.getElementById('mpLobby').style.display='none';
  document.getElementById('startScreen').style.display='flex';
}
function showLB(){
  const lb=loadLB();
  if(!lb.length){alert('Aun no hay registros.');return}
  let html='<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:200;display:flex;justify-content:center;align-items:center" onclick="this.remove()"><div style="background:#1a0f0a;border:3px solid #8B4513;padding:30px;min-width:400px;max-height:80vh;overflow-y:auto" onclick="event.stopPropagation()"><h2 style="color:#FFD700;text-align:center;margin-bottom:20px">TABLERO DE LIDERES</h2>';
  lb.slice(0,15).forEach((e,i)=>{const gold=i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#AAA';html+='<div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid #333;color:'+gold+'"><span>'+(i+1)+'. '+e.name+'</span><span>Oleada:'+e.wave+' Kills:'+e.kills+' Nv:'+e.lv+'</span></div>'});
  html+='</div></div>';document.body.insertAdjacentHTML('beforeend',html);
}
function changeName(){const n=prompt('Nuevo nombre de guerrero:');if(n&&n.trim()){setPlayerName(n.trim());alert('Nombre cambiado a: '+n.trim())}}
function mpSendState(p){
  if(!ws||ws.readyState!==1||!G)return;
  if(isHost){ws.send(JSON.stringify({type:'state',data:{p2x:p.x,p2y:p.y,p2face:p.face,p2wpn:p.wpn,p2arm:p.arm,p2atk:p.atkF>0}}))}
  else{ws.send(JSON.stringify({type:'state',data:{p2x:p.x,p2y:p.y,p2face:p.face,p2wpn:p.wpn,p2arm:p.arm,p2atk:p.atkF>0}}))}
}
function drawRemotePlayer(ctx){
  if(!remotePlayer)return;
  ctx.globalAlpha=0.8;
  if(remotePlayer.atkAnim>0)remotePlayer.atkAnim--;
  drawWarrior(ctx,remotePlayer.x-12,remotePlayer.y-32,remotePlayer.aFrame||0,remotePlayer.face||'down',remotePlayer.arm||-1,remotePlayer.wpn||0,remotePlayer.atkAnim||0);
  ctx.globalAlpha=1;
  ctx.fillStyle='#4AF';ctx.font='bold 10px Courier New';ctx.textAlign='center';ctx.fillText(playerName||'P2',remotePlayer.x,remotePlayer.y-40);ctx.textAlign='left';
}
