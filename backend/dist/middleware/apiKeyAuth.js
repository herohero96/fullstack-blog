"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = void 0;
const apiKeyAuth = (req, res, next) => {
    const expectedKey = process.env.API_KEY;
    // If no API_KEY configured, skip auth (dev mode)
    if (!expectedKey) {
        return next();
    }
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== expectedKey) {
        res.status(401).json({ message: 'Unauthorized: invalid or missing API key' });
        return;
    }
    next();
};
exports.apiKeyAuth = apiKeyAuth;
//# sourceMappingURL=apiKeyAuth.js.map