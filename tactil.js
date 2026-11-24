// Óxido · controles en pantalla para celular y tablet, con la lógica de un joystick de PlayStation.
// Va solo en la copia pública (dist/): armar.mjs lo carga después de los js del juego.
// No cambia la lógica del juego: aprieta las mismas acciones que el teclado (keys y pressed de input.js).
//
// A la derecha, siempre el rombo ✕ ○ □ △. A la izquierda, la palanca flotante (jugando y en los menús:
// es lo mismo que dice la ayuda del juego). Si la pantalla tiene barras negras (más ancha que 16:9, o una
// tablet), los controles se ubican en las barras; si no entran, se pegan al borde para tapar lo menos posible.
//   Jugando:  ✕ saltar · □ disparar (mantener = ráfaga) · ○ granada · △ arma (tocar = cambiar,
//             mantener = rueda de armas en cámara lenta: la palanca elige el gajo, soltar △ confirma; el avión
//             es un gajo) · II pausa. Palanca flotante con diagonales.
//             Con RUEDA: TOCAR (opción del juego): tocar △ abre o cierra la rueda y deslizar el dedo sobre △ a la
//             izquierda o a la derecha cambia al arma anterior o siguiente.
//             Sin rueda (versiones viejas del juego): mantener △ = avión, con anillo de carga.
//             DISPARO (opción del juego): AUTOMÁTICO = mantener □ tira ráfaga; ALTERNADO = tocar □ empieza y otro
//             toque para, y □ queda encendido mientras dispara. Lo decide el juego con el mismo □ (pressed/keys.shoot).
//   Menús:    ✕ aceptar · ○ volver · palanca para elegir (un movimiento = un paso, sin diagonales).
//   ¡CAÍSTE! y misión cumplida: ✕ seguir · mantener ○ terminar (con anillo, para no perder la partida sin querer).
//   FIN DEL JUEGO (estado 'fin', fin.js): como un menú (○ = MENÚ).
//   Pausa:    ✕ u ○ seguir.
//   Nombre:   ✕ listo · ○ borrar · palanca para las letras · ESCRIBIR abre el teclado del celular.
//   Intro de la misión 1 (intro.js): tocar OMITIR (arriba al centro) la saltea.
// Salidas con texto (prueba con gente en iPad: "no hay forma de volver atrás"): toda pantalla menos el título
// tiene un botón que dice qué hace, donde está II (en la barra de abajo de la tablet, o a la izquierda):
//   VOLVER (elección, logros, récords, FIN DEL JUEGO) · pausa: SEGUIR y SALIR AL MENÚ · ¡CAÍSTE!: los botones del juego ·
//   misión cumplida: SEGUIR y SALIR AL MENÚ · nombre: LISTO. Salir y terminar piden un segundo toque
//   ("¿SALIR? TOCÁ OTRA VEZ", 3 s) para no perder la partida sin querer.
// En una tablet parada se juega igual (el juego arriba, los controles abajo); "Girá la pantalla" es solo para celulares.
// Extras:    la pantalla no se apaga mientras jugás · pantalla completa en Android · en iPhone, cómo
//            agregarlo a inicio · "Girá la pantalla" con pausa · sin zoom ni gestos del navegador ·
//            el gesto de "atrás" pausa en vez de salir del juego.
// Se muestran al tocar la pantalla y se esconden al usar el teclado o un joystick (iPad con teclado: vuelven con el
// primer toque, y ese toque ya aprieta el botón que tocaste). En escritorio no aparece nada.
// window.OXIDO_TOQUE dice si el último control fue la pantalla: el juego lo lee con onTouch() para
// nombrar los botones (✕ ○ □ △) en sus textos. window.OXIDO_TACTIL_LIBRE dice, en coordenadas del juego,
// la franja que los controles dejan libre abajo ({x0, x1, y0}: de x0 a x1 no hay controles por debajo de y0),
// para que la ayuda de controles del menú se acomode ahí. Es null si los controles no se ven.
// window.OXIDO_TACTIL_POS dice dónde está cada control ({k, x, o, c, t, pausa, palanca}: centro x, y y radio r,
// en coordenadas del juego), para la tarjeta de CONTROLES dibujada. También es null si no se ven.
//
// Usa del juego: keys, pressed, state, audioInit y, si existen, AIR_HOLD y OXIDO_RUEDA (rueda.js).
window.OXIDO_TACTIL = true; // apaga el aviso "se juega con teclado o joystick" (aviso-tactil.js)
window.OXIDO_TOQUE = false;
(() => {
  if (typeof keys === 'undefined' || typeof pressed === 'undefined') return;
  const mm = q => matchMedia(q).matches;
  const soloTactil = mm('(any-pointer: coarse)') && !mm('(any-pointer: fine)');
  if (!soloTactil && !(navigator.maxTouchPoints > 0)) return;
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instalada = mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)') || navigator.standalone === true;
  const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const estado = () => (typeof state === 'string' ? state : '');
  const durAvion = (typeof AIR_HOLD === 'number' ? AIR_HOLD : 36) / 60;
  const rueda = () => window.OXIDO_RUEDA || null; // rueda de armas (rueda.js): con ella △ mantenido no carga el avión
  const DUR_TERMINAR = 0.6; // segundos manteniendo ○ para terminar la partida

  // qué hace cada botón del rombo en cada pantalla (como el joystick de PlayStation en el juego)
  // 'mantener:back' = hay que mantenerlo apretado DUR_TERMINAR segundos
  const MAPA = {
    play: { x: 'jump', o: 'bomb', c: 'shoot', t: 'air' },
    menu: { x: 'start', o: 'back' },
    fin: { x: 'start', o: 'mantener:back' },
    pausa: { x: 'start', o: 'back' },
    nombre: { x: 'jump', o: 'bomb' },
  };

  // ---------- dibujos ----------
  const svg = d => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
  const ICO = {
    x: svg('<path d="M5.5 5.5l13 13M18.5 5.5l-13 13" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'),
    o: svg('<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="3"/>'),
    c: svg('<rect x="5.5" y="5.5" width="13" height="13" rx="1" fill="none" stroke="currentColor" stroke-width="3"/>'),
    t: svg('<path d="M12 4.5l8 13.5H4z" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>'),
    flecha: svg('<path d="M12 5l7 9H5z" fill="currentColor"/>'),
    teclado: svg('<rect x="2" y="6" width="20" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 10h1M10 10h1M14 10h1M18 10h1M6 14h1M18 14h1M9 15h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  };
  // dibujo de la acción (Apple: íconos de lo que hace el botón, no letras); el símbolo ✕ ○ □ △ va chico en la esquina
  const DIBUJO = { // (no se llama ACC: así se llaman las opciones de accesibilidad del juego)
    salto: svg('<path d="M12 3.5l7.5 8.5H15v7.5H9V12H4.5z" fill="currentColor"/>'),
    bala: svg('<path d="M2.5 8h11c3.2 0 6 1.7 8 4-2 2.3-4.8 4-8 4h-11z" fill="currentColor"/><path d="M7 8v8" stroke="rgba(0,0,0,.55)" stroke-width="1.8"/>'),
    granada: svg('<circle cx="11" cy="14.5" r="6" fill="currentColor"/><rect x="8.5" y="5.5" width="5" height="3.5" rx=".8" fill="currentColor"/><path d="M13.5 7h3.5l1.5 2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M11 10.5v8M7 14.5h8" stroke="rgba(0,0,0,.5)" stroke-width="1.3"/>'),
    rueda: svg('<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12 3.5v17M4.6 7.75l14.8 8.5M4.6 16.25l14.8-8.5" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/>'),
    avion: svg('<path d="M2.5 12.5l7-1 3.5-7h2.2l-1.8 7 5.6.8 1.8-2.3h1.2l-.8 3 .8 3h-1.2l-1.8-2.3-5.6.8 1.8 7H13l-3.5-7-7-1z" fill="currentColor"/>'),
    ok: svg('<path d="M4.5 12.5l5 5L19.5 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    volver: svg('<path d="M15 4.5L7.5 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    seguir: svg('<path d="M7.5 4.5l12 7.5-12 7.5z" fill="currentColor"/>'),
    borrar: svg('<path d="M9 5.5h11.5v13H9L2.5 12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M11.5 9l6 6M17.5 9l-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
    salir: svg('<path d="M10.5 4.5h-6v15h6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M14.5 7.5l4.5 4.5-4.5 4.5M19 12H9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'),
  };
  // qué dibujo lleva cada acción, según la pantalla: sale de MAPA, así que si cambia un botón, cambia el dibujo
  function iconoDe(modo, a) {
    if (!a) return null;
    if (a === 'jump') return modo === 'nombre' ? 'ok' : 'salto';
    if (a === 'bomb') return modo === 'nombre' ? 'borrar' : 'granada';
    if (a === 'shoot') return 'bala';
    if (a === 'air' || a === 'swap') return rueda() ? 'rueda' : 'avion';
    if (a === 'start') return modo === 'menu' ? 'ok' : 'seguir';
    if (a === 'back') return modo === 'pausa' ? 'seguir' : 'volver';
    if (a === 'mantener:back') return 'salir';
    return null;
  }
  // anillo de carga (mantener apretado): un círculo que se dibuja de a poco; anda en cualquier Safari
  const ANILLO = '<svg class="anillo" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" pathLength="100"/></svg>';

  // ---------- estilos ----------
  const css = document.createElement('style');
  css.textContent = `
html,body{touch-action:none;overscroll-behavior:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
html.ox-arriba body{align-items:flex-start;padding-top:var(--ox-top,0px);box-sizing:border-box} /* tablet: el juego arriba, los controles en la barra de abajo */
#tactil{--u:clamp(52px,15.5vh,72px);--sl:env(safe-area-inset-left,0px);--sr:env(safe-area-inset-right,0px);--sb:env(safe-area-inset-bottom,0px);--st:env(safe-area-inset-top,0px);
  --borde:12px; /* lejos de los bordes, donde están los gestos del sistema */
  /* acomodar() pisa estos valores en px según las barras negras de la pantalla */
  --rx:calc(var(--sr) + var(--borde));--ry:calc(var(--sb) + var(--borde));--px:calc(10px + var(--sl));--py:calc(10px + var(--st));
  position:fixed;inset:0;z-index:5;pointer-events:none;display:none;color:#fff;font:bold 12px/1 ui-monospace,Menlo,Consolas,monospace;transition:opacity .4s}
#tactil.on{display:block}
#tactil.quieto{opacity:.5}
#tactil.pagina .ps,#tactil.pagina .zona{opacity:.12;transition:opacity .3s}
#tactil .b,#tactil .zona,#tactil .girar,#tactil .inicio{pointer-events:auto;touch-action:none}
/* botones transparentes (se ve el juego detrás) pero con borde lleno y un halo oscuro, para que se vean sobre fondos claros y oscuros */
#tactil .b{--c:255,224,138;position:absolute;display:none;align-items:center;justify-content:center;border-radius:50%;box-sizing:border-box;
  background:rgba(10,8,14,.24);border:2.5px solid rgba(var(--c),.95);color:rgb(var(--c));
  box-shadow:0 0 0 1.5px rgba(0,0,0,.55),inset 0 0 0 1px rgba(0,0,0,.4);transition:transform .06s,background .06s,opacity .15s}
#tactil .b::before{content:"";position:absolute;inset:-8px;border-radius:inherit}
#tactil .b svg{width:50%;height:50%;filter:drop-shadow(0 0 1.5px rgba(0,0,0,.95)) drop-shadow(0 1px 1px rgba(0,0,0,.8));pointer-events:none}
/* apretado: se hunde, se llena de su color y brilla (Apple: estado apretado siempre visible) */
#tactil .b.a{background:rgba(var(--c),.6);color:#fff;transform:scale(.88);box-shadow:0 0 0 1.5px rgba(0,0,0,.55),0 0 16px 3px rgba(var(--c),.8)}
/* rombo: el dibujo de la acción grande y el símbolo de la Play chico, abajo a la derecha */
#tactil .ps .acc,#tactil .ps .sim{position:absolute;display:flex;align-items:center;justify-content:center;pointer-events:none}
#tactil .ps .acc{inset:0}
#tactil .ps .acc svg{width:56%;height:56%}
#tactil .ps .sim{right:-4%;bottom:-4%;width:38%;height:38%;border-radius:50%;background:rgba(10,8,14,.9);box-shadow:0 0 0 2px rgba(var(--c),.95)}
#tactil .ps .sim svg{width:64%;height:64%;filter:none}
#tactil .ps.a .sim{background:rgb(var(--c));color:#1a0f14}
/* DISPARO: ALTERNADO (opción del juego): mientras sigue disparando solo, □ queda encendido */
#tactil .ps.c.sigue{background:rgba(var(--c),.45);color:#fff;box-shadow:0 0 0 1.5px rgba(0,0,0,.55),0 0 14px 3px rgba(var(--c),.7)}
/* sin acción en esta pantalla: solo el símbolo, grande y al centro */
#tactil .ps.sin-acc .acc{display:none}
#tactil .ps.sin-acc .sim{inset:0;width:auto;height:auto;background:none;box-shadow:none}
#tactil .ps.sin-acc .sim svg{width:50%;height:50%;filter:drop-shadow(0 0 1.5px rgba(0,0,0,.95))}
/* los botones sin uso en una pantalla se ven igual (Facu: en el menú □ y △ casi no se veían); solo no hacen nada */
/* rombo de PlayStation: un cuadrado de 2,36 × --u con la esquina de abajo a la derecha en (--rx, --ry) */
#tactil .ps{display:flex;width:calc(var(--u)*.84);height:calc(var(--u)*.84)}
#tactil .ps.x{--c:140,192,255;right:calc(var(--rx) + var(--u)*.76);bottom:var(--ry)}
#tactil .ps.o{--c:255,122,122;right:var(--rx);bottom:calc(var(--ry) + var(--u)*.76)}
#tactil .ps.c{--c:255,170,228;right:calc(var(--rx) + var(--u)*1.52);bottom:calc(var(--ry) + var(--u)*.76)}
#tactil .ps.t{--c:96,238,192;right:calc(var(--rx) + var(--u)*.76);bottom:calc(var(--ry) + var(--u)*1.52)}
#tactil .b svg.anillo{position:absolute;left:-6px;top:-6px;width:calc(100% + 12px);height:calc(100% + 12px);transform:rotate(-90deg);opacity:0;filter:none}
#tactil .anillo circle{fill:none;stroke:rgb(var(--c));stroke-width:3;stroke-dasharray:100;stroke-dashoffset:100}
#tactil .b.carga svg.anillo{opacity:1}
#tactil .b.carga .anillo circle{animation:oxCarga var(--dur,.6s) linear forwards}
@keyframes oxCarga{to{stroke-dashoffset:0}}
/* pausa (II) arriba a la izquierda, jugando y en pausa */
#tactil .pausa{width:max(46px,calc(var(--u)*.7));height:max(46px,calc(var(--u)*.7));border-radius:14px;font-size:18px;
  left:var(--px);top:var(--py)}
#tactil[data-modo=play] .pausa{display:flex}
#tactil .b{z-index:2} /* por encima de la zona de la palanca, que también ocupa la izquierda */
/* salidas con texto: en fila en la barra de abajo (tablet) o en columna a la izquierda, donde está II */
#tactil .salidas{position:absolute;z-index:3;display:flex;gap:14px;left:var(--sx,10px);top:var(--sy,10px);pointer-events:none}
#tactil .salidas[data-fila=abajo]{transform:translateX(-50%)}
/* celular: VOLVER chico arriba a la izquierda; pausa, fin y nombre en fila abajo, entre la palanca y el rombo */
#tactil .salidas[data-fila=lado] .chip{font-size:13px;padding:0 14px}
#tactil:is([data-modo=fin],[data-modo=nombre]) .salidas[data-fila=lado]{left:var(--sx2);top:var(--sy2);transform:translateX(-50%)}
/* pausa en celular: en fila arriba a la izquierda, sobre el marcador (abajo está la franja de ayudas del juego y, en
   columna, OMITIR INTRO tapaba el texto de la pausa) */
#tactil[data-modo=pausa] .salidas[data-fila=lado]{gap:8px}
/* movimiento reducido (opción del juego, ACC.mov): nada se anima */
#tactil.sin-mov,#tactil.sin-mov *{transition:none!important;animation:none!important}
#tactil .chip{position:relative;display:none;border-radius:999px;height:max(46px,calc(var(--u)*.7));padding:0 20px;gap:8px;
  font-size:15px;letter-spacing:.04em;white-space:nowrap;background:rgba(10,8,14,.72)}
#tactil .chip.ver{display:flex}
#tactil .chip.rojo{--c:255,122,122}
#tactil .chip.confirma{background:rgb(var(--c));color:#1a0f14;border-color:#fff}
#tactil .chip.espera{opacity:.4}
/* ESCRIBIR (nombre del récord) arriba a la derecha */
#tactil .escribir{border-radius:999px;height:max(46px,calc(var(--u)*.7));padding:0 18px;gap:8px;font-size:14px;
  right:calc(12px + var(--sr));top:calc(10px + var(--st))}
#tactil .escribir svg{width:22px;height:22px}
#tactil[data-modo=nombre] .escribir{display:flex}
/* palanca (jugando y en los menús; en la pausa no hace falta) */
#tactil .zona{position:absolute;left:calc(var(--sl) + 24px);bottom:calc(var(--sb) + 8px);width:44vw;top:calc(var(--u)*.95 + var(--st));display:none}
#tactil.on:not([data-modo=pausa]) .zona{display:block}
#tactil .base{position:absolute;width:calc(var(--u)*1.9);height:calc(var(--u)*1.9);margin:calc(var(--u)*-.95) 0 0 calc(var(--u)*-.95);border-radius:50%;box-sizing:border-box;
  background:rgba(10,8,14,.2);border:2.5px solid rgba(255,224,138,.75);box-shadow:0 0 0 1.5px rgba(0,0,0,.5);opacity:.8;transition:opacity .15s;pointer-events:none}
/* quieta es solo una pista: más chica, para no tapar al jugador cuando arranca la misión (al tocar aparece entera donde apoyás) */
#tactil .zona:not(.toca) .base{left:var(--bx,calc(var(--u)*1.05));top:var(--by,calc(100% - var(--u)*1.1));transform:scale(.85);translate:var(--pdx,0px) var(--pdy,0px)}
/* editor: acomodar los botones (OPCIONES › CONTROLES › BOTONES EN PANTALLA) */
#tactil .editor{position:fixed;inset:0;display:none;background:rgba(8,6,12,.62);z-index:1;pointer-events:auto;touch-action:none}
#tactil.editando .editor{display:block}
#tactil .editor .barra{position:absolute;left:50%;top:calc(8px + var(--st));transform:translateX(-50%);display:flex;gap:8px;align-items:center;
  background:rgba(18,12,24,.96);border:1.5px solid #f3c969;border-radius:14px;padding:6px 8px;white-space:nowrap;color:#ffe08a;font-size:13px}
#tactil .editor .barra span{padding:0 6px}
#tactil .editor .barra b{min-width:44px;text-align:center;color:#fff}
#tactil .editor button{font:inherit;font-size:15px;color:#fff;background:#2a1f30;border:1.5px solid #f3c969;border-radius:10px;min-width:44px;height:44px;padding:0 12px}
#tactil .editor button[data-ed=listo]{background:#f3c969;color:#1a0f14}
#tactil.editando .pausa{display:flex}
#tactil.editando .zona{display:block;pointer-events:none;z-index:2}
#tactil.editando .base{pointer-events:auto;opacity:1}
#tactil.editando .salidas,#tactil.editando .escribir{display:none}
#tactil.editando .b,#tactil.editando .base{outline:2px dashed rgba(255,255,255,.7);outline-offset:5px}
#tactil .zona.toca .base{opacity:1}
#tactil .perilla{position:absolute;left:50%;top:50%;width:calc(var(--u)*.85);height:calc(var(--u)*.85);margin:calc(var(--u)*-.425) 0 0 calc(var(--u)*-.425);border-radius:50%;box-sizing:border-box;
  background:rgba(255,224,138,.25);border:2.5px solid rgba(255,224,138,.95)}
#tactil .base i{position:absolute;width:14px;height:14px;color:rgba(255,224,138,.7)}
#tactil .base i svg{width:100%;height:100%;display:block}
#tactil .base i.on{color:#ffe08a;filter:drop-shadow(0 0 4px #ffe08a)}
#tactil .base .u{left:50%;top:6px;margin-left:-7px}
#tactil .base .d{left:50%;bottom:6px;margin-left:-7px;transform:rotate(180deg)}
#tactil .base .l{top:50%;left:6px;margin-top:-7px;transform:rotate(-90deg)}
#tactil .base .r{top:50%;right:6px;margin-top:-7px;transform:rotate(90deg)}
/* avisos */
#tactil .girar{position:fixed;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;
  background:#0b0a10;color:#ffe08a;font:bold 18px/1.35 ui-monospace,Menlo,Consolas,monospace;text-align:center;padding:24px}
#tactil .girar span{font-size:52px;display:inline-block;animation:oxGira 1.6s ease-in-out infinite}
@keyframes oxGira{0%,30%{transform:rotate(0)}60%,100%{transform:rotate(90deg)}}
#tactil.on.parado .girar{display:flex}
/* con el cartel de girar no se ve nada más: los botones tienen z-index y quedaban encima del texto (prueba en un iPhone) */
#tactil .girar{z-index:30}
#tactil.parado .b,#tactil.parado .zona,#tactil.parado .salidas,#tactil.parado .inicio,#tactil.parado .editor{display:none!important}
#tactil .inicio{position:absolute;left:50%;top:calc(8px + var(--st));transform:translateX(-50%);display:none;align-items:center;gap:10px;
  background:rgba(18,12,24,.92);border:1px solid #f3c969;border-radius:999px;padding:4px 4px 4px 16px;font-size:12px;color:#eee;white-space:nowrap}
#tactil .inicio b{color:#ffe08a}
#tactil .inicio button{font:inherit;font-size:16px;color:#fff;background:transparent;border:0;width:40px;height:40px;border-radius:50%}
#tactil.inicio-on[data-pantalla=title] .inicio{display:flex}
#tactil input{position:fixed;left:50%;top:0;width:1px;height:1px;opacity:.01;font-size:16px;border:0;padding:0;pointer-events:none;
  -webkit-user-select:text;user-select:text} /* Safari no deja escribir en un campo con user-select:none */
@media (prefers-reduced-motion:reduce){#tactil .girar span{animation:none}#tactil .b,#tactil{transition:none}}`;
  document.head.appendChild(css);

  // ---------- armado ----------
  const raiz = document.createElement('div');
  raiz.id = 'tactil';
  raiz.setAttribute('aria-hidden', 'true');
  const el = (cls, a, html) => { const d = document.createElement('div'); d.className = cls; if (a) d.dataset.a = a; if (html) d.innerHTML = html; raiz.appendChild(d); return d; };
  const rombo = {};
  for (const k of ['x', 'o', 'c', 't']) {
    rombo[k] = el('b ps ' + k, 'ps', ANILLO + '<span class="acc"></span><span class="sim">' + ICO[k] + '</span>');
    rombo[k].dataset.k = k;
  }
  rombo.t.style.setProperty('--dur', durAvion + 's');
  rombo.o.style.setProperty('--dur', DUR_TERMINAR + 's');
  const pausa = el('b pausa', 'pause', 'II');
  const escribir = el('b escribir', 'escribir', ICO.teclado + 'ESCRIBIR');
  const salidas = el('salidas');
  const chips = [0, 1, 2, 3].map(() => { const d = document.createElement('div'); d.className = 'b chip'; salidas.appendChild(d); return d; });
  const zona = el('zona');
  const base = document.createElement('div'); base.className = 'base';
  base.innerHTML = '<i class="u">' + ICO.flecha + '</i><i class="d">' + ICO.flecha + '</i><i class="l">' + ICO.flecha + '</i><i class="r">' + ICO.flecha + '</i><div class="perilla"></div>';
  zona.appendChild(base);
  const perilla = base.querySelector('.perilla');
  const marcas = { up: base.querySelector('.u'), down: base.querySelector('.d'), left: base.querySelector('.l'), right: base.querySelector('.r') };
  el('girar', '', '<span>↻</span>Girá la pantalla para jugar');
  const editor = el('editor', '', '<div class="barra"><span>Arrastrá cada botón</span><button type="button" data-ed="menos" aria-label="Más chicos">−</button><b class="tam"></b>' +
    '<button type="button" data-ed="mas" aria-label="Más grandes">+</button><button type="button" data-ed="restablecer">RESTABLECER</button><button type="button" data-ed="listo">LISTO</button></div>');
  // en Safari el botón Compartir está en la barra de abajo; en Chrome, Edge y Firefox de iPhone, en la barra de direcciones
  const otroNavegador = /CriOS|EdgiOS|FxiOS/.test(navigator.userAgent);
  const inicio = el('inicio', '', 'Pantalla completa: <b>Compartir</b>' + (otroNavegador ? ' (en la barra de direcciones)' : '') +
    ' → <b>Agregar a inicio</b><button type="button" aria-label="Cerrar">✕</button>');
  const campo = document.createElement('input');
  Object.assign(campo, { type: 'text', autocomplete: 'off', spellcheck: false });
  campo.setAttribute('autocapitalize', 'characters'); campo.setAttribute('autocorrect', 'off'); campo.setAttribute('enterkeyhint', 'done');
  raiz.appendChild(campo);
  document.body.appendChild(raiz);

  // ---------- apretar y soltar acciones (igual que el teclado) ----------
  const cuenta = {};  // cuántos dedos sostienen cada acción
  const dedos = {};   // pointerId → acción que sostiene ese dedo
  const dedosEn = {}; // pointerId → botón que toca ese dedo (para iluminarlo)
  const relojes = {}; // pointerId → temporizador de "mantener"
  let palancaDedo = null, centro = null, dir = {}, angPalanca = null;
  // vibración: en la app de iPhone, la respuesta háptica del sistema (la app tiene que registrar un
  // WKScriptMessageHandler "haptico", ver PUBLICAR.md); en Android, navigator.vibrate. Safari de iOS no vibra.
  const vibrar = (fuerte = false) => {
    try { const h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptico; if (h) { h.postMessage(fuerte ? 'fuerte' : 'toque'); return; } } catch (e) {}
    try { navigator.vibrate && navigator.vibrate(fuerte ? 18 : 8); } catch (e) {}
  };
  // sonido corto al tocar un botón de menú, pausa o fin (Apple pide estado apretado con sonido). Jugando no:
  // cada acción ya tiene su sonido (salto, disparo, granada) y un clic encima de la ráfaga molesta.
  const clic = () => { try { if (typeof tone === 'function' && !(typeof muted !== 'undefined' && muted)) tone('square', 1400, 1150, 0.025, 0.018); } catch (e) {} };
  const esMantener = a => typeof a === 'string' && a.startsWith('mantener:');
  // página de historieta de un jefe (pagina.js): el juego espera. Los botones quedan sostenidos (keys) pero no
  // "tocados" (pressed), así saltar con ✕ o disparar no la saltean, igual que la tecla de saltar en la Mac.
  // La pasa un toque fuera de los controles (ver más abajo). II sí pausa.
  const enPagina = () => typeof VIN !== 'undefined' && !!VIN;
  function bajar(a) {
    try { audioInit(); } catch (e) {}
    if (!cuenta[a]) { if (!keys[a] && (a === 'pause' || !enPagina())) pressed[a] = true; keys[a] = true; }
    cuenta[a] = (cuenta[a] || 0) + 1;
  }
  function subir(a) { if (!cuenta[a]) return; if (--cuenta[a] <= 0) { cuenta[a] = 0; keys[a] = false; } }
  // △ con RUEDA: TOCAR (opción del juego, ACC.rueda): al apoyar no aprieta nada. Si el dedo se desliza a un costado
  // cambia al arma anterior o siguiente (OXIDO_RUEDA.cambiar); si se levanta sin deslizar, es un toque y abre o cierra
  // la rueda (pulso corto de 'air'). Así no se pierde el cambio rápido de arma.
  const ruedaTocar = () => typeof ACC !== 'undefined' && !!ACC && ACC.rueda === 'tocar' && !!rueda();
  const gestos = {}; // pointerId → { x, y, u, deslizo }
  function pulso(a) { bajar(a); setTimeout(() => subir(a), 60); }
  function soltarDedo(id, levantado = false) {
    const a = dedos[id];
    if (a === 'gesto:air') { if (levantado && gestos[id] && !gestos[id].deslizo) pulso('air'); delete gestos[id]; }
    else if (esMantener(a)) { clearTimeout(relojes[id]); delete relojes[id]; } else if (a) subir(a);
    delete dedos[id]; delete dedosEn[id];
  }
  function soltarPalanca() { palancaDedo = null; centro = null; zona.classList.remove('toca'); base.style.left = base.style.top = ''; direccion(null); }
  function soltarTodo() {
    for (const id in dedos) soltarDedo(id);
    for (const a in cuenta) if (cuenta[a]) { cuenta[a] = 0; keys[a] = false; }
    soltarPalanca(); marcar();
  }

  // qué acción hace un botón en la pantalla actual (null = nada)
  function accion(b) {
    if (b.classList.contains('espera')) return null; // fin del juego recién aparecido: el juego todavía no escucha
    if (b.dataset.a !== 'ps') return b.dataset.a;
    return (MAPA[raiz.dataset.modo] || {})[b.dataset.k] || null;
  }
  function botonEn(x, y) {
    let n = document.elementFromPoint(x, y);
    while (n && n !== raiz) { if (n.classList && n.classList.contains('b') && n.dataset.a) return n; n = n.parentNode; }
    return null;
  }
  function marcar() {
    const tocados = new Set(Object.values(dedosEn));
    raiz.querySelectorAll('.b').forEach(b => b.classList.toggle('a', tocados.has(b)));
    // anillo: ○ mantenido para terminar y, sin rueda de armas, △ mantenido jugando (avión)
    const cargando = new Set(Object.keys(dedos).filter(id => (dedos[id] === 'air' && !rueda()) || esMantener(dedos[id])).map(id => dedosEn[id]));
    for (const k in rombo) rombo[k].classList.toggle('carga', cargando.has(rombo[k]));
  }

  function apretar(id, b) {
    const a = accion(b);
    if (!a) return false; // botón sin uso en esta pantalla
    if (a === 'start' && estado() === 'select') pantallaCompleta();
    dedos[id] = a; dedosEn[id] = b;
    if (a === 'air' && raiz.dataset.modo === 'play' && ruedaTocar()) {
      dedos[id] = 'gesto:air'; const r = b.getBoundingClientRect();
      gestos[id] = { x: r.left + r.width / 2, y: r.top + r.height / 2, u: r.width / 0.84, deslizo: false };
    } else if (a === 'actualizar') { dedos[id] = null; try { window.OXIDO_ACTUALIZAR(); } catch (e) {} }
    else if (a.startsWith('tecla:')) { dedos[id] = null; tecla(a.slice(6)); }
    else if (a.startsWith('confirmar:')) { // primer toque: pregunta; segundo toque (en 3 s): lo hace
      dedos[id] = null;
      if (b.classList.contains('confirma')) { desarmar(); pressed[a.slice(10)] = true; }
      else { desarmar(); b.classList.add('confirma'); b.textContent = b.dataset.pregunta; armado = setTimeout(desarmar, 3000); }
    } else if (esMantener(a)) {
      relojes[id] = setTimeout(() => {
        delete relojes[id];
        if (dedos[id] !== a) return;
        const real = a.slice(9); pressed[real] = true; vibrar(true);
        dedos[id] = null; marcar(); // ya hizo lo suyo: el anillo se apaga
      }, DUR_TERMINAR * 1000);
    } else bajar(a);
    vibrar(); if (raiz.dataset.modo !== 'play' || b.classList.contains('chip')) clic();
    marcar(); despertar();
    return true;
  }
  raiz.addEventListener('pointerdown', e => {
    if (editando) return;
    const b = botonEn(e.clientX, e.clientY);
    if (!b || b === escribir) return;
    e.preventDefault();
    apretar(e.pointerId, b);
  });
  addEventListener('pointermove', e => {
    if (editando) return;
    if (e.pointerId === palancaDedo) { direccion(e); return; }
    // un dedo que quedó apoyado en la zona de la palanca (por ejemplo al volver de la pausa) la retoma
    if (palancaDedo === null && raiz.dataset.modo === 'play' && e.pointerType === 'touch' && !(e.pointerId in dedos) && raiz.classList.contains('on')) {
      const r = zona.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { tomarPalanca(e); return; }
    }
    // △ con RUEDA: TOCAR: deslizar a un costado cambia de arma (cada 0,35 del botón, un arma)
    const gs = gestos[e.pointerId];
    if (gs) {
      const dx = e.clientX - gs.x, dy = e.clientY - gs.y;
      if (Math.abs(dx) > gs.u * 0.35 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        gs.deslizo = true; gs.x = e.clientX; gs.y = e.clientY; // desde acá, otro tramo cambia otra arma
        const ru = rueda();
        try { if (ru && ru.cambiar) ru.cambiar(dx > 0 ? 1 : -1); } catch (err) {}
        vibrar();
      }
      return;
    }
    // jugando, el dedo se puede deslizar de un botón del rombo a otro (por ejemplo de □ a ✕)
    if (!(e.pointerId in dedos) || raiz.dataset.modo !== 'play') return;
    const b = botonEn(e.clientX, e.clientY);
    if (!b || b.dataset.a !== 'ps' || b === dedosEn[e.pointerId] || !accion(b)) return;
    soltarDedo(e.pointerId); apretar(e.pointerId, b);
  });
  function fin(e) {
    // iPhone: el sonido se habilita al levantar el dedo (audioUnlock, de audio.js, además toca un sonido mudo)
    try { if (typeof audioUnlock === 'function') audioUnlock(); else audioInit(); } catch (err) {}
    if (e.pointerId === palancaDedo) { soltarPalanca(); return; }
    if (!(e.pointerId in dedos)) return;
    soltarDedo(e.pointerId, e.type === 'pointerup'); marcar();
  }
  addEventListener('pointerup', fin);
  addEventListener('pointercancel', fin);

  // ---------- palanca flotante ----------
  // La dirección se mide desde donde apoyaste el dedo (apoyar sin mover no aprieta nada). Solo el dibujo
  // se corre hacia adentro si el dedo está muy cerca del borde.
  const radio = () => base.offsetWidth / 2;
  function direccion(e) {
    const nueva = {};
    if (e && centro) {
      const R = radio();
      let dx = e.clientX - centro.x, dy = e.clientY - centro.y, d = Math.hypot(dx, dy);
      // si el dedo se va lejos, la palanca lo sigue (no hace falta volver al centro para cambiar de lado)
      const max = R * 1.15;
      if (d > max) {
        centro.x += dx * (1 - max / d); centro.y += dy * (1 - max / d);
        dx = e.clientX - centro.x; dy = e.clientY - centro.y; d = max;
      }
      ubicarBase();
      if (d > R * 0.22) {
        const ux = dx / d, uy = dy / d, h = k => (dir[k] ? 0.06 : 0); // un poco de margen para que no titile
        // ← → hasta ~72° de la horizontal: ↗ casi vertical también corre (prueba con gente: no podían correr
        // disparando arriba). Igual que el joystick físico (input.js).
        if (ux > 0.3 - h('right')) nueva.right = 1; else if (ux < -0.3 + h('left')) nueva.left = 1;
        // agacharse pide más inclinación, para no frenar sin querer mientras corrés
        if (uy < -0.5 + h('up')) nueva.up = 1; else if (uy > 0.64 - h('down')) nueva.down = 1;
        // en los menús, una sola dirección por vez: la que más se movió (si no, ↗ cambia de fila y de opción a la vez)
        if (raiz.dataset.modo !== 'play' && (nueva.up || nueva.down) && (nueva.left || nueva.right)) {
          if (Math.abs(ux) > Math.abs(uy)) { delete nueva.up; delete nueva.down; } else { delete nueva.left; delete nueva.right; }
        }
      }
      angPalanca = d > R * 0.22 ? Math.atan2(dy, dx) : null; // para la rueda de armas (en cuadro())
      const k = Math.min(d, R * 0.8) / (d || 1);
      perilla.style.transform = `translate(${dx * k}px,${dy * k}px)`;
    } else { perilla.style.transform = ''; angPalanca = null; }
    for (const a of ['up', 'down', 'left', 'right']) {
      if (nueva[a] && !dir[a]) bajar(a);
      if (!nueva[a] && dir[a]) subir(a);
      marcas[a].classList.toggle('on', !!nueva[a]);
    }
    dir = nueva;
  }
  function ubicarBase() { // el dibujo, sin salirse de la zona
    const r = zona.getBoundingClientRect(), R = radio() * 0.7;
    base.style.left = (Math.max(r.left + R, Math.min(centro.x, r.right - R)) - r.left) + 'px';
    base.style.top = (Math.max(r.top + R, Math.min(centro.y, r.bottom - R)) - r.top) + 'px';
  }
  function tomarPalanca(e) {
    palancaDedo = e.pointerId;
    centro = { x: e.clientX, y: e.clientY };
    zona.classList.add('toca'); direccion(e); despertar();
  }
  const enZona = e => { if (getComputedStyle(zona).display === 'none') return false; const r = zona.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
  zona.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (editando) return;
    if (palancaDedo === null) tomarPalanca(e);
  });

  // ---------- ubicar los controles en las barras negras ----------
  // El juego se ve en 16:9 y fit() (base.js) lo centra: en un celular más ancho sobran barras a los costados,
  // y en una tablet sobra arriba y abajo. En la tablet el juego se sube, así abajo queda una sola barra más alta.
  // Si el rombo entra en una barra (con botones de 47 px o más), va ahí, centrado. Si no entra, se pega al borde,
  // que es lo que menos tapa. La palanca queda a la misma altura que el rombo, como en un joystick.
  // lugar y tamaño elegidos por el jugador en el editor (OXIDO_TACTIL_EDITAR, más abajo). Se guarda en el aparato.
  // k: tamaño (1 = el automático) · d: corrimiento de cada control, en unidades de --u (así sirve en cualquier pantalla)
  const LUGAR0 = () => ({ k: 1, d: {} });
  let lugar = (() => { try { const o = JSON.parse(leer('oxido-tactil-lugar') || 'null'); if (o && typeof o.k === 'number' && o.d && typeof o.d === 'object') return o; } catch (e) {} return LUGAR0(); })();
  const desp = n => (Array.isArray(lugar.d[n]) ? lugar.d[n] : [0, 0]);
  const guardarLugar = () => guardar('oxido-tactil-lugar', JSON.stringify(lugar));
  const lienzo = document.getElementById('c');
  const sonda = document.createElement('div'); // para leer los márgenes seguros (muesca, esquinas redondeadas)
  sonda.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
    'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
  document.body.appendChild(sonda);
  const M = 12, LADO = 2.36, U_MIN = 54, QUIETA = 0.85; // QUIETA = tamaño de la palanca en reposo (scale en el CSS) // borde · ancho y alto del rombo en unidades de --u · --u mínima
  let claveVieja = '';
  function acomodar() {
    if (!lienzo) return;
    const vw = innerWidth, vh = innerHeight, on = raiz.classList.contains('on');
    const cs = getComputedStyle(sonda), px = k => parseFloat(cs[k]) || 0;
    // De los márgenes seguros se usa el de abajo (la barrita de inicio) y el de arriba. Los de los costados no: en el
    // iPhone acostado son ~47-59 px de cada lado (por la muesca, que ocupa solo el medio de un costado) y empujaban
    // la palanca y el rombo encima del juego. Abajo y en las esquinas no hay muesca, y ahí van los controles.
    const sl = 0, sr = 0, sb = px('paddingBottom'), st = px('paddingTop');
    raiz.style.setProperty('--sl', '0px'); raiz.style.setProperty('--sr', '0px');
    const clave = [vw, vh, lienzo.offsetWidth, lienzo.offsetHeight, sb, st, on, JSON.stringify(lugar)].join();
    if (clave === claveVieja) return;
    claveVieja = clave;
    const hueco = vh - lienzo.offsetHeight, arriba = on && hueco > 2;
    document.documentElement.classList.toggle('ox-arriba', arriba);
    document.documentElement.style.setProperty('--ox-top', (arriba ? Math.min(st, hueco) : 0) + 'px');
    const r = lienzo.getBoundingClientRect();
    const bl = r.left, br = vw - r.right, bb = vh - r.bottom; // barras: izquierda, derecha, abajo
    const u0 = Math.max(U_MIN, Math.min(0.155 * vh, 72));
    const uLado = (Math.min(bl - sl, br - sr) - 2 * M) / LADO, uAbajo = (bb - sb - M - 6) / LADO;
    const entra = Math.max(uLado, uAbajo) >= U_MIN;
    const u = (entra ? Math.min(u0, Math.max(uLado, uAbajo)) : u0) * lugar.k, lado = LADO * u, R = 0.95 * u * QUIETA;
    let rx = sr + M, ry = sb + M;
    if (entra && uLado >= uAbajo) rx = Math.max(rx, (br - lado) / 2);
    else if (entra) ry = Math.max(ry, (bb - lado) / 2);
    // palanca en reposo: a la altura del centro del rombo; en la barra de la izquierda si entra
    const cx = entra && uLado >= uAbajo ? Math.max(sl + M + R, bl / 2) : sl + M + R;
    const cy = vh - (ry + lado / 2);
    // II: en la barra de la izquierda (arriba, lejos de la esquina redondeada), o en el medio de la barra de abajo,
    // o, si no hay barras, a la izquierda justo debajo del marcador (y = 38 del juego), para no pisar el HUD
    const pw = Math.max(46, 0.7 * u), k0 = r.width / 320;
    let ppx, ppy;
    if (bl >= pw + 16) { ppx = (bl - pw) / 2; ppy = st + 16; }
    else if (bb - sb >= pw + 16) { ppx = (vw - pw) / 2; ppy = r.bottom + (bb - sb - pw) / 2; }
    else { ppx = 10; ppy = Math.max(st + 10, r.top + 38 * k0); }
    // salidas con texto: en el medio de la barra de abajo si entran (tablet). Si no (celular): VOLVER arriba a la
    // izquierda, y las de pausa, fin y nombre en fila abajo, centradas entre la palanca y el rombo
    const abajo = bb - sb >= pw + 16;
    salidas.dataset.fila = abajo ? 'abajo' : 'lado';
    // (VOLVER bien arriba: más abajo tapaba la tarjeta del personaje en la elección)
    const ssx = abajo ? vw / 2 : sl + 10, ssy = abajo ? r.bottom + (bb - sb - pw) / 2 : st + 6;
    const v = { '--u': u, '--rx': rx, '--ry': ry, '--px': ppx, '--py': ppy, '--sx': ssx, '--sy': ssy,
      '--sx2': (vw - rx - lado) / 2 + (cx + R) / 2, '--sy2': vh - sb - pw - 10,
      '--bx': cx - (sl + 24), '--by': cy - (st + 0.95 * u) }; // la zona de la palanca empieza en (sl + 24, st + 0,95u)
    for (const k in v) raiz.style.setProperty(k, v[k].toFixed(1) + 'px');
    // corrimientos del editor (translate no se mezcla con el scale de apretado)
    const D = n => { const [a, b] = desp(n); return [a * u, b * u]; };
    const tr = n => { const [a, b] = D(n); return a || b ? `${a.toFixed(1)}px ${b.toFixed(1)}px` : ''; };
    for (const n of ['x', 'o', 'c', 't']) rombo[n].style.translate = tr(n);
    pausa.style.translate = tr('pausa');
    { const [a, b] = D('palanca'); raiz.style.setProperty('--pdx', a.toFixed(1) + 'px'); raiz.style.setProperty('--pdy', b.toFixed(1) + 'px'); }
    // centro de cada botón del rombo y de la palanca en reposo, ya corridos
    const rb = 0.42 * u;
    const en = (n, der, aba) => { const [a, b] = D(n); return [vw - der - rb + a, vh - aba - rb + b]; };
    const C = { x: en('x', rx + 0.76 * u, ry), o: en('o', rx, ry + 0.76 * u), c: en('c', rx + 1.52 * u, ry + 0.76 * u), t: en('t', rx + 0.76 * u, ry + 1.52 * u) };
    const pal = (([a, b]) => [cx + a, cy + b])(D('palanca')), pp = (([a, b]) => [ppx + pw / 2 + a, ppy + pw / 2 + b])(D('pausa'));
    // franja libre para la ayuda del menú, en coordenadas del juego
    const k = r.width / (typeof W === 'number' ? W : 320);
    const izqRombo = Math.min(...Object.values(C).map(q => q[0] - rb)), arribaRombo = Math.min(...Object.values(C).map(q => q[1] - rb));
    window.OXIDO_TACTIL_LIBRE = on && k > 0 ? {
      x0: Math.max(0, Math.ceil((pal[0] + R - r.left) / k)),
      x1: Math.min(r.width / k, Math.floor((izqRombo - r.left) / k)),
      y0: Math.max(0, Math.floor((Math.min(arribaRombo, pal[1] - R) - r.top) / k)),
    } : null;
    // dónde está cada control, en coordenadas del juego (centro y radio), para la tarjeta de CONTROLES
    // dibujada (js/controles.js). Pueden caer fuera de 0..W × 0..H: están en las barras negras.
    const g = ([X, Y], rad) => ({ x: (X - r.left) / k, y: (Y - r.top) / k, r: rad / k });
    window.OXIDO_TACTIL_POS = on && k > 0 ? {
      k, x: g(C.x, rb), o: g(C.o, rb), c: g(C.c, rb), t: g(C.t, rb), pausa: g(pp, pw / 2), palanca: g(pal, R),
    } : null;
  }
  addEventListener('resize', acomodar);

  // ---------- teclado del celular para el nombre del récord ----------
  // Las letras llegan al juego como teclas (historial.js ya sabe leerlas). Si el teclado manda teclas con
  // nombre, historial.js las toma directo. Si no (iPhone a veces manda "Unidentified", y los teclados que
  // arman palabras, como Gboard, mandan la palabra entera cada vez), se compara lo que hay en el campo con
  // lo que había y se mandan solo las diferencias: letras nuevas o borrados.
  const tecla = key => dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  let previo = '';
  escribir.addEventListener('click', () => {
    campo.value = ''; previo = '';
    campo.style.pointerEvents = 'auto';
    campo.blur(); campo.focus(); // blur antes: en Android, si quedó con foco, focus() solo no reabre el teclado
  });
  campo.addEventListener('input', () => {
    const v = campo.value.toUpperCase();
    let comun = 0;
    while (comun < v.length && comun < previo.length && v[comun] === previo[comun]) comun++;
    for (let i = previo.length; i > comun; i--) tecla('Backspace');
    for (const ch of v.slice(comun)) tecla(ch);
    previo = v;
  });
  const delCampo = new Set(); // teclas que bajaron en el campo: su keyup llega después del blur y no es "teclado de verdad"
  campo.addEventListener('keydown', e => {
    e.stopPropagation(); delCampo.add(e.key);
    if (e.key === 'Enter') { e.preventDefault(); campo.blur(); tecla('Enter'); }
  });
  // historial.js se queda con el keydown del nombre (stopImmediatePropagation) y el campo se cierra al guardar:
  // el keyup de esa tecla llega después, fuera del campo. Lo que se suelta hasta 0,5 s después de cerrarlo
  // viene del teclado del celular, no de uno de verdad (con la máquina cargada pasaba y escondía los controles).
  let campoCerrado = -1e9;
  campo.addEventListener('blur', () => { campo.style.pointerEvents = 'none'; campoCerrado = performance.now(); });

  // ---------- pantalla completa (Android) y aviso de "Agregar a inicio" (iPhone) ----------
  function pantallaCompleta() {
    if (esIOS || instalada || !document.fullscreenEnabled || document.fullscreenElement) return;
    document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}))
      .catch(() => {});
  }
  if (esIOS && !instalada && leer('oxido-inicio-visto') !== '1') raiz.classList.add('inicio-on');
  inicio.querySelector('button').addEventListener('click', () => { raiz.classList.remove('inicio-on'); guardar('oxido-inicio-visto', '1'); });

  // ---------- el gesto de "atrás" (Android) pausa en vez de salir del juego ----------
  let resguardo = false;
  function ponerResguardo() { if (!resguardo) { try { history.pushState({ oxido: 1 }, ''); resguardo = true; } catch (e) {} } }
  addEventListener('popstate', () => {
    resguardo = false;
    const s = estado();
    if (s === 'play' || s === 'pause') { if (s === 'play') state = 'pause'; ponerResguardo(); }
  });

  // ---------- la pantalla no se apaga mientras jugás ----------
  let traba = null, pidiendo = false, falloEn = -1e9;
  function pantallaEncendida(quiero) {
    if (!('wakeLock' in navigator)) return;
    if (quiero && !traba && !pidiendo && document.visibilityState === 'visible' && performance.now() - falloEn > 5000) {
      pidiendo = true;
      navigator.wakeLock.request('screen')
        .then(t => { traba = t; t.addEventListener('release', () => { traba = null; }); })
        .catch(() => { falloEn = performance.now(); })
        .finally(() => { pidiendo = false; });
    } else if (!quiero && traba) { traba.release().catch(() => {}); traba = null; }
  }

  // ---------- ¿el aparato está parado? ----------
  // Se mira la orientación del aparato, no la forma de la ventana: en pantalla dividida (iPad con Split View)
  // la ventana puede ser angosta con el aparato acostado, y ahí no hay que pedir que lo giren.
  function parado() {
    const o = screen.orientation && screen.orientation.type;
    if (o) return o.startsWith('portrait');
    if (typeof window.orientation === 'number') return window.orientation % 180 === 0;
    return innerHeight > innerWidth;
  }

  // ---------- mostrar y esconder ----------
  let ultimoToque = performance.now();
  function despertar() { ultimoToque = performance.now(); raiz.classList.remove('quieto'); }
  function mostrar() { window.OXIDO_TOQUE = true; raiz.classList.add('on'); ponerResguardo(); acomodar(); }
  function esconder() {
    if (editando) cerrarEditor();
    window.OXIDO_TOQUE = false;
    if (raiz.classList.contains('on')) { raiz.classList.remove('on'); soltarTodo(); }
    acomodar();
  }
  // ---------- tocar una opción del menú la elige (como el mouse: raton.js anota las zonas de cada menú) ----------
  // Un toque corto y quieto sobre una opción: al apoyar la resalta (sobre) y al levantar la elige (clic). Si el dedo
  // se mueve, es la palanca y no elige nada. Los botones en pantalla que hacen algo tienen prioridad.
  const toques = {}; // pointerId → { x, y, t, z }
  // ¡CAÍSTE! y la placa de misión cumplida también: sus botones son grandes y dicen qué hacen (y el juego espera
  // un momento antes de aceptarlos, así un disparo al caer no elige nada)
  const tocaMenu = () => raiz.dataset.modo === 'menu' || raiz.dataset.modo === 'nombre' || raiz.dataset.modo === 'pausa' || estado() === 'over' || estado() === 'win';
  // en la pausa solo la franja de ayudas de abajo (DIFICULTAD, VIDAS ∞…): arriba está el texto "salir" del juego,
  // que saldría sin preguntar (para eso está SALIR AL MENÚ, que pregunta)
  const zonaPermitida = z => raiz.dataset.modo !== 'pausa' || z.y >= 100;
  function zonaMenuEn(x, y) {
    if (typeof RA_zonas === 'undefined' || !lienzo || !RA_zonas.length) return null;
    const r = lienzo.getBoundingClientRect(), hc = typeof HC === 'number' ? HC : H;
    const gx = (x - r.left) / r.width * W, gy = (y - r.top) / r.height * hc, pad = 3; // un dedo no es tan preciso como el mouse
    for (let i = RA_zonas.length - 1; i >= 0; i--) {
      const z = RA_zonas[i];
      if (gx >= z.x - pad && gx <= z.x + z.w + pad && gy >= z.y - pad && gy <= z.y + z.h + pad) return z;
    }
    return null;
  }
  const mismaZona = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h; // se rearman cada cuadro
  addEventListener('pointerdown', e => {
    // un botón en pantalla que no hace nada en esta pantalla (□ y △ en un menú) no tapa la opción de abajo
    const bt = botonEn(e.clientX, e.clientY);
    if (editando || e.pointerType !== 'touch' || !tocaMenu() || (bt && accion(bt))) return;
    const z = zonaMenuEn(e.clientX, e.clientY);
    if (!z || !zonaPermitida(z)) return;
    toques[e.pointerId] = { x: e.clientX, y: e.clientY, t: performance.now(), z };
    try { if (z.sobre) z.sobre(); } catch (err) {}
  }, true);
  addEventListener('pointermove', e => {
    const q = toques[e.pointerId];
    if (q && Math.hypot(e.clientX - q.x, e.clientY - q.y) > 14) delete toques[e.pointerId];
  }, true);
  addEventListener('pointerup', e => {
    const q = toques[e.pointerId]; delete toques[e.pointerId];
    if (!q || performance.now() - q.t > 700 || !tocaMenu()) return;
    const z = zonaMenuEn(e.clientX, e.clientY);
    if (!mismaZona(z, q.z) || !z.clic) return;
    try { audioInit(); } catch (err) {}
    if (typeof dev1 !== 'undefined') { dev1 = -1; devAny = -1; } // como en raton.js: el que eligió es el jugador 1
    try { z.clic(); } catch (err) {}
    vibrar(); clic();
  }, true);
  addEventListener('pointercancel', e => { delete toques[e.pointerId]; }, true);

  // ---------- intro jugable de la misión 1 (intro.js): un toque en OMITIR la saltea ----------
  // window.OXIDO_INTRO = { activa(), omitir(), rect() }: rect() da el botón en unidades del juego (320 de ancho) o null.
  // Se toca con un margen de 6 unidades (el botón dibujado es chico para un dedo) y antes que la palanca.
  addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch' || editando || raiz.dataset.modo !== 'play' || !lienzo) return;
    const I = window.OXIDO_INTRO;
    if (!I || typeof I.rect !== 'function' || typeof I.omitir !== 'function') return;
    let q = null; try { q = I.rect(); } catch (err) {}
    if (!q) return;
    const r = lienzo.getBoundingClientRect(), k = r.width / (typeof W === 'number' ? W : 320), pad = 6;
    const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
    if (x < q.x - pad || x > q.x + q.w + pad || y < q.y - pad || y > q.y + q.h + pad) return;
    e.preventDefault(); e.stopPropagation();
    try { I.omitir(); } catch (err) {}
    vibrar(); clic();
  }, true);

  addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    // página de historieta de un jefe (pagina.js): la pasa un toque fuera de los botones y de la palanca, después de
    // 0,5 s, como un clic en la Mac. Saltar, disparar o agarrar la palanca no la saltean (ver bajar()).
    if (typeof VIN !== 'undefined' && VIN && VIN.t >= 30 && !botonEn(e.clientX, e.clientY) && !enZona(e)) VIN.saltar = true;
    const estaban = raiz.classList.contains('on');
    mostrar(); despertar();
    if (estaban || editando) return;
    // estaban escondidos (iPad con teclado): el toque cayó en el juego, no en un botón. Si donde tocaste ahora
    // hay un botón o la palanca, ese mismo toque ya lo aprieta (no hay que tocar dos veces).
    const b = botonEn(e.clientX, e.clientY);
    if (b && b !== escribir) { e.preventDefault(); apretar(e.pointerId, b); return; }
    const r = zona.getBoundingClientRect();
    if (palancaDedo === null && getComputedStyle(zona).display !== 'none' && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { e.preventDefault(); tomarPalanca(e); }
  }, true);
  // teclado de verdad: se esconden (las teclas que manda ESCRIBIR no cuentan). keyup también: en la
  // pantalla del nombre, historial.js frena el keydown.
  const deTeclado = e => e.isTrusted && e.target !== campo && document.activeElement !== campo;
  addEventListener('keydown', e => { if (deTeclado(e)) esconder(); }, true);
  addEventListener('keyup', e => {
    if (delCampo.delete(e.key) || performance.now() - campoCerrado < 500) return;
    if (deTeclado(e)) esconder();
  }, true);
  addEventListener('blur', soltarTodo);
  document.addEventListener('visibilitychange', () => { if (document.hidden) soltarTodo(); });
  // sin zoom con dos dedos, sin lupa ni menú al mantener, sin gestos del navegador sobre los controles
  for (const ev of ['gesturestart', 'gesturechange', 'contextmenu']) document.addEventListener(ev, e => e.preventDefault());
  raiz.addEventListener('touchstart', e => { if (!e.target.closest('.escribir,.inicio') && e.target !== campo) e.preventDefault(); }, { passive: false });
  raiz.addEventListener('touchmove', e => { if (e.target !== campo) e.preventDefault(); }, { passive: false });

  // ---------- editor: acomodar los botones y la palanca (OPCIONES › CONTROLES › BOTONES EN PANTALLA) ----------
  // El juego llama a window.OXIDO_TACTIL_EDITAR(). Tapa todo y toma todos los toques hasta LISTO: se arrastra cada
  // botón del rombo, II y la palanca en reposo; − y + cambian el tamaño; RESTABLECER vuelve a lo automático.
  let editando = false;
  const arrastres = {}; // pointerId → { n, x, y, d0, u, el }
  const tam = editor.querySelector('.tam');
  const elDe = n => (n === 'palanca' ? base : n === 'pausa' ? pausa : rombo[n]);
  const uActual = () => parseFloat(raiz.style.getPropertyValue('--u')) || 60;
  function marcarTam() { tam.textContent = Math.round(lugar.k * 100) + '%'; }
  function abrirEditor() {
    mostrar(); soltarTodo(); editando = true; raiz.classList.add('editando'); marcarTam(); acomodar();
    // se acomodan para jugar: los botones muestran el dibujo de la partida (saltar, disparar…), no el del menú
    for (const k in rombo) { const ic = iconoDe('play', MAPA.play[k]); rombo[k].classList.toggle('sin-acc', !ic); rombo[k].querySelector('.acc').innerHTML = ic ? DIBUJO[ic] : ''; }
  }
  function cerrarEditor() {
    editando = false; raiz.classList.remove('editando');
    modoViejo = ''; // cuadro() vuelve a poner los dibujos de la pantalla en la que está
    for (const id in arrastres) { arrastres[id].el.classList.remove('a'); delete arrastres[id]; }
    guardarLugar(); acomodar();
  }
  window.OXIDO_TACTIL_EDITAR = abrirEditor;
  function accionEditor(a) {
    if (a === 'menos') lugar.k = Math.max(0.8, Math.round((lugar.k - 0.1) * 10) / 10);
    else if (a === 'mas') lugar.k = Math.min(1.5, Math.round((lugar.k + 0.1) * 10) / 10);
    else if (a === 'restablecer') lugar = LUGAR0();
    else if (a === 'listo') { cerrarEditor(); vibrar(); clic(); return; }
    marcarTam(); acomodar(); guardarLugar(); vibrar(); clic();
  }
  raiz.addEventListener('pointerdown', e => {
    if (!editando) return;
    e.preventDefault();
    const bt = e.target.closest && e.target.closest('[data-ed]');
    if (bt) { accionEditor(bt.dataset.ed); return; }
    const t = e.target.closest && e.target.closest('.ps, .pausa, .base');
    if (!t) return;
    const n = t.classList.contains('ps') ? t.dataset.k : t.classList.contains('pausa') ? 'pausa' : 'palanca';
    arrastres[e.pointerId] = { n, x: e.clientX, y: e.clientY, d0: desp(n).slice(), u: uActual(), el: t };
    t.classList.add('a'); vibrar();
  });
  addEventListener('pointermove', e => {
    const q = arrastres[e.pointerId];
    if (!editando || !q) return;
    lugar.d[q.n] = [q.d0[0] + (e.clientX - q.x) / q.u, q.d0[1] + (e.clientY - q.y) / q.u];
    acomodar();
  });
  function soltarArrastre(e) {
    const q = arrastres[e.pointerId];
    if (!q) return;
    delete arrastres[e.pointerId]; q.el.classList.remove('a');
    // que no quede afuera de la pantalla
    const r = q.el.getBoundingClientRect(); let ax = 0, ay = 0;
    if (r.left < 4) ax = 4 - r.left; else if (r.right > innerWidth - 4) ax = innerWidth - 4 - r.right;
    if (r.top < 4) ay = 4 - r.top; else if (r.bottom > innerHeight - 4) ay = innerHeight - 4 - r.bottom;
    if (ax || ay) { const d = desp(q.n); lugar.d[q.n] = [d[0] + ax / q.u, d[1] + ay / q.u]; acomodar(); }
    guardarLugar();
  }
  addEventListener('pointerup', soltarArrastre);
  addEventListener('pointercancel', soltarArrastre);

  // ---------- salidas con texto ----------
  // [texto, acción, pregunta (si pide un segundo toque), rojo]
  let armado = null, salidasViejas = '';
  function desarmar() {
    clearTimeout(armado); armado = null;
    for (const c of chips) if (c.classList.contains('confirma')) { c.classList.remove('confirma'); c.textContent = c.dataset.texto; }
  }
  function salidasDe(s) {
    const salir = (t, p) => [t, 'confirmar:quit', p, true];
    if (s === 'pause') {
      const l = [['▶ SEGUIR', 'pause'], salir('SALIR AL MENÚ', '¿SALIR? TOCÁ OTRA VEZ')];
      // durante la intro de la misión 1 (intro.js) el juego omite la intro con 'bomb' en la pausa (juego.js)
      try { if (window.OXIDO_INTRO && OXIDO_INTRO.activa()) l.push(['OMITIR INTRO ▶▶', 'bomb']); } catch (e) {}
      // hay versión nueva del juego (registrar.js): se actualiza desde la pausa, nunca jugando
      if (typeof window.OXIDO_ACTUALIZAR === 'function') l.push(['ACTUALIZAR ↻', 'actualizar']);
      return l;
    }
    if (s === 'win') return [['SEGUIR ▶', 'start'], salir('SALIR AL MENÚ', '¿SALIR? TOCÁ OTRA VEZ')];
    if (s === 'over') return typeof FIN_updCaiste === 'function' ? [] // ¡CAÍSTE! (fin.js) ya dibuja CONTINUAR y TERMINAR, que se tocan
      : typeof contQuedan !== 'function' || contQuedan() > 0
        ? [['CONTINUAR ▶', 'start'], salir('TERMINAR', '¿TERMINAR? TOCÁ OTRA VEZ')]
        : [['TERMINAR', 'start', '', true]]; // sin continuaciones, ✕ ya termina
    if (s === 'nombre') return [['LISTO ✓', 'tecla:Escape']]; // Escape: guarda lo escrito (o el último nombre)
    if (!s || s === 'title' || s === 'play') return [];
    return [['‹ VOLVER', 'back']]; // elección, logros, récords y cualquier pantalla de menú nueva
  }
  function ponerSalidas(s) {
    const l = salidasDe(s), clave = JSON.stringify(l);
    if (clave === salidasViejas) return;
    salidasViejas = clave; desarmar();
    chips.forEach((c, i) => {
      const d = l[i];
      c.classList.toggle('ver', !!d);
      if (!d) { delete c.dataset.a; return; }
      c.dataset.texto = c.textContent = d[0]; c.dataset.a = d[1]; c.dataset.pregunta = d[2] || ''; c.classList.toggle('rojo', !!d[3]);
    });
  }

  // cada cuadro: modo según la pantalla del juego y avisos
  let modoViejo = '', pantallaVieja = '';
  function cuadro() {
    requestAnimationFrame(cuadro);
    acomodar(); // no hace nada si no cambió el tamaño (en iPhone, al girar, resize a veces llega antes que el tamaño nuevo)
    const s = estado();
    const modo = s === 'play' ? 'play' : s === 'pause' ? 'pausa' : s === 'nombre' ? 'nombre' : s === 'over' || s === 'win' ? 'fin' : 'menu';
    if (modo !== modoViejo) {
      soltarTodo(); raiz.dataset.modo = modo; modoViejo = modo; despertar();
      // los botones del rombo que no hacen nada en esta pantalla se apagan
      for (const k in rombo) {
        const a = (MAPA[modo] || {})[k], ic = iconoDe(modo, a);
        rombo[k].classList.toggle('apagado', !a);
        rombo[k].classList.toggle('sin-acc', !ic);
        rombo[k].querySelector('.acc').innerHTML = ic ? DIBUJO[ic] : '';
        rombo[k].dataset.icono = ic || '';
      }
      // al salir de la pantalla del nombre se cierra el teclado del celular (el Enter lo toma historial.js)
      if (modo !== 'nombre' && document.activeElement === campo) campo.blur();
    }
    if (s !== pantallaVieja) { raiz.dataset.pantalla = s; pantallaVieja = s; }
    // rueda de armas abierta: la palanca apunta con su ángulo exacto (no solo 8 direcciones), también si el
    // pulgar ya estaba inclinado cuando se abrió
    const ru = rueda();
    try { if (ru && s === 'play' && typeof ru.abierta === 'function' && ru.abierta() && typeof ru.apuntar === 'function') ru.apuntar(angPalanca); } catch (e) {}
    ponerSalidas(s);
    const espera = (s === 'over' || s === 'win') && typeof overT === 'number' && overT <= 45;
    for (const c of chips) c.classList.toggle('espera', espera);
    // página de historieta de un jefe: los controles casi desaparecen (tapaban el nombre del jefe; el juego espera)
    raiz.classList.toggle('pagina', typeof VIN_activo === 'function' && VIN_activo());
    raiz.classList.toggle('sin-mov', typeof ACC !== 'undefined' && !!ACC && ACC.mov === 'reducido');
    // DISPARO: ALTERNADO: el juego decide (cada toque de □ empieza o para); acá solo se muestra si sigue disparando
    rombo.c.classList.toggle('sigue', s === 'play' && typeof ACC !== 'undefined' && !!ACC && ACC.disparo === 'alternado'
      && typeof ACC_fuego !== 'undefined' && !!ACC_fuego[0]);
    // jugando y sin tocar un rato: los controles se aclaran para ver mejor el juego
    if (modo === 'play' && palancaDedo === null && !Object.keys(dedos).length && performance.now() - ultimoToque > 2500) raiz.classList.add('quieto');
    // celular parado: "Girá la pantalla" y, si estaba jugando, pausa. Una tablet parada (700 px o más de ancho)
    // se juega igual: el juego entra arriba y los controles en la barra de abajo.
    const p = raiz.classList.contains('on') && parado() && innerWidth < 700;
    raiz.classList.toggle('parado', p);
    if (p && s === 'play') state = 'pause';
    pantallaEncendida(s === 'play');
  }
  requestAnimationFrame(cuadro);
  // joystick: si se aprieta un botón o se mueve la palanca, los controles en pantalla se esconden
  setInterval(() => {
    const l = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const g of l) {
      if (g && (g.buttons.some(b => b && b.pressed) || Math.abs(g.axes[0] || 0) > 0.5 || Math.abs(g.axes[1] || 0) > 0.5)) { esconder(); break; }
    }
  }, 150);
  if (soloTactil) mostrar();
})();
