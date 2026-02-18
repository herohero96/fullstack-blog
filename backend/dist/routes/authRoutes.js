"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validate_1 = require("../middleware/validate");
const authSchema_1 = require("../schemas/authSchema");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: '登录尝试过多，请15分钟后再试' },
    standardHeaders: true,
    legacyHeaders: false,
});
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(authSchema_1.registerSchema), authController_1.register);
router.post('/login', loginLimiter, (0, validate_1.validate)(authSchema_1.loginSchema), authController_1.login);
router.get('/me', auth_1.requireAuth, authController_1.getMe);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map