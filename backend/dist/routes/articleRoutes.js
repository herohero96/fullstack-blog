"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const articleSchema_1 = require("../schemas/articleSchema");
const articleController_1 = require("../controllers/articleController");
const router = (0, express_1.Router)();
router.get('/', articleController_1.getArticles);
router.get('/:slug', articleController_1.getArticleBySlug);
router.post('/', auth_1.requireAuth, auth_1.requireApproved, (0, validate_1.validate)(articleSchema_1.createArticleSchema), articleController_1.createArticle);
router.put('/:slug', auth_1.requireAuth, auth_1.requireApproved, (0, validate_1.validate)(articleSchema_1.updateArticleSchema), articleController_1.updateArticle);
router.delete('/:slug', auth_1.requireAuth, auth_1.requireApproved, articleController_1.deleteArticle);
exports.default = router;
//# sourceMappingURL=articleRoutes.js.map