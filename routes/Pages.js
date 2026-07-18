const router = require('express').Router();

router.get('/', (req, res) => {
	const dla = typeof req.query.dla === 'string' ? req.query.dla.trim().slice(0, 24) : '';
	res.render('index.ejs', { dla });
});

router.get('/test', (req, res) => res.render('test.ejs'));
router.get('/moje-certyfikaty', (req, res) => res.render('certificates.ejs'));
router.get('/uznania', (req, res) => res.render('credits.ejs'));

module.exports = router;
