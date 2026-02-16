"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiKeyAuth_1 = require("../middleware/apiKeyAuth");
const validate_1 = require("../middleware/validate");
const articleSchema_1 = require("../schemas/articleSchema");
const articleController_1 = require("../controllers/articleController");
const router = (0, express_1.Router)();
router.get('/', articleController_1.getArticles);
router.get('/:slug', articleController_1.getArticleBySlug);
router.post('/', apiKeyAuth_1.apiKeyAuth, (0, validate_1.validate)(articleSchema_1.createArticleSchema), articleController_1.createArticle);
router.put('/:slug', apiKeyAuth_1.apiKeyAuth, (0, validate_1.validate)(articleSchema_1.updateArticleSchema), articleController_1.updateArticle);
router.delete('/:slug', apiKeyAuth_1.apiKeyAuth, articleController_1.deleteArticle);
exports.default = router;
//# sourceMappingURL=articleRoutes.js.map