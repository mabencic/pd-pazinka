# Upute za rad na stranici PD Pazinka

Stranica: https://www.planinarsko-drustvo-pazinka.hr (Cloudflare Pages, objava s grane `main`).
Izgradnja: `node build.js` (sadržaj u `content/`, izlaz u `dist/`). CMS: Sveltia na `/admin/`.

## Komunikacija
- Odgovaraj uvijek na hrvatskom.
- Podatke (visine vrhova, datume, nazive, pravne navode) provjeri u izvoru prije nego ih navedeš.
- Nikad ne objavljuj osobne OIB-e; javan je samo OIB društva (48416564331).

## Nove objave
- Datoteka `content/objave/<slug>.json`; polja: title, date (YYYY-MM-DD), time (HH:MM, ako je isti dan više objava), type (novost | raspis | izvjestaj), section (vodicki | visoko | marka), excerpt, body, image, imageAlt, gallery, attachments, art.
- Tekst u našem formatu: "## podnaslov", "- stavka", **podebljano**, [tekst](adresa).
- Slike: WebP, najviše 1280 px, kvaliteta 72, u `images/arhiva/GGGG-MM/`.
- Preuzeti tekst (npr. HPS): na dnu "Izvor teksta i fotografija: …" s poveznicom.

## Pohodi u kalendaru (obavezno)
- Kad se objavi **raspis** pohoda, izleta ili akcije s datumom, uvijek dodaj i zapis u `content/pohodi/GGGG-MM-DD-<naziv>.json`
  (date, dateEnd, title, category, level, summary, departure, length, ascent, duration, transport, guides, registerUrl, registerText).
- U pohodu **uvijek** postavi `"post": "<slug objave>"`. Tada naslov u okviru "Najbliži pohod" i u kalendaru otvara objavu,
  a pojavljuje se i gumb "Pročitaj raspis".
- Ako zahtjevnost nije navedena, pitaj korisnika (ili navedi pretpostavku u odgovoru).

## Kolačići i privatnost
- Google Analytics (`googleTag` u `content/site.json`) učitava se tek nakon privole; baner i politika su usklađeni s AZOP/ZEK/GDPR.
- Ne dodavati ugrađene sadržaje trećih strana (YouTube, Facebook, Google karte, obrasci) bez dopune politike privatnosti i privole.

## Provjera prije objave
- `node build.js`, pa pregled u pregledniku (Playwright snimka) za promijenjene stranice.
- Commit na radnu granu i `main` (korisnik je to odobrio za ovu stranicu).
