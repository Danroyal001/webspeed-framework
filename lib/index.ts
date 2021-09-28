import serverEvents from './eventEmitters/serverEvents';
import server from './httpServerExporter';
import PORT from '../PORT';
import config from '../config';

export const exit = (code?: Number) => {
    console.log('\nshutting down server instance\n');

    process.exit(code as number || 0);
    // bookmark
}

const init = () => {

    serverEvents.emit('beforeStart:listening');
    try {
        serverEvents.emit('start:listening');
        server.listen(PORT, () => {
            serverEvents.emit('listening');
            console.log(`${config.name} is listening at http://127.0.0.1:${PORT}`);

            process.on('SIGTERM', () => exit(0))
            process.on('SIGINT', () => exit(0));
        });
        serverEvents.emit('end:listening');
    } catch (error) {
        console.error(error);
        serverEvents.emit('error:listening');
    }

}

export default init;
