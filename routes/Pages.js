const router = require('express').Router();
const TestResult = require('../database/models/testResult.model.js');

router.get('/', async (req, res) => {
	const dla = typeof req.query.dla === 'string' ? req.query.dla.trim().slice(0, 24) : '';
	const hasStats = await TestResult.exists({});
	res.render('index.ejs', { dla, hasStats });
});

router.get('/test', (req, res) => res.render('test.ejs'));
router.get('/moje-certyfikaty', (req, res) => res.render('certificates.ejs'));
router.get('/statystyki', (req, res) => res.render('statystyki.ejs'));
router.get('/uznania', (req, res) => res.render('credits.ejs'));
router.get('/polityka-prywatnosci', (req, res) => res.render('privacy.ejs'));

module.exports = router;
