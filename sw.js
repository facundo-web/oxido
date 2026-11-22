// Óxido · service worker: guarda el juego en el equipo para jugar sin conexión.
// Este archivo es una plantilla: armar.mjs reemplaza VERSION y ARCHIVOS al generar dist/.
const VERSION = "ad1e686de209";
const ARCHIVOS = ["./","LICENCIA.txt","aviso-tactil.js","creditos.html","iconos/apple-touch-icon.png","iconos/favicon-32.png","iconos/favicon-64.png","iconos/icono-192.png","iconos/icono-512.png","iconos/icono-maskable-512.png","index.html","js/aliados.js","js/armados.js","js/armas.js","js/audio.js","js/avion.js","js/ayuda.js","js/base.js","js/camara.js","js/combate.js","js/dibujito.js","js/enemigos.js","js/entradas.js","js/espera.js","js/gatito.js","js/globos.js","js/grillo.js","js/guinos.js","js/historial.js","js/hud.js","js/input.js","js/jefes.js","js/jefes10.js","js/jefes4.js","js/jefes5.js","js/jefes6.js","js/jefes7.js","js/jefes8.js","js/jefes9.js","js/juego.js","js/jugador.js","js/medallas.js","js/mision10.js","js/mision3.js","js/mision4.js","js/mision5.js","js/mision6.js","js/mision7.js","js/mision8.js","js/mision9.js","js/momentos.js","js/mundo.js","js/musica10.js","js/musica3.js","js/musica4.js","js/musica5.js","js/musica6.js","js/musica7.js","js/musica8.js","js/musica9.js","js/niveles.js","js/partida.js","js/personajes.js","js/planta.js","js/recolectar.js","js/rueda.js","js/sprites.js","manifest.webmanifest","privacidad.html","registrar.js","tactil.js"];
const CACHE = 'oxido-' + VERSION;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('oxido-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero lo guardado; si no está, la red. La portada ("./") sale de index.html.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(req, { ignoreSearch: true }).then(r =>
        r || (req.mode === 'navigate' ? c.match('index.html') : null)
      ).then(r => r || fetch(req))
    )
  );
});
