import serverEvents from './eventEmitters/serverEvents';
import server from './httpServerExporter';
import PORT from '../PORT';
import config from '../config';
import dbConnection from '../database/connection';

export const exit = (code?: Number) => {
    console.log('\nshutting down server instance\n');

    process.exit(code as number || 0);
    // bookmark
}

const init = async () => {

    serverEvents.emit('beforeStart:listening');
    try {
        console.log('Connecting to database...');
        await dbConnection.connect();
        console.log('Database connected successfully.');

        serverEvents.emit('start:listening');
        server.listen(PORT, () => {
            serverEvents.emit('listening');
            console.log(`${config.name} is listening at http://127.0.0.1:${PORT}`);

            process.on('SIGTERM', () => exit(0))
            process.on('SIGINT', () => exit(0));
        });
        serverEvents.emit('end:listening');
    } catch (error) {
        console.error('Failed to start server:', error);
        serverEvents.emit('error:listening');
    }

}

export default init;
