window.CertStore = (() => {
	const STORAGE_KEY = 'certyfikaty';
	const MAX_SAVED_CERTS = 12;

	const load = () => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const list = raw ? JSON.parse(raw) : [];
			return Array.isArray(list) ? list : [];
		} catch {
			return [];
		}
	};

	const save = list => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
		} catch { /* ... */ }
	};

	const append = certs => {
		let list = load();
		list.push(...certs);
		if (list.length > MAX_SAVED_CERTS) list = list.slice(list.length - MAX_SAVED_CERTS);

		while (list.length) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
				return;
			} catch (err) {
				if (err.name !== 'QuotaExceededError' && err.name !== 'NS_ERROR_DOM_QUOTA_REACHED') return;
				list.shift();
			}
		}
	};

	return { load, save, append, MAX_SAVED_CERTS };
})();
