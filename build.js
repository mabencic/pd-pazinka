'use strict';
// Gradi višestraničnu statičku stranicu u mapu dist/ iz JSON datoteka u content/.
// Pokretanje: node build.js (bez dodatnih paketa).

const fs = require('fs');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'dist');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(root, 'content', f), 'utf8'));

const site = readJson('site.json');
const hikesAll = readJson('hikes.json').sort((a, b) => a.date.localeCompare(b.date));
const posts = readJson('objave.json').sort((a, b) => b.date.localeCompare(a.date));
const odsjeci = readJson('odsjeci.json');
const skloniste = readJson('skloniste.json');
const clanstvo = readJson('clanstvo.json');
const putovi = readJson('putovi.json');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dd = (n) => String(n).padStart(2, '0');

const MONTHS = ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp', 'kol', 'ruj', 'lis', 'stu', 'pro'];
const MONTHS_NOM = ['siječanj', 'veljača', 'ožujak', 'travanj', 'svibanj', 'lipanj', 'srpanj', 'kolovoz', 'rujan', 'listopad', 'studeni', 'prosinac'];
const DAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
const CATEGORY = { vodicki: 'Vodički', visoko: 'Visokogorski', marka: 'Markacisti' };
const LEVEL = { lagano: ['l1', 'Lagano'], srednje: ['l2', 'Srednje'], zahtjevno: ['l3', 'Zahtjevno'] };
const POST_TYPE = { izvjestaj: 'Izvještaj', raspis: 'Raspis', novost: 'Novost' };

const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return { y, m, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() }; };
const fmt = (iso) => { const p = parse(iso); return `${dd(p.d)}.${dd(p.m)}.${p.y}.`; };

// Datum izgradnje, po vremenu Europe/Zagreb
const todayIso = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zagreb' }).format(new Date());
const hikes = hikesAll.filter((h) => (h.dateEnd || h.date) >= todayIso);

// ---------- ilustracije ----------
const ART = {
  1: '<path class="m1" d="M0 110 L70 50 L130 90 L210 30 L290 95 L350 60 L400 90 L400 150 L0 150Z"/><path class="m2" d="M0 128 L90 84 L170 118 L260 72 L340 120 L400 100 L400 150 L0 150Z"/><path class="m3" d="M0 142 L120 118 L240 138 L360 114 L400 126 L400 150 L0 150Z"/>',
  2: '<path class="m1" d="M0 100 L60 70 L120 96 L200 40 L260 80 L330 48 L400 84 L400 150 L0 150Z"/><path class="m2" d="M0 120 L100 90 L180 112 L280 80 L400 116 L400 150 L0 150Z"/><path class="m3" d="M0 140 L110 126 L220 140 L320 122 L400 138 L400 150 L0 150Z"/>',
  3: '<path class="m1" d="M0 90 L80 40 L150 80 L220 20 L300 76 L400 36 L400 150 L0 150Z"/><path class="m2" d="M0 118 L70 88 L160 120 L250 70 L340 112 L400 92 L400 150 L0 150Z"/><path class="m3" d="M0 142 L100 124 L200 140 L310 118 L400 134 L400 150 L0 150Z"/>'
};
const art = (n) => `<svg class="art" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect class="sky" width="400" height="150"/>${ART[n] || ART[1]}</svg>`;
const LOGO = '<svg width="44" height="44" viewBox="0 0 44 44" role="img" aria-label="Planinarska markacija"><circle cx="22" cy="22" r="19" fill="none" stroke="#c4372c" stroke-width="7"/><circle cx="22" cy="22" r="12" fill="#ffffff"/></svg>';
const RIDGE = '<svg class="ridge" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true"><path class="far" d="M0 70 L120 40 L210 62 L330 18 L450 58 L560 32 L690 66 L800 24 L930 60 L1050 36 L1200 64 L1200 120 L0 120Z"/><path class="near" d="M0 96 L90 80 L180 92 L300 66 L420 90 L540 72 L660 94 L790 70 L910 92 L1030 76 L1130 90 L1200 82 L1200 120 L0 120Z"/></svg>';
const SHELTER_ART = '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect class="sky" width="400" height="300"/><path class="m1" d="M0 190 L90 100 L170 170 L260 70 L340 150 L400 120 L400 300 L0 300Z"/><path class="m2" d="M0 230 L120 170 L220 220 L330 160 L400 200 L400 300 L0 300Z"/><path class="m3" d="M0 270 L140 240 L280 268 L400 244 L400 300 L0 300Z"/><path d="M182 242 L214 218 L246 242 L246 262 L182 262Z" fill="var(--surface)"/><path d="M176 244 L214 214 L252 244" fill="none" stroke="var(--red)" stroke-width="5" stroke-linejoin="round"/></svg>';

