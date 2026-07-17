(() => {
	const STORAGE_KEY = 'certyfikaty';

	const loadCertificates = () => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const list = raw ? JSON.parse(raw) : [];
			return Array.isArray(list) ? list : [];
		} catch {
			return [];
		}
	};

	const saveCertificates = list => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
		} catch { /* ... */ }
	};

	const formatDate = iso => {
		try {
			return new Date(iso).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
		} catch {
			return '';
		}
	};

	const downloadCertificate = cert => {
		const prefix = cert.title && cert.title.startsWith('Skierowanie') ? 'skierowanie-do-choroszczy' : 'certyfikat-malkontenci';
		const a = document.createElement('a');
		a.href = cert.image;
		a.download = `${prefix}-${cert.ticketNumber || cert.id}.jpg`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	const render = () => {
		const grid = document.getElementById('certs-grid');
		const empty = document.getElementById('certs-empty');
		const list = loadCertificates().slice().reverse();

		grid.innerHTML = '';
		empty.classList.toggle('hidden', list.length > 0);

		list.forEach(cert => {
			const card = document.createElement('div');
			card.className = 'cert-card';

			const img = document.createElement('img');
			img.src = cert.image;
			img.alt = `Certyfikat: ${cert.title}`;
			img.loading = 'lazy';
			img.decoding = 'async';
			card.appendChild(img);

			const meta = document.createElement('div');
			meta.className = 'cert-card-meta';
			const metaTitle = document.createElement('div');
			metaTitle.className = 'cert-card-title';
			metaTitle.textContent = cert.title;
			const metaDate = document.createElement('div');
			metaDate.className = 'cert-card-date';
			metaDate.textContent = `${formatDate(cert.date)} · ${cert.score}/${cert.max} pkt`;
			meta.appendChild(metaTitle);
			meta.appendChild(metaDate);
			card.appendChild(meta);

			const actions = document.createElement('div');
			actions.className = 'cert-card-actions';

			const dlBtn = document.createElement('button');
			dlBtn.type = 'button';
			dlBtn.className = 'btn-outline';
			dlBtn.textContent = 'Pobierz';
			dlBtn.addEventListener('click', () => downloadCertificate(cert));
			actions.appendChild(dlBtn);

			const delBtn = document.createElement('button');
			delBtn.type = 'button';
			delBtn.className = 'btn-ghost';
			delBtn.textContent = 'Usuń';
			delBtn.addEventListener('click', () => {
				saveCertificates(loadCertificates().filter(c => c.id !== cert.id));
				render();
			});
			actions.appendChild(delBtn);

			card.appendChild(actions);
			grid.appendChild(card);
		});
	};

	window.PageRouter.register('certificates', render);
})();
