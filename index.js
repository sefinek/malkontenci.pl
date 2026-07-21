process.loadEnvFile();
const express = require('express');
const helmet = require('helmet');
const { version } = require('./package.json');
const { DOMAIN, NODE_ENV, PORT } = process.env;
const isProd = NODE_ENV === 'production';

// Middleware imports
const timeout = require('./middlewares/timeout.js');
const logger = require('./middlewares/morgan.js');
const { globalLimiter } = require('./middlewares/ratelimit.js');
const session = require('./middlewares/session.js');
const { RenderError } = require('./utils/errors.js');

// Mongoose & passport initialization
require('./database/mongoose.js');

// Create an Express app
const app = express();

// Configure the app
if (isProd) app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.locals.domain = DOMAIN;
app.locals.version = version;

// Use middlewares
app.use(helmet({
	crossOriginResourcePolicy: false,
	contentSecurityPolicy: {
		directives: {
			...helmet.contentSecurityPolicy.getDefaultDirectives(),
			'script-src': ['\'self\'', 'https://cdn.sefinek.net', 'https://challenges.cloudflare.com'],
			'style-src': ['\'self\'', 'https://fonts.googleapis.com'],
			'font-src': ['\'self\'', 'https://fonts.gstatic.com'],
			'img-src': ['\'self\'', 'data:'],
			'connect-src': ['\'self\'', 'https://challenges.cloudflare.com'],
			'frame-src': ['https://challenges.cloudflare.com'],
		},
	},
}));
app.use(express.static('public'));
app.use(express.json({ limit: '8kb' }));
app.use(logger);
if (isProd) app.use(globalLimiter);
app.use(timeout());
app.use(session);


// Routes
const PagesRouter = require('./routes/Pages.js');
const APIRouter = require('./routes/Api.js');

app.use('/', PagesRouter);
app.use('/api/v1', APIRouter);


// Error handling
app.use((req, res) => RenderError(res, 404));
app.use((err, req, res, _next) => RenderError(res, 500, err));

// Start the server
app.listen(PORT, () => process.send ? process.send('ready') : console.log(`Server running at ${DOMAIN}:${PORT}`));
