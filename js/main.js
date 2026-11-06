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

  // Kalendar: sakrij prošle pohode i omogući filtar po kategoriji
  var rows = [].slice.call(document.querySelectorAll('.hike[data-end]'));
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var empty = document.getElementById('calEmpty');
  var current = 'all';

  function apply() {
    var visible = 0;
    rows.forEach(function (r) {
      var past = r.getAttribute('data-end') < today;
      var hide = past || !(current === 'all' || r.getAttribute('data-c') === current);
      r.hidden = hide;
      if (!hide) visible++;
    });
    if (empty) empty.hidden = visible > 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      current = chip.getAttribute('data-f');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      apply();
    });
  });
  if (rows.length) apply();

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
