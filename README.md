# Planinarsko društvo Pazinka, web stranica

Statička stranica bez okvira i bez dodatnih paketa. Sadržaj je u JSON datotekama u mapi `content/`, a `build.js` iz njih generira gotovu stranicu u mapu `dist/`.

## Uređivanje preko CMS-a (/admin/)

Sadržaj se najlakše uređuje u pregledniku na adresi **`/admin/`** (npr. `https://<adresa-stranice>/admin/`). To je [Sveltia CMS](https://github.com/sveltia/sveltia-cms): obrazac na hrvatskom za objave, kalendar pohoda i stalne stranice, s prijenosom fotografija. Nema baze ni poslužitelja: svako spremanje postaje commit u ovom repozitoriju na grani `main`, a Cloudflare Pages zatim sam objavi novu verziju stranice (obično za minutu do dvije).

Što se uređuje:

- **Objave**: raspisi, izvještaji i novosti, svaka u svojoj datoteci u `content/objave/`. Naziv datoteke nastaje iz naslova i postaje adresa objave (`/objave/naziv/`); kasnija promjena naslova ne mijenja adresu.
- **Kalendar pohoda**: svaki pohod u svojoj datoteci u `content/pohodi/`. Pohod se može povezati s raspisom (polje "Raspis").
- **Stranice**: sklonište, članstvo, planinarski putovi, odsjeci te osnovni podaci, početna, O nama i izbornik.

Fotografije prenesene kroz CMS spremaju se u mapu `images/`.

### Prijava

Svaka osoba koja uređuje treba GitHub račun s pravom pisanja u repozitorij `mabencic/pd-pazinka` (vlasnik je dodaje u *Settings → Collaborators*). Zatim:

1. Na GitHubu otvori <https://github.com/settings/personal-access-tokens/new> (fine-grained token).
2. *Repository access*: **Only select repositories** → `mabencic/pd-pazinka`.
3. *Permissions → Repository permissions → Contents*: **Read and write**.
4. Odaberi rok trajanja, stvori token i kopiraj ga.
5. Na `/admin/` klikni **Prijava pomoću pristupnog tokena** i zalijepi token.

Token je kao lozinka: ne šalji ga drugima. Kad istekne, stvori novi na isti način.

### Prijava gumbom "Prijava s GitHubom" (po želji)

Ako ne želiš da urednici sami stvaraju tokene, može se uključiti klasična prijava preko GitHuba. Za to treba mali posrednik za prijavu na Cloudflare Workersu, [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth):

1. Postavi worker gumbom *Deploy to Cloudflare Workers* iz uputa tog repozitorija; dobiješ adresu oblika `https://sveltia-cms-auth.<poddomena>.workers.dev`.
2. Na <https://github.com/settings/applications/new> registriraj OAuth aplikaciju. *Authorization callback URL*: `<adresa-workera>/callback`.
3. U postavkama workera (*Settings → Variables*) upiši `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (šifrirano) i `ALLOWED_DOMAINS` (adresa stranice, npr. `www.pd-pazinka.hr`).
4. U `admin/config.yml` pod `backend` dodaj `base_url: <adresa-workera>` i promijeni `auth_methods` u `[oauth, token]`.

### Nadogradnja CMS-a

Verzija je zakucana u `admin/index.html` (`@sveltia/cms@0.249.1`). Za nadogradnju promijeni broj verzije i provjeri da se `/admin/` normalno otvara.

## Gdje se što mijenja

| Što | Datoteka |
| --- | --- |
| Naziv društva, kontakt, izbornik, tekst na vrhu | `content/site.json` |
| Kalendar pohoda i "najbliži pohod" na vrhu | mapa `content/pohodi/` (jedan pohod = jedna datoteka) |
| Objave (raspisi, izvještaji) | mapa `content/objave/` (jedna objava = jedna datoteka) |
| Odsjeci | `content/odsjeci.json` |
| Sklonište | `content/skloniste.json` |
| Upute za članstvo, članarina, povlastice | `content/clanstvo.json` |
| Tablica planinarskih putova | `content/putovi.json` |
| Fotografije | mapa `images/` |
| Izgled | `css/style.css` |
| Postavke CMS-a (polja obrazaca) | `admin/config.yml` |

### Novi pohod (ručno, bez CMS-a)

U mapi `content/pohodi/` napravi novu datoteku, npr. `2026-12-20-naziv-pohoda.json`:

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
- `post`: naziv datoteke raspisa iz `content/objave/` (bez `.json`), ako postoji
- `"hero": false`: pohod se neće prikazati u kartici "Najbliži pohod" na vrhu
- Pohodi kojima je datum prošao sami nestaju iz kalendara u pregledniku, a pri sljedećoj objavi i iz koda.

### Nova objava (ručno, bez CMS-a)

U mapi `content/objave/` napravi novu datoteku. Naziv datoteke je adresa objave, pa neka bude bez razmaka i dijakritika (npr. `izvjestaj-ucka.json` → `/objave/izvjestaj-ucka/`). Polja: `date`, `type` (`raspis`, `izvjestaj` ili `novost`), `title`, `excerpt` i `body` (popis odlomaka). Za fotografiju dodaj `"image": "/images/naziv.jpg"` i `"imageAlt": "opis slike"`, a bez nje se prikazuje ilustracija (`"art": 1`, `2` ili `3`).

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
2. Dopuni kalendar pohoda (u CMS-u ili u mapi `content/pohodi/`; trenutno je unesen samo najbliži pohod).
3. Upiši pravu adresu u `url` i postavi `"noindex": false`. Dok je `noindex` uključen, tražilice stranicu ne indeksiraju.

## Struktura stranica

`build.js` generira ove stranice: početna, O nama, tri odsjeka (`vodicki-odsjek`, `visokogorski-odsjek`, `markacisti`), kalendar pohoda, planinarski putovi, sklonište Kremenjak, članstvo te popis objava i stranica svake objave. Izbornik je u `content/site.json` (`nav`), a pločice na početnoj u `tiles`. Članovi odsjeka mijenjaju se u `content/odsjeci.json` (`groups`).

## Slike

Fotografije stavi u mapu `images/` (npr. `images/kremenjak.jpg`, po mogućnosti do 1600 px širine) i upiši putanju u sadržaj:

- naslovne slike na početnoj (izmjenjuju se same): popis `"heroImages"` u `content/site.json`, npr. `"/images/naziv.jpg"`
- slika objave: `"image"` i `"imageAlt"` u datoteci objave u `content/objave/`
- slika skloništa: `"image"` i `"imageAlt"` u `content/skloniste.json`

Koristi samo slike za koje društvo ima pravo objave.
