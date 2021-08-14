import serverEvents from './eventEmitters/serverEvents';
import server from './httpServerExporter';

const init = () => {

    serverEvents.emit('start:listening');
    server.listen(process.env.PORT || 8080);
    serverEvents.emit('end:listening');
  
}

export default init;
