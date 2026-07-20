(() => {
	const formatNumber = n => n.toLocaleString('pl-PL');

	const renderDailyChart = (block, chart, byDay) => {
		chart.innerHTML = '';

		if (!byDay.some(d => d.count > 0)) {
			block.classList.add('hidden');
			return;
		}

		block.classList.remove('hidden');
		const max = Math.max(1, ...byDay.map(d => d.count));
		const fragment = document.createDocumentFragment();

		byDay.forEach((day, i) => {
			const bar = document.createElement('div');
			bar.className = 'stats-bar';
			bar.title = `${day.date}: ${day.count} diagnoz`;

			const track = document.createElement('div');
			track.className = 'stats-bar-track';

			const fill = document.createElement('div');
			fill.className = 'stats-bar-fill';
			fill.style.height = `${Math.max(2, Math.round((day.count / max) * 100))}%`;
			track.appendChild(fill);
			bar.appendChild(track);

			const label = document.createElement('div');
			label.className = 'stats-bar-label';
			if (i % 5 === 0 || i === byDay.length - 1) {
				const [, month, dayOfMonth] = day.date.split('-');
				label.textContent = `${dayOfMonth}.${month}`;
			}
			bar.appendChild(label);

			fragment.appendChild(bar);
		});

		chart.appendChild(fragment);
	};

	const renderArchetypes = (list, byArchetype) => {
		list.innerHTML = '';
		const fragment = document.createDocumentFragment();

		byArchetype.forEach(item => {
			const row = document.createElement('div');
			row.className = 'archetype-row';

			const title = document.createElement('div');
			title.className = 'archetype-title';
			title.textContent = item.title;

			const track = document.createElement('div');
			track.className = 'archetype-track';
			const fill = document.createElement('div');
			fill.className = 'archetype-fill';
			fill.style.width = `${item.percent}%`;
			track.appendChild(fill);

			const meta = document.createElement('div');
			meta.className = 'archetype-meta';
			meta.textContent = `${formatNumber(item.count)} (${item.percent}%)`;

			row.appendChild(title);
			row.appendChild(track);
			row.appendChild(meta);
			fragment.appendChild(row);
		});

		list.appendChild(fragment);
	};

	const showError = els => els.forEach(el => { el.textContent = 'błąd'; });

	const init = async () => {
		const els = {
			total: document.getElementById('stat-total'),
			today: document.getElementById('stat-today'),
			avg: document.getElementById('stat-avg'),
			record: document.getElementById('stat-record'),
			chartBlock: document.getElementById('daily-chart-block'),
			chart: document.getElementById('stats-chart'),
			archetypeList: document.getElementById('archetype-list'),
		};

		try {
			const res = await fetch('/api/v1/stats');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();

			els.total.textContent = formatNumber(data.total);
			els.today.textContent = formatNumber(data.today.count);
			els.avg.textContent = data.averageScore ?? '–';
			els.record.textContent = data.today.minScore === null ? '–' : `${data.today.minScore}-${data.today.maxScore}`;

			renderDailyChart(els.chartBlock, els.chart, data.byDay);
			renderArchetypes(els.archetypeList, data.byArchetype);
		} catch {
			showError([els.total, els.today, els.avg, els.record]);
		}
	};

	window.PageRouter.register('stats', init);
})();
