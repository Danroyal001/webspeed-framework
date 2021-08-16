import http from 'http';
import app from './appExporter';
import socketIO from './socketIOExporter';
import serverEvents from './eventEmitters/serverEvents';


serverEvents.emit('start:createServer', app);
// create http server
const server = http.createServer(app);
serverEvents.emit('end:createServer', app);


serverEvents.emit('start:attachSocket', socketIO);
// attach socket.io
export const io = new socketIO.Server(server);
serverEvents.emit('end:attachSocket', io);


export default server;
