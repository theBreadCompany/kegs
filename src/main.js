const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')

var app = express()
const port = 5501

// example data
const applications = require('./applications.json')

app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(port, () => console.log('Listening on port ' + port))

app.get('/', function (req, res) {
    res.sendFile('index.html')
})
app.get('/api/applications', function (req, res) {
    res.send(applications)
})