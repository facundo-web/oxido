// Óxido · aviso en pantallas solo táctiles (celular o tablet sin teclado).
// El juego no tiene controles táctiles: se juega con teclado o joystick.
// El aviso se va solo cuando se conecta un joystick o se toca "Entendido".
// Cuando el juego tenga controles táctiles, pone window.OXIDO_TACTIL = true y este aviso no sale.
(function () {
  if (window.OXIDO_TACTIL) return;
  var soloTactil = matchMedia('(any-pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;
  if (!soloTactil) return;
  var hayPad = function () {
    var l = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < l.length; i++) if (l[i]) return true;
    return false;
  };
  if (hayPad()) return;
  var d = document.createElement('div');
  d.id = 'aviso-tactil';
  d.setAttribute('role', 'dialog');
  d.setAttribute('aria-labelledby', 'aviso-tactil-t');
  d.innerHTML =
    '<div class="caja">' +
    '<p id="aviso-tactil-t" class="t">Óxido se juega con teclado o joystick</p>' +
    '<p>En esta pantalla no hay controles táctiles. Conectá un joystick por Bluetooth y apretá cualquier botón, o abrí el juego en una computadora.</p>' +
    '<button type="button">Entendido</button>' +
    '</div>';
  var css = document.createElement('style');
  css.textContent =
    '#aviso-tactil{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;' +
    'background:rgba(11,10,16,.88);z-index:10;font:16px/1.45 ui-monospace,Menlo,Consolas,monospace;color:#eee}' +
    '#aviso-tactil .caja{max-width:440px;background:#1a1220;border:2px solid #f3c969;padding:20px 22px;text-align:center}' +
    '#aviso-tactil .t{color:#ffe08a;font-weight:bold;font-size:18px;margin:0 0 10px}' +
    '#aviso-tactil p{margin:0 0 16px}' +
    '#aviso-tactil button{font:inherit;font-weight:bold;background:#e0582c;color:#120c18;border:0;padding:12px 22px;min-height:44px;cursor:pointer}' +
    '#aviso-tactil button:focus-visible{outline:3px solid #ffe08a;outline-offset:3px}';
  var cerrar = function () { if (d.parentNode) d.parentNode.removeChild(d); };
  d.querySelector('button').addEventListener('click', cerrar);
  addEventListener('gamepadconnected', cerrar);
  document.head.appendChild(css);
  document.body.appendChild(d);
})();
