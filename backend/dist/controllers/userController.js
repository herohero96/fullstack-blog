"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserStatus = exports.getUsers = void 0;
const db_1 = __importDefault(require("../config/db"));
const getUsers = async (req, res) => {
    try {
        const where = {};
        if (req.query.status) {
            where.status = req.query.status;
        }
        const users = await db_1.default.user.findMany({
            where,
            select: { id: true, username: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    }
    catch (error) {
        console.error('GetUsers error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
const updateUserStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        const user = await db_1.default.user.update({
            where: { id },
            data: { status },
            select: { id: true, username: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
        });
        res.json(user);
    }
    catch (error) {
        console.error('UpdateUserStatus error:', error);
        res.status(500).json({ message: 'Failed to update user status' });
    }
};
exports.updateUserStatus = updateUserStatus;
const deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (id === req.user.userId) {
            res.status(400).json({ message: 'Cannot delete yourself' });
            return;
        }
        await db_1.default.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        console.error('DeleteUser error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map