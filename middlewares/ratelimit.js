const rateLimit = require('express-rate-limit');
const { ApiError, RenderError } = require('../utils/errors.js');

const globalLimiter = rateLimit({
	windowMs: 40 * 1000,
	limit: 52,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	handler: (req, res) => RenderError(res, 429),
});

const certificateLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 6,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	handler: (req, res) => ApiError(res, 429),
});

module.exports = { globalLimiter, certificateLimiter };
