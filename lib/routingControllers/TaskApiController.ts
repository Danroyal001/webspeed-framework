import RoutingController, { RouteContext } from './RoutingController';
import Task from '../../database/databaseModels/Task';
import { z } from 'zod';

class TaskApiController extends RoutingController {
    constructor() {
        super('/api/tasks');

        // Add subroutes for parameter matching relative to '/api/tasks'
        // Express router matches routes sequentially, so put specific routes before '/' if needed
        this.router.get('/:id', (req, res, next) => {
            this.show(new RouteContext(req, res, next));
        });
        this.router.put('/:id', (req, res, next) => {
            this.updateTask(new RouteContext(req, res, next));
        });
        this.router.delete('/:id', (req, res, next) => {
            this.deleteTask(new RouteContext(req, res, next));
        });
    }

    // Handles GET /api/tasks
    async get(context: RouteContext) {
        try {
            const tasks = await Task.query().get();
            return context.json(tasks);
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }

    // Handles POST /api/tasks
    async post(context: RouteContext) {
        try {
            const taskSchema = z.object({
                title: z.string().min(1, 'Title is required'),
                description: z.string().optional(),
                completed: z.boolean().optional()
            });

            const body = context.validateBody<{ title: string; description?: string; completed?: boolean }>(taskSchema);
            if (!body) return;

            const task = new Task({
                title: body.title,
                description: body.description || '',
                completed: body.completed || false
            });
            await task.__saveToDatabase();
            return context.json(task, 201);
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }

    async show(context: RouteContext) {
        try {
            const id = context.getUrlParam('id');
            const task = await Task.query().where('id', id).first();
            if (!task) {
                return context.json({ error: 'Task not found' }, 404);
            }
            return context.json(task);
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }

    async updateTask(context: RouteContext) {
        try {
            const id = context.getUrlParam('id');
            const body = context.getBody();
            
            const updated = await Task.query().where('id', id).update(body);
            if (!updated) {
                return context.json({ error: 'Task not found' }, 404);
            }

            const task = await Task.query().where('id', id).first();
            return context.json(task);
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }

    async deleteTask(context: RouteContext) {
        try {
            const id = context.getUrlParam('id');
            const deleted = await Task.query().where('id', id).delete();
            if (!deleted) {
                return context.json({ error: 'Task not found' }, 404);
            }
            return context.json({ success: true });
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }
}

export default new TaskApiController();
