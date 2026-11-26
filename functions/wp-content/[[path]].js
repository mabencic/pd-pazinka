// Stare adrese slika i dokumenata (WordPress /wp-content/uploads/...) -> 301 na nove datoteke.
// Pokreće se samo za /wp-content/* (vidi dist/_routes.json); sve ostalo poslužuje se statično.
// Tablicu stare-slike.json izradila je migracija; dokumenti su u content/stare-adrese.json.
import slike from '../stare-slike.json';
import adrese from '../../content/stare-adrese.json';

const EXT = '(?=\\.[A-Za-z0-9]+$)';
const VARIJANTE = [
  [new RegExp(`-\\d+x\\d+${EXT}`), ''], // smanjene verzije, npr. slika-300x200.jpg
  [new RegExp(`-scaled${EXT}`), ''],
  [new RegExp(`-e\\d{10,}${EXT}`), ''], // slike obrezane u WordPressu
  [/\/photo-gallery\/(thumb|\.original)\//, '/photo-gallery/'],
];

function trazi(p) {
  if (slike[p]) return slike[p];
  if (adrese[p]) return adrese[p];
  for (const [rx, zamjena] of VARIJANTE) {
    const a = p.replace(rx, zamjena);
    if (a !== p && (slike[a] || adrese[a])) return slike[a] || adrese[a];
  }
  if (p.startsWith('/wp-content/uploads/photo-gallery/')) return '/fotogalerija/';
  return null;
}

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  let p = url.pathname;
  try { p = decodeURIComponent(p); } catch (e) { /* neispravno kodiranje: tražimo kako je došlo */ }
  const cilj = trazi(p.normalize('NFC'));
  if (cilj) return Response.redirect(new URL(cilj, url.origin).toString(), 301);
  return next();
}
