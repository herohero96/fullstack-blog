"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKeyAuth_1 = require("../middleware/apiKeyAuth");
const validate_1 = require("../middleware/validate");
const taxonomySchema_1 = require("../schemas/taxonomySchema");
const categoryController_1 = require("../controllers/categoryController");
const router = (0, express_1.Router)();
router.get('/', categoryController_1.getCategories);
router.post('/', apiKeyAuth_1.apiKeyAuth, (0, validate_1.validate)(taxonomySchema_1.createCategorySchema), categoryController_1.createCategory);
router.put('/:id', apiKeyAuth_1.apiKeyAuth, (0, validate_1.validate)(taxonomySchema_1.updateCategorySchema), categoryController_1.updateCategory);
router.delete('/:id', apiKeyAuth_1.apiKeyAuth, categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map