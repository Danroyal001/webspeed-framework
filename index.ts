import config from "./config";
import express from 'express';
import http from 'http';
// import * as _io from 'socket.io';
// import https from 'https';

const app = express();

app.use(express.json({
    extended: false
} as any));

const server = http.createServer(app);

const io = require('socket.io')(server);

io.on('connection', () => { /* … */ });

server.listen(process.env.PORT || 8080);
