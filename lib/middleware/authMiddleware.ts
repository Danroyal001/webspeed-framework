import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import env from '../../env';

const JWT_SECRET = env.JWT_SECRET || 'webspeed-secret-key';

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
};

export const generateToken = (payload: any, expiresIn: string = '24h'): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
};
