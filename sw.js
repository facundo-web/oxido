// Óxido · service worker: guarda el juego entero en el equipo para jugar sin conexión (y sin gastar datos).
// Este archivo es una plantilla: armar.mjs reemplaza VERSION y ARCHIVOS ([ruta, huella, bytes]) al generar dist/.
//
// Primera visita: baja todo (lo mide probar-web.mjs; ver PUBLICAR.md). Después el juego abre y se juega sin conexión.
// Versión nueva: solo baja los archivos cuya huella cambió; los demás se copian de lo que ya estaba guardado.
// Con ahorro de datos activado o red de celular (navigator.connection, donde el navegador lo dice; Safari de iPhone
// no lo dice), si la actualización pesa más de CHICA se deja para más tarde: el juego sigue con la versión que tiene
// y se vuelve a intentar en la próxima visita o al pasar a wifi (registrar.js).
const VERSION = "bfa4e177d015";
const ARCHIVOS = [
  ["LICENCIA.txt","49a1176ce7",275],
  ["aviso-tactil.js","b862e0ab3f",2276],
  ["creditos.html","01b5e02f1f",2165],
  ["iconos/apple-touch-icon.png","1d04aee907",9353],
  ["iconos/favicon-32.png","6ef161cc85",1331],
  ["iconos/favicon-64.png","9af022872d",3043],
  ["iconos/icono-192.png","ff39c279b8",10314],
  ["iconos/icono-512.png","97d86e23c9",37094],
  ["iconos/icono-maskable-512.png","e15ab8c8af",32217],
  ["index.html","b9a80fecf8",6155],
  ["js/accesible.js","5ac6a7e323",3854],
  ["js/aliados.js","11c884abd8",5382],
  ["js/armados.js","364d0b74b6",13384],
  ["js/armas.js","6d8d515aa0",5931],
  ["js/arpon.js","817e39c3fe",17926],
  ["js/arte-apertura.js","b75c04a073",14660],
  ["js/arte-caminatas.js","5e9a01ff0c",18827],
  ["js/arte-fx.js","072b1daff6",16756],
  ["js/arte-historia.js","aeee93fc41",17068],
  ["js/arte-intro.js","413e9aa4fd",12454],
  ["js/arte-jefe.js","d951d21d46",8858],
  ["js/arte-jefes-m1.js","61f8b2292b",14403],
  ["js/arte-jefes-m10.js","e78d5ae376",4289],
  ["js/arte-jefes-m2.js","cf0d0e9b49",8776],
  ["js/arte-jefes-m3.js","2e3c93391f",9573],
  ["js/arte-jefes-m4.js","dbe63c9489",5336],
  ["js/arte-jefes-m5.js","7c6406b225",10841],
  ["js/arte-jefes-m6.js","1d75b5b6cc",6195],
  ["js/arte-jefes-m7.js","2699bd482e",5860],
  ["js/arte-jefes-m8.js","cdbd83e86d",2757],
  ["js/arte-jefes-m9.js","de27f55819",9889],
  ["js/arte-luz.js","ca6e925b40",22374],
  ["js/arte-oliver.js","bb286c5532",16784],
  ["js/arte-personaje.js","ff873be2b6",3357],
  ["js/arte-tasador.js","a9d6b55a54",12204],
  ["js/arte-terreno.js","37543dd818",22683],
  ["js/arte-vehiculos.js","3140e0479b",26796],
  ["js/arte-vehiculos2.js","dd4bee7f77",15851],
  ["js/audio.js","72ce9875fb",13517],
  ["js/avion.js","56cf1056b7",3526],
  ["js/ayuda.js","716ec95d04",3993],
  ["js/base.js","7f08b20dcd",12941],
  ["js/camara.js","4b5c6e732c",6266],
  ["js/caminos-m2.js","36de13737e",10212],
  ["js/caminos.js","2a9a7d1221",18062],
  ["js/clima.js","559314480c",31428],
  ["js/combate.js","58122702a6",18255],
  ["js/comic.js","3db5cb6c6a",13025],
  ["js/consejos.js","6abf5b4618",9386],
  ["js/controles.js","ae74fd43a8",39983],
  ["js/cumplida.js","e9ec2641cb",10535],
  ["js/dibujito.js","552df41726",7685],
  ["js/eco-armas.js","cce9d75f99",15150],
  ["js/economia.js","5852f9d810",1462],
  ["js/enemigos.js","0f2a137a03",11854],
  ["js/entradas.js","b806eed6d5",24653],
  ["js/escenario-base.js","c9000f6735",41257],
  ["js/escenario-m1.js","fb6c7da466",25282],
  ["js/escenario-m10.js","b09dc4c6a5",21278],
  ["js/escenario-m2.js","16b3c5aec2",29073],
  ["js/escenario-m3.js","f4f2feae59",25764],
  ["js/escenario-m4.js","3e010b2870",13025],
  ["js/escenario-m5.js","0ac6d7ced0",25050],
  ["js/escenario-m6.js","43f46c775c",18846],
  ["js/escenario-m7.js","11f1d766e8",18607],
  ["js/escenario-m8.js","e7d60d7c2c",13515],
  ["js/escenario-m9.js","2c02edf2e2",12640],
  ["js/espera.js","785bc2ede6",9086],
  ["js/fin.js","3c22350f6f",16786],
  ["js/fusion-carga.js","b271a24e17",6347],
  ["js/fusion.js","1381109d5e",6989],
  ["js/gatito.js","f878c7ce89",32680],
  ["js/globos.js","b1f7588cd7",10317],
  ["js/grillo.js","5f2ad9dbe1",16541],
  ["js/guinos.js","f0642813aa",17109],
  ["js/historia.js","45731c9cac",23508],
  ["js/historial.js","1c4d0459a5",35020],
  ["js/hud.js","57df20b285",51357],
  ["js/input.js","61be665f09",17537],
  ["js/intro.js","ba08d55df8",24544],
  ["js/jefes.js","43c327b8c6",43402],
  ["js/jefes10.js","101ac56fad",31816],
  ["js/jefes4.js","0511ffa1b9",26832],
  ["js/jefes5.js","ee1f8309ca",25958],
  ["js/jefes6.js","810ced5241",23849],
  ["js/jefes7.js","db1c5b3226",21352],
  ["js/jefes8.js","87d5d0a522",24147],
  ["js/jefes9.js","3badf34f71",28172],
  ["js/juego.js","721b2c758d",39050],
  ["js/jugador.js","948facd733",7829],
  ["js/medallas.js","378d41ea04",1668],
  ["js/mision10.js","1300934b23",64495],
  ["js/mision3.js","1648721e14",39237],
  ["js/mision4.js","c50dd26583",58195],
  ["js/mision5.js","42f8117dec",50870],
  ["js/mision6.js","2ba1804e1f",42746],
  ["js/mision7.js","e38a7c2fb2",44565],
  ["js/mision8.js","e8de390d71",62168],
  ["js/mision9.js","d49ca35ed1",62410],
  ["js/momentos.js","2cd2bea116",20601],
  ["js/mundo.js","349ab45438",27373],
  ["js/mundos.js","cfb74b5c65",6379],
  ["js/musica10.js","9ba0e26cf0",11122],
  ["js/musica3.js","7112620a07",7082],
  ["js/musica4.js","7489bca41c",6451],
  ["js/musica5.js","3b840b0f57",5998],
  ["js/musica6.js","78f12d4788",5399],
  ["js/musica7.js","11bf4fba46",6606],
  ["js/musica8.js","e0ca97c843",5529],
  ["js/musica9.js","3cc518c0e8",7337],
  ["js/niveles.js","c0720716e2",14491],
  ["js/nota.js","173b55db95",5406],
  ["js/oliver.js","664da96f66",11823],
  ["js/partida.js","81638cf5cd",18614],
  ["js/personajes.js","a724a89ac4",3598],
  ["js/pieles-arte.js","a12744b5fa",7081],
  ["js/pieles.js","60c75d8e25",16674],
  ["js/planta.js","81de501512",43619],
  ["js/raton.js","cdf0146cd9",4693],
  ["js/reasignar.js","32f3f25407",10125],
  ["js/recolectar.js","4211659763",18704],
  ["js/reloj.js","168f73ec8a",11653],
  ["js/remolino.js","01f39dc4c1",6331],
  ["js/rescate.js","4631a212ef",7606],
  ["js/rueda.js","7b0427781c",9666],
  ["js/simple.js","46e217394d",3913],
  ["js/sprites.js","9286f6d764",7665],
  ["js/terreno.js","1a17720900",20109],
  ["js/textos.js","a1f0ea3154",39555],
  ["js/tuerca.js","df6b685edc",4012],
  ["js/vehiculos.js","384ac8a477",32040],
  ["js/vehiculos2.js","9ac33e1865",18117],
  ["manifest.webmanifest","1de8a7b57f",825],
  ["privacidad.html","87bea1d814",6050],
  ["registrar.js","721c2e1ddf",5062],
  ["registro-prueba.js","b85c4918e2",24238],
  ["tactil.js","2ae472f4a3",61658]
];
const CACHE = 'oxido-' + VERSION;
const HUELLAS = '__huellas__'; // en cada caché: qué huella tiene cada archivo guardado
const CHICA = 150 * 1024;

