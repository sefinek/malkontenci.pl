const { MAX_SCORE } = require('./archetypes.js');

const QUESTIONS = [
	{
		'q': 'Ktoś zajeżdża ci drogę bez kierunkowskazu.',
		'a': [
			{
				't': 'Zwalniam i jadę dalej. Szkoda nerwów.',
				's': 0,
			},
			{
				't': 'Trąbię krótko i przez chwilę jestem wkurzony.',
				's': 1,
			},
			{
				't': 'Komentuję pod nosem, że gościu chyba prawo jazdy w chipsach wygrał.',
				's': 2,
			},
			{
				't': 'Przez resztę trasy wyłapuję każdy błąd innych kierowców i narzekam, że dziś nikt nie potrafi jeździć.',
				's': 3,
			},
		],
	},
	{
		'q': 'Sąsiad wierci w ścianie o 6:00 rano w niedzielę.',
		'a': [
			{
				't': 'Zasłaniam uszy i próbuję dalej spać. Taki jest urok mieszkania w bloku.',
				's': 0,
			},
			{
				't': 'Sprawdzam godzinę, kręcę głową, idę spać dalej.',
				's': 1,
			},
			{
				't': 'Wale kijem od miotły w sufit przeklinając przy tym. Jeśli nie pomaga, dobijam się do niego pod drzwiami.',
				's': 2,
			},
			{
				't': 'Piszę obszerną skargę do wspólnoty, cytuję regulamin i opisuję, jak przez takich ludzi nie da się normalnie mieszkać.',
				's': 3,
			},
		],
	},
	{
		'q': 'Windows zaczyna się aktualizować i uruchamia ponownie w trakcie pracy.',
		'a': [
			{
				't': 'Czekam, aż aktualizacja się zakończy. Trudno, przecież to w końcu Windows.',
				's': 0,
			},
			{
				't': 'Wyłączam aktualizacje na kolejne 7 dni, żeby Windows więcej mnie nie zaskoczył.',
				's': 1,
			},
			{
				't': 'Przeklinam pod nosem i liczę, że wszystko się zapisało.',
				's': 2,
			},
			{
				't': 'Ogłaszam, że Windows to najgorszy system na świecie, i po raz dwudziesty rozważam przejście na Linuksa.',
				's': 3,
			},
		],
	},
	{
		'q': 'Aplikacja firmy kurierskiej pokazuje status "dostarczono", ale paczki nigdzie nie ma.',
		'a': [
			{
				't': 'Czekam jeszcze chwilę. Pewnie zaraz się znajdzie.',
				's': 0,
			},
			{
				't': 'Sprawdzam skrzynkę, okolice drzwi i pytam sąsiadów.',
				's': 1,
			},
			{
				't': 'Składam reklamację i dokładnie opisuję, jak bardzo ta sytuacja mnie zirytowała.',
				's': 2,
			},
			{
				't': 'Natychmiast składam reklamację. Po jej złożeniu piszę swoje żale na Wykopie.',
				's': 3,
			},
		],
	},
	{
		'q': 'Ktoś na forum pisze, że ma problem z BIOS-em w komputerze. Ta osoba nie interesuje się informatyką, dość słabo zna się na sprzęcie.',
		'a': [
			{
				't': 'Spokojnie mu pomagam i podaję kilka prostych wskazówek. Ostrzegam, czego lepiej nie zmieniać.',
				's': 0,
			},
			{
				't': 'Zwracam uwagę na jego błędy, ale próbuję naprowadzić go na właściwe rozwiązanie.',
				's': 1,
			},
			{
				't': 'Odpowiadam, że powinien najpierw nauczyć się podstaw, zanim zacznie grzebać w BIOS-ie.',
				's': 2,
			},
			{
				't': 'Piszę protekcjonalnie: "Nie bierz się za coś, czego nie potrafisz. Najpierw naucz się obsługiwać UEFI".',
				's': 3,
			},
		],
	},
	{
		'q': 'Kawa w biurowej kuchni właśnie się skończyła.',
		'a': [
			{
				't': 'Piję wodę. Nic wielkiego się nie stało.',
				's': 0,
			},
			{
				't': 'Sięgam po swoją zapasową.',
				's': 1,
			},
			{
				't': 'Zostawiam przy ekspresie pasywno-agresywną karteczkę o uzupełnianiu zapasów.',
				's': 2,
			},
			{
				't': 'Rozpoczynam prywatne śledztwo, żeby ustalić, kto wypija najwięcej kawy i nigdy jej nie kupuje.',
				's': 3,
			},
		],
	},
	{
		'q': 'Twój ulubiony film znika z Netflixa.',
		'a': [
			{
				't': 'Trudno, obejrzę coś innego.',
				's': 0,
			},
			{
				't': 'Sprawdzam, czy film jest dostępny na innej platformie.',
				's': 1,
			},
			{
				't': 'Piszę do znajomego i kilka razy narzekam, że z Netflixa ciągle znika coś dobrego.',
				's': 2,
			},
			{
				't': 'Rozważam rezygnację z subskrypcji i piszę do Netflixa, że ich oferta jest coraz gorsza.',
				's': 3,
			},
		],
	},
	{
		'q': 'Czekasz z kierunkowskazem na zwalniające się miejsce parkingowe, ale ktoś wjeżdża w nie od drugiej strony.',
		'a': [
			{
				't': 'Odjeżdżam i szukam innego miejsca. Nie będę się kłócić o parking.',
				's': 0,
			},
			{
				't': 'Pokazuję kierowcy, że czekałem. Jeśli nie reaguje - odpuszczam.',
				's': 1,
			},
			{
				't': 'Wysiadam i mówię mu, co o tym myślę, używając przy tym wulgarnych słów.',
				's': 2,
			},
			{
				't': 'Szukam innego miejsca. Długo opowiadam każdemu, jak ktoś bezczelnie ukradł mi miejsce.',
				's': 3,
			},
		],
	},
	{
		'q': 'Kolega zmienia coś w projekcie i nagle wszystko przestaje działać.',
		'a': [
			{
				't': 'Naprawiamy problem i sprawdzamy, co poszło nie tak.',
				's': 0,
			},
			{
				't': 'Piszę mu, że po jego zmianie coś się wysypało, i proszę, żeby na to spojrzał.',
				's': 1,
			},
			{
				't': 'Zadaje pytanie: "Testowałeś ten AI-slop w ogóle? Nie marnuj mojego czasu nieudaczniku.".',
				's': 2,
			},
			{
				't': 'Robię z tego wielką aferę i przez kilka dni wypominam mu ten błąd.',
				's': 3,
			},
		],
	},
	{
		'q': 'W restauracji przynoszą ci zimne danie.',
		'a': [
			{
				't': 'Spokojnie proszę o podgrzanie albo wymianę.',
				's': 0,
			},
			{
				't': 'Proszę o wymianę i komentuję, że danie powinno być ciepłe.',
				's': 1,
			},
			{
				't': 'Pytam, jak długo danie stało, zanim trafiło na mój stolik.',
				's': 2,
			},
			{
				't': 'Robię awanturę, żądam rozmowy z kierownikiem i piszę szczegółową recenzję na kilku portalach.',
				's': 3,
			},
		],
	},
	{
		'q': 'Czekasz u lekarza już 40 minut. Wizyta wciąż się nie zaczyna.',
		'a': [
			{
				't': 'Pytam się kto jest ostatni, spokojnie czekam na swoją kolej.',
				's': 0,
			},
			{
				't': 'Czekam, coraz częściej zerkając na zegarek.',
				's': 1,
			},
			{
				't': 'Rozpoczynam dyskusje z innymi pacjentami, że tutaj zawsze tak jest.',
				's': 2,
			},
			{
				't': 'Głośno mówię, że lekarze kompletnie nie szanują czasu pacjentów.',
				's': 3,
			},
		],
	},
	{
		'q': 'W markecie czynna jest tylko jedna kasa, a kolejka sięga do drzwi.',
		'a': [
			{
				't': 'Staję w kolejce i pytam, czy można otworzyć drugą kasę.',
				's': 0,
			},
			{
				't': 'Wzdycham i przeglądam telefon, czekając na swoją kolej.',
				's': 1,
			},
			{
				't': 'Komentuję na głos, że przy kasie siedzi jedna osoba, a reszta pracowników chyba urządziła sobie sjestę na magazynie.',
				's': 2,
			},
			{
				't': 'Wdaje się w agresywną dyskusję z kasjerką, która po chwili odpowiada mi po ukraińsku. Nic z tego nie rozumiem, zirytowany zostawiam zakupy i wściekły wychodzę ze sklepu.',
				's': 3,
			},
		],
	},
	{
		'q': 'Rachunek za prąd znowu jest wyższy niż wcześniej.',
		'a': [
			{
				't': 'Porównuję rachunki i sprawdzam, skąd wynika różnica.',
				's': 0,
			},
			{
				't': 'Sprawdzam, które urządzenia zużywają najwięcej prądu.',
				's': 1,
			},
			{
				't': 'Narzekam domownikom, że nikt poza mną nie przejmuje się rachunkami.',
				's': 2,
			},
			{
				't': 'Przez następny tydzień wypominam każde zapalone światło i każdy nieużywany sprzęt zostawiony w kontakcie.',
				's': 3,
			},
		],
	},
	{
		'q': 'Na rodzinnym obiedzie ktoś znowu pyta, kiedy w końcu się ustatkujesz.',
		'a': [
			{
				't': 'Mówię, że nie chcę o tym rozmawiać, i zmieniam temat.',
				's': 0,
			},
			{
				't': 'Odpowiadam żartem, chociaż zaczyna mnie to irytować.',
				's': 1,
			},
			{
				't': 'Mówię poirytowanym tonem, że to nie jest niczyja sprawa.',
				's': 2,
			},
			{
				't': 'Robię z tego scenę i przypominam przy całym stole wszystkie poprzednie pytania tego typu.',
				's': 3,
			},
		],
	},
	{
		'q': 'Docierasz do sklepu dwie minuty po jego zamknięciu.',
		'a': [
			{
				't': 'Trudno, wrócę jutro.',
				's': 0,
			},
			{
				't': 'Pukam raz i pytam, czy da się jeszcze szybko coś kupić. Jeśli nie, odchodzę.',
				's': 1,
			},
			{
				't': 'Stoję pod drzwiami i narzekam, że zabrakło mi dosłownie dwóch minut.',
				's': 2,
			},
			{
				't': 'Opowiadam wszystkim, że obsługa widziała mnie pod drzwiami i nawet nie chciała podejść.',
				's': 3,
			},
		],
	},
	{
		'q': 'Chatbot AI odpowiada z pełnym przekonaniem, ale zupełnie nie na temat.',
		'a': [
			{
				't': 'Formułuję pytanie inaczej i próbuję ponownie.',
				's': 0,
			},
			{
				't': 'Piszę: "Nie o to pytałem", i doprecyzowuję polecenie.',
				's': 1,
			},
			{
				't': 'Zaczynam mu tłumaczyć, dlaczego jego odpowiedź nie ma żadnego sensu.',
				's': 2,
			},
			{
				't': 'Robię zrzut ekranu i wysyłam go znajomym jako kolejny dowód, że AI jest kompletnie bezużyteczne.',
				's': 3,
			},
		],
	},
	{
		'q': 'Masz już wyłożone zakupy na taśmie w Biedronce, ale kasjerka prosi, żebyś je zabrał i przeszedł do innej kasy, ponieważ musi iść do toalety. Gdy odpowiadasz: "Mogę poczekać", słyszysz, że nie ma takiej możliwości.',
		'a': [
			{
				't': 'Wkładam produkty z powrotem do koszyka i przechodzę do innej kasy.',
				's': 0,
			},
			{
				't': 'Mówię: "Ale przecież może pani zaciągnąć sznurek przy kasie, żeby nikt nie przeszedł i zaraz tutaj wrócić".',
				's': 1,
			},
			{
				't': 'Komentuję, że większość pracowników opierdziela się na magazynie, a robić to nie ma komu. 2 kasy otwarte, a powinny być 3!',
				's': 2,
			},
			{
				't': 'Odmawiam zabrania produktów, wdaję się w kłótnię i żądam rozmowy z kierownikiem, ponieważ nie będę drugi raz stać w kolejce.',
				's': 3,
			},
		],
	},
	{
		'q': 'Ktoś zajmuje sprzęt na siłowni i zamiast ćwiczyć, od dłuższej chwili scrolluje telefon.',
		'a': [
			{
				't': 'Pytam, czy możemy ćwiczyć na zmianę.',
				's': 0,
			},
			{
				't': 'Robię inne ćwiczenie i wracam za kilka minut.',
				's': 1,
			},
			{
				't': 'Pytam: "Ty w ogóle ćwiczysz czy tylko udajesz, że ćwiczysz?".',
				's': 2,
			},
			{
				't': 'Zaczynam głośno komentować, że niektórzy przychodzą na siłownię tylko po to, żeby zajmować sprzęt.',
				's': 3,
			},
		],
	},
	{
		'q': 'Kolejka w urzędzie od dłuższego czasu się nie rusza.',
		'a': [
			{
				't': 'Czekam spokojnie, przeglądając telefon.',
				's': 0,
			},
			{
				't': 'Patrzę na swój numerek i wzdycham co kilka minut.',
				's': 1,
			},
			{
				't': 'Liczę z osobami, ile okienek jest pustych, i komentujemy tempo obsługi.',
				's': 2,
			},
			{
				't': 'Składam skargę, a po wyjściu jeszcze długo opowiadam, że w tym urzędzie nic nigdy nie działa.',
				's': 3,
			},
		],
	},
	{
		'q': 'Dyskusja na czacie trwa już czwartą godzinę, a ktoś wciąż pisze: "Odwracasz kota ogonem".',
		'a': [
			{
				't': 'Wychodzę z rozmowy. Dalej już nic z tego nie będzie.',
				's': 0,
			},
			{
				't': 'Piszę ostatnią odpowiedź i wyciszam czat.',
				's': 1,
			},
			{
				't': 'Przygotowuję długi kontrargument w punktach.',
				's': 2,
			},
			{
				't': 'Piszę, że kończę dyskusję, po czym po dziesięciu minutach wracam i kłócę się dalej.',
				's': 3,
			},
		],
	},
];

