const router = require('express').Router();
const { certificateLimiter } = require('../middlewares/ratelimit.js');
const { generateCertificate, generateReferral } = require('../utils/certificate.js');
const { ARCHETYPE_TITLES, getArchetype } = require('../utils/archetypes.js');
const { PET_QUESTION, PUBLIC_QUESTIONS, computeScore } = require('../utils/quiz.js');
const { ApiError } = require('../utils/httpError.js');
const TestResult = require('../database/models/testResult.model.js');

const toDataUrl = buf => `data:image/jpeg;base64,${buf.toString('base64')}`;
const REGENERATE_COOLDOWN_MS = 4000;
const STATS_DAYS = 30;

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

		if (!isSameKey) {
			req.session.cert = { key, at: Date.now() };
			TestResult.create({ score, archetype: arch.title }).catch(err => console.error('Nie udało się zapisać wyniku do statystyk:', err));
		}

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

router.get('/stats', async (req, res) => {
	res.set('Cache-Control', 'public, max-age=120');

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
						{ $group: { _id: '$archetype', count: { $sum: 1 } } },
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

		const archetypeCounts = new Map(facet.byArchetype.map(a => [a._id, a.count]));
		const byArchetype = ARCHETYPE_TITLES.map(title => {
			const count = archetypeCounts.get(title) || 0;
			return { title, count, percent: total ? Math.round((count / total) * 1000) / 10 : 0 };
		});

		res.json({
			success: true,
			status: 200,
			total,
			today: { count: today.count, minScore: today.min ?? null, maxScore: today.max ?? null },
			averageScore,
			byDay,
			byArchetype,
		});
	} catch (err) {
		ApiError(res, 500, err);
	}
});

router.use((req, res) => ApiError(res, 404));

module.exports = router;
