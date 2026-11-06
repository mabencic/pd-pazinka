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
})();
