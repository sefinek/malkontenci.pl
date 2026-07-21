const router = require('express').Router();
const { certificateLimiter } = require('../middlewares/ratelimit.js');
const { generateCertificate, generateReferral } = require('../utils/certificate.js');
const { ARCHETYPES, ARCHETYPE_TITLES, getArchetype } = require('../utils/archetypes.js');
const { PET_QUESTION, PUBLIC_QUESTIONS, computeScore } = require('../utils/questions.js');
const { ApiError } = require('../utils/errors.js');
const axios = require('../services/axios.js');
const RedisClient = require('../services/redis.js');
const TestResult = require('../database/models/testResult.model.js');
const { SECRET_KEY: TURNSTILE_SECRET_KEY } = require('../utils/turnstile.js');

const toDataUrl = buf => `data:image/jpeg;base64,${buf.toString('base64')}`;
const REGENERATE_COOLDOWN_MS = 4000;
const TEST_AUTH_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const STATS_DAYS = 30;
const STATS_CACHE_MS = 60 * 1000;
const ARCHETYPE_SWITCH = {
	$switch: {
		branches: ARCHETYPES.map(a => ({ case: { $and: [{ $gte: ['$score', a.min] }, { $lte: ['$score', a.max] }] }, then: a.title })),
		default: null,
	},
};
const TEST_LIMIT_HOUR_MAX = 2;
const TEST_LIMIT_HOUR_WINDOW_S = 60 * 60;
const TEST_LIMIT_WEEK_MAX = 5;
const TEST_LIMIT_WEEK_WINDOW_S = 7 * 24 * 60 * 60;

const incrWithExpiry = async (key, windowS) => {
	await RedisClient.set(key, 0, { EX: windowS, NX: true });
	return RedisClient.incr(key);
};

const peekTestLimit = async ip => {
	const [hourCount, weekCount] = await RedisClient.mGet([
		`malkontencipl:test-limit:hour:${ip}`,
		`malkontencipl:test-limit:week:${ip}`,
	]);
	return Number(hourCount) < TEST_LIMIT_HOUR_MAX && Number(weekCount) < TEST_LIMIT_WEEK_MAX;
};

const consumeTestLimit = ip => Promise.all([
	incrWithExpiry(`malkontencipl:test-limit:hour:${ip}`, TEST_LIMIT_HOUR_WINDOW_S),
	incrWithExpiry(`malkontencipl:test-limit:week:${ip}`, TEST_LIMIT_WEEK_WINDOW_S),
]);

const verifyTurnstile = async (token, ip) => {
	if (typeof token !== 'string' || !token) return false;

	try {
		const { data } = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token, remoteip: ip }));
		if (data.success !== true) {
			const errors = Array.isArray(data['error-codes']) ? data['error-codes'] : [];
			console.warn('[turnstile] validation failed:', errors.join(', ') || 'unknown-error');
		}
		return data.success === true;
	} catch (err) {
		console.error('[turnstile] request failed:', err.message);
		return false;
	}
};

const hasTestAuthorization = req => {
	const verifiedAt = req.session.testAuthorizedAt;
	return Number.isFinite(verifiedAt) && Date.now() - verifiedAt < TEST_AUTH_MAX_AGE_MS;
};

const QUESTIONS_PAYLOAD = { success: true, status: 200, questions: PUBLIC_QUESTIONS };

router.get('/questions', (req, res) => {
	res.set('Cache-Control', 'no-store');
	res.json(QUESTIONS_PAYLOAD);
});

