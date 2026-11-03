(function () {
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('mainNav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var cal = document.getElementById('cal');
  if (!cal) return;

  var d = new Date();
  var today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  var rows = [].slice.call(cal.querySelectorAll('.hike'));
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
  apply();

  var cards = [].slice.call(document.querySelectorAll('.next[data-end]'));
  var shown = false;
  cards.forEach(function (c) {
    var ok = !shown && c.getAttribute('data-end') >= today;
    c.hidden = !ok;
    if (ok) shown = true;
  });
  var none = document.getElementById('nextEmpty');
  if (none) none.hidden = shown;
})();
