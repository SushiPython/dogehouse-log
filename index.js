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

app.get('/', (req, res) => {
  MongoClient.connect(process.env.url, async function(err, db) {
    let coll = db.db('dogehouse').collection('room-logger')
    let data = await coll.find({}).toArray()
    var [times, users, servers] = [data.map(o => o['time']), data.map(o => o['users']), data.map(o => o['servers'])]
    times = times.map(function (val) {
      return `${val.getUTCMonth()}/${val.getUTCDate()}/${val.getUTCFullYear()} ${val.getUTCHours()}:${(val.getUTCMinutes().toString().length === 2) ? val.getUTCMinutes() : '0'+val.getUTCMinutes().toString()}`
    })
    res.render('index.html', {'times': times,'users': users,'servers': servers})
  })
})

app.listen(3000, () => {
  console.log('server started');
});