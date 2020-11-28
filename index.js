const express = require('express')
const http = require('http');
const socket = require('socket.io');
const app = express();
const server = http.createServer(app);
const db = require('nedb');
const path = require('path')
const cookieParser = require('cookie-parser');
const md5 = require('md5')


app.use(cookieParser())

let options = {
    cors: true,
    origins: ["http://127.0.0.1:8080"],
}
const io = require('socket.io')(server, options);


db.user = new db('user.db');
db.user.loadDatabase();
db.user.update({}, { $set: { status: 'offline' } }, { multi: true }, function (err, numReplaced) { });

app.use(express.json({ limit: '1mb' }))

const STATUS = {
    wrong: 0,
    exist: 1,
    done: 3,
    success: 4,
}

//GET methods

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/room', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/room.html'))
})

app.get('/get/userList', (req, res) => {
    db.user.find({}, (err, docs) => {
        delete docs.tokens;
        for (let doc of docs) {
            delete doc.tokens;
            delete doc.password;
            delete doc.hashCode;
        }
        res.json(docs)
    })
})

//POST methods

app.post('/login', (req, res) => {
    let body = req.body;
    db.user.find({ username: body.username }, (err, docs) => {
        if (docs.length > 0 && docs[0].password == md5(body.password + docs[0].hashCode)) {
            res.json({
                success: true,
                status: STATUS.success,
                response: 'login_success',
                message: 'Login success',
                tokens: docs[0].tokens
            })
        } else {
            res.json({
                success: true,
                status: STATUS.wrong,
                response: 'login_fail',
                message: 'Username or password goes wrong',
                USER_HASH: md5(JSON.stringify(docs))
            })
        }
    })
})

app.post('/register', (req, res) => {
    let body = req.body;
    db.user.find({ username: body.username }, (err, docs) => {
        if (docs.length > 0) {
            res.json({
                success: true,
                status: STATUS.exist,
                message: 'Username existed',
                response: 'register_fail'
            })
        } else if (docs.length == 0) {
            const USER_HASH = Math.random()
            db.user.insert({
                username: body.username,
                password: md5(body.password + USER_HASH.toString()),
                hashCode: USER_HASH,
                status: 'offline',
                tokens: md5(body.username + body.password + USER_HASH)
            })
            res.json({
                success: true,
                status: STATUS.done,
                message: 'Register done',
                response: 'register_success'
            })
        }
    })
})

app.post('/check/tokens', (req, res) => {
    let body = req.body;
    db.user.find({ tokens: body.tokens }, (err, docs) => {
        if (docs.length == 0) {
            res.json({
                success: true,
                status: STATUS.wrong,
                message: '',
                response: 'tokens_false'
            })
        } else {
            res.json({
                success: true,
                status: STATUS.done,
                message: '',
                response: 'tokens_true',
                status: docs[0].status,
            })
        }
    })
})

//WEB_SOCKETS

let userTokens = {}

io.on('connect', socket => {

    socket.on('user_alive', req => {
        db.user.update({ tokens: req }, { $set: { status: 'online' } }, { multi: true }, function (err, numReplaced) {
            console.log(`- Logs: ${req} online`)
            userTokens[socket.id] = req
        });

        db.user.find({ tokens: req }, (err, docs) => {
            io.emit('new_user_online', docs[0].username)
        })
    })

    socket.on('user_multiple_login', req => {
        console.log('- Warn: ' + req + ' user multiple online')
        userTokens[socket.id] = req
        socket.emit('user_multiple_login', md5(req))
    })

    socket.on('disconnect', req => {
        db.user.update({ tokens: userTokens[socket.id] }, { $set: { status: 'offline' } }, { multi: true }, function (err, numReplaced) {
            if (userTokens[socket.id]) {
                io.emit('user_multiple_login', md5(userTokens[socket.id]))
            }
            console.log(`- Logs: ${userTokens[socket.id]} offline`)

        });

        db.user.find({ tokens: userTokens[socket.id] }, (err, docs) => {
            if (docs.length > 0) {
                io.emit('new_user_leave', docs[0].username)
            }
        })
    })

})

//SERVE_FILES

app.use(express.static(path.join(__dirname + '/public')))

server.listen(7420);