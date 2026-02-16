"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const authSchema_1 = require("../schemas/authSchema");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(authSchema_1.registerSchema), authController_1.register);
router.post('/login', (0, validate_1.validate)(authSchema_1.loginSchema), authController_1.login);
router.get('/me', auth_1.requireAuth, authController_1.getMe);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map