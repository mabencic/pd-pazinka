# Planinarsko društvo Pazinka, web stranica

Statička stranica bez okvira i bez dodatnih paketa. Sadržaj je u JSON datotekama u mapi `content/`, a `build.js` iz njih generira gotovu stranicu u mapu `dist/`.

## Gdje se što mijenja

| Što | Datoteka |
| --- | --- |
| Naziv društva, kontakt, izbornik, tekst na vrhu | `content/site.json` |
| Kalendar pohoda i "najbliži pohod" na vrhu | `content/hikes.json` |
| Objave (raspisi, izvještaji) | `content/objave.json` |
| Odsjeci | `content/odsjeci.json` |
| Sklonište | `content/skloniste.json` |
| Upute za članstvo, članarina, povlastice | `content/clanstvo.json` |
| Tablica planinarskih putova | `content/putovi.json` |
| Fotografije | mapa `images/` |
| Izgled | `css/style.css` |

### Novi pohod

U `content/hikes.json` dopiši blok:

```json
{
  "date": "2026-12-20",
  "title": "Naziv pohoda",
  "category": "vodicki",
  "level": "lagano",
  "summary": "Kratki opis, duljina, uspon, trajanje",
  "departure": "08:00",
  "length": "10 km",
  "ascent": "300 m",
  "duration": "4 h",
  "transport": "Osobni automobili"
}
```

- `category`: `vodicki`, `visoko` ili `marka`
- `level`: `lagano`, `srednje` ili `zahtjevno`
- `dateEnd`: dodaj za višednevne pohode
- `"hero": false`: pohod se neće prikazati u kartici "Najbliži pohod" na vrhu
- Pohodi kojima je datum prošao sami nestaju iz kalendara u pregledniku, a pri sljedećoj objavi i iz koda.

### Nova objava

U `content/objave.json` dopiši blok s poljima `slug` (dio adrese, bez razmaka i dijakritika), `date`, `type` (`raspis`, `izvjestaj` ili `novost`), `title`, `excerpt` i `body` (popis odlomaka). Za fotografiju dodaj `"image": "/images/naziv.jpg"` i `"imageAlt": "opis slike"`, a bez nje se prikazuje ilustracija (`"art": 1`, `2` ili `3`).

## Lokalno pokretanje

```
node build.js
```

Rezultat je u `dist/`.

## Objava na Cloudflare Pages

- Framework preset: **None**
- Build command: `node build.js`
- Build output directory: `dist`

Svaki push na `main` automatski objavljuje novu verziju.

## Prije prave objave

1. U `content/site.json` provjeri naziv društva (`name`) i ostale podatke.
2. Dopuni kalendar pohoda u `content/hikes.json` (trenutno je unesen samo najbliži pohod).
3. Upiši pravu adresu u `url` i postavi `"noindex": false`. Dok je `noindex` uključen, tražilice stranicu ne indeksiraju.

## Struktura stranica

`build.js` generira ove stranice: početna, O nama, tri odsjeka (`vodicki-odsjek`, `visokogorski-odsjek`, `markacisti`), kalendar pohoda, planinarski putovi, sklonište Kremenjak, članstvo te popis objava i stranica svake objave. Izbornik je u `content/site.json` (`nav`), a pločice na početnoj u `tiles`. Članovi odsjeka mijenjaju se u `content/odsjeci.json` (`groups`).

## Slike

Fotografije stavi u mapu `images/` (npr. `images/kremenjak.jpg`, po mogućnosti do 1600 px širine) i upiši putanju u sadržaj:

- naslovna slika na početnoj: `"heroImage": "/images/naziv.jpg"` u `content/site.json`
- slika objave: `"image"` i `"imageAlt"` u `content/objave.json`
- slika skloništa: `"image"` i `"imageAlt"` u `content/skloniste.json`

Koristi samo slike za koje društvo ima pravo objave.
