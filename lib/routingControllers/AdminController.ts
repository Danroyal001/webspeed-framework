import RoutingController, { RouteContext } from './RoutingController';
import dbConnection from '../../database/connection';
import serverEvents from '../eventEmitters/serverEvents';

class AdminController extends RoutingController {
    private ioInstance: any;

    constructor() {
        super('/admin');

        // Hook socket.io instance
        serverEvents.on('end:attachSocket', (io: any) => {
            this.ioInstance = io;
        });

        // Dashboard UI API endpoints
        this.router.get('/api/database', (req, res, next) => {
            this.getCollectionsList(new RouteContext(req, res, next));
        });

        this.router.get('/api/database/:collection', (req, res, next) => {
            this.getCollectionRecords(new RouteContext(req, res, next));
        });

        this.router.delete('/api/database/:collection/:id', (req, res, next) => {
            this.deleteRecord(new RouteContext(req, res, next));
        });

        this.router.get('/api/websockets', (req, res, next) => {
            this.getSocketStats(new RouteContext(req, res, next));
        });

        this.router.get('/api/logs', (req, res, next) => {
            this.getLogs(new RouteContext(req, res, next));
        });
    }

    // Serve Admin HTML View
    async get(context: RouteContext) {
        return context.render('views/admin.html', {
            title: 'WebSpeed Premium Admin Console'
        });
    }

    // Fetch collections list and size
    async getCollectionsList(context: RouteContext) {
        try {
            const driver = dbConnection.getDriver();
            const collections = await driver.listCollections();
            
            const list = [];
            for (const col of collections) {
                const records = await driver.read(col);
                list.push({
                    name: col,
                    count: records.length
                });
            }
            return context.json(list);
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }

    // Fetch collection records
    async getCollectionRecords(context: RouteContext) {
        try {
            const col = context.getUrlParam('collection');
            const driver = dbConnection.getDriver();
            const records = await driver.read(col);
            return context.json(records);
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }

    // Delete a record
    async deleteRecord(context: RouteContext) {
        try {
            const col = context.getUrlParam('collection');
            const id = context.getUrlParam('id');
            const driver = dbConnection.getDriver();
            const deleted = await driver.delete(col, { id });
            return context.json({ success: deleted });
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }

    // Fetch socket.io metrics
    async getSocketStats(context: RouteContext) {
        try {
            if (!this.ioInstance) {
                return context.json({ error: 'Socket.io not attached yet' }, 503);
            }
            const socketsMap = this.ioInstance.sockets.sockets;
            const list = Array.from(socketsMap.values()).map((s: any) => ({
                id: s.id,
                rooms: Array.from(s.rooms),
                handshake: {
                    address: s.handshake.address,
                    time: s.handshake.time
                }
            }));
            return context.json({
                totalConnected: list.length,
                sockets: list
            });
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }

    // Fetch request logs
    async getLogs(context: RouteContext) {
        const logs = (global as any).webspeedLogs || [];
        return context.json(logs);
    }
}

export default new AdminController();
