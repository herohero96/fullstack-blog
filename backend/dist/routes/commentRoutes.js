"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const commentSchema_1 = require("../schemas/commentSchema");
const commentController_1 = require("../controllers/commentController");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/', commentController_1.getComments);
router.post('/', auth_1.requireAuth, auth_1.requireApproved, (0, validate_1.validate)(commentSchema_1.createCommentSchema), commentController_1.createComment);
router.delete('/:id', auth_1.requireAuth, commentController_1.deleteComment);
exports.default = router;
//# sourceMappingURL=commentRoutes.js.map