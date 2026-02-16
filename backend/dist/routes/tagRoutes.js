"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKeyAuth_1 = require("../middleware/apiKeyAuth");
const validate_1 = require("../middleware/validate");
const taxonomySchema_1 = require("../schemas/taxonomySchema");
const tagController_1 = require("../controllers/tagController");
const router = (0, express_1.Router)();
router.get('/', tagController_1.getTags);
router.post('/', apiKeyAuth_1.apiKeyAuth, (0, validate_1.validate)(taxonomySchema_1.createTagSchema), tagController_1.createTag);
router.put('/:id', apiKeyAuth_1.apiKeyAuth, (0, validate_1.validate)(taxonomySchema_1.updateTagSchema), tagController_1.updateTag);
router.delete('/:id', apiKeyAuth_1.apiKeyAuth, tagController_1.deleteTag);
exports.default = router;
//# sourceMappingURL=tagRoutes.js.map