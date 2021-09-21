import serverEvents from './eventEmitters/serverEvents';
import server from './httpServerExporter';
import PORT from '../PORT';
import config from '../config';

const init = () => {

    serverEvents.emit('beforeStart:listening');
    try {
        serverEvents.emit('start:listening');
        server.listen(PORT, () => {
            serverEvents.emit('listening');
            console.log(`${config.name} is listening at http://127.0.0.1:${PORT}`);
        });
        serverEvents.emit('end:listening');
    } catch (error) {
        console.error(error);
        serverEvents.emit('error:listening');
    }

}

export default init;
