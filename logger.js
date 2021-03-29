const WebSocket = require('ws');
const MongoClient = require('mongodb').MongoClient

const ws = new WebSocket('wss://api.dogehouse.tv/socket');

const auth = JSON.stringify({
  "op": "auth",
  "d": {
    "accessToken": process.env.token,
    "refreshToken": process.env.refresh_token,
    "reconnectToVoice": true,
    "muted": false,
    "platform":"web"
  }
})

const fetchTop = JSON.stringify({
  "op": "get_top_public_rooms",
  "d": {"cursor": 0},
  "fetchId": process.env.fetch_id
})


ws.on('open', function open() {
  ws.send(auth)
  ws.send(fetchTop)
  setInterval(function(){
    ws.send(fetchTop)
    console.log(`fetched at ${new Date()}`)
  }, 6000000)
  setInterval(function(){
    ws.send('ping')
    console.log('sent a ping')
  }, 30000);
});

ws.on('message', function incoming(data) {
  let parsed = JSON.parse(data)
  if (parsed.op == 'fetch_done') {
    let totalUsers = 0
    let totalServers = 0
    parsed.d.rooms.forEach(obj => {
      totalServers++
      Object.entries(obj).forEach(([key, value]) => {
        if (key == 'numPeopleInside') {
          totalUsers += value
        }
      });
    });
    MongoClient.connect(process.env.url, function(err, db) {
      let coll = db.db('dogehouse').collection('room-logger')
      coll.insertOne({
        'users': totalUsers,
        'servers': totalServers,
        'time': new Date()
      })
      console.log('pushed to DB')
      db.close()
    })
    console.log(`Total Users: ${totalUsers}, Total Servers: ${totalServers}`)
  }
});

ws.on('close', function() {
  console.log('closed')
})
