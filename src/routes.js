const express = require('express');
const router = express.Router();
const db = require("./database")
const fs = require("fs");
const path = require('path');

const clientID = process.env.DISCORD_CLIENT_ID
const clientSecret = process.env.DISCORD_CLIENT_SECRET
const redirectUri = process.env.DISCORD_CLIENT_REDIRECT
const scopes = ["identify"]

router.get('/', function (req, res) {
    res.sendFile('index.html')
})

router.get('/api/corsproxy', function (req, res) {
    res.set('Content-Type', 'text/html')
    fetch(req.query.url)
        .then(response => response.text().then((txt) => {
            //console.log(txt)
            return res.send(txt)
        }))
})

router.get('/api/applications', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'applications.json'))
})
router.post('/api/applications', function (req, res) {
    fs.readFile(path.resolve(__dirname, 'applications.json'), (err, _data) => {
        let data = JSON.parse(_data.toString())
        const largestID = data.reduce((maxID, item) => item.id > maxID ? item.id : maxID, -Infinity)
        let application = {
            "id": largestID + 1,
            "source": req.query.source,
            "preview": req.query.preview,
            "title": req.query.title,
            "price": req.query.price,
            "applicant": {
                "user": req.query.user,
                "name": req.query.name,
                "avatar": req.query.avatar,
            }
        }
        console.log(application)
        data.push(application)
        fs.writeFile(path.resolve(__dirname, 'applications.json'), JSON.stringify(data, undefined,4), (writeErr) => console.log(writeErr))
    })
    res.sendStatus(200)
})

router.get('/api/users', function (req, res) {})
router.post('/api/users', function (req, res) {})

router.get('/api/items', function (req, res) {})
router.post('/api/items', function (req, res) {})

router.get('/api/discord/login', function (req, res) {
    return res.redirect('https://discord.com/oauth2/authorize?client_id=1244065363562463322&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5501%2Fapi%2Fdiscord%2Fcallback&scope=identify')
})
router.get('/api/discord/callback', function (req, res) {
    console.log("Received callback: ", req.query)
    return fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'code': req.query.code,
            'redirect_uri': redirectUri
            }),
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientID + ":" + clientSecret),
        }),
    })
        .then(response =>
            response.json()
                .then((json) => {
                    console.log("Received valid token response: " + JSON.stringify(json))
                    const access_token = json['access_token']

                    return fetch("https://discord.com/api/v10/users/@me", {
                        headers: new Headers({ 'Authorization': 'Bearer ' + access_token})
                    })
                        .then(response => {
                            return response.json()
                                .then(json => {
                                    console.log("Received valid user response: " + JSON.stringify(json))
                                    const select_sql = "SELECT id FROM USERS WHERE id = ?"
                                    const insert_sql = "INSERT INTO USERS (id, name, avatar) VALUES (?, ?, ?)"
                                    const update_sql = "UPDATE USERS SET name = ?, avatar = ?"

                                    db.get(select_sql, [json["id"]],  (err, row) => {
                                        if (err) {
                                            res.redirect('/?' + new URLSearchParams({ 'error': err }).toString())
                                        } else {
                                            if (row) {
                                                db.run(update_sql, [json["global_name"], json["avatar"]], err => error = err)
                                                console.log("Updated database entry for user " + json["global_name"])
                                            } else {
                                                db.run(insert_sql, [json["id"], json["global_name"], json["avatar"]], err => error = err)
                                                console.log("Inserted database entry for user " + json["global_name"])
                                            }
                                            res.redirect('/?' + new URLSearchParams({
                                                'id': json["id"],
                                                'username': json["global_name"],
                                                'avatar': json["avatar"],
                                            }).toString())
                                        }
                                    })
                                })
                                .catch(err => console.log(err))
                        })
                })
                .catch((err) => res.redirect('/?' + new URLSearchParams({ 'error': err }).toString()))
        )
        .catch((err) => res.redirect('/?' + new URLSearchParams({ 'error': err }).toString()))
})

module.exports = router