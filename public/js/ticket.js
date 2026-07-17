window.getTicketNumber = () => {
	const createTicketNumber = () => String(Math.floor(1000 + Math.random() * 9000));

	try {
		let ticket = localStorage.getItem('ticket');
		if (!ticket) {
			ticket = createTicketNumber();
			localStorage.setItem('ticket', ticket);
		}
		return ticket;
	} catch {
		return createTicketNumber();
	}
};
