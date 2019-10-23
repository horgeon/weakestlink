const express = require('express');
const next = require('next');
const storage = require('node-persist');
var session = require('express-session');

const GameManager = require('./game/manager');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

require('./game/io');

(async () => {
    const gamemanager = new GameManager();

    await storage.init();

    app.prepare()
    .then(() => {
        const server = express();
        const http = require('http').createServer(server);
        const io = require('socket.io')(http);

        gameIO.io = io;

        server.set('trust proxy', 1);
        server.use(session({
            name: 'gamesession',
            secret: 'gamemanager',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true, httpOnly: false }
        }));

        server.get('*', (req, res) => {
            return handle(req, res);
        });

        io.on('connection', (socket) => {
            console.log('a user connected');
            socket.on('upevent', (event) => gameIO.onEvent(socket, event));
        });

        http.listen(3000, (err) => {
            if (err) throw err
            console.log('> Ready on http://localhost:3000');
        });
    })
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1);
    });
})();