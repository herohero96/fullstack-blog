"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const taxonomySchema_1 = require("../schemas/taxonomySchema");
const categoryController_1 = require("../controllers/categoryController");
const router = (0, express_1.Router)();
router.get('/', categoryController_1.getCategories);
router.post('/', auth_1.requireAuth, auth_1.requireApproved, (0, validate_1.validate)(taxonomySchema_1.createCategorySchema), categoryController_1.createCategory);
router.put('/:id', auth_1.requireAuth, auth_1.requireApproved, (0, validate_1.validate)(taxonomySchema_1.updateCategorySchema), categoryController_1.updateCategory);
router.delete('/:id', auth_1.requireAuth, auth_1.requireApproved, categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map