// la versión guardada que está andando (la más nueva que terminó de instalarse)
async function anterior() {
  const ks = (await caches.keys()).filter(k => k.startsWith('oxido-') && k !== CACHE);
  for (let i = ks.length - 1; i >= 0; i--) {
    const c = await caches.open(ks[i]), r = await c.match(HUELLAS);
    if (r) { try { return { c, h: await r.json() }; } catch (e) {} }
  }
  return null;
}
async function huellaDe(r) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', await r.arrayBuffer()));
  return Array.from(d, x => x.toString(16).padStart(2, '0')).join('').slice(0, 10);
}
function ahorraDatos() {
  const c = self.navigator && self.navigator.connection;
  return !!c && (c.saveData === true || c.type === 'cellular');
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const ant = await anterior();
    const cambian = ARCHIVOS.filter(([f, h]) => !ant || ant.h[f] !== h);
    const peso = cambian.reduce((s, a) => s + a[2], 0);
    // ya hay una versión que anda y la persona ahorra datos: si es grande, queda para después (no se instala)
    if (ant && ahorraDatos() && peso > CHICA) throw new Error('Óxido: actualización de ' + Math.round(peso / 1024) + ' KB postergada (ahorro de datos o celular)');
    const c = await caches.open(CACHE);
    await Promise.all(ARCHIVOS.map(async ([f, h]) => {
      if (ant && ant.h[f] === h) {
        const r = await ant.c.match(f);
        if (r) { await c.put(f, r); return; }
      }
      // Primera visita: la página ya bajó estos archivos, así que se piden normal y salen del caché del navegador
      // (no se bajan dos veces). Se revisa la huella: si lo guardado era de otra versión, se baja la buena.
      // En una actualización van directo con ?v=huella, para que ningún caché del camino dé la versión vieja.
      let r = ant ? null : await fetch(f).catch(() => null);
      if (r && r.ok && await huellaDe(r.clone()) === h) { await c.put(f, r); return; }
      r = await fetch(f + '?v=' + h, { cache: 'no-cache' });
      if (!r.ok) throw new Error('Óxido: no se pudo bajar ' + f);
      await c.put(f, r);
    }));
    await c.put(HUELLAS, new Response(JSON.stringify(Object.fromEntries(ARCHIVOS.map(([f, h]) => [f, h]))),
      { headers: { 'content-type': 'application/json' } }));
    await self.skipWaiting();
  })());
});

// la página pregunta qué versión tiene (registrar.js la muestra en el título)
self.addEventListener('message', e => {
  if (e.data === 'version' && e.ports && e.ports[0]) e.ports[0].postMessage(VERSION);
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('oxido-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero lo guardado; si no está, la red. La portada ("./") sale de index.html. Lo de otros sitios (el clima real,
// si está activado) no pasa por acá.
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
