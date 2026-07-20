(() => {
	const CACHE_TTL_MS = 5 * 60 * 1000;
	const CACHE_LIMIT = 8;
	const cache = new Map();
	const pending = new Map();
	const inits = new Map();
	const loadedScripts = new Set(Array.from(document.querySelectorAll('script[src]'), s => s.src));
	let navToken = 0;

	const cacheKey = url => url.pathname + url.search;

	const getCached = key => {
		const entry = cache.get(key);
		if (!entry) return null;
		if (Date.now() - entry.at > CACHE_TTL_MS) {
			cache.delete(key);
			return null;
		}
		return entry.html;
	};

	const setCached = (key, html) => {
		cache.delete(key);
		cache.set(key, { html, at: Date.now() });
		if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
	};

	const fetchPage = url => {
		const key = cacheKey(url);
		const cached = getCached(key);
		if (cached) return Promise.resolve(cached);
		if (pending.has(key)) return pending.get(key);

		const req = fetch(url.href, { headers: { Accept: 'text/html' } })
			.then(res => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.text();
			})
			.then(html => {
				setCached(key, html);
				return html;
			})
			.finally(() => pending.delete(key));

		pending.set(key, req);
		return req;
	};

	const SYNCED_HEAD = [
		'meta[name="description"]',
		'meta[name="keywords"]',
		'meta[name="robots"]',
		'link[rel="canonical"]',
		'meta[property="og:title"]',
		'meta[property="og:description"]',
		'meta[property="og:url"]',
		'meta[name="twitter:title"]',
		'meta[name="twitter:description"]',
		'script[type="application/ld+json"][data-seo]',
	];

	const syncPageCss = doc => {
		const current = new Map(Array.from(document.head.querySelectorAll('link[data-page-css]'), link => [link.getAttribute('href'), link]));
		const next = new Set();
		doc.head.querySelectorAll('link[data-page-css]').forEach(link => {
			const href = link.getAttribute('href');
			next.add(href);
			if (!current.has(href)) document.head.appendChild(document.adoptNode(link));
		});
		current.forEach((link, href) => {
			if (!next.has(href)) link.remove();
		});
	};

	const syncHead = doc => {
		document.title = doc.title;
		SYNCED_HEAD.forEach(selector => {
			const current = document.head.querySelector(selector);
			const next = doc.head.querySelector(selector);
			if (next) {
				const adopted = document.adoptNode(next);
				if (current) {
					current.replaceWith(adopted);
				} else {
					document.head.appendChild(adopted);
				}
			} else if (current) {
				current.remove();
			}
		});
		syncPageCss(doc);
	};

	const teardownPage = main => {
		main.querySelectorAll('video, audio').forEach(media => media.pause());
		if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
	};

	const applyDocument = doc => {
		syncHead(doc);
		document.body.dataset.page = doc.body.dataset.page || '';
		const main = document.querySelector('main');
		teardownPage(main);
		main.replaceWith(document.adoptNode(doc.querySelector('main')));
		const footer = document.querySelector('footer');
		const nextFooter = doc.querySelector('footer');
		if (footer && nextFooter) footer.replaceWith(document.adoptNode(nextFooter));
		window.musicPlayer.resume();
	};

	const loadScripts = doc => {
		const jobs = Array.from(doc.querySelectorAll('body script[src]'))
			.filter(s => !loadedScripts.has(s.src))
			.map(s => new Promise((resolve, reject) => {
				loadedScripts.add(s.src);
				const el = document.createElement('script');
				el.src = s.src;
				el.onload = resolve;
				el.onerror = () => {
					loadedScripts.delete(s.src);
					reject(new Error(`Script failed: ${s.src}`));
				};
				document.body.appendChild(el);
			}));
		return Promise.all(jobs);
	};

	const runPageInit = () => {
		const init = inits.get(document.body.dataset.page);
		if (init) init();
	};

	const resetScroll = url => {
		const anchor = url.hash && document.getElementById(url.hash.slice(1));
		if (anchor) {
			anchor.scrollIntoView();
		} else {
			window.scrollTo({ top: 0, behavior: 'instant' });
		}
	};

	const navigate = async (url, { push = true, resetPosition = true } = {}) => {
		const token = ++navToken;
		try {
			const html = await fetchPage(url);
			if (token !== navToken) return;
			const doc = new DOMParser().parseFromString(html, 'text/html');
			if (!doc.querySelector('main')) throw new Error('Invalid document');
			await loadScripts(doc);
			if (token !== navToken) return;
			if (push) history.pushState(null, '', url.href);
			applyDocument(doc);
			runPageInit();
			if (resetPosition) resetScroll(url);
		} catch {
			if (token === navToken) window.location.href = url.href;
		}
	};

	const linkTarget = a => {
		if (!a || a.target || a.hasAttribute('download') || a.origin !== location.origin) return null;
		const url = new URL(a.href);
		if (url.pathname.startsWith('/api/')) return null;
		return url;
	};

	const isSamePage = url => url.pathname === location.pathname && url.search === location.search;

	document.addEventListener('click', e => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		if (!(e.target instanceof Element)) return;
		const url = linkTarget(e.target.closest('a[href]'));
		if (!url) return;
		if (isSamePage(url)) {
			if (url.hash) return;
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		e.preventDefault();
		void navigate(url);
	});

	const prefetch = e => {
		if (!(e.target instanceof Element)) return;
		const url = linkTarget(e.target.closest('a[href]'));
		if (!url || isSamePage(url)) return;
		fetchPage(url).catch(() => undefined);
	};

	document.addEventListener('mouseover', prefetch);
	document.addEventListener('touchstart', prefetch, { passive: true });
	window.addEventListener('popstate', () => navigate(new URL(location.href), { push: false, resetPosition: false }));
	document.addEventListener('DOMContentLoaded', () => runPageInit());

	window.PageRouter = {
		register: (page, init) => {
			inits.set(page, init);
		},
	};
})();
