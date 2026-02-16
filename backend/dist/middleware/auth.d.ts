import { Request, Response, NextFunction } from 'express';
export interface AuthPayload {
    userId: number;
    role: string;
    status: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export declare const signToken: (payload: AuthPayload) => string;
export declare const verifyToken: (token: string) => AuthPayload;
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireApproved: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map