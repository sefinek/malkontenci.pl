const { MAX_SCORE } = require('./archetypes.js');

const QUESTIONS = [
	{
		'q': 'Twój internet przestaje działać w środku ważnego spotkania online.',
		'a': [
			{
				't': 'Spokojnie przełączam się na internet w telefonie i wracam do rozmowy.',
				's': 0,
			},
			{
				't': 'Wzdycham, próbuję ponownie się połączyć i czekam na powrót sieci.',
				's': 1,
			},
			{
				't': 'Piszę na czacie, że internet znowu nie działa i że zawsze musi się to zdarzyć w najgorszym momencie.',
				's': 2,
			},
			{
				't': 'Dzwonię do operatora i robię awanturę, wyliczając wszystkie wcześniejsze awarie.',
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
				't': 'Sprawdzam godzinę, kręcę głową i ciężko wzdycham.',
				's': 1,
			},
			{
				't': 'Biorę miotłę i pukam w sufit. Może zrozumie aluzję.',
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
				't': 'Czekam, aż aktualizacja się zakończy. Trudno, zdarza się. To w końcu Windows.',
				's': 0,
			},
			{
				't': 'Przeklinam pod nosem, a potem wracam do pracy.',
				's': 1,
			},
			{
				't': 'Wyłączam aktualizacje na kolejne 7 dni, żeby Windows więcej mnie nie zaskoczył.',
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
				't': 'Natychmiast składam reklamację, narzekam rodzinie i ogłaszam, że tej firmie już nigdy nie można zaufać.',
				's': 3,
			},
		],
	},
	{
		'q': 'Ktoś na forum pisze, że ma problem z BIOS-em w komputerze. Nie interesuje się informatyką i słabo zna się na sprzęcie.',
		'a': [
			{
				't': 'Spokojnie mu pomagam i podaję kilka prostych wskazówek.',
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
				't': 'Sięgam po swoją zapasową paczkę kawy.',
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
		'q': 'Ktoś zajmuje ostatnie wolne miejsce parkingowe tuż przed tobą.',
		'a': [
			{
				't': 'Szukam innego miejsca. Trudno, był pierwszy.',
				's': 0,
			},
			{
				't': 'Wzdycham i jadę szukać miejsca dalej.',
				's': 1,
			},
			{
				't': 'Narzekam pod nosem, że zawsze ktoś musi mnie ubiec.',
				's': 2,
			},
			{
				't': 'Przez resztę dnia opowiadam wszystkim, że ludzie nie mają za grosz kultury.',
				's': 3,
			},
		],
	},
	{
		'q': 'Kolega zmienia coś w projekcie i nagle wszystko przestaje działać.',
		'a': [
			{
				't': 'Naprawiam problem i spokojnie tłumaczę mu, co poszło nie tak.',
				's': 0,
			},
			{
				't': 'Naprawiam problem i wysyłam mu jedną ironiczną emotkę.',
				's': 1,
			},
			{
				't': 'Pytam z ironią: "Sprawdzałeś to w ogóle przed zapisaniem?".',
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
				't': 'Spokojnie proszę o podgrzanie albo wymianę dania.',
				's': 0,
			},
			{
				't': 'Proszę o podgrzanie i mówię, że danie powinno być ciepłe.',
				's': 1,
			},
			{
				't': 'Wypytuję kelnera, jak długo danie stało, zanim trafiło na mój stolik.',
				's': 2,
			},
			{
				't': 'Robię awanturę, żądam rozmowy z kierownikiem i piszę szczegółową recenzję na kilku portalach.',
				's': 3,
			},
		],
	},
	{
		'q': 'Reklamy przed filmem na YouTube trwają dłużej niż sam film.',
		'a': [
			{
				't': 'Czekam spokojnie. To tylko chwila.',
				's': 0,
			},
			{
				't': 'Klikam "Pomiń" od razu, gdy tylko pojawia się taka możliwość.',
				's': 1,
			},
			{
				't': 'Wzdycham i po raz setny rozważam wykupienie Premium.',
				's': 2,
			},
			{
				't': 'Wyłączam film i zaczynam narzekać, że YouTube stał się jedną wielką reklamą.',
				's': 3,
			},
		],
	},
	{
		'q': 'Ktoś wysyła zrzut ekranu z tekstem, zamiast wkleić sam tekst.',
		'a': [
			{
				't': 'Odczytuję ze zrzutu to, czego potrzebuję, i nie zwracam na to uwagi.',
				's': 0,
			},
			{
				't': 'Ręcznie przepisuję potrzebny fragment i lekko się irytuję.',
				's': 1,
			},
			{
				't': 'Proszę, żeby następnym razem wkleił tekst zamiast zdjęcia.',
				's': 2,
			},
			{
				't': 'Wysyłam mu zrzut ekranu jego wiadomości i pytam, czy teraz rozumie problem.',
				's': 3,
			},
		],
	},
	{
		'q': 'Rachunek za prąd znowu jest wyższy niż wcześniej.',
		'a': [
			{
				't': 'Płacę rachunek i nie robię z tego problemu.',
				's': 0,
			},
			{
				't': 'Sprawdzam taryfę i porównuję rachunek z poprzednim.',
				's': 1,
			},
			{
				't': 'Analizuję zużycie każdego urządzenia i szukam winowajcy.',
				's': 2,
			},
			{
				't': 'Składam reklamację, robię własne dochodzenie i zaczynam podejrzewać, że sąsiad podpiął się do mojego prądu.',
				's': 3,
			},
		],
	},
	{
		'q': 'Podczas spotkania na Zoomie ktoś zapomina wyciszyć mikrofon.',
		'a': [
			{
				't': 'Czekam chwilę, aż sam to zauważy.',
				's': 0,
			},
			{
				't': 'Piszę na czacie, że ma włączony mikrofon.',
				's': 1,
			},
			{
				't': 'Wzdycham i pytam, czy tak trudno pamiętać o wyciszeniu mikrofonu.',
				's': 2,
			},
			{
				't': 'Proponuję przygotowanie obowiązkowej instrukcji obsługi Zooma dla całego zespołu.',
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
				't': 'Pukam w szybę z nadzieją, że ktoś jeszcze mnie wpuści.',
				's': 1,
			},
			{
				't': 'Sprawdzam godziny otwarcia i narzekam, że zabrakło mi tylko dwóch minut.',
				's': 2,
			},
			{
				't': 'Oburzam się, że nie mogli poczekać chwili dłużej, i opowiadam wszystkim o fatalnym podejściu do klienta.',
				's': 3,
			},
		],
	},
	{
		'q': 'Chatbot AI odpowiada z pełnym przekonaniem, ale zupełnie nie na temat.',
		'a': [
			{
				't': 'Formułuję pytanie inaczej i spokojnie wyjaśniam, o co mi chodzi.',
				's': 0,
			},
			{
				't': 'Wzdycham i próbuję jeszcze raz, tym razem bardziej precyzyjnie.',
				's': 1,
			},
			{
				't': 'Irytuję się i piszę, że znowu nie zrozumiał prostego pytania.',
				's': 2,
			},
			{
				't': 'Wyzywam go od przygłupów, kończę konwersacje i idę po zimnego browara.',
				's': 3,
			},
		],
	},
	{
		'q': 'Ktoś pisze: "Wysłałem maila, sprawdź spam".',
		'a': [
			{
				't': 'Sprawdzam folder ze spamem. Faktycznie tam był.',
				's': 0,
			},
			{
				't': 'Sprawdzam spam i lekko się irytuję.',
				's': 1,
			},
			{
				't': 'Narzekam, że ważne wiadomości zawsze trafiają nie tam, gdzie powinny.',
				's': 2,
			},
			{
				't': 'Zgłaszam sprawę do działu IT i żądam wyjaśnienia, dlaczego poczta znowu nie działa jak należy.',
				's': 3,
			},
		],
	},
	{
		'q': 'Wi-Fi w kawiarni wymaga podania numeru telefonu i zaakceptowania regulaminu.',
		'a': [
			{
				't': 'Rejestruję się i korzystam z internetu.',
				's': 0,
			},
			{
				't': 'Wypełniam formularz, lekko przy tym wzdychając.',
				's': 1,
			},
			{
				't': 'Narzekam, że nawet do zwykłego Wi-Fi trzeba podawać swoje dane.',
				's': 2,
			},
			{
				't': 'Włączam własny internet i głośno komentuję, że kawiarnia pewnie chce sprzedać mój numer reklamodawcom.',
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
				't': 'Obserwuję kolejkę i zastanawiam się, ile osób weszło po znajomości.',
				's': 2,
			},
			{
				't': 'Na miejscu piszę skargę do kierownika i głośno komentuję, że w tym urzędzie nic nigdy nie działa.',
				's': 3,
			},
		],
	},
	{
		'q': 'Dyskusja na czacie trwa już czwartą godzinę, a ktoś wciąż pisze: "Odwracasz kota ogonem".',
		'a': [
			{
				't': 'Wychodzę z rozmowy. Każda dyskusja ma swoje granice.',
				's': 0,
			},
			{
				't': 'Czytam kolejne wiadomości z lekkim rozbawieniem.',
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