// ---------- zajednički dijelovi ----------
function navHtml(current) {
  return '<ul class="nav-main">' + site.nav.map((i) => {
    const isCurrent = i.href === current || (i.match || []).includes(current);
    const cls = [i.join ? 'nav-join' : '', isCurrent ? 'current' : ''].filter(Boolean).join(' ');
    const sub = i.children ? '<ul class="sub">' + i.children.map((c) => `<li><a href="${esc(c.href)}">${esc(c.label)}</a></li>`).join('') + '</ul>' : '';
    return `<li${cls ? ` class="${cls}"` : ''}><a href="${esc(i.href)}"${isCurrent ? ' aria-current="page"' : ''}>${esc(i.label)}</a>${sub}</li>`;
  }).join('') + '</ul>';
}

function header(current) {
  return `<header class="top"><div class="wrap">
<a class="brand" href="/">${LOGO}<span><b>${esc(site.name)}</b><small>${esc(site.tagline)}</small></span></a>
<button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="mainNav">Izbornik</button>
<nav id="mainNav" aria-label="Glavni izbornik">${navHtml(current)}</nav>
</div></header>`;
}

function footer() {
  const c = site.contact;
  return `<footer>
<div class="wrap">
<div><h3>Planinarsko društvo</h3><p>${esc(site.name)}<br>${c.address.map(esc).join('<br>')}${site.founded ? `<br>${esc(site.founded)}` : ''}</p></div>
<div><h3>Kontakt</h3><ul><li>${esc(c.email)}</li>${c.meetings ? `<li>${esc(c.meetings)}</li>` : ''}${c.facebook ? `<li><a href="${esc(c.facebook)}" rel="noopener">Facebook</a></li>` : ''}</ul></div>
<div><h3>Poveznice</h3><ul><li><a href="/kalendar-pohoda/">Kalendar pohoda</a></li><li><a href="/objave/">Objave</a></li><li><a href="/planinarski-putovi/">Planinarski putovi</a></li><li><a href="/clanstvo/">Članstvo</a></li></ul></div>
</div>
${site.footerNote ? `<div class="note"><div class="wrap">${esc(site.footerNote)}</div></div>` : ''}
</footer>`;
}

