"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const taxonomySchema_1 = require("../schemas/taxonomySchema");
const tagController_1 = require("../controllers/tagController");
const router = (0, express_1.Router)();
router.get('/', tagController_1.getTags);
router.post('/', auth_1.requireAuth, auth_1.requireApproved, (0, validate_1.validate)(taxonomySchema_1.createTagSchema), tagController_1.createTag);
router.put('/:id', auth_1.requireAuth, auth_1.requireApproved, (0, validate_1.validate)(taxonomySchema_1.updateTagSchema), tagController_1.updateTag);
router.delete('/:id', auth_1.requireAuth, auth_1.requireApproved, tagController_1.deleteTag);
exports.default = router;
//# sourceMappingURL=tagRoutes.js.map