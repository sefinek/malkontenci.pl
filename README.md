# malkontenci.pl
Humorystyczny test „Czy jesteś malkontentem?” stylizowany na diagnozę Krajowej Poradni Antyfrustracyjnej. Po ukończeniu testu serwis oblicza wynik, przypisuje archetyp malkontenta i generuje memiczny certyfikat w JPG.

Strona produkcyjna: [malkontenci.pl](https://malkontenci.pl)

## Funkcje
- losowa kolejność pytań i zapisywanie postępu w bieżącej sesji;
- wynik w skali 0-100 oraz jeden z pięciu archetypów;
- generowanie certyfikatów i skierowań po stronie serwera;
- lokalna historia certyfikatów w przeglądarce;
- udostępnianie testu wskazanej osobie przez parametr `?dla=`;
- responsywny interfejs, muzyka tła i materiały dopasowane do wyniku;
- polityka prywatności, creditsy i manifest aplikacji webowej.

## Technologie
- Node.js i Express 5;
- EJS;
- Sharp do generowania grafik;
- Redis oraz `express-session`;
- JavaScript i CSS bez frameworka frontendowego.

## Uruchomienie lokalne
Wymagane są Node.js 22 lub nowszy oraz działający serwer Redis.

```bash
git clone https://github.com/sefinek/malkontenci.pl.git
cd malkontenci.pl
npm i
```

Utwórz plik `.env` w katalogu projektu na podstawie templatki `.env.default`.

Następnie uruchom aplikację:
```bash
node index.js
```

Serwis domyślnie wystartuje pod adresem http://127.0.0.1:8080.

## Struktura projektu
```text
assets/       fonty używane podczas generowania certyfikatów
middlewares/ middleware Expressa
public/       statyczne CSS, JavaScript, obrazy, dźwięki i filmy
routes/       trasy stron oraz API
services/     połączenie z Redisem i usługi pomocnicze
utils/        pytania, punktacja i generator certyfikatów
views/        szablony EJS
```

## Prywatność
Certyfikaty, pseudonim i postęp testu są zapisywane przede wszystkim w przeglądarce użytkownika. Serwer wykorzystuje krótkotrwałą sesję Redis do zabezpieczenia generowania dokumentów. Szczegóły znajdują się w [polityce prywatności](https://malkontenci.pl/polityka-prywatnosci).

## Licencja i materiały zewnętrzne
Kod projektu jest udostępniany na licencji [MIT](LICENSE). Licencja repozytorium nie obejmuje automatycznie wykorzystanych materiałów audio, wideo, znaków ani innych utworów należących do podmiotów trzecich. Ich autorzy i źródła są wymienieni na stronie [Uznania i źródła](https://malkontenci.pl/uznania).

Copyright 2026 © Sefinek.