function layout({ title, description, body, path: pagePath }) {
  const fullTitle = title ? `${title} | ${site.name}` : site.name;
  const canonical = site.url && pagePath ? `<link rel="canonical" href="${esc(site.url.replace(/\/$/, '') + pagePath)}">` : '';
  return `<!doctype html>
<html lang="hr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.description)}">
${site.noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
${canonical}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
${header(pagePath)}
${body}
${footer()}
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}

function pageHead(title, label, lead) {
  return `<section class="page-head"><div class="wrap">
<p class="crumb"><a href="/">Početna</a> / ${esc(title)}</p>
${label ? `<span class="label">${esc(label)}</span>` : ''}
<h1>${esc(title)}</h1>
${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
</div></section>`;
}

const peopleList = (g) => `<div class="group"><h3>${esc(g.title)}</h3><ul class="people">${g.people.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>`;

// ---------- pohodi ----------
function hikeRow(h) {
  const a = parse(h.date);
  let big = dd(a.d) + '.';
  let cls = '';
  if (h.dateEnd && h.dateEnd !== h.date) {
    big = `${dd(a.d)}.–${dd(parse(h.dateEnd).d)}.`;
    cls = ' class="range"';
  }
  const [lc, ln] = LEVEL[h.level] || LEVEL.srednje;
  return `<article class="hike" data-c="${esc(h.category)}" data-end="${esc(h.dateEnd || h.date)}">
<div class="d"><b${cls}>${big}</b><span>${MONTHS[a.m - 1]}</span></div>
<div><h3>${h.post ? `<a href="/objave/${esc(h.post)}/">${esc(h.title)}</a>` : esc(h.title)}</h3><p class="meta"><span class="tag">${esc(CATEGORY[h.category] || h.category)}</span>${esc(h.summary || '')}</p></div>
<span class="lvl ${lc}">${ln}</span>
</article>`;
}

function nextCard(h, hidden) {
  const a = parse(h.date);
  const [, ln] = LEVEL[h.level] || LEVEL.srednje;
  const facts = [['Polazak', h.departure], ['Zahtjevnost', ln], ['Duljina', h.length], ['Uspon', h.ascent], ['Vrijeme hoda', h.duration], ['Prijevoz', h.transport], ['Vodiči', h.guides]].filter((f) => f[1]);
  const dateBig = h.dateEnd && h.dateEnd !== h.date ? `${dd(a.d)}.–${dd(parse(h.dateEnd).d)}.` : `${dd(a.d)}.`;
  return `<div class="next" data-end="${esc(h.dateEnd || h.date)}"${hidden ? ' hidden' : ''}>
<span class="label">Najbliži pohod</span>
<div class="date"><b>${dateBig}</b><span>${MONTHS_NOM[a.m - 1]} · ${DAYS[a.dow]}</span></div>
<h2>${esc(h.title)}</h2>
${facts.length ? '<dl class="facts">' + facts.map((f) => `<div><dt>${f[0]}</dt><dd>${esc(f[1])}</dd></div>`).join('') + '</dl>' : `<p>${esc(h.summary || '')}</p>`}
${h.registerUrl ? `<p class="reg"><a class="btn btn-red" href="${esc(h.registerUrl)}" rel="noopener">${esc(h.registerText || 'Prijave')}</a>${h.post ? ` <a href="/objave/${esc(h.post)}/">Cijeli raspis</a>` : ''}</p>` : ''}
</div>`;
}

// ---------- objave ----------
function postCard(p) {
  const media = p.image ? `<img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy">` : art(p.art);
  return `<article class="post">${media}<div class="body">
<span class="label">${esc(POST_TYPE[p.type] || 'Objava')} · ${fmt(p.date)}</span>
<h3><a href="/objave/${esc(p.slug)}/">${esc(p.title)}</a></h3>
<p>${esc(p.excerpt)}</p>
<a class="more" href="/objave/${esc(p.slug)}/">Nastavi čitati</a>
</div></article>`;
}

// ---------- stranice ----------
function homePage() {
  const heroHikes = hikes.filter((h) => h.hero !== false);
  const cards = heroHikes.map((h, i) => nextCard(h, i !== 0)).join('\n');
  const noNext = `<div class="next" id="nextEmpty"${heroHikes.length ? ' hidden' : ''}><span class="label">Najbliži pohod</span><h2>Novi pohodi uskoro</h2><p>Kalendar se redovito dopunjuje, pogledajte objave.</p></div>`;
  const heroImg = site.heroImage ? `<img class="hero-img" src="${esc(site.heroImage)}" alt="">` : '';

  const body = `<main>
<section class="hero"><div class="wrap">
<div>
<span class="label">${esc(site.heroLabel)}</span>
<h1>${esc(site.heroTitle)}</h1>
<p class="lead">${esc(site.heroLead)}</p>
<div class="hero-cta"><a class="btn btn-red" href="/kalendar-pohoda/">Kalendar pohoda</a><a class="btn btn-ghost" href="/clanstvo/">Kako postati član</a></div>
</div>
<aside aria-label="Najbliži pohod">${cards}${noNext}</aside>
</div>${heroImg}${RIDGE}</section>

<section class="block"><div class="wrap">
<div class="sec-head"><h2>Nadolazeći pohodi</h2><a href="/kalendar-pohoda/" class="label">Cijeli kalendar</a></div>
<div class="cal">${hikes.slice(0, 3).map(hikeRow).join('\n')}</div>
<p class="empty" id="calEmpty"${hikes.length ? ' hidden' : ''}>Trenutno nema najavljenih pohoda.</p>
</div></section>

<section class="block"><div class="wrap">
<div class="sec-head"><h2>Najnovije objave</h2><a href="/objave/" class="label">Sve objave</a></div>
<div class="posts">${posts.slice(0, 3).map(postCard).join('\n')}</div>
</div></section>

<section class="block"><div class="wrap">
<div class="sec-head"><h2>Na stranici</h2></div>
<div class="tiles">${site.tiles.map((t) => `<a class="tile" href="${esc(t.href)}"><b>${esc(t.title)}</b><span>${esc(t.text)}</span></a>`).join('\n')}</div>
</div></section>
</main>`;
  return layout({ title: '', body, path: '/' });
}

function aboutPage() {
  const c = site.contact;
  const body = `${pageHead('O nama', site.founded, site.aboutText)}
<main class="block"><div class="wrap two">
<div><h2 class="h2s">${esc(site.board.title)}</h2><ul class="people one">${site.board.members.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>
<div id="kontakt"><h2 class="h2s">Kontakt</h2>
<p>${esc(site.name)}<br>${c.address.map(esc).join('<br>')}</p>
<p class="gap">E-pošta: ${esc(c.email)}</p>
${c.facebook ? `<p class="gap"><a href="${esc(c.facebook)}" rel="noopener">Facebook stranica društva</a></p>` : ''}
</div>
</div></main>`;
  return layout({ title: 'O nama', description: site.aboutText, body, path: '/o-nama/' });
}

function odsjekPage(o) {
  const body = `${pageHead(o.title, o.label, o.text)}
<main class="block"><div class="wrap">
<div class="groups">${o.groups.map(peopleList).join('')}</div>
<ul class="bullets">${o.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
${o.link ? `<p class="gap"><a class="btn btn-dark" href="${esc(o.link.href)}">${esc(o.link.label)}</a></p>` : ''}
</div></main>`;
  return layout({ title: o.title, description: o.text, body, path: `/${o.slug}/` });
}

function calendarPage() {
  const body = `${pageHead('Kalendar pohoda', '', 'Najavljeni pohodi društva. Pohodi kojima je datum prošao sami nestaju s popisa.')}
<main class="block"><div class="wrap">
<div class="chips" role="group" aria-label="Filtar pohoda">
<button class="chip" data-f="all" aria-pressed="true">Svi</button>
<button class="chip" data-f="vodicki" aria-pressed="false">Vodički</button>
<button class="chip" data-f="visoko" aria-pressed="false">Visokogorski</button>
<button class="chip" data-f="marka" aria-pressed="false">Markacisti</button>
</div>
<div class="cal">${hikes.map(hikeRow).join('\n')}</div>
<p class="empty" id="calEmpty"${hikes.length ? ' hidden' : ''}>Trenutno nema najavljenih pohoda u ovoj kategoriji.</p>
</div></main>`;
  return layout({ title: 'Kalendar pohoda', description: 'Kalendar pohoda Planinarskog društva Pazinka.', body, path: '/kalendar-pohoda/' });
}

function trailsPage() {
  const body = `${pageHead(putovi.title, '', putovi.intro)}
<main class="block"><div class="wrap">
<div class="table-wrap"><table class="trails">
<thead><tr><th>Oznaka</th><th>Put</th><th>Planina</th><th>Duljina</th><th>Hod</th></tr></thead>
<tbody>${putovi.rows.map((r) => `<tr><td>${esc(r.mark)}</td><td>${esc(r.name)}</td><td>${esc(r.mountain)}</td><td>${esc(r.km)} km</td><td>${esc(r.time)} h</td></tr>`).join('')}</tbody>
</table></div>
</div></main>`;
  return layout({ title: putovi.title, description: putovi.intro, body, path: '/planinarski-putovi/' });
}

function shelterPage() {
  const media = skloniste.image ? `<img src="${esc(skloniste.image)}" alt="${esc(skloniste.imageAlt || skloniste.title)}">` : SHELTER_ART;
  const body = `${pageHead('Sklonište ' + skloniste.title, skloniste.label, '')}
<main class="block"><div class="wrap">
<div class="shelter">${media}<div class="txt">
<p>${esc(skloniste.text)}</p>
<dl>${skloniste.facts.map((f) => `<dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd>`).join('')}</dl>
</div></div>
</div></main>`;
  return layout({ title: 'Sklonište ' + skloniste.title, description: skloniste.text, body, path: '/skloniste-kremenjak/' });
}

function membershipPage() {
  const body = `${pageHead(clanstvo.title, '', '')}
<main class="block"><div class="wrap">
<ol class="steps">${clanstvo.steps.map((s) => `<li><b>${esc(s.title)}</b><span>${esc(s.text)}</span></li>`).join('')}</ol>
<div class="join-info">
<div><h3>${esc(clanstvo.categoriesTitle)}</h3>${clanstvo.categoriesNote ? `<p class="intro">${esc(clanstvo.categoriesNote)}</p>` : ''}<dl class="prices">${clanstvo.categories.map((c) => `<div><dt>${esc(c.name)}<small>${esc(c.note)}</small></dt><dd>${esc(c.price)}</dd></div>`).join('')}</dl></div>
<div><h3>${esc(clanstvo.benefitsTitle)}</h3><ul class="benefits">${clanstvo.benefits.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>
</div>
</div></main>`;
  return layout({ title: clanstvo.title, description: 'Članarina, povlastice i upis u Planinarsko društvo Pazinka.', body, path: '/clanstvo/' });
}

function postsIndexPage() {
  const body = `${pageHead('Objave', '', 'Raspisi i izvještaji s pohoda i akcija društva.')}
<main class="block"><div class="wrap">
<div class="list-posts">${posts.map((p) => `<article><span class="label">${esc(POST_TYPE[p.type] || 'Objava')} · ${fmt(p.date)}</span><h2><a href="/objave/${esc(p.slug)}/">${esc(p.title)}</a></h2><p>${esc(p.excerpt)}</p></article>`).join('\n')}</div>
</div></main>`;
  return layout({ title: 'Objave', description: 'Raspisi i izvještaji s pohoda i akcija društva.', body, path: '/objave/' });
}

function postPage(p) {
  const body = `<main class="page"><div class="wrap">
<p class="crumb crumb-light"><a href="/">Početna</a> / <a href="/objave/">Objave</a></p>
<span class="label">${esc(POST_TYPE[p.type] || 'Objava')} · ${fmt(p.date)}</span>
<h1>${esc(p.title)}</h1>
<div class="article">${p.image ? `<p><img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}"></p>` : ''}${p.body.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
<p><a href="/objave/">Sve objave</a></p>
</div></main>`;
  return layout({ title: p.title, description: p.excerpt, body, path: `/objave/${p.slug}/` });
}

function notFoundPage() {
  const body = '<main class="page"><div class="wrap"><h1>Stranica nije pronađena</h1><p><a href="/">Povratak na početnu</a></p></div></main>';
  return layout({ title: 'Stranica nije pronađena', body });
}

// ---------- pisanje ----------
const write = (rel, content) => {
  const f = path.join(dist, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const d of ['css', 'js', 'images']) {
  if (fs.existsSync(path.join(root, d))) fs.cpSync(path.join(root, d), path.join(dist, d), { recursive: true });
}

const urls = [];
const page = (p, html) => { urls.push(p); write(p === '/' ? 'index.html' : `${p.replace(/^\//, '')}index.html`, html); };

page('/', homePage());
page('/o-nama/', aboutPage());
odsjeci.forEach((o) => page(`/${o.slug}/`, odsjekPage(o)));
page('/kalendar-pohoda/', calendarPage());
page('/planinarski-putovi/', trailsPage());
page('/skloniste-kremenjak/', shelterPage());
page('/clanstvo/', membershipPage());
page('/objave/', postsIndexPage());
posts.forEach((p) => page(`/objave/${p.slug}/`, postPage(p)));
write('404.html', notFoundPage());

if (site.noindex || !site.url) {
  write('robots.txt', 'User-agent: *\nDisallow: /\n');
} else {
  const base = site.url.replace(/\/$/, '');
  write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map((u) => `<url><loc>${base}${u}</loc></url>`).join('\n') + '\n</urlset>\n');
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
}

console.log(`Gotovo: ${urls.length} stranica, ${hikes.length} pohoda, ${posts.length} objava, izlaz u dist/ (datum izgradnje ${todayIso})`);
