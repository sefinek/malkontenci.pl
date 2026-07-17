const music = document.getElementById('bg-music');
const soundBtn = document.getElementById('sound-btn');
const soundIcon = document.getElementById('sound-icon');
const soundLabel = document.getElementById('sound-label');

let soundOn = false;
let suppressed = false;

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
		return;
	}

	soundOn = false;
	music.pause();
	music.muted = true;
	soundIcon.textContent = '🔈';
	soundLabel.textContent = 'Włącz muzykę';
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
document.addEventListener('click', startSound, { once: true });
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
