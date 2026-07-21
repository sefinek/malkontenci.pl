const sharp = require('sharp');
const path = require('path');
const { MAX_SCORE } = require('./archetypes.js');

const FONT_CINZEL = path.join(__dirname, '..', 'assets', 'fonts', 'Cinzel.ttf');
const FONT_WORKSANS = path.join(__dirname, '..', 'assets', 'fonts', 'WorkSans.ttf');

const WIDTH = 1200;
const PAD_X = 100;
const CONTENT_W = WIDTH - PAD_X * 2;
const SIG_W = 340;
const SEAL_SIZE = 220;

const COLORS = {
	pageEdge: '#ffffff',
	paperTop: '#ffffff',
	paperMid: '#ffffff',
	paperBottom: '#ffffff',
	frame: '#9c7b3c',
	divider: '#a5936c',
	ink: '#2b2520',
	kicker: '#8a2f2a',
	meta: '#6b5f4b',
	label: '#7a6e58',
	title: '#2b2520',
	score: '#8a2f2a',
	body: '#3c352a',
	treatLabel: '#8a2f2a',
	treatBody: '#514a3a',
	footer: '#8a7d63',
	seal: '#c22f28',
	pen: '#1f3d99',
	watermark: '#f4f1e9',
};

const REFERRAL_COLORS = {
	paperTop: '#ffffff',
	paperBottom: '#ffffff',
	border: '#5a2320',
	innerBorder: '#8a6a4f',
	kicker: '#7a2420',
	meta: '#6b5a3f',
	label: '#6b5a3f',
	title: '#5a2320',
	subtitle: '#7a4a42',
	body: '#4a3a2a',
	ink: '#3a2a1a',
	footer: '#8a7a5f',
	pen: '#1f3d99',
	watermark: '#f5f0e4',
};

const escapeMarkup = str => String(str)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&apos;');

const renderText = async ({ text, cinzel = false, weight = '', size, color, width, align = 'centre', letterSpacing }) => {
	const fontfile = cinzel ? FONT_CINZEL : FONT_WORKSANS;
	const family = cinzel ? 'Cinzel' : 'Work Sans';
	const span = `<span foreground="${color}"${letterSpacing ? ` letter_spacing="${letterSpacing}"` : ''}>${escapeMarkup(text)}</span>`;
	const { data, info } = await sharp({
		text: {
			text: span,
			font: `${family}${weight ? ` ${weight}` : ''} ${size}`,
			fontfile,
			width,
			rgba: true,
			align,
			dpi: 72,
		},
	}).png().toBuffer({ resolveWithObject: true });
	return { buf: data, w: info.width, h: info.height };
};

const textCache = new Map();

const renderTextCached = opts => {
	const key = JSON.stringify(opts);
	let cached = textCache.get(key);
	if (!cached) {
		cached = renderText(opts);
		cached.catch(() => textCache.delete(key));
		textCache.set(key, cached);
	}
	return cached;
};

const ARC_FONT_SIZE = 17;
const ARC_SPACING = 3;

const arcGlyphs = async ({ text, radius, centerAngle, clockwise, color }) => {
	const c = SEAL_SIZE / 2;
	const glyphs = [];
	for (const ch of text) {
		if (ch === ' ') {
			glyphs.push({ w: ARC_FONT_SIZE * 0.4 });
			continue;
		}
		const glyph = await renderText({ text: ch, weight: 'Bold', size: `${ARC_FONT_SIZE}px`, color, width: 60 });
		glyphs.push({ w: glyph.w, buf: glyph.buf });
	}
	const dir = clockwise ? 1 : -1;
	const totalAngle = glyphs.reduce((sum, glyph) => sum + glyph.w + ARC_SPACING, -ARC_SPACING) / radius;
	let cursor = centerAngle - dir * totalAngle / 2;
	const items = [];
	for (const glyph of glyphs) {
		const step = dir * (glyph.w + ARC_SPACING) / radius;
		const angle = cursor + step / 2;
		cursor += step;
		if (!glyph.buf) continue;
		const deg = angle * 180 / Math.PI + dir * 90;
		const { data, info } = await sharp(glyph.buf)
			.rotate(deg, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
			.png()
			.toBuffer({ resolveWithObject: true });
		items.push({
			input: data,
			top: Math.round(c + radius * Math.sin(angle) - info.height / 2),
			left: Math.round(c + radius * Math.cos(angle) - info.width / 2),
		});
	}
	return items;
};

const makeSeal = async () => {
	const c = SEAL_SIZE / 2;
	const rText = 80;
	const ring = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SEAL_SIZE}" height="${SEAL_SIZE}">
		<circle cx="${c}" cy="${c}" r="${c - 6}" fill="none" stroke="${COLORS.seal}" stroke-width="5"/>
		<circle cx="${c}" cy="${c}" r="${c - 14}" fill="none" stroke="${COLORS.seal}" stroke-width="1.5"/>
		<circle cx="${c}" cy="${c}" r="60" fill="none" stroke="${COLORS.seal}" stroke-width="1.5"/>
		<g fill="${COLORS.seal}">
			<path d="M ${c - rText} ${c - 6} l 5 6 -5 6 -5 -6 z"/>
			<path d="M ${c + rText} ${c - 6} l 5 6 -5 6 -5 -6 z"/>
		</g>
	</svg>`);
	const [center, sub, topArc, bottomArc] = await Promise.all([
		renderText({ text: 'KPA', cinzel: true, weight: 'Bold', size: '46px', color: COLORS.seal, width: 150 }),
		renderText({ text: 'MALKONTENCI.PL', weight: 'Bold', size: '11px', color: COLORS.seal, width: 140 }),
		arcGlyphs({ text: 'KRAJOWA PORADNIA', radius: rText, centerAngle: -Math.PI / 2, clockwise: true, color: COLORS.seal }),
		arcGlyphs({ text: 'ANTYFRUSTRACYJNA', radius: rText, centerAngle: Math.PI / 2, clockwise: false, color: COLORS.seal }),
	]);
	const stamp = await sharp(ring).composite([
		...topArc,
		...bottomArc,
		{ input: center.buf, top: Math.round(c - center.h / 2) - 10, left: Math.round(c - center.w / 2) },
		{ input: sub.buf, top: Math.round(c + center.h / 2) - 4, left: Math.round(c - sub.w / 2) },
	]).png().toBuffer();
	return sharp(stamp).rotate(-12, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
};

let sealPromise = null;

const getSeal = () => {
	if (!sealPromise) {
		sealPromise = makeSeal();
		sealPromise.catch(() => { sealPromise = null; });
	}
	return sealPromise;
};

const SIGNATURE_PATHS = [
	'M 38 10 C 56 2, 72 7, 64 24 C 57 38, 52 50, 47 63 C 42 81, 20 84, 17 70 C 15 60, 26 56, 34 59',
	'M 86 67 C 90 54, 94 42, 96 36 C 100 47, 105 57, 109 65 C 112 53, 115 42, 118 37',
	'M 132 49 C 125 48, 121 56, 126 61 C 130 65, 137 61, 136 53 C 135 49, 133 48, 131 48',
	'M 152 49 C 145 50, 144 56, 150 58 C 156 60, 156 65, 148 65',
	'M 180 49 C 171 45, 163 52, 165 59 C 167 66, 177 65, 180 57 C 182 52, 182 50, 182 49 C 182 55, 181 61, 186 63',
	'M 204 50 C 196 47, 191 53, 193 59 C 195 64, 202 65, 206 61',
	'M 212 50 C 220 45, 229 46, 233 50 C 226 55, 219 60, 216 64 C 226 61, 240 61, 250 62 C 262 63, 270 58, 276 52',
	'M 24 78 C 100 88, 200 86, 276 74',
];

const PATIENT_PATHS = [
	'M 26 42 C 18 43, 17 50, 24 52 C 30 54, 30 60, 21 60',
	'M 38 42 C 36 52, 34 64, 32 74',
	'M 34 46 C 40 40, 48 44, 46 52 C 44 58, 36 58, 34 54',
	'M 56 44 C 55 48, 54 52, 54 56',
	'M 57 36 L 58 37',
	'M 64 50 C 70 48, 72 44, 66 43 C 60 43, 58 52, 62 56 C 66 59, 70 57, 73 54',
	'M 82 43 C 80 48, 79 52, 78 56',
	'M 79 47 C 82 42, 87 41, 90 44',
	'M 104 44 C 96 42, 92 50, 96 55 C 100 59, 106 56, 107 50 C 108 44, 110 34, 112 26 C 110 38, 108 50, 110 56',
	'M 124 45 C 116 44, 114 52, 118 56 C 122 59, 127 55, 128 48 C 128 52, 128 56, 132 56',
	'M 140 28 C 139 38, 138 48, 140 56',
	'M 156 45 C 148 44, 146 52, 150 56 C 154 59, 159 55, 160 48 C 160 52, 160 56, 164 56',
	'M 174 44 C 173 54, 172 64, 168 72 C 165 77, 158 76, 158 70',
	'M 176 36 L 177 37',
];

const rand = (min, max) => min + Math.random() * (max - min);

const jitterPath = (d, amp) => d.replace(/-?\d+(\.\d+)?/g, n => (parseFloat(n) + rand(-amp, amp)).toFixed(1));

const drawScrawl = (paths, amp, x, y, rotation, color) => {
	const body = paths.map(d => `<path d="${jitterPath(d, amp)}"/>`).join('');
	return `<g transform="translate(${(x + rand(-12, 12)).toFixed(1)} ${(y + rand(-5, 3)).toFixed(1)}) rotate(${rotation.toFixed(1)} 150 50)" stroke="${color}" stroke-width="${rand(2.1, 2.8).toFixed(2)}" fill="none" opacity="${rand(0.82, 0.95).toFixed(2)}" stroke-linecap="round">${body}</g>`;
};

const drawSignature = (x, y, color) => drawScrawl(SIGNATURE_PATHS, 4.5, x, y - 74, rand(-9, -2), color);

const drawPatientScrawl = (x, y, color) => drawScrawl(PATIENT_PATHS, 4, x, y - 62, rand(1, 7), color);

const watermarkCache = new Map();

const getWatermark = color => {
	let wm = watermarkCache.get(color);
	if (!wm) {
		wm = (async () => {
			const text = await renderText({ text: 'KPA', cinzel: true, weight: 'Bold', size: '360px', color, width: 1000 });
			const { data, info } = await sharp(text.buf)
				.rotate(-28, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
				.png()
				.toBuffer({ resolveWithObject: true });
			return { buf: data, w: info.width, h: info.height };
		})();
		wm.catch(() => watermarkCache.delete(color));
		watermarkCache.set(color, wm);
	}
	return wm;
};

const makeLayout = (startY = 90) => {
	let y = startY;
	const layout = [];
	const place = (item, gapAfter, align = 'centre') => {
		const left = align === 'left' ? PAD_X : Math.round((WIDTH - item.w) / 2);
		layout.push({ input: item.buf, top: y, left });
		y += item.h + gapAfter;
	};
	const advance = n => { y += n; };
	return { place, advance, items: layout, get y() { return y; } };
};

const placeCorners = (lay, cornerNo, cornerCopy, top, marginX) => {
	lay.items.push(
		{ input: cornerNo.buf, top, left: marginX },
		{ input: cornerCopy.buf, top, left: WIDTH - marginX - cornerCopy.w }
	);
};

const signatureLineSvg = (x, width, y, color) => `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="${color}" stroke-width="1.5"/>`;

const composeWatermark = (watermark, cardH) => ({
	input: watermark.buf,
	top: Math.round((cardH - watermark.h) / 2) - 40,
	left: Math.round((WIDTH - watermark.w) / 2),
});

const JPEG_OPTIONS = { quality: 90, chromaSubsampling: '4:4:4' };

const finalizeDocument = ({ background, lines, watermark, cardH, items, flattenBackground }) => sharp(background).composite([
	composeWatermark(watermark, cardH),
	{ input: lines, top: 0, left: 0 },
	...items,
]).flatten({ background: flattenBackground }).jpeg(JPEG_OPTIONS).toBuffer();

const generateCertificate = async ({ nickname, ticketNumber, score, arch }) => {
	const total = Math.max(0, Math.min(MAX_SCORE, score));
	const nick = nickname || 'Anonimowy Malkontent';
	const now = new Date();
	const today = now.toLocaleDateString('pl-PL');

	const [kicker, meta, dateLine, label, title, score_, diagnosis, treatLabel, treatment, sigPatient, sigDoctor, cornerNo, cornerCopy, finePrint, footer, seal, watermark] = await Promise.all([
		renderTextCached({ text: 'OFICJALNY CERTYFIKAT DIAGNOSTYCZNY', size: '30px', weight: 'Bold', color: COLORS.kicker, width: CONTENT_W, letterSpacing: 2200 }),
		renderText({ text: `Zgłoszenie #${ticketNumber} · Pacjent: ${nick}`, size: '26px', color: COLORS.meta, width: CONTENT_W }),
		renderText({ text: `Wystawiono dnia ${today} · dokument ważny bezterminowo`, size: '24px', color: COLORS.meta, width: CONTENT_W }),
		renderTextCached({ text: 'ZDIAGNOZOWANY TYP', cinzel: true, weight: 'SemiBold', size: '28px', color: COLORS.label, width: CONTENT_W, letterSpacing: 1600 }),
		renderTextCached({ text: arch.title, cinzel: true, weight: 'Bold', size: '68px', color: COLORS.title, width: CONTENT_W }),
		renderTextCached({ text: `Wynik: ${total} / ${MAX_SCORE} pkt frustracji`, weight: 'SemiBold', size: '36px', color: COLORS.score, width: CONTENT_W }),
		renderTextCached({ text: arch.diagnosis, size: '34px', color: COLORS.body, width: CONTENT_W, align: 'left' }),
		renderTextCached({ text: 'ZALECANA TERAPIA', cinzel: true, weight: 'Bold', size: '26px', color: COLORS.treatLabel, width: CONTENT_W, align: 'left', letterSpacing: 1600 }),
		renderTextCached({ text: arch.treatment, size: '32px', color: COLORS.treatBody, width: CONTENT_W, align: 'left' }),
		renderTextCached({ text: 'podpis pacjenta (odmówił)', size: '20px', color: COLORS.meta, width: SIG_W }),
		renderTextCached({ text: 'specjalista ds. frustracji', size: '20px', color: COLORS.meta, width: SIG_W }),
		renderText({ text: `Nr dok.: KPA/CERT/${now.getFullYear()}/${ticketNumber}`, size: '18px', color: COLORS.meta, width: 400 }),
		renderTextCached({ text: 'Egz. 1/1', size: '18px', color: COLORS.meta, width: 200 }),
		renderTextCached({ text: 'Dokument został wygenerowany elektronicznie w systemie KPA, ważny bez podpisu. Diagnoza jest ostateczna i nie podlega reklamacji. Skargi na naszą skrzynke mailową nie będą nawet czytane.', size: '17px', color: COLORS.footer, width: CONTENT_W }),
		renderTextCached({ text: 'malkontenci.pl - Krajowa Poradnia Antyfrustracyjna "KPA"', size: '24px', color: COLORS.footer, width: CONTENT_W }),
		getSeal(),
		getWatermark(COLORS.watermark),
	]);

	const lay = makeLayout();
	lay.place(kicker, 16);
	lay.place(meta, 12);
	lay.place(dateLine, 54);
	lay.place(label, 18);
	lay.place(title, 22);
	lay.place(score_, 64);
	lay.place(diagnosis, 52, 'left');
	const dividerY = lay.y;
	lay.advance(40);
	lay.place(treatLabel, 18, 'left');
	lay.place(treatment, 0, 'left');

	lay.advance(180);
	const sigY = lay.y;
	const sigLeftX = PAD_X;
	const sigRightX = WIDTH - PAD_X - SIG_W;
	lay.items.push(
		{ input: sigPatient.buf, top: sigY + 16, left: Math.round(sigLeftX + (SIG_W - sigPatient.w) / 2) },
		{ input: sigDoctor.buf, top: sigY + 16, left: Math.round(sigRightX + (SIG_W - sigDoctor.w) / 2) },
		{ input: seal, top: sigY - 180, left: sigRightX + 50 }
	);
	placeCorners(lay, cornerNo, cornerCopy, 50, 54);
	lay.advance(16 + sigDoctor.h + 72);
	lay.place(finePrint, 10);
	lay.place(footer, 0);

	const cardH = lay.y + 80;

	const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${cardH}">
		<defs>
			<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="${COLORS.paperTop}"/>
				<stop offset="55%" stop-color="${COLORS.paperMid}"/>
				<stop offset="100%" stop-color="${COLORS.paperBottom}"/>
			</linearGradient>
		</defs>
		<rect width="${WIDTH}" height="${cardH}" fill="${COLORS.pageEdge}"/>
		<rect x="6" y="6" width="${WIDTH - 12}" height="${cardH - 12}" fill="url(#paper)"/>
		<rect x="26" y="26" width="${WIDTH - 52}" height="${cardH - 52}" fill="none" stroke="${COLORS.frame}" stroke-width="3"/>
		<rect x="36" y="36" width="${WIDTH - 72}" height="${cardH - 72}" fill="none" stroke="${COLORS.frame}" stroke-width="1"/>
		<g fill="${COLORS.frame}">
			<rect x="18" y="18" width="16" height="16" transform="rotate(45 26 26)"/>
			<rect x="${WIDTH - 34}" y="18" width="16" height="16" transform="rotate(45 ${WIDTH - 26} 26)"/>
			<rect x="18" y="${cardH - 34}" width="16" height="16" transform="rotate(45 26 ${cardH - 26})"/>
			<rect x="${WIDTH - 34}" y="${cardH - 34}" width="16" height="16" transform="rotate(45 ${WIDTH - 26} ${cardH - 26})"/>
		</g>
	</svg>`);

	const lines = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${cardH}">
		<line x1="${PAD_X}" y1="${dividerY}" x2="${WIDTH - PAD_X}" y2="${dividerY}" stroke="${COLORS.divider}" stroke-width="2" stroke-dasharray="8 8"/>
		${signatureLineSvg(sigLeftX, SIG_W, sigY, COLORS.ink)}
		${signatureLineSvg(sigRightX, SIG_W, sigY, COLORS.ink)}
		${drawSignature(sigRightX + 45, sigY, COLORS.pen)}
		${drawPatientScrawl(sigLeftX + 70, sigY, COLORS.pen)}
	</svg>`);

	return finalizeDocument({ background, lines, watermark, cardH, items: lay.items, flattenBackground: COLORS.pageEdge });
};

const generateReferral = async ({ nickname, ticketNumber }) => {
	const nick = nickname || 'Anonimowy Malkontent';
	const now = new Date();
	const today = now.toLocaleDateString('pl-PL');

	const [kicker, meta, dateLine, label, title, facility, subtitle, details, body, note, sigDoctor, cornerNo, cornerCopy, finePrint, footer, seal, watermark] = await Promise.all([
		renderTextCached({ text: 'OFICJALNE SKIEROWANIE', size: '30px', weight: 'Bold', color: REFERRAL_COLORS.kicker, width: CONTENT_W, letterSpacing: 2200 }),
		renderText({ text: `Zgłoszenie #${ticketNumber} · Pacjent: ${nick}`, size: '26px', color: REFERRAL_COLORS.meta, width: CONTENT_W }),
		renderText({ text: `Wystawiono dnia ${today}`, size: '24px', color: REFERRAL_COLORS.meta, width: CONTENT_W }),
		renderTextCached({ text: 'PLACÓWKA PARTNERSKA', cinzel: true, weight: 'SemiBold', size: '28px', color: REFERRAL_COLORS.label, width: CONTENT_W, letterSpacing: 1600 }),
		renderTextCached({ text: 'Centralna Izba Przyjęć', cinzel: true, weight: 'Bold', size: '68px', color: REFERRAL_COLORS.title, width: CONTENT_W }),
		renderTextCached({ text: 'Samodzielny Publiczny Psychiatryczny ZOZ w Choroszczy', weight: 'SemiBold', size: '32px', color: REFERRAL_COLORS.title, width: CONTENT_W }),
		renderTextCached({ text: 'oddział dla malkontentów', size: '30px', color: REFERRAL_COLORS.subtitle, width: CONTENT_W }),
		renderTextCached({ text: 'Adres: 16-070 Choroszcz · Telefon: 606 997 890 · Czynne całą dobę', size: '26px', color: REFERRAL_COLORS.meta, width: CONTENT_W }),
		renderTextCached({
			text: 'W specjalnych przypadkach wystawiamy skierowanie do placówki partnerskiej w Choroszczy. Nie ma tam jednak takich luksusów, jak niektórym się wydaje. Zanim zaczniesz narzekać na warunki, obejrzyj na YouTube relacje ludzi, którzy już tam byli. Chociaż w twoim przypadku nie ma większego sensu pakować walizki na kilka dni. To raczej podróż w jedną stronę, bez biletu powrotnego i możliwości złożenia reklamacji. Naprawdę gratulujemy bycia takim defektem. To niezwykle rzadki przypadek.',
			size: '32px',
			color: REFERRAL_COLORS.body,
			width: CONTENT_W,
		}),
		renderTextCached({ text: 'ważne bezterminowo · miejsce: 1 (jedno)', weight: 'SemiBold', size: '26px', color: REFERRAL_COLORS.kicker, width: CONTENT_W }),
		renderTextCached({ text: 'lekarz kierujący', size: '20px', color: REFERRAL_COLORS.meta, width: SIG_W }),
		renderText({ text: `Nr dok.: KPA/SKIER/${now.getFullYear()}/${ticketNumber}`, size: '18px', color: REFERRAL_COLORS.meta, width: 400 }),
		renderTextCached({ text: 'Egz. 1/1', size: '18px', color: REFERRAL_COLORS.meta, width: 200 }),
		renderTextCached({ text: 'Niniejszy dokument został wygenerowany elektronicznie w systemie KPA, ważny bez podpisu. Na izbę przyjęć prosimy zabrać dokument tożsamości oraz resztki dobrego humoru.', size: '17px', color: REFERRAL_COLORS.footer, width: CONTENT_W }),
		renderTextCached({ text: 'malkontenci.pl - Krajowa Poradnia Antyfrustracyjna "KPA"', size: '24px', color: REFERRAL_COLORS.footer, width: CONTENT_W }),
		getSeal(),
		getWatermark(REFERRAL_COLORS.watermark),
	]);

	const lay = makeLayout(100);
	lay.place(kicker, 18);
	lay.place(meta, 12);
	lay.place(dateLine, 56);
	lay.place(label, 20);
	lay.place(title, 16);
	lay.place(facility, 14);
	lay.place(subtitle, 18);
	lay.place(details, 50);
	lay.place(body, 50);
	lay.place(note, 0);

	lay.advance(180);
	const sigY = lay.y;
	const sigRightX = WIDTH - PAD_X - SIG_W;
	lay.items.push(
		{ input: sigDoctor.buf, top: sigY + 16, left: Math.round(sigRightX + (SIG_W - sigDoctor.w) / 2) },
		{ input: seal, top: sigY - 180, left: sigRightX + 50 }
	);
	placeCorners(lay, cornerNo, cornerCopy, 48, 56);
	lay.advance(16 + sigDoctor.h + 72);
	lay.place(finePrint, 10);
	lay.place(footer, 0);

	const cardH = lay.y + 90;

	const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${cardH}">
		<defs>
			<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color="${REFERRAL_COLORS.paperTop}"/>
				<stop offset="100%" stop-color="${REFERRAL_COLORS.paperBottom}"/>
			</linearGradient>
		</defs>
		<rect width="${WIDTH}" height="${cardH}" fill="#ffffff"/>
		<rect x="10" y="10" width="${WIDTH - 20}" height="${cardH - 20}" fill="url(#paper)" stroke="${REFERRAL_COLORS.border}" stroke-width="4"/>
		<rect x="28" y="28" width="${WIDTH - 56}" height="${cardH - 56}" fill="none" stroke="${REFERRAL_COLORS.innerBorder}" stroke-width="2" stroke-dasharray="10 8"/>
	</svg>`);

	const lines = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${cardH}">
		${signatureLineSvg(sigRightX, SIG_W, sigY, REFERRAL_COLORS.ink)}
		${drawSignature(sigRightX + 45, sigY, REFERRAL_COLORS.pen)}
	</svg>`);

	return finalizeDocument({ background, lines, watermark, cardH, items: lay.items, flattenBackground: REFERRAL_COLORS.paperTop });
};

module.exports = { generateCertificate, generateReferral };
