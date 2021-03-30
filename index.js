const MongoClient = require('mongodb').MongoClient
const express = require('express');
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')

const app = express()


nunjucks.configure('views', {
  autoescape: true,
  express: app
});


app.use(bodyParser.json())

app.get('/old', (req, res) => {
  MongoClient.connect(process.env.url, async function(err, db) {
    let coll = db.db('dogehouse').collection('room-logger')
    let data = await coll.find({}).toArray()
    let [times, users, servers] = [data.map(o => o['time']), data.map(o => o['users']), data.map(o => o['servers'])]
    times = times.map(function (val) {
      return `${val.getUTCMonth()}/${val.getUTCDate()}/${val.getUTCFullYear()} ${val.getUTCHours()}:${(val.getUTCMinutes().toString().length === 2) ? val.getUTCMinutes() : '0'+val.getUTCMinutes().toString()}`
    })
    res.render('index.html', {'times': times,'users': users,'servers': servers})
  })
})

app.get('/', (req, res) => {
  res.render('new.html')
})

app.get('/api/json', (req, res) => {
  MongoClient.connect(process.env.url, async function(err, db) {
    let coll = db.db('dogehouse').collection('room-logger')
    let data = await coll.find({}).toArray()
    let [times, users, servers] = [data.map(o => o['time']), data.map(o => o['users']), data.map(o => o['servers'])]
    times = times.map(function (val) {
      return `${val.getUTCMonth()}/${val.getUTCDate()}/${val.getUTCFullYear()} ${val.getUTCHours()}:${(val.getUTCMinutes().toString().length === 2) ? val.getUTCMinutes() : '0'+val.getUTCMinutes().toString()}`
    })
    res.render('api.html', {'data': JSON.stringify({'times': times,'users': users,'servers': servers})})
  })
})
app.get('/api/csv', (req, res) => {
  MongoClient.connect(process.env.url, async function(err, db) {
  let coll = db.db('dogehouse').collection('room-logger')
  let data = await coll.find({}).toArray()
  let [times, users, servers] = [data.map(o => o['time']), data.map(o => o['users']), data.map(o => o['servers'])]
  times = times.map(function (val) {
    return `${val.getUTCMonth()}/${val.getUTCDate()}/${val.getUTCFullYear()} ${val.getUTCHours()}:${(val.getUTCMinutes().toString().length === 2) ? val.getUTCMinutes() : '0'+val.getUTCMinutes().toString()}`
  })
  let mergedList = [...times, ...users, ...servers]
  let csv = 'Data,Users,Servers\n'
  for (i=0; i<times.length; i++) {
    csv += `${times[i]},${users[i]},${servers[i]}\n`
  }
  res.render('api.html', {'data': csv})
  })
})

app.listen(3000, () => {
  console.log('server started');
});