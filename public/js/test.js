(() => {
	const PROGRESS_KEY = 'postep';
	const CERT_STORAGE_KEY = 'certyfikaty';
	const MAX_SAVED_CERTS = 12;
	const MAX_SCORE = 100;

	let QUESTIONS = [];
	let PET_QUESTION = null;
	let quizReady = null;
	let els;
	let state;
	let turnstileToken = null;
	let turnstileWidgetId = null;

	const fromBase64Url = str => {
		const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
		return atob(padded);
	};

	const moveTurnstileToModal = () => {
		const container = document.getElementById('turnstile-widget');
		if (container && els.modalActions) els.modalActions.parentElement.insertBefore(container, els.modalActions);
	};

	const moveTurnstileOffscreen = () => {
		const container = document.getElementById('turnstile-widget');
		const keepalive = document.getElementById('turnstile-keepalive');
		if (container && keepalive) keepalive.appendChild(container);
	};

	const initTurnstile = () => {
		const container = document.getElementById('turnstile-widget');
		if (!container || !window.turnstile || turnstileWidgetId !== null) return;

		turnstileWidgetId = window.turnstile.render(container, {
			sitekey: container.dataset.sitekey,
			'refresh-expired': 'auto',
			callback: token => {
				turnstileToken = token;
				els.nickConfirm.disabled = false;
			},
			'error-callback': () => {
				turnstileToken = null;
				els.nickConfirm.disabled = true;
			},
			'expired-callback': () => {
				turnstileToken = null;
				els.nickConfirm.disabled = true;
			},
		});
	};

	const loadQuiz = async () => {
		const res = await fetch('/api/v1/questions');
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		QUESTIONS = data.questions;
	};

	const ensureQuizLoaded = () => {
		if (!quizReady) {
			quizReady = loadQuiz().catch(err => {
				quizReady = null;
				throw err;
			});
		}
		return quizReady;
	};

	const shuffledOrder = () => {
		const order = QUESTIONS.map((_, i) => i);
		for (let i = order.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[order[i], order[j]] = [order[j], order[i]];
		}
		return order;
	};

	const queryEls = () => ({
		viewQuiz: document.getElementById('view-quiz'),
		viewResult: document.getElementById('view-result'),
		viewLimit: document.getElementById('view-limit'),
		petSection: document.getElementById('pet-section'),
		petQuestion: document.getElementById('pet-question'),
		petAnswers: document.getElementById('pet-answers'),
		petAck: document.getElementById('pet-ack'),
		branchBlock: document.getElementById('branch-block'),
		branchText: document.getElementById('branch-text'),
		branchPhone: document.getElementById('branch-phone'),
		branchActions: document.getElementById('branch-actions'),
		branchYesBtn: document.getElementById('branch-yes-btn'),
		branchNoBtn: document.getElementById('branch-no-btn'),
		branchVideo: document.getElementById('branch-video'),
		resultMedia: document.getElementById('result-media'),
		questionNumber: document.getElementById('question-number'),
		totalQuestions: document.getElementById('total-questions'),
		progressLabel: document.getElementById('progress-label'),
		progressFill: document.getElementById('progress-fill'),
		quizQuestion: document.getElementById('quiz-question'),
		answers: document.getElementById('answers'),
		copyBtn: document.getElementById('copy-btn'),
		restartBtn: document.getElementById('restart-btn'),
		modalOverlay: document.getElementById('nick-modal'),
		modalActions: document.getElementById('modal-actions'),
		nickInput: document.getElementById('nick-input'),
		nickConfirm: document.getElementById('nick-confirm'),
		certImageStatus: document.getElementById('cert-image-status'),
		certImageWrap: document.getElementById('cert-image-wrap'),
		certImage: document.getElementById('cert-image'),
		downloadBtn: document.getElementById('download-btn'),
		referralImageWrap: document.getElementById('referral-image-wrap'),
		referralImage: document.getElementById('referral-image'),
		downloadReferralBtn: document.getElementById('download-referral-btn'),
		printBtn: document.getElementById('print-btn'),
	});

	const showView = view => {
		els.viewQuiz.classList.toggle('hidden', view !== 'quiz');
		els.viewResult.classList.toggle('hidden', view !== 'result');
		els.viewLimit.classList.toggle('hidden', view !== 'limit');
		window.scrollTo({ top: 0, behavior: 'instant' });
	};

	const openNickDialog = () => {
		els.nickInput.value = state.targetName || state.nickname || '';
		moveTurnstileToModal();
		els.modalOverlay.classList.add('open');
		els.nickConfirm.disabled = true;

		if (turnstileWidgetId === null) {
			initTurnstile();
		} else {
			turnstileToken = null;
			window.turnstile.reset(turnstileWidgetId);
		}
	};

	const closeNickDialog = () => {
		els.modalOverlay.classList.remove('open');
		moveTurnstileOffscreen();
	};

	const checkTestLimit = async () => {
		try {
			const res = await fetch('/api/v1/test-limit');
			if (!res.ok) return true;
			const data = await res.json();
			return data.allowed !== false;
		} catch {
			return true;
		}
	};

	const startNewAttempt = async () => {
		if (await checkTestLimit()) {
			openNickDialog();
		} else {
			showView('limit');
		}
	};

	const saveProgress = () => {
		try {
			if (!state.answers.length) {
				sessionStorage.removeItem(PROGRESS_KEY);
				return;
			}
			sessionStorage.setItem(PROGRESS_KEY, JSON.stringify({ order: state.order, answers: state.answers }));
		} catch { /* ... */ }
	};

	const isValidOrder = order => {
		if (!Array.isArray(order) || order.length !== QUESTIONS.length) return false;
		if (order.some(n => !Number.isInteger(n) || n < 0 || n >= QUESTIONS.length)) return false;
		return new Set(order).size === QUESTIONS.length;
	};

	const isValidAnswers = (answers, order) => {
		if (!Array.isArray(answers) || answers.length > order.length) return false;
		return answers.every((a, i) => {
			const optionsCount = QUESTIONS[order[i]].a.length;
			return Number.isInteger(a) && a >= 0 && a < optionsCount;
		});
	};

	const loadProgress = () => {
		try {
			const raw = sessionStorage.getItem(PROGRESS_KEY);
			if (!raw) return null;
			const data = JSON.parse(raw);
			if (!data || !isValidOrder(data.order) || !isValidAnswers(data.answers, data.order)) return null;
			return data;
		} catch {
			return null;
		}
	};

	const answersByQuestionIndex = () => {
		const answers = new Array(QUESTIONS.length).fill(null);
		state.order.forEach((originalIndex, i) => {
			if (i < state.answers.length) answers[originalIndex] = state.answers[i];
		});
		return answers;
	};

	const saveCertificates = certs => {
		let list;
		try {
			const raw = localStorage.getItem(CERT_STORAGE_KEY);
			list = raw ? JSON.parse(raw) : [];
			if (!Array.isArray(list)) list = [];
		} catch { list = []; }
		list.push(...certs);
		if (list.length > MAX_SAVED_CERTS) list = list.slice(list.length - MAX_SAVED_CERTS);
		try { localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(list)); } catch { /* ... */ }
	};

	const resetBranch = () => {
		state.branchVideoSrc = '';
		state.branchNoAck = '';
		els.branchBlock.classList.add('hidden');
		els.branchActions.classList.remove('hidden');
		els.branchVideo.classList.add('hidden');
		els.branchVideo.pause();
		els.branchVideo.removeAttribute('src');
		els.branchVideo.load();
	};

	const showBranch = branch => {
		window.musicPlayer.pause();
		els.resultMedia.pause();
		state.branchVideoSrc = branch.video;
		state.branchNoAck = branch.noAck || 'Dziękujemy za odpowiedź.';
		els.branchText.textContent = branch.text;
		els.branchPhone.textContent = branch.phone || '';
		els.branchBlock.classList.remove('hidden');
		els.branchActions.classList.remove('hidden');
		els.branchVideo.classList.add('hidden');
	};

	const renderPetQuestion = () => {
		resetBranch();
		els.petSection.classList.remove('hidden');
		els.petAck.classList.add('hidden');
		els.petAnswers.classList.remove('hidden');

		els.petQuestion.textContent = PET_QUESTION.q;
		els.petAnswers.innerHTML = '';
		PET_QUESTION.a.forEach(opt => {
			const btn = document.createElement('button');
			btn.className = 'answer-btn';
			btn.textContent = opt.t;
			btn.addEventListener('click', () => {
				els.petAnswers.classList.add('hidden');
				if (opt.branch) {
					showBranch(opt.branch);
				} else {
					els.petAck.textContent = opt.ack || 'Dziękujemy za odpowiedź.';
					els.petAck.classList.remove('hidden');
				}
			});
			els.petAnswers.appendChild(btn);
		});
	};

	const requestVideoFullscreen = video => {
		const request = video.requestFullscreen || video.webkitRequestFullscreen || video.webkitEnterFullscreen;
		if (request) {
			const result = request.call(video);
			if (result && result.catch) result.catch(() => undefined);
		}
	};

	const playBranchVideo = () => {
		window.musicPlayer.pause();
		els.resultMedia.pause();
		els.branchActions.classList.add('hidden');
		els.branchVideo.classList.remove('hidden');
		els.branchVideo.src = state.branchVideoSrc;
		requestVideoFullscreen(els.branchVideo);
		els.branchVideo.play().catch(() => undefined);
	};

	const declineBranchVideo = () => {
		els.branchBlock.classList.add('hidden');
		els.petAck.textContent = state.branchNoAck;
		els.petAck.classList.remove('hidden');
	};

	const generateCertificateImage = async nick => {
		els.certImageStatus.textContent = 'Trwa generowanie dokumentów, proszę czekać...';
		els.certImageStatus.classList.remove('hidden');
		els.certImageWrap.classList.add('hidden');
		els.downloadBtn.classList.add('hidden');
		els.referralImageWrap.classList.add('hidden');
		els.downloadReferralBtn.classList.add('hidden');
		els.printBtn.classList.add('hidden');
		els.copyBtn.classList.add('hidden');
		els.restartBtn.classList.add('hidden');

		try {
			const res = await fetch('/api/v1/certificate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nickname: nick, ticketNumber: state.ticketNumber, answers: answersByQuestionIndex(), turnstileToken }),
			});
			const data = await res.json().catch(() => null);
			if (!res.ok || !data || !data.success) {
				els.certImageStatus.textContent = (data && data.message) || 'Nie udało się wygenerować obrazu certyfikatu.';
				return;
			}

			state.resultTitle = data.title;
			state.resultScore = data.score;
			els.copyBtn.classList.remove('hidden');
			els.restartBtn.classList.remove('hidden');

			if (data.media) {
				els.resultMedia.src = data.media;
				els.resultMedia.muted = false;
				els.resultMedia.classList.remove('hidden');
				els.resultMedia.play().catch(() => undefined);
			}

			els.certImage.src = data.certificate;
			els.certImageStatus.classList.add('hidden');
			els.certImageWrap.classList.remove('hidden');
			els.downloadBtn.classList.remove('hidden');
			els.printBtn.classList.remove('hidden');
			if (data.pet) {
				PET_QUESTION = data.pet;
				renderPetQuestion();
			} else {
				els.petSection.classList.add('hidden');
			}

			if (data.referral) {
				els.referralImage.src = data.referral;
				els.referralImageWrap.classList.remove('hidden');
				els.downloadReferralBtn.classList.remove('hidden');
			}

			if (!data.cached) {
				const now = Date.now();
				const newCerts = [{
					id: `${state.ticketNumber}-${now}`,
					date: new Date().toISOString(),
					nickname: nick,
					title: data.title,
					score: data.score,
					max: MAX_SCORE,
					ticketNumber: state.ticketNumber,
					image: data.certificate,
				}];

				if (data.referral) {
					newCerts.push({
						id: `${state.ticketNumber}-${now}-ref`,
						date: new Date().toISOString(),
						nickname: nick,
						title: 'Skierowanie: Szpital w Choroszczy',
						score: data.score,
						max: MAX_SCORE,
						ticketNumber: state.ticketNumber,
						image: data.referral,
					});
				}

				saveCertificates(newCerts);
			}
		} catch {
			els.certImageStatus.textContent = 'Nie udało się wygenerować obrazu certyfikatu.';
		}
	};

	const showResult = () => {
		const nick = state.nickname || 'Anonimowy Malkontent';
		window.musicPlayer.pause();
		showView('result');
		generateCertificateImage(nick);
	};

	const renderQuestion = () => {
		const q = QUESTIONS[state.order[state.questionIndex]];
		els.questionNumber.textContent = state.questionIndex + 1;
		els.totalQuestions.textContent = QUESTIONS.length;
		const pct = Math.round((state.questionIndex / QUESTIONS.length) * 100);
		els.progressLabel.textContent = `${pct}%`;
		els.progressFill.style.width = `${pct}%`;
		els.quizQuestion.textContent = q.q;
		els.answers.innerHTML = '';
		q.a.forEach((opt, i) => {
			const btn = document.createElement('button');
			btn.className = 'answer-btn';
			btn.textContent = opt.t;
			btn.addEventListener('click', () => {
				state.answers.push(i);
				saveProgress();
				if (state.questionIndex + 1 >= QUESTIONS.length) {
					showResult();
				} else {
					state.questionIndex += 1;
					renderQuestion();
				}
			});
			els.answers.appendChild(btn);
		});
	};

	const startQuiz = () => {
		state.questionIndex = 0;
		state.answers = [];
		state.order = shuffledOrder();
		saveProgress();
		showView('quiz');
		renderQuestion();
	};

	const restoreProgress = () => {
		if (!state.nickname) return false;
		const data = loadProgress();
		if (!data) return false;
		state.order = data.order;
		state.answers = data.answers;
		if (data.answers.length >= QUESTIONS.length) {
			showResult();
		} else {
			state.questionIndex = data.answers.length;
			showView('quiz');
			renderQuestion();
		}
		return true;
	};

	const confirmNick = async () => {
		const nick = (els.nickInput.value || '').trim() || 'Anonimowy Malkontent';
		state.nickname = nick;
		try { localStorage.setItem('nick', nick); } catch { /* ... */ }
		closeNickDialog();

		try {
			await ensureQuizLoaded();
		} catch {
			els.quizQuestion.textContent = 'Nie udało się wczytać pytań. Odśwież stronę.';
			showView('quiz');
			return;
		}

		startQuiz();
	};

	const downloadImage = (src, filename) => {
		if (!src) return;
		const a = document.createElement('a');
		a.href = src;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	const resetResultMedia = () => {
		els.resultMedia.pause();
		els.resultMedia.removeAttribute('src');
		els.resultMedia.load();
		els.resultMedia.classList.add('hidden');
		window.musicPlayer.resume();
	};

	const restart = async () => {
		els.copyBtn.textContent = 'Skopiuj wynik';
		resetResultMedia();
		await startNewAttempt();
	};

	const copyResult = () => {
		const nick = state.nickname || 'Anonimowy Malkontent';
		const title = state.resultTitle || 'Malkontent';
		const text = `${nick} zdiagnozowany jako: ${title} (${state.resultScore}/${MAX_SCORE} pkt frustracji) | Krajowa Poradnia Antyfrustracyjna - https://malkontenci.pl`;
		if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => undefined);

		els.copyBtn.textContent = 'Skopiowano';
		setTimeout(() => { els.copyBtn.textContent = 'Skopiuj wynik'; }, 2000);
	};

	const init = async () => {
		ensureQuizLoaded().catch(() => undefined);

		els = queryEls();
		turnstileWidgetId = null;
		turnstileToken = null;
		let storedNick = '';
		try { storedNick = localStorage.getItem('nick') || ''; } catch { /* ... */ }
		state = {
			questionIndex: 0,
			answers: [],
			order: [],
			ticketNumber: window.getTicketNumber(),
			nickname: storedNick,
			targetName: '',
			resultTitle: '',
			resultScore: 0,
			branchVideoSrc: '',
			branchNoAck: '',
		};

		const params = new URLSearchParams(window.location.search);
		const target = params.get('dla');
		if (target) {
			try {
				state.targetName = fromBase64Url(target).trim().slice(0, 24);
			} catch { /* ... */ }
		}

		els.nickConfirm.addEventListener('click', confirmNick);
		els.nickInput.addEventListener('keydown', e => { if (e.key === 'Enter') confirmNick(); });
		els.copyBtn.addEventListener('click', copyResult);
		els.downloadBtn.addEventListener('click', () => downloadImage(els.certImage.src, `certyfikat-malkontenci-${state.ticketNumber}.jpg`));
		els.downloadReferralBtn.addEventListener('click', () => downloadImage(els.referralImage.src, `skierowanie-do-choroszczy-${state.ticketNumber}.jpg`));
		els.printBtn.addEventListener('click', () => window.print());
		els.restartBtn.addEventListener('click', restart);
		els.branchYesBtn.addEventListener('click', playBranchVideo);
		els.branchNoBtn.addEventListener('click', declineBranchVideo);

		if (!state.nickname) {
			await startNewAttempt();
			return;
		}

		try {
			await ensureQuizLoaded();
		} catch {
			els.quizQuestion.textContent = 'Nie udało się wczytać pytań. Odśwież stronę.';
			showView('quiz');
			return;
		}

		if (!restoreProgress()) await startNewAttempt();
	};

	window.PageRouter.register('test', init);
})();
