const session = require('express-session');
const { RedisStore } = require('connect-redis');
const RedisClient = require('../services/redis.js');
const { NODE_ENV, SESSION_SECRET } = process.env;

if (!SESSION_SECRET) throw new Error('SESSION_SECRET environment variable is required');

const MAX_AGE = 2 * 60 * 60 * 1000;

module.exports = session({
	name: 'mki.sid',
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: new RedisStore({ client: RedisClient, prefix: 'malkontencipl:sessions:' }),
	cookie: {
		httpOnly: true,
		sameSite: 'lax',
		secure: NODE_ENV === 'production',
		maxAge: MAX_AGE,
	},
});
