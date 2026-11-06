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
})();
