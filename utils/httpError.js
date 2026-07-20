const API_MESSAGES = {
	400: 'Nieprawidłowe dane żądania.',
	404: 'Nie znaleziono zasobu.',
	429: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.',
	500: 'Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie za chwilę.',
};

const PAGE_MESSAGES = {
	...API_MESSAGES,
	404: 'Nie znaleziono strony. Wróć na stronę główną.',
	503: 'Serwer jest chwilowo niedostępny. Spróbuj ponownie za chwilę.',
};

const ApiError = (res, status, err, msg) => {
	if (err) console.error(err);

	res.status(status).json({ success: false, status, message: msg || API_MESSAGES[status] || 'Wystąpił nieznany błąd. Zgłoś go proszę na contact@sefinek.net' });
};

const RenderError = (res, status, err) => {
	if (err) console.error(err);

	res.status(status).render('error.ejs', {
		status,
		message: PAGE_MESSAGES[status] || 'Wystąpił błąd.',
	});
};

module.exports = { ApiError, RenderError };
