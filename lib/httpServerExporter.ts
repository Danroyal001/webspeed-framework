import http from 'http';
import app from './appExporter';
import socketIO from './socketIOExporter';
import serverEvents from './eventEmitters/serverEvents';


serverEvents.emit('start:createServer', app);
// create http server
const server = http.createServer(app);
serverEvents.emit('end:createServer', server);


serverEvents.emit('start:attachSocket', socketIO);
// attach socket.io
export const io = new socketIO.Server(server);
io.on('connection', (e) => console.info('Socket.io connected: ', e));
serverEvents.emit('end:attachSocket', io);


export default server;
