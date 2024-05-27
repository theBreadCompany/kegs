const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const router = require('./routes')
const db = require('./database')

var app = express()
const port = 5501


app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', router)

var server = app.listen(port, () => console.log('Listening on port ' + port))

function shutdown() {
    console.log("Closing server...")
    server.close((err) => {
        console.log("Closing database...")
        db.close()
    })
}
//process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())

module.exports = app