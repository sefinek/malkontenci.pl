(() => {
	let els;

	const toBase64Url = str => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

	const generateShareLink = () => {
		const name = (els.shareInput.value || '').trim();
		if (!name) return;
		const url = new URL(window.location.href);
		url.search = '';
		url.searchParams.set('dla', toBase64Url(name));
		const link = url.toString();
		els.shareLink.textContent = link;
		els.shareLink.classList.add('visible');
		if (navigator.clipboard) {
			navigator.clipboard.writeText(link).catch(() => undefined);
			els.shareBtn.textContent = 'Skopiowano';
			setTimeout(() => { els.shareBtn.textContent = 'Generuj link'; }, 2000);
		}
	};

	const init = () => {
		els = {
			ticketNumber: document.getElementById('ticket-number'),
			shareInput: document.getElementById('share-input'),
			shareBtn: document.getElementById('share-btn'),
			shareLink: document.getElementById('share-link'),
		};

		els.ticketNumber.textContent = window.getTicketNumber();

		els.shareBtn.addEventListener('click', generateShareLink);
		els.shareInput.addEventListener('keydown', e => { if (e.key === 'Enter') generateShareLink(); });
		els.shareInput.addEventListener('input', () => els.shareLink.classList.remove('visible'));
	};

	window.PageRouter.register('home', init);
})();