router.post('/turnstile', certificateLimiter, async (req, res) => {
	const { turnstileToken } = req.body || {};

	if (!(await peekTestLimit(req.ip))) return ApiError(res, 429, null, 'Osiągnięto limit testów. Spróbuj ponownie później.', 'test_limit_reached');
	if (!(await verifyTurnstile(turnstileToken, req.ip))) return ApiError(res, 400, null, 'Weryfikacja Cloudflare Turnstile nie powiodła się. Spróbuj ponownie.', 'turnstile_failed');

	req.session.testAuthorizedAt = Date.now();
	res.json({ success: true, status: 200 });
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
	const isSameKey = Boolean(cached && cached.key === key && cached.certificate);

	if (!isSameKey && !(await peekTestLimit(req.ip))) return ApiError(res, 429, null, 'Osiągnięto limit testów. Spróbuj ponownie później.', 'test_limit_reached');
	if (!isSameKey && cached && Date.now() - cached.at < REGENERATE_COOLDOWN_MS) return ApiError(res, 429);
	if (!isSameKey && !hasTestAuthorization(req)) return ApiError(res, 403, null, 'Sesja weryfikacji wygasła. Potwierdź ponownie, że nie jesteś botem.', 'test_authorization_required');

	try {
		const arch = getArchetype(score);
		let certificateUrl, referralUrl;

		if (isSameKey) {
			({ certificate: certificateUrl, referral: referralUrl } = cached);
		} else {
			const [certificate, referral] = await Promise.all([
				generateCertificate({ nickname: nick, ticketNumber, score, arch }),
				arch.referral ? generateReferral({ nickname: nick, ticketNumber }) : null,
			]);
			certificateUrl = toDataUrl(certificate);
			referralUrl = referral ? toDataUrl(referral) : null;

			req.session.cert = { key, at: Date.now(), certificate: certificateUrl, referral: referralUrl };
			delete req.session.testAuthorizedAt;
			TestResult.create({ score, archetype: arch.title }).catch(err => console.error('Failed to save test result to statistics:', err));
			consumeTestLimit(req.ip).catch(err => console.error('Failed to update test limit:', err));
		}

		res.json({
			success: true,
			status: 200,
			certificate: certificateUrl,
			referral: referralUrl,
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

let statsCache = null;

router.get('/stats', async (req, res) => {
	res.set('Cache-Control', 'public, max-age=120');

	if (statsCache && Date.now() - statsCache.at < STATS_CACHE_MS) return res.json(statsCache.payload);

	const now = new Date();
	const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	const daysAgo = new Date(startOfToday);
	daysAgo.setUTCDate(daysAgo.getUTCDate() - (STATS_DAYS - 1));

	try {
		const [facet] = await TestResult.aggregate([
			{
				$facet: {
					total: [{ $count: 'count' }],
					byDay: [
						{ $match: { createdAt: { $gte: daysAgo } } },
						{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
					],
					byArchetype: [
						{ $group: { _id: ARCHETYPE_SWITCH, count: { $sum: 1 } } },
					],
					avgScore: [
						{ $group: { _id: null, avg: { $avg: '$score' } } },
					],
					today: [
						{ $match: { createdAt: { $gte: startOfToday } } },
						{ $group: { _id: null, count: { $sum: 1 }, min: { $min: '$score' }, max: { $max: '$score' } } },
					],
				},
			},
		]);

		const total = facet.total[0]?.count || 0;
		const today = facet.today[0] || { count: 0, min: null, max: null };
		const averageScore = facet.avgScore[0] ? Math.round(facet.avgScore[0].avg * 10) / 10 : null;

		const dayCounts = new Map(facet.byDay.map(d => [d._id, d.count]));
		const byDay = [];
		for (let i = 0; i < STATS_DAYS; i++) {
			const date = new Date(daysAgo);
			date.setUTCDate(date.getUTCDate() + i);
			const key = date.toISOString().slice(0, 10);
			byDay.push({ date: key, count: dayCounts.get(key) || 0 });
		}

		const archetypeCounts = new Map(facet.byArchetype.map(item => [item._id, item.count]));
		const byArchetype = ARCHETYPE_TITLES.map(title => {
			const count = archetypeCounts.get(title) || 0;
			return { title, count, percent: total ? Math.round((count / total) * 1000) / 10 : 0 };
		});

		const payload = {
			success: true,
			status: 200,
			total,
			today: { count: today.count, minScore: today.min ?? null, maxScore: today.max ?? null },
			averageScore,
			byDay,
			byArchetype,
		};
		statsCache = { at: Date.now(), payload };
		res.json(payload);
	} catch (err) {
		ApiError(res, 500, err);
	}
});

router.use((req, res) => ApiError(res, 404));

module.exports = router;
