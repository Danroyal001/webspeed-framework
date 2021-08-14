import http from 'http';
import app from './appExporter';
import socketIO from './socketIOExporter';
import serverEvents from './eventEmitters/serverEvents';


serverEvents.emit('start:createServer');
const server = http.createServer(app);
serverEvents.emit('end:createServer');


export const io = new socketIO.Server(server);


export default server;
