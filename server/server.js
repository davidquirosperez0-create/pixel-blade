const express=require('express');
const http=require('http');
const {WebSocketServer}=require('ws');
const path=require('path');

const app=express();
const server=http.createServer(app);
const wss=new WebSocketServer({server});

const clientPath=path.join(__dirname,'..');
app.use(express.static(clientPath));

const rooms={};
let nextRoomId=1000;
function genCode(){return String(nextRoomId++).padStart(4,'0')}

wss.on('connection',ws=>{
  let currentRoom=null;
  let playerId=null;

  ws.on('message',raw=>{
    let msg;
    try{msg=JSON.parse(raw)}catch(e){return}

    if(msg.type==='create'){
      const code=genCode();
      rooms[code]={host:ws,clients:new Map(),state:'lobby',wave:0,seed:Math.random()*999999|0};
      playerId='host';currentRoom=code;
      ws.send(JSON.stringify({type:'created',code,playerId:'host'}));
    }

    if(msg.type==='join'){
      const room=rooms[msg.code];
      if(!room){ws.send(JSON.stringify({type:'error',msg:'Sala no encontrada'}));return}
      if(room.state!=='lobby'){ws.send(JSON.stringify({type:'error',msg:'La partida ya empezo'}));return}
      if(room.clients.size>=1){ws.send(JSON.stringify({type:'error',msg:'Sala llena (max 2)'}));return}
      playerId='p2-'+Date.now();
      room.clients.set(playerId,ws);
      currentRoom=msg.code;
      ws.send(JSON.stringify({type:'joined',code:msg.code,playerId}));
      room.host.send(JSON.stringify({type:'playerJoined',playerId,name:msg.name||'Jugador'}));
    }

    if(msg.type==='startGame'){
      const room=rooms[currentRoom];
      if(!room)return;room.state='playing';
      room.host.send(JSON.stringify({type:'gameStart',seed:room.seed}));
      room.clients.forEach((c,id)=>c.send(JSON.stringify({type:'gameStart',seed:room.seed,playerId:id})));
    }

    if(msg.type==='state'){
      const room=rooms[currentRoom];if(!room)return;
      if(playerId==='host'){
        room.clients.forEach(c=>{try{c.send(JSON.stringify({type:'state',data:msg.data}))}catch(e){}});
      }else{
        try{room.host.send(JSON.stringify({type:'input',playerId,data:msg.data}))}catch(e){}
      }
    }

    if(msg.type==='attack'){
      const room=rooms[currentRoom];if(!room)return;
      if(playerId==='host'){
        room.clients.forEach(c=>{try{c.send(JSON.stringify({type:'attack',data:msg.data}))}catch(e){}});
      }else{
        try{room.host.send(JSON.stringify({type:'attack',playerId,data:msg.data}))}catch(e){}
      }
    }

    if(msg.type==='leave'||msg.type==='disconnect')leaveRoom();
  });

  function leaveRoom(){
    if(!currentRoom)return;
    const room=rooms[currentRoom];if(!room)return;
    if(playerId==='host'){
      room.clients.forEach(c=>{try{c.send(JSON.stringify({type:'hostLeft'}))}catch(e){}});
      delete rooms[currentRoom];
    }else{
      room.clients.delete(playerId);
      room.host.send(JSON.stringify({type:'playerLeft',playerId}));
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
