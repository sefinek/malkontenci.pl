const router = require('express').Router();
const TestResult = require('../database/models/testResult.model.js');

const decodeName = value => {
	if (typeof value !== 'string') return '';
	try {
		return atob(value).trim().slice(0, 24);
	} catch {
		return '';
	}
};

router.get('/', async (req, res) => {
	const dla = decodeName(req.query.dla);
	const hasStats = await TestResult.exists({});
	res.render('index.ejs', { dla, hasStats });
});

router.get('/test', (req, res) => res.render('test.ejs'));
router.get('/moje-certyfikaty', (req, res) => res.render('certificates.ejs'));
router.get('/statystyki', (req, res) => res.render('statystyki.ejs'));
router.get('/uznania', (req, res) => res.render('credits.ejs'));
router.get('/polityka-prywatnosci', (req, res) => res.render('privacy.ejs'));

module.exports = router;