const PET_QUESTION = {
	'q': 'Czy posiadasz w domu zwierzę?',
	'a': [
		{
			't': 'Tak, posiadam i jestem z tego dumny',
			'ack': 'My też jesteśmy z tego dumni! Zwierzę w domu to wierny przyjaciel, źródło radości i dodatkowa warstwa sierści na wszystkich ubraniach. Prawdopodobnie jest to jedyna istota, która nadal dobrowolnie przebywa z tobą w jednym pomieszczeniu. Dbaj o nią, ponieważ może być ostatnim jasnym punktem w twoim marnym życiu.',
		},
		{
			't': 'Nie, nie posiadam. Jestem samotnikiem',
			'ack': 'Rozumiemy, że musi to być bardzo frustrujące. Wracasz do mieszkania po robocie, a tam nikogo nie ma. Z drugiej strony żadne zwierzę nie musi słuchać twojego narzekania, więc przynajmniej jedna niewinna istota została oszczędzona.',
		},
		{
			't': 'Posiadam tylko zepsutego kota',
			'branch': {
				'text': 'Przykro nam. Wstępna diagnoza wskazuje na poważną usterkę kota. Urządzenie może nie reagować na swoje imię, bez powodu patrzeć w ścianę, uruchamiać się o trzeciej nad ranem albo odmawiać współpracy pomimo pełnej miski. Spróbuj ponownego uruchomienia, aktualizacji oprogramowania lub potrząśnięcia opakowaniem z karmą. Jeżeli problem nadal występuje, skorzystaj z poradnika naprawczego autorstwa WVW Productions. Czy chcesz do niego przejść?',
				'phone': 'Linia wsparcia technicznego: 0118 999 881 999 119 7253',
				'video': '/video/lU5a3THsSgc.webm',
				'noAck': 'W takim razie przepraszamy za niedogodności.',
			},
		},
	],
};

const RAW_MAX_SCORE = QUESTIONS.length * 3;
const PUBLIC_QUESTIONS = QUESTIONS.map(q => ({ q: q.q, a: q.a.map(({ t }) => ({ t })) }));

const computeScore = answers => {
	if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) return null;

	let raw = 0;
	for (let i = 0; i < QUESTIONS.length; i++) {
		const idx = answers[i];
		const options = QUESTIONS[i].a;
		if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) return null;
		raw += options[idx].s;
	}

	return Math.max(0, Math.min(MAX_SCORE, Math.round((raw * MAX_SCORE) / RAW_MAX_SCORE)));
};

module.exports = { PET_QUESTION, PUBLIC_QUESTIONS, computeScore };
