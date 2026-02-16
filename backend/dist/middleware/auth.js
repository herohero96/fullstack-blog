"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireApproved = exports.requireAuth = exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: no token provided' });
        return;
    }
    try {
        const token = header.slice(7);
        req.user = (0, exports.verifyToken)(token);
        next();
    }
    catch {
        res.status(401).json({ message: 'Unauthorized: invalid token' });
    }
};
exports.requireAuth = requireAuth;
const requireApproved = (req, res, next) => {
    if (req.user?.status !== 'approved') {
        res.status(403).json({ message: 'Forbidden: account not approved' });
        return;
    }
    next();
};
exports.requireApproved = requireApproved;
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden: admin access required' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map