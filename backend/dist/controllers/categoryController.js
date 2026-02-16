"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const db_1 = __importDefault(require("../config/db"));
const getCategories = async (_req, res) => {
    try {
        const categories = await db_1.default.category.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    }
    catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, slug, description } = req.body;
        const category = await db_1.default.category.create({
            data: { name, slug, description: description || '' },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Failed to create category:', error);
        res.status(500).json({ message: 'Failed to create category' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }
        const { name, slug, description } = req.body;
        const category = await db_1.default.category.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(description !== undefined && { description }),
            },
        });
        res.json(category);
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        console.error('Failed to update category:', error);
        res.status(500).json({ message: 'Failed to update category' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }
        await db_1.default.category.delete({ where: { id } });
        res.json({ message: 'Category deleted' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        console.error('Failed to delete category:', error);
        res.status(500).json({ message: 'Failed to delete category' });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map