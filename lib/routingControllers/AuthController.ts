import RoutingController, { RouteContext } from './RoutingController';
import { z } from 'zod';
import { generateToken, authMiddleware } from '../middleware/authMiddleware';

class AuthController extends RoutingController {
    constructor() {
        super('/api/auth');

        // Login route: POST /api/auth/login
        this.router.post('/login', (req, res, next) => {
            this.login(new RouteContext(req, res, next));
        });

        // Profile route (Secured): GET /api/auth/me
        this.router.get('/me', authMiddleware, (req, res, next) => {
            this.profile(new RouteContext(req, res, next));
        });
    }

    // Handle Login
    async login(context: RouteContext) {
        // Define validation schema using Zod
        const loginSchema = z.object({
            username: z.string().min(3),
            password: z.string().min(4)
        });

        // Use the built-in validateBody helper
        const body = context.validateBody<{ username: string }>(loginSchema);
        if (!body) return; // Validation failed, error already sent by helper

        // Simulating authentication matching the seeded users (e.g. admin)
        const token = generateToken({
            username: body.username,
            role: body.username === 'admin' ? 'admin' : 'user'
        });

        return context.json({
            message: 'Login successful',
            token
        });
    }

    // Handle Profile (Secured)
    async profile(context: RouteContext) {
        // Retrieve authenticated user metadata
        const user = context.getUser();
        if (!user) {
            return context.json({ error: 'Unauthorized' }, 401);
        }
        return context.json({ user });
    }
}

export default new AuthController();
