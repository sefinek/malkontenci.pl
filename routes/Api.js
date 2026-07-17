const router = require('express').Router();
const { certificateLimiter } = require('../middlewares/ratelimit.js');
const { generateCertificate, generateReferral } = require('../utils/certificate.js');
const { getArchetype } = require('../utils/archetypes.js');
const { PET_QUESTION, PUBLIC_QUESTIONS, computeScore } = require('../utils/quiz.js');
const { ApiError } = require('../utils/httpError.js');

const toDataUrl = buf => `data:image/jpeg;base64,${buf.toString('base64')}`;
const REGENERATE_COOLDOWN_MS = 4000;

const QUESTIONS_PAYLOAD = { success: true, status: 200, questions: PUBLIC_QUESTIONS };

router.get('/questions', (req, res) => {
	res.set('Cache-Control', 'public, max-age=3600');
	res.json(QUESTIONS_PAYLOAD);
});

router.post('/certificate', certificateLimiter, async (req, res) => {
	const { nickname, ticketNumber, answers } = req.body || {};

	if (typeof ticketNumber !== 'string' || !(/^\d{4}$/).test(ticketNumber)) return ApiError(res, 400);
	if (nickname !== undefined && (typeof nickname !== 'string' || nickname.length > 24)) return ApiError(res, 400);

	const score = computeScore(answers);
	if (score === null) return ApiError(res, 400);

	const nick = (nickname || '').trim();
	const key = `${ticketNumber}:${score}:${nick}`;
	const cached = req.session.cert;
	const isSameKey = Boolean(cached && cached.key === key);

	if (!isSameKey && cached && Date.now() - cached.at < REGENERATE_COOLDOWN_MS) return ApiError(res, 429);

	try {
		const arch = getArchetype(score);
		const [certificate, referral] = await Promise.all([
			generateCertificate({ nickname: nick, ticketNumber, score, arch }),
			arch.referral ? generateReferral({ nickname: nick, ticketNumber }) : null,
		]);

		if (!isSameKey) req.session.cert = { key, at: Date.now() };

		res.json({
			success: true,
			status: 200,
			certificate: toDataUrl(certificate),
			referral: referral ? toDataUrl(referral) : null,
			title: arch.title,
			media: arch.media || null,
			pet: arch.pet ? PET_QUESTION : null,
			score,
			cached: isSameKey,
		});
	} catch (err) {
		ApiError(res, 500, err);
	}
});

router.use((req, res) => ApiError(res, 404));

module.exports = router;
