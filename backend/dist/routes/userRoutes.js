"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const authSchema_1 = require("../schemas/authSchema");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, auth_1.requireAdmin, userController_1.getUsers);
router.patch('/:id/status', auth_1.requireAuth, auth_1.requireAdmin, (0, validate_1.validate)(authSchema_1.updateUserStatusSchema), userController_1.updateUserStatus);
router.delete('/:id', auth_1.requireAuth, auth_1.requireAdmin, userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map