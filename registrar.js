// Óxido · registra el service worker para jugar sin conexión, y se encarga de que se vea la versión nueva.
// Solo en la web (http o https). Con doble clic (file://) o dentro de la app de Mac no hace nada.
//
// Versión nueva: el service worker nuevo se instala solo y toma el control, pero la página abierta sigue mostrando el
// código viejo hasta recargar (en el iPhone, una pestaña que vuelve de segundo plano no se recarga sola). Por eso:
//   · se busca versión nueva al abrir y cada vez que la página vuelve a verse (pestaña o app que vuelve);
//   · si llega una versión nueva y estás en un menú (título, elección, opciones…), la página se recarga sola, una vez;
//   · si estás jugando, nunca se recarga y no aparece nada (abajo quedaba sobre la palanca: un pulgar lo tocaba sin
//     querer). En la PAUSA sale, arriba a la derecha, "Versión nueva lista · tocá para actualizar" (en el iPhone, al
//     volver de otra app el juego ya está en pausa). Al volver a un menú se recarga sola.
// Además muestra la versión, chica, arriba a la izquierda del título (la pregunta al service worker).
// Si una actualización quedó para después (ahorro de datos o celular, ver sw.js), se vuelve a probar al pasar a wifi.
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.protocol !== 'http:') return;
  var sw = navigator.serviceWorker, habiaControl = !!sw.controller, pendiente = false, aviso = null;
  var MENUS = ['title', 'select', 'opciones', 'ayuda', 'logros', 'records', 'reasignar'];
  var enMenu = function () { return typeof state === 'string' && MENUS.indexOf(state) >= 0; };
  var recargar = function () {
    // nunca dos recargas seguidas (por si algo se repite): una cada 30 s como mucho
    try { var t = +sessionStorage.getItem('oxido-recarga') || 0; if (Date.now() - t < 30000) return; sessionStorage.setItem('oxido-recarga', String(Date.now())); } catch (e) {}
    location.reload();
  };
  function armarAviso() {
    if (aviso) return;
    aviso = document.createElement('button');
    aviso.type = 'button';
    aviso.id = 'oxido-version-nueva';
    aviso.textContent = 'Versión nueva lista · tocá para actualizar';
    aviso.style.cssText = 'position:fixed;right:calc(10px + env(safe-area-inset-right,0px));top:calc(8px + env(safe-area-inset-top,0px));z-index:40;display:none;' +
      'font:bold 13px ui-monospace,Menlo,Consolas,monospace;color:#1a0f14;background:#ffe08a;border:0;border-radius:999px;padding:12px 18px;min-height:44px;cursor:pointer';
    aviso.addEventListener('click', recargar);
    document.body.appendChild(aviso);
  }
  // llegó una versión nueva (el service worker nuevo tomó el control)
  sw.addEventListener('controllerchange', function () {
    if (!habiaControl) { habiaControl = true; return; } // primera visita: ya es la versión que corresponde
    pendiente = true; armarAviso();
    window.OXIDO_ACTUALIZAR = recargar; // con pantalla táctil, tactil.js lo pone como botón ACTUALIZAR en la pausa
    if (enMenu()) recargar();
  });
  // con una versión pendiente: en un menú se recarga; en la pausa se ve el aviso; jugando, nada
  setInterval(function () {
    if (!pendiente) return;
    if (enMenu()) { recargar(); return; }
    // con pantalla táctil el aviso es el botón ACTUALIZAR de la pausa (tactil.js), en la fila de SEGUIR y SALIR
    if (aviso) aviso.style.display = typeof state === 'string' && state === 'pause' && !window.OXIDO_TOQUE ? 'block' : 'none';
  }, 300);

  // versión, chica, arriba a la izquierda del título
  var rotulo = document.createElement('div');
  rotulo.style.cssText = 'position:fixed;left:calc(8px + env(safe-area-inset-left,0px));top:calc(6px + env(safe-area-inset-top,0px));z-index:4;' +
    'font:10px ui-monospace,Menlo,Consolas,monospace;color:rgba(236,232,226,.45);pointer-events:none;display:none';
  rotulo.id = 'oxido-version';
  function pedirVersion() {
    if (!sw.controller) return;
    var ch = new MessageChannel();
    ch.port1.onmessage = function (e) { if (e.data) rotulo.textContent = 'versión ' + String(e.data).slice(0, 6); };
    sw.controller.postMessage('version', [ch.port2]);
  }
  setInterval(function () { rotulo.style.display = state === 'title' && rotulo.textContent ? 'block' : 'none'; }, 500);
  sw.addEventListener('controllerchange', pedirVersion);

  addEventListener('load', function () {
    document.body.appendChild(rotulo);
    pedirVersion();
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(function (reg) {
      reg.update().catch(function () {});
      // la pestaña o la app vuelve a verse: buscar versión nueva
      document.addEventListener('visibilitychange', function () { if (!document.hidden) reg.update().catch(function () {}); });
      var c = navigator.connection;
      if (c && c.addEventListener) c.addEventListener('change', function () {
        if (!c.saveData && c.type !== 'cellular') reg.update().catch(function () {});
      });
    }).catch(function () {});
  });
})();
