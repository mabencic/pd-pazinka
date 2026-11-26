(function () {
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('mainNav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var d = new Date();
  var today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);

  // Kalendar: sakrij prošle pohode
  var rows = [].slice.call(document.querySelectorAll('.hike[data-end]'));
  rows.forEach(function (r) { if (r.getAttribute('data-end') < today) r.setAttribute('data-past', ''); });

  // Filtri (kalendar pohoda, objave): gumbi u .chips[data-for] filtriraju stavke s data-c u ciljanom popisu
  [].slice.call(document.querySelectorAll('.chips[data-for]')).forEach(function (group) {
    var list = document.getElementById(group.getAttribute('data-for'));
    if (!list) return;
    var chips = [].slice.call(group.querySelectorAll('.chip'));
    var items = [].slice.call(list.querySelectorAll('[data-c]'));
    var empty = list.id === 'cal' ? document.getElementById('calEmpty') : null;
    function apply(f) {
      var visible = 0;
      items.forEach(function (it) {
        var hide = it.hasAttribute('data-past') || !(f === 'all' || it.getAttribute('data-c') === f);
        it.hidden = hide;
        if (!hide) visible++;
      });
      if (empty) empty.hidden = visible > 0;
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        apply(chip.getAttribute('data-f'));
      });
    });
    apply('all');
  });
  // Pohodi izvan kalendara (početna): samo sakrij prošle
  rows.forEach(function (r) { if (r.hasAttribute('data-past')) r.hidden = true; });
  var calEmptyHome = document.getElementById('calEmpty');
  if (calEmptyHome && !document.querySelector('.chips[data-for="cal"]')) calEmptyHome.hidden = rows.some(function (r) { return !r.hidden; });

  // Kartica "Najbliži pohod": prikaži prvi pohod koji nije prošao
  var cards = [].slice.call(document.querySelectorAll('.next[data-end]'));
  if (cards.length || document.getElementById('nextEmpty')) {
    var shown = false;
    cards.forEach(function (c) {
      var ok = !shown && c.getAttribute('data-end') >= today;
      c.hidden = !ok;
      if (ok) shown = true;
    });
    var none = document.getElementById('nextEmpty');
    if (none) none.hidden = shown;
  }

  // Naslovne fotografije: same se izmjenjuju, bez gumba. Slike koje se nisu učitale preskaču se.
  var slides = [].slice.call(document.querySelectorAll('.hero-slides .hero-img'));
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (slides.length > 1 && !calm) {
    var cur = 0;
    var ok = function (img) { return img.complete && img.naturalWidth > 0; };
    setInterval(function () {
      if (document.hidden) return;
      for (var step = 1; step < slides.length; step++) {
        var next = (cur + step) % slides.length;
        if (ok(slides[next])) {
          slides[cur].classList.remove('on');
          slides[next].classList.add('on');
          cur = next;
          return;
        }
      }
    }, 6500);
  }

  // Tražilica objava: učitava indeks tek kad korisnik počne tipkati
  var q = document.getElementById('q');
  var res = document.getElementById('searchResults');
  var listing = document.getElementById('listing');
  if (q && res) {
    var idx = null, loading = false;
    var norm = function (t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd'); };
    var escH = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var fmtD = function (d) { var p = d.split('-'); return p[2] + '.' + p[1] + '.' + p[0] + '.'; };
    var run = function () {
      var v = norm(q.value.trim());
      if (v.length < 2) { res.hidden = true; if (listing) listing.hidden = false; return; }
      if (!idx) { if (!loading) { loading = true; fetch('/objave/indeks.json').then(function (r) { return r.json(); }).then(function (d) { idx = d.map(function (e) { return { e: e, k: norm(e[2] + ' ' + e[3] + ' ' + e[1]) }; }); run(); }).catch(function () { loading = false; }); } return; }
      var words = v.split(/\s+/);
      var hits = idx.filter(function (x) { return words.every(function (w) { return x.k.indexOf(w) >= 0; }); });
      res.innerHTML = '<p class="search-count">' + (hits.length ? 'Pronađeno: ' + hits.length + (hits.length > 60 ? ' (prikazano prvih 60)' : '') : 'Nema objava za „' + escH(q.value) + '“.') + '</p>' +
        hits.slice(0, 60).map(function (x) { var e = x.e; return '<a class="hit" href="/objave/' + e[0] + '/"><small>' + escH(e[4]) + ' · ' + fmtD(e[1]) + '</small><b>' + escH(e[2]) + '</b><span>' + escH(e[3]) + '</span></a>'; }).join('');
      res.hidden = false; if (listing) listing.hidden = true;
    };
    q.addEventListener('input', run);
  }

  // Galerije: klik na fotografiju otvara je preko cijelog ekrana; strelice i Esc
  var galleries = [].slice.call(document.querySelectorAll('[data-gallery]'));
  if (galleries.length) {
    var box = document.createElement('div');
    box.className = 'lightbox'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Fotografija');
    box.innerHTML = '<img alt=""><button class="lb-close" aria-label="Zatvori">×</button><button class="lb-prev" aria-label="Prethodna">‹</button><button class="lb-next" aria-label="Sljedeća">›</button><span class="lb-count"></span>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), count = box.querySelector('.lb-count'), items = [], at = 0, back = null;
    var show = function (i) { at = (i + items.length) % items.length; img.src = items[at].getAttribute('href'); img.alt = items[at].querySelector('img').alt; count.textContent = (at + 1) + ' / ' + items.length; };
    var close = function () { box.hidden = true; document.body.classList.remove('lb-open'); if (back) back.focus(); };
    galleries.forEach(function (g) {
      var links = [].slice.call(g.querySelectorAll('a'));
      links.forEach(function (a, i) { a.addEventListener('click', function (ev) { ev.preventDefault(); items = links; back = a; show(i); box.hidden = false; document.body.classList.add('lb-open'); box.querySelector('.lb-close').focus(); }); });
    });
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(at - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(at + 1); });
    box.addEventListener('click', function (ev) { if (ev.target === box) close(); });
    document.addEventListener('keydown', function (ev) { if (box.hidden) return; if (ev.key === 'Escape') close(); if (ev.key === 'ArrowLeft') show(at - 1); if (ev.key === 'ArrowRight') show(at + 1); });
  }
  // Kolačići: Google Analytics se učitava tek nakon pristanka (osnovni način rada, bez ičega prije odabira).
  // Odabir se pamti 12 mjeseci s datumom i verzijom; nova verzija ili istek znače ponovno pitanje.
  (function () {
    var bar = document.getElementById('cookieBar');
    if (!bar) return;
    var tag = bar.getAttribute('data-gtag');
    var KEY = 'pd-privola', VERSION = 1, MAX_AGE = 365 * 24 * 3600 * 1000;
    var main = bar.querySelector('.consent-main');
    var settings = bar.querySelector('.consent-settings');
    var box = document.getElementById('consentAnalytics');
    var settingsBtn = bar.querySelector('[data-consent-settings]');
    function read() {
      try {
        localStorage.removeItem('pd-kolacici'); // stari zapis (prije novog banera) se ne priznaje
        var c = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (!c || c.v !== VERSION || !c.datum || Date.now() - Date.parse(c.datum) > MAX_AGE) return null;
        return c;
      } catch (e) { return null; }
    }
    function save(analitika) {
      try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, analitika: !!analitika, datum: new Date().toISOString() })); } catch (e) {}
    }
    function load() {
      if (window.__pdGtag) return;
      window.__pdGtag = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      // Consent Mode v2: sve odbijeno, zatim dopuštena samo analitika (oglašavanje ostaje odbijeno)
      window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      window.gtag('js', new Date());
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/' + (/^GTM-/.test(tag) ? 'gtm.js' : 'gtag/js') + '?id=' + encodeURIComponent(tag);
      document.head.appendChild(s);
      if (!/^GTM-/.test(tag)) window.gtag('config', tag);
    }
    function clearGa() {
      var host = location.hostname.split('.');
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (!/^_ga|^_gid|^_gat/.test(name)) return;
        for (var i = 0; i < host.length - 1; i++) {
          var dom = host.slice(i).join('.');
          document.cookie = name + '=; Max-Age=0; path=/; domain=' + dom;
          document.cookie = name + '=; Max-Age=0; path=/; domain=.' + dom;
        }
        document.cookie = name + '=; Max-Age=0; path=/';
      });
    }
    function show(withSettings) {
      bar.hidden = false;
      var c = read();
      box.checked = !!(c && c.analitika);
      settings.hidden = !withSettings;
      main.hidden = !!withSettings;
      if (settingsBtn) settingsBtn.setAttribute('aria-expanded', withSettings ? 'true' : 'false');
    }
    function decide(analitika) {
      var before = read();
      save(analitika);
      bar.hidden = true;
      if (analitika) { load(); return; }
      if (window.gtag && window.__pdGtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
      clearGa();
      if (before && before.analitika) location.reload(); // Googleova skripta je već bila učitana
    }
    var c = read();
    var closed = false;
    try { closed = sessionStorage.getItem('pd-privola-zatvoreno') === '1'; } catch (e) {}
    if (c && c.analitika) load();
    else if (!c && !closed) show(false);
    bar.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      var v = b.getAttribute('data-consent');
      if (v === 'da') { box.checked = true; decide(true); }
      else if (v === 'ne') { box.checked = false; decide(false); }
      else if (v === 'odabir') decide(box.checked);
      else if (b.hasAttribute('data-consent-settings')) show(true);
      else if (b.hasAttribute('data-consent-close')) {
        // Zatvaranje = bez privole; ništa se ne učitava, a pri sljedećem posjetu baner se ponovno prikaže
        bar.hidden = true;
        try { sessionStorage.setItem('pd-privola-zatvoreno', '1'); } catch (e) {}
      }
    });
    [].slice.call(document.querySelectorAll('[data-consent-open]')).forEach(function (b) {
      b.addEventListener('click', function () { show(true); });
    });
  })();

  // Karta skloništa (OpenStreetMap) učitava se tek na klik
  [].slice.call(document.querySelectorAll('[data-map-load]')).forEach(function (b) {
    b.addEventListener('click', function () {
      var box = b.closest('[data-map-src]');
      var f = document.createElement('iframe');
      f.src = box.getAttribute('data-map-src');
      f.title = box.getAttribute('data-map-title');
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.replaceWith(f);
    });
  });
})();
