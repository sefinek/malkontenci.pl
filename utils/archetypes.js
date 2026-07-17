const MAX_SCORE = 100;

const ARCHETYPES = [
	{
		min: 0,
		max: 24,
		title: 'Podejrzany przypadek',
		diagnosis: 'Wyniki wskazują na niepokojąco niski poziom frustracji. Albo naprawdę osiągnąłeś spokój wewnętrzny, albo wypełniałeś test w półśnie. Nie denerwują cię kolejki, aktualizacje systemu ani ludzie, którzy zatrzymują się nagle na środku chodnika. Nasza komisja zaleca dalszą obserwację. Tak głęboki spokój budzi w nas większy niepokój niż złość. Możliwe też, że po prostu niczego jeszcze dzisiaj nie czytałeś w internecie.',
		treatment: 'Na ten moment nie musisz nic robić. Zalecamy jedynie regularny kontakt z rzeczywistością. Wróć za pół roku, kiedy dowolna aplikacja odmówi współpracy, kurier spóźni się trzy godziny, albo gdy od kogoś otrzymasz wiadomość "u mnie działa". Będziemy na ciebie czekać.',
		media: '/video/J---aiyznGQ.webm',
	},
	{
		min: 25,
		max: 48,
		title: 'Malkontent Okazjonalny',
		diagnosis: 'Irytujesz się we właściwych momentach i w rozsądnych dawkach. To zdrowy, kontrolowany malkontentyzm. Potrafisz zauważyć, że coś nie działa, skomentować to jednym westchnieniem i wrócić do swoich zajęć. Reagujesz, ale nie opisujesz całej sytuacji na trzech grupach na Facebooku, nie piszesz reklamacji na cztery strony i nie próbujesz przekonać wszystkich, że świat właśnie się kończy. Nadal dopuszczasz możliwość, że ktoś inny może mieć rację. Tak trzymaj!',
		treatment: 'Herbatka lub kawa z rana, zależnie od preferencji. W trudniejszych przypadkach dopuszcza się dodatkowe westchnienie i krótkie spojrzenie w dal. Powinno wystarczyć.',
		media: '/video/Cqd1Gvq-RBY.webm',
	},
	{
		min: 49,
		max: 70,
		title: 'Malkontent Etatowy',
		diagnosis: 'Frustracja stała się dla ciebie codziennością operacyjną. Masz przygotowane riposty, wzdychasz z wyczuciem rytmu, a każda kolejka w sklepie staje się materiałem na późniejszą anegdotę. Przesłanie na dziś: "Don\'t worry, be happy".',
		treatment: 'Po przebudzeniu daj sobie 5-10 minut na przemyślenie swojej egzystencji, życia i planów na przyszłość. Następnie spokojnie wypij kawę. Stopniowo ograniczaj korzystanie z internetu, szczególnie z Wykopu i Reddita.',
		media: '/video/AWnXww7y5r4.mp4',
	},
	{
		min: 71,
		max: 85,
		title: 'Malkontent Zawodowy',
		pet: true,
		diagnosis: 'Narzekanie przestało być u ciebie reakcją. Stało się systemem operacyjnym. Potrafisz znaleźć wadę w rozwiązaniu problemu, którego wcześniej sam nie zauważyłeś. Twoje reklamacje mają wstęp, rozwinięcie, załączniki i groźbę przekazania sprawy wyżej. Bliscy przestali pytać cię o zdanie, bo nadal pamiętają poprzednią odpowiedź.',
		treatment: 'Odetnij się od internetu, wyjdź na zewnątrz i przez 3 godziny nie informuj nikogo, co robi źle. Gdy poczujesz potrzebę pouczenia kogokolwiek lub wygłoszenia kolejnego wysrywu, połóż się na podłodze i poczekaj, aż ci przejdzie. Jeżeli ktoś zapyta: "Co pan wyprawia?", odpowiedz: "To moja pokuta".',
		media: '/video/wwM3cUJKkuE.webm',
	},
	{
		min: 86,
		max: 100,
		title: 'Malkontent Podludź',
		pet: true,
		diagnosis: 'Przekroczyłeś granicę zwykłego malkontenctwa. Nie oceniasz już rzeczywistości - prowadzisz przeciwko niej osobistą kampanię. Nawet gdy wszystko działa, podejrzewasz, że to tylko chwilowe. Potrafisz zepsuć atmosferę samym westchnieniem, a zdanie "ja tylko mówię, jak jest" służy ci jako immunitet dyplomatyczny. Chętnie wcielasz się też w rolę mentora: bez pytania wyjaśniasz innym, jak mają żyć, pracować i myśleć. Każda odmowa zastosowania się do twoich rad jest dla ciebie kolejnym dowodem na upadek społeczeństwa. Na szczęście to tylko twoje urojenia.',
		treatment: 'Wyrzuć telefon oraz komputer przez okno i zakurw baranka gdzielkolwiek. Przez dobę nie kontaktuj się z internetem ani ludźmi posiadającymi własne zdanie. Niestety na tym etapie nasze metody przestają działać. Takie przypadki kierujemy bezpośrednio do placówki partnerskiej w Choroszczy.',
		referral: true,
		media: '/video/OaFk8XkgZik.webm',
	},
];

const getArchetype = total => ARCHETYPES.find(a => total >= a.min && total <= a.max) || ARCHETYPES[ARCHETYPES.length - 1];

module.exports = { MAX_SCORE, getArchetype };
