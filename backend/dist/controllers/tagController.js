"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.createTag = exports.getTags = void 0;
const db_1 = __importDefault(require("../config/db"));
const getTags = async (_req, res) => {
    try {
        const tags = await db_1.default.tag.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(tags);
    }
    catch (error) {
        console.error('Failed to fetch tags:', error);
        res.status(500).json({ message: 'Failed to fetch tags' });
    }
};
exports.getTags = getTags;
const createTag = async (req, res) => {
    try {
        const { name, slug, color } = req.body;
        const tag = await db_1.default.tag.create({
            data: { name, slug, color: color || '#3B82F6' },
        });
        res.status(201).json(tag);
    }
    catch (error) {
        console.error('Failed to create tag:', error);
        res.status(500).json({ message: 'Failed to create tag' });
    }
};
exports.createTag = createTag;
const updateTag = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }
        const { name, slug, color } = req.body;
        const tag = await db_1.default.tag.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(color !== undefined && { color }),
            },
        });
        res.json(tag);
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Tag not found' });
            return;
        }
        console.error('Failed to update tag:', error);
        res.status(500).json({ message: 'Failed to update tag' });
    }
};
exports.updateTag = updateTag;
const deleteTag = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }
        await db_1.default.tag.delete({ where: { id } });
        res.json({ message: 'Tag deleted' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Tag not found' });
            return;
        }
        console.error('Failed to delete tag:', error);
        res.status(500).json({ message: 'Failed to delete tag' });
    }
};
exports.deleteTag = deleteTag;
//# sourceMappingURL=tagController.js.map