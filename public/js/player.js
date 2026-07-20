const STORAGE_KEY = 'muzyka';

const music = document.getElementById('bg-music');
const soundBtn = document.getElementById('sound-btn');
const soundIcon = document.getElementById('sound-icon');
const soundLabel = document.getElementById('sound-label');

let soundOn = false;
let suppressed = false;

const getStoredPreference = () => {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
};

const setStoredPreference = value => {
	try {
		localStorage.setItem(STORAGE_KEY, value);
	} catch { /* ... */ }
};

const startSound = () => {
	if (soundOn) return;
	soundOn = true;
	music.muted = false;
	music.play().catch(() => undefined);
	soundIcon.textContent = '🔊';
	soundLabel.textContent = 'Zatrzymaj muzykę';
};

const toggleSound = () => {
	if (!soundOn) {
		startSound();
		setStoredPreference('on');
		return;
	}

	soundOn = false;
	music.pause();
	music.muted = true;
	soundIcon.textContent = '🔈';
	soundLabel.textContent = 'Włącz muzykę';
	setStoredPreference('off');
};

const syncPlayback = () => {
	if (document.hidden || !document.hasFocus()) {
		music.pause();
	} else if (soundOn && !suppressed) {
		music.play().catch(() => undefined);
	}
};

music.volume = 0.75;
soundBtn.addEventListener('click', toggleSound);
if (getStoredPreference() !== 'off') document.addEventListener('click', startSound, { once: true });
document.addEventListener('visibilitychange', syncPlayback);
window.addEventListener('blur', syncPlayback);
window.addEventListener('focus', syncPlayback);

window.musicPlayer = {
	pause: () => {
		suppressed = true;
		music.pause();
	},
	resume: () => {
		suppressed = false;
		syncPlayback();
	},
};
