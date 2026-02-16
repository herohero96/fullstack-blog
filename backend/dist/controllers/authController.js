"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
const auth_1 = require("../middleware/auth");
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingEmail = await db_1.default.user.findUnique({ where: { email } });
        if (existingEmail) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        const existingUsername = await db_1.default.user.findUnique({ where: { username } });
        if (existingUsername) {
            res.status(400).json({ message: 'Username already taken' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: { username, email, password: hashedPassword },
        });
        const token = (0, auth_1.signToken)({ userId: user.id, role: user.role, status: user.status });
        res.status(201).json({
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role, status: user.status },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = (0, auth_1.signToken)({ userId: user.id, role: user.role, status: user.status });
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role, status: user.status },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, username: true, email: true, role: true, status: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Failed to get user info' });
    }
};
exports.getMe = getMe;
//# sourceMappingURL=authController.js.map