import RoutingController, { RouteContext } from '../../lib/routingControllers/RoutingController';
import Message from '../../database/databaseModels/Message';
import Task from '../../database/databaseModels/Task';
import serverEvents from '../../lib/eventEmitters/serverEvents';

class CollabController extends RoutingController {
    constructor() {
        super('/collab');

        // Set up real-time socket events after io is initialized
        serverEvents.on('end:attachSocket', (io: any) => {
            io.on('connection', (socket: any) => {
                // When a client requests recent chat messages and tasks
                socket.on('collab:join', async () => {
                    const messages = await Message.query().limit(50).get();
                    const tasks = await Task.query().get();
                    socket.emit('collab:init', { messages, tasks });
                });

                // When a client sends a new chat message
                socket.on('collab:send-message', async (data: { username: string; text: string }) => {
                    if (!data.username || !data.text) return;
                    const msg = new Message({
                        username: data.username,
                        text: data.text,
                        timestamp: new Date().toLocaleTimeString()
                    });
                    await msg.__saveToDatabase();
                    io.emit('collab:message-received', msg);
                });

                // When a client toggles/updates a task in real-time
                socket.on('collab:toggle-task', async (data: { id: string; completed: boolean }) => {
                    await Task.query().where('id', data.id).update({ completed: data.completed });
                    const updatedTask = await Task.query().where('id', data.id).first();
                    if (updatedTask) {
                        io.emit('collab:task-updated', updatedTask);
                    }
                });

                // When a client adds a task in real-time
                socket.on('collab:add-task', async (data: { title: string }) => {
                    if (!data.title) return;
                    const task = new Task({
                        title: data.title,
                        completed: false
                    });
                    await task.__saveToDatabase();
                    io.emit('collab:task-added', task);
                });
            });
        });
    }

    // Serve the Collab Board HTML page
    async get(context: RouteContext) {
        return context.render('examples/collab-board/index.html', {
            title: 'WebSpeed Real-Time Collaboration Board'
        });
    }
}

export default new CollabController();
