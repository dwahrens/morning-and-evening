/**
 * We load everything related to the web service in a single file as its a pretty small app.
 */
const fs = require('fs')
const path = require('path')
const helmet = require('helmet')
const express = require('express')
const app = express()
const useragent = require('express-useragent')
const port = 7009
const morningEvening = path.join(__dirname + '/data/m_e.json')
const meData = JSON.parse(fs.readFileSync(morningEvening, 'utf-8'))

app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set("view options", { layout: false } )
app.use(useragent.express())
app.use('/public', express.static(path.join(__dirname, "public")))
app.get('/public/data/m_e.json', (req, res) => {
  res.sendFile(path.join(__dirname + '/data/m_e.json'))
})
app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/js/service-worker.js'))
})
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/manifest.json'))
})
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/favicon.ico'))
})
app.get('/public/index.html', (req, res) => {
  // convert over to an ejs file to use SSR rather than depend on vue. 
  res.sendFile(path.join(__dirname + '/public/index.html'), 'utf-8')
})
app.get("/me/:month/:day/:time", (req, res) => {
  var month = parseInt(req.params.month)
  var day = parseInt(req.params.day)
  var time = String(req.params.time)
  var results = {}
  meData.forEach(me => {
    if (me.month === month && me.day === day && me.time === time) {
      var body = me.body.substring(me.body.indexOf('\r\n    \n\n    '), me.body.length)
      body = body.replace(/"([^"]+)"/g, '<i>"$1"</i>')
      body = body.replace(/(?:\r\n|\r|\n)/g, '<br>')
      results = {
        date: me.date,
        time: me.time,
        month: me.month,
        day: me.day,
        keyverse: me.keyverse.replace(/"([^"]+)"/g, '<i>"$1"</i>'),
        body: body
      }
    }
  })
  
  res.send(JSON.stringify(results))
})
app.get('/', (req, res) => {
  // convert over to an ejs file to use SSR rather than depend on vue. 
  let data = {
    isIos: false
  }
  if ((req.useragent.isiPad || req.useragent.isiPhone || req.useragent.isiPod) && req.useragent.isSafari) {
    data.isIos = true
  }
  res.render('index', data)
})

// Error handling
app.get('*', function(req, res){
  res.status(404).sendFile(path.join(__dirname + "/public/404.html"))
})

console.log(`Starting Morning & Evening on ${ port }`)
app.listen(port, () => {})