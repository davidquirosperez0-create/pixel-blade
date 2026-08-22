const express=require('express');
const http=require('http');
const {WebSocketServer}=require('ws');
const path=require('path');

const app=express();
const server=http.createServer(app);
const wss=new WebSocketServer({server});

app.use(express.json());
app.use((req,res,next)=>{
  res.set('Access-Control-Allow-Origin','*');
  res.set('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.sendStatus(204);
  next();
});
const clientPath=path.join(__dirname,'..');
app.use(express.static(clientPath));

const rooms=new Map();
const leaderboard=[];
const MAX_LEADERBOARD=50;
const MAX_PLAYERS=4;

function genCode(){
  let code;
  do{code=String(Math.floor(1000+Math.random()*9000))}while(rooms.has(code));
  return code;
}

app.get('/api/rooms',(req,res)=>{
  const list=[];
  rooms.forEach((room,code)=>{
    list.push({
      code,
      host:room.hostName,
      players:room.clients.size+1,
      maxPlayers:MAX_PLAYERS,
      state:room.state,
      wave:room.wave
    });
  });
  res.json(list);
});

app.get('/api/leaderboard',(req,res)=>{
  res.json(leaderboard.slice(0,MAX_LEADERBOARD));
});

app.post('/api/leaderboard',(req,res)=>{
  const {name,wave,kills,lv}=req.body;
  if(!name||typeof wave!=='number'||typeof kills!=='number')return res.status(400).json({error:'Invalid data'});
  leaderboard.push({name,wave:Math.floor(wave),kills:Math.floor(kills),lv:lv||1,date:Date.now()});
  leaderboard.sort((a,b)=>b.wave-a.wave||b.kills-a.kills||b.lv-a.lv);
  if(leaderboard.length>MAX_LEADERBOARD)leaderboard.length=MAX_LEADERBOARD;
  res.json({ok:true,rank:leaderboard.findIndex(e=>e.date===leaderboard[leaderboard.length-1]?.date)+1});
});

wss.on('connection',ws=>{
  let currentRoom=null;
  let playerId=null;
  let playerName='Jugador';
  let lastInputTime=0;
  let pingInterval=null;

  pingInterval=setInterval(()=>{
    if(ws.readyState===1)ws.send(JSON.stringify({type:'ping',t:Date.now()}));
  },3000);

  ws.on('message',raw=>{
    let msg;
    try{msg=JSON.parse(raw)}catch(e){return}

    if(msg.type==='ping'){ws.send(JSON.stringify({type:'pong',t:msg.t}));return}

    if(msg.type==='create'){
      const code=msg.code||genCode();
      if(rooms.has(code)){ws.send(JSON.stringify({type:'error',msg:'Sala ya existe'}));return}
      const name=msg.name||'Host';
      playerName=name;
      playerId='host';
      currentRoom=code;
      const room={
        host:ws,hostName:name,hostState:null,
        clients:new Map(),clientInputs:{},clientNames:{},
        state:'lobby',wave:0,seed:Math.random()*999999|0,
        maxPlayers:MAX_PLAYERS
      };
      rooms.set(code,room);
      ws.send(JSON.stringify({type:'created',code,playerId:'host',maxPlayers:MAX_PLAYERS}));
      console.log(`[Room ${code}] Host "${name}" created room`);
    }

    if(msg.type==='join'){
      const room=rooms.get(msg.code);
      if(!room){ws.send(JSON.stringify({type:'error',msg:'Sala no encontrada'}));return}
      if(room.state!=='lobby'){ws.send(JSON.stringify({type:'error',msg:'La partida ya empezo'}));return}
      if(room.clients.size+1>=MAX_PLAYERS){ws.send(JSON.stringify({type:'error',msg:'Sala llena (max '+MAX_PLAYERS+')'}));return}
      const name=msg.name||'Jugador';
      playerName=name;
      playerId='p'+Date.now();
      room.clients.set(playerId,ws);
      room.clientNames[playerId]=name;
      room.clientInputs[playerId]={};
      currentRoom=msg.code;
      const players=[];
      room.clients.forEach((c,id)=>players.push({id,name:room.clientNames[id]}));
      players.unshift({id:'host',name:room.hostName});
      ws.send(JSON.stringify({type:'joined',code:msg.code,playerId,maxPlayers:MAX_PLAYERS,players}));
      try{room.host.send(JSON.stringify({type:'playerJoined',playerId,name,players}))}catch(e){}
      room.clients.forEach((c,id)=>{
        if(id!==playerId){
          try{c.send(JSON.stringify({type:'playerJoined',playerId,name,players}))}catch(e){}
        }
      });
      console.log(`[Room ${msg.code}] "${name}" joined (${room.clients.size+1}/${MAX_PLAYERS})`);
    }

    if(msg.type==='chat'){
      const room=rooms.get(currentRoom);if(!room)return;
      const chatMsg={type:'chat',from:playerName,text:String(msg.text||'').slice(0,200),ts:Date.now()};
      if(playerId==='host'){
        room.host.send(JSON.stringify(chatMsg));
        room.clients.forEach(c=>{try{c.send(JSON.stringify(chatMsg))}catch(e){}});
      }else{
        try{room.host.send(JSON.stringify(chatMsg))}catch(e){}
        room.clients.forEach((c,id)=>{if(id!==playerId)try{c.send(JSON.stringify(chatMsg))}catch(e){}});
      }
    }

    if(msg.type==='startGame'){
      const room=rooms.get(currentRoom);if(!room||playerId!=='host')return;
      room.state='playing';
      room.wave=1;
      const players=[];
      players.push({id:'host',name:room.hostName});
      room.clients.forEach((c,id)=>players.push({id,name:room.clientNames[id]}));
      const startMsg={type:'gameStart',seed:room.seed,maxPlayers:MAX_PLAYERS,players};
      room.host.send(JSON.stringify(startMsg));
      room.clients.forEach((c,id)=>{try{c.send(JSON.stringify({...startMsg,playerId:id}))}catch(e){}});
      console.log(`[Room ${currentRoom}] Game started`);
    }

    if(msg.type==='gameState'){
      const room=rooms.get(currentRoom);if(!room||playerId!=='host')return;
      room.hostState=msg.data;
      room.wave=msg.data.wave||room.wave;
      room.clients.forEach((c)=>{try{c.send(JSON.stringify({type:'gameState',data:msg.data}))}catch(e){}});
    }

    if(msg.type==='input'){
      const room=rooms.get(currentRoom);if(!room)return;
      const now=Date.now();
      if(now-lastInputTime<16)return;
      lastInputTime=now;
      if(playerId!=='host'&&room.host){
        room.clientInputs[playerId]=msg.data;
        try{room.host.send(JSON.stringify({type:'remoteInput',playerId,data:msg.data}))}catch(e){}
      }
    }

    if(msg.type==='hostInput'){
      const room=rooms.get(currentRoom);if(!room||playerId!=='host')return;
      room.clients.forEach((c)=>{try{c.send(JSON.stringify({type:'hostInput',data:msg.data}))}catch(e){}});
    }

    if(msg.type==='playerState'){
      const room=rooms.get(currentRoom);if(!room)return;
      if(playerId!=='host'){
        try{room.host.send(JSON.stringify({type:'clientState',playerId,data:msg.data}))}catch(e){}
      }
    }

    if(msg.type==='leave'||msg.type==='disconnect')leaveRoom();
  });

  function leaveRoom(){
    if(pingInterval)clearInterval(pingInterval);
    if(!currentRoom)return;
    const room=rooms.get(currentRoom);if(!room){currentRoom=null;playerId=null;return}
    if(playerId==='host'){
      room.clients.forEach(c=>{try{c.send(JSON.stringify({type:'hostLeft'}))}catch(e){}});
      rooms.delete(currentRoom);
      console.log(`[Room ${currentRoom}] Host left, room deleted`);
    }else{
      room.clients.delete(playerId);
      delete room.clientInputs[playerId];
      delete room.clientNames[playerId];
      const leaveMsg={type:'playerLeft',playerId,name:playerName};
      try{room.host.send(JSON.stringify(leaveMsg))}catch(e){}
      room.clients.forEach((c,id)=>{try{c.send(JSON.stringify(leaveMsg))}catch(e){}});
      console.log(`[Room ${currentRoom}] "${playerName}" left (${room.clients.size+1} remaining)`);
      if(room.clients.size===0&&room.state==='playing'){
        try{room.host.send(JSON.stringify({type:'hostLeft'}))}catch(e){}
      }
    }
    currentRoom=null;playerId=null;
  }

  ws.on('close',leaveRoom);
  ws.on('error',()=>leaveRoom());
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>{
  console.log('Pixel Blade server on port '+PORT);
  console.log('http://localhost:'+PORT);
});
