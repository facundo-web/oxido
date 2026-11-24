'use strict';
// Óxido · Registro de la prueba con personas (área de Pruebas). Se carga SOLO con ?prueba=1 en la dirección.
// Anota en el aparato (localStorage 'oxido-prueba-registro'), sin mandar nada a internet:
//   muertes (misión, tramo, qué te pegó, segundo de la misión) · tiempo por tramo · armas y cuánto tiempo con cada una ·
//   granadas, avión, rueda de armas y vehículo · intro completa u omitida · teclas, joystick o pantalla usados.
//   Además: indicaciones de tecla que salieron en el prólogo por atascarse (paso y tecla) y si entró a M1 sin ayuda;
//   al caer (¡CAÍSTE!), si eligió CONTINUAR o TERMINAR, en qué misión y tramo.
// No cambia nada del juego: solo mira (ON_EVENT, ON_STEP y eventos del navegador) y no escribe en otras claves.
// Un botoncito "REGISTRO" arriba abre el resumen: COPIAR, DESCARGAR y NUEVA PERSONA (guarda la actual y empieza otra).
// Al abrir el resumen, si estaba jugando, pausa.
// Prefijo RP_.
(function () {
  if (!/[?&]prueba=1\b/.test(location.search)) return;
  const CLAVE = 'oxido-prueba-registro';
  const ahora = () => Date.now();
  let todo; try { todo = JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { todo = null; }
  if (!todo || !Array.isArray(todo.personas)) todo = { personas: [] };
  const nueva = n => ({ persona: n, inicio: new Date().toISOString(), msJugados: 0, partidas: 0, misiones: {}, muertes: [], armas: {}, granadas: 0, aviones: 0,
    ruedaVeces: 0, ruedaSeg: 0, vehiculos: {}, caminosM2: { arriba: false, abajo: false, arpon: false, salaSecreta: false }, intro: null, teclas: {}, joystick: { id: null, botones: 0 }, toques: 0, mouse: 0, fines: [], hitos: [], pistasIntro: [], caidas: [], terreno: null });
  if (!todo.actual) todo.actual = nueva(todo.personas.length + 1);
  const R = todo.actual; R.pistasIntro = R.pistasIntro || []; R.caidas = R.caidas || [];
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(todo)); } catch (e) {} };
  const hito = s => { R.hitos.push(Math.round((ahora() - t0) / 1000) + ' s · ' + s); if (R.hitos.length > 200) R.hitos.shift(); };
  const t0 = ahora() - (R.msJugados || 0);
  const mis = () => (typeof levelIdx !== 'undefined' ? levelIdx + 1 : 0);
  const M = () => (R.misiones[mis()] = R.misiones[mis()] || { segundos: 0, muertes: 0, ganada: false, tramos: [], llegoJefe: false, llegoVillano: false });
  const tramo = () => { try { return PC_mis && PC_mis.cur ? PC_mis.cur.n : (PC_mis ? PC_mis.tramos.length + 1 : null); } catch (e) { return null; } };
  const enIntro = () => typeof IN !== 'undefined' && IN.activa;
  const segMision = () => { try { return Math.round((typeof JT !== 'undefined' ? JT.mis : timeF) / 60); } catch (e) { return null; } };
  const nombreDe = c => !c ? 'no se sabe' : (c.name || ({ soldier: 'soldado', grenadier: 'granadero', shield: 'escudero', drone: 'dron', turret: 'torreta' })[c.type] || c.type || c.kind || 'algo');

  // ---------- al caer (¡CAÍSTE!): ¿CONTINUAR o TERMINAR?, en qué misión y tramo (pedido de Dirección) ----------
  try {
    const caida = como => { R.caidas.push({ eligio: como, mision: mis(), tramo: tramo(), seg: segMision() }); hito('al caer elige ' + como + ' (misión ' + mis() + ', tramo ' + (tramo() ?? '-') + ')'); guardar(); };
    if (typeof continuar === 'function') { const c0 = continuar; window.continuar = function () { if (typeof state !== 'undefined' && state === 'over') caida('CONTINUAR'); return c0.apply(this, arguments); }; }
    if (typeof FIN_terminar === 'function') { const f0 = FIN_terminar; window.FIN_terminar = function () { if (typeof state !== 'undefined' && state === 'over') caida('TERMINAR'); return f0.apply(this, arguments); }; }
  } catch (e) {}

  // ---------- terreno (terreno.js, Mecánicas): muertes paradas en una zona y si el cambio de una cinta las agarra desprevenidas ----------
  try {
    if (typeof TR !== 'undefined' || typeof V2_rampas !== 'undefined') {
      const T0 = R.terreno = R.terreno || { muertes: 0, cambiosEncima: 0, cambiosEnElAire: 0, golpesTrasCambio: 0, muertesTrasCambio: 0, golpesEnZona: 0, golpesEnZonaAire: 0, porMision: {} };
      let trM = 0, ult = null, hp = null, muerto = false; const dirs = new WeakMap(), arde = new WeakMap(); let v2t0 = null, v2seco = false, vapVuela = false, vapT = null, luzPlat = null, luzT = null, corrZ = null, corrT = 0; const vapDentro = new WeakMap();
      ON_STEP.push(() => { try { if (state !== 'play' || !P || enIntro()) return;
        if (typeof TR !== 'undefined' && TR.muertes < trM) trM = 0; if (typeof TR !== 'undefined' && TR.muertes > trM) { T0.muertes += TR.muertes - trM; T0.porMision[mis()] = (T0.porMision[mis()] || 0) + TR.muertes - trM; trM = TR.muertes; hito('muere parada en el terreno (misión ' + mis() + ')'); guardar(); }
        const z = typeof TR_en === 'function' ? TR_en(P) : null;
        for (const q of (typeof TR !== 'undefined' && TR.zonas) || []) { const v = q.dir !== undefined ? q.dir : q.on, d0 = dirs.get(q); if (d0 !== undefined && d0 !== v && (z === q || (q.todo && P.x + 4 >= q.x0 && P.x + 4 <= q.x1))) { T0.cambiosEncima++; if (!P.onGround) T0.cambiosEnElAire = (T0.cambiosEnElAire || 0) + 1; ult = T; } dirs.set(q, v); }
        if (hp !== null && P.hp < hp && z) { T0.golpesEnZona = (T0.golpesEnZona || 0) + 1; if (!P.onGround) T0.golpesEnZonaAire = (T0.golpesEnZonaAire || 0) + 1; }
    // luz de M9 (z.tipo 'luz'): plataformas que existen solo con la lámpara prendida (plataforma con trLuz). Cuántas veces
    // las usa (se sube), cuántas veces se cae porque se apagaron debajo suyo, y golpes o muertes en 1,5 s después de esa caída
    { const Lz = T0.luz = T0.luz || { subidas: 0, caidasPorApagado: 0, golpesTrasCaida: 0, muertesTrasCaida: 0 };
      const pl = P.plat && P.plat.trLuz ? P.plat : null;
      if (pl && pl !== luzPlat) Lz.subidas++;
      // las de luz no salen de platforms: apagadas quedan con w 0 (w0 es el ancho de verdad); en la lámpara de 2540 se turnan dos
      if (!pl && luzPlat && !P.onGround && luzPlat.w === 0) { Lz.caidasPorApagado++; luzT = T; }
      luzPlat = pl;
      if (luzT !== null && T - luzT >= 0 && T - luzT <= 90) { if (hp !== null && P.hp < hp) Lz.golpesTrasCaida++; if (P.dead && !muerto) Lz.muertesTrasCaida++; } }
    // corriente de M2 (z.tipo 'corriente'): solo empuja a quien nada (CA_abajo). Tiempo nadando en la corriente, golpes ahí
    // (las minas) y cuánto tarda en cruzar cada tramo de agua (de entrar a salir)
    { const Co = T0.corriente = T0.corriente || { seg: 0, golpes: 0, muertes: 0, cruces: [] };
      const zc = z && z.tipo === 'corriente' && typeof CA_abajo === 'function' && CA_abajo(P) ? z : null;
      if (zc) { Co.seg += 1 / 60; if (hp !== null && P.hp < hp) Co.golpes++; if (P.dead && !muerto) Co.muertes++; if (!corrZ) { corrZ = zc; corrT = T; } }
      else if (corrZ) { if (T - corrT > 0) Co.cruces.push(+((T - corrT) / 60).toFixed(1)); corrZ = null; } }
    // vapor de M5 (z.tipo 'vapor', z.est quieto|aviso|chorro): veces que el chorro lanza al jugador, dónde cae (plataforma o
    // encima de enemigos), golpes en 1,5 s después de un lanzamiento, y si se mete a propósito (entra durante el aviso)
    { const Vp = T0.vapor = T0.vapor || { lanzamientos: 0, caePlataforma: 0, caeSobreEnemigo: 0, golpesTrasLanzar: 0, entraEnAviso: 0 };
      for (const q of (typeof TR !== 'undefined' && TR.zonas) || []) { if (q.tipo !== 'vapor') continue; const dentro = z === q || Math.abs(P.x + 4 - (q.cx ?? (q.x0 + q.x1) / 2)) < Math.max(8, (q.x1 - q.x0) / 2);
        const antes = vapDentro.get(q) || false; if (dentro && !antes && q.est === 'aviso') Vp.entraEnAviso++; vapDentro.set(q, dentro);
        if (dentro && q.est === 'chorro' && P.vy < -3 && !vapVuela) { Vp.lanzamientos++; vapVuela = true; vapT = T; } }
      if (vapVuela && P.onGround && T - vapT > 10) { vapVuela = false; if (P.plat) Vp.caePlataforma++; if (enemies.some(e => !e.gone && Math.abs(e.x - P.x) < 14 && Math.abs(e.y - P.y) < 20)) Vp.caeSobreEnemigo++; }
      if (vapT !== null && T - vapT >= 0 && T - vapT <= 90 && hp !== null && P.hp < hp) Vp.golpesTrasLanzar++; }
    // vehículos nuevos (vehiculos2.js, Mecánicas): tiempo arriba, golpes y muertes montado; RESORTE: cuánto tarda en llegar al 90 %
    // de su velocidad máxima (3,0) desde parado; VENTARRÓN: tiempo en el aire, veces que se queda sin combustible volando, choques en el aire
    { const m = P.ride; if (m && m.v2) { const V = T0.v2 = T0.v2 || {}, k = m.v2, x = V[k] = V[k] || { seg: 0, golpes: 0, muertes: 0, acel: [], aire: 0, sinNafta: 0, choquesAire: 0 };
        x.seg += 1 / 60; const vx = Math.abs(m.v2v || 0);
        if (k === 'ruedas') { if (vx < 0.3) v2t0 = T; else if (v2t0 !== null && vx >= 2.7) { x.acel.push(+((T - v2t0) / 60).toFixed(2)); v2t0 = null; } }
        if (k === 'vuela' && !m.onGround) { x.aire += 1 / 60; if (m.fuel !== undefined && m.fuel <= 0 && !v2seco) { x.sinNafta++; v2seco = true; } }
        if (m.fuel > 0) v2seco = false;
        if (hp !== null && P.hp < hp) { x.golpes++; if (k === 'vuela' && !m.onGround) x.choquesAire++; }
        if (P.dead && !muerto) x.muertes++; } }
    // aceite de M1 (z.tipo 'aceite'): golpes y muertes mientras arde con el jugador encima, golpes resbalando (sin arder),
    // y cuántas veces lo prende una explosión con el jugador cerca (a 40 px o menos)
    { const A = T0.aceite = T0.aceite || { golpesArdiendo: 0, muertesArdiendo: 0, golpesResbalando: 0, encendidosCerca: 0 };
      for (const q of (typeof TR !== 'undefined' && TR.zonas) || []) { if (q.tipo !== 'aceite') continue; const a0 = arde.get(q) || 0, cerca = P.x + 4 > q.x0 - 40 && P.x + 4 < q.x1 + 40;
        if (a0 === 0 && q.arde > 0 && cerca) A.encendidosCerca++; arde.set(q, q.arde || 0); }
      if (z && z.tipo === 'aceite') { if (hp !== null && P.hp < hp) { if (z.arde > 0) A.golpesArdiendo++; else A.golpesResbalando++; } if (P.dead && !muerto && z.arde > 0) A.muertesArdiendo++; } }
        const reciente = ult !== null && T - ult >= 0 && T - ult <= 90;
        if (hp !== null && P.hp < hp && reciente) T0.golpesTrasCambio++;
        if (P.dead && !muerto && reciente) { T0.muertesTrasCambio++; hito('muere justo después de que cambió la cinta (misión ' + mis() + ')'); guardar(); }
        hp = P.hp; muerto = P.dead; } catch (e) {} });
    }
  } catch (e) {}

  // ---------- eventos del juego ----------
  try {
    ON_EVENT.push((t, d) => {
      if (enIntro()) return;
      if (t === 'gameStart') { R.partidas++; hito('empieza una partida'); }
      else if (t === 'missionStart') hito('empieza la misión ' + mis());
      else if (t === 'airCall') { R.aviones++; hito('pide el avión'); }
      else if (t === 'missionWin') { const m = M(); m.ganada = true; try { m.tramos = PC_mis.tramos.map(x => ({ n: x.n, tipo: x.kind, seg: x.secs, bajas: x.kills })); } catch (e) {} hito('gana la misión ' + mis());
        // nota de la misión (js/nota.js, si está): para ver con personas si los cortes S/A/B/C son justos
        setTimeout(() => { try { if (typeof NM !== 'undefined' && NM.res) { m.nota = { letra: NM.res.letra, v: NM.res.v, golpes: NM.res.golpes, secs: NM.res.secs }; guardar(); } } catch (e) {} }, 500); }
      else if (t === 'gameOver' || t === 'gameQuit') { const m = M(); try { m.tramos = PC_mis.tramos.map(x => ({ n: x.n, tipo: x.kind, seg: x.secs, bajas: x.kills })); } catch (e) {}
        R.fines.push({ como: t === 'gameOver' ? 'perdió' : 'salió', mision: mis(), tramo: tramo(), seg: segMision() }); hito(t === 'gameOver' ? 'pierde la partida' : 'sale al menú'); }
      guardar();
    });
  } catch (e) {}

  // ---------- cada cuadro de juego (no corre en pausa ni en menús) ----------
  let muertoAntes = false, bombsAntes = null, ruedaAntes = false, introAntes = false, introT0 = 0, introPasoMax = 0, pistaAntes = null;
  try {
    ON_STEP.push(() => {
      try {
        if (enIntro()) { if (!introAntes) { introAntes = true; introT0 = ahora(); hito('empieza la intro'); pistaAntes = null; } introPasoMax = Math.max(introPasoMax, IN.paso || 0);
          // ¿apareció una indicación de tecla por atascarse? (intro.js, IN_pista: tecla dibujada sobre la parada)
          try { const pi = typeof IN_pista === 'function' ? IN_pista() : null, clave = pi ? IN.paso + ':' + pi.k.join('+') : null;
            if (clave && clave !== pistaAntes) { R.pistasIntro.push({ paso: IN.paso, tecla: pi.k.join(' + '), seg: Math.round((ahora() - introT0) / 1000) }); hito('indicación en el paso ' + IN.paso + ': ' + pi.k.join(' + ')); guardar(); }
            pistaAntes = clave; } catch (e) {}
          return; }
        if (introAntes) { introAntes = false; const marca = localStorage.getItem('oxido-intro');
          R.intro = { como: marca === 'omitida' ? 'omitida' : marca === 'vista' ? 'completa' : marca || '?', segundos: Math.round((ahora() - introT0) / 1000), llegoAlPaso: introPasoMax, pistas: R.pistasIntro.length };
          R.intro.sinAyuda = R.intro.como === 'completa' && R.pistasIntro.length === 0;
          hito('intro ' + R.intro.como + ' (llegó al paso ' + introPasoMax + ' de 6)'); }
        if (typeof P === 'undefined' || !P) return;
        const m = M(); m.segundos += 1 / 60;
        if (lock && lock.a && lock.a.mini) m.llegoJefe = true;
        if (lock && lock.a && lock.a.boss) m.llegoVillano = true;
        const w = P.ride ? 'vehículo' : P.weapon; R.armas[w] = (R.armas[w] || 0) + 1 / 60;
        // misión 2: los caminos en capas (pedido de Código): arriba por las grúas, abajo nadando, arpón y sala secreta
        if (levelIdx === 1 && R.caminosM2) { const c = R.caminosM2, o = P.ride || P;
          if (o.y < 40 && !c.arriba) { c.arriba = true; hito('misión 2: sube por las grúas'); }
          if (o.y > GROUND + 4 && !c.abajo) { c.abajo = true; hito('misión 2: baja al agua, bajo el muelle'); }
          if (P.weapons && P.weapons.harpoon > 0 && !c.arpon) { c.arpon = true; hito('misión 2: agarra el arpón'); }
          if (typeof AR !== 'undefined' && AR.secreto && !c.salaSecreta) { c.salaSecreta = true; hito('misión 2: entra a la sala secreta'); } }
        if (P.ride) { const n = typeof VH_nombre === 'function' ? VH_nombre(P.ride) : 'CHATARRA'; R.vehiculos[n] = (R.vehiculos[n] || 0) + 1 / 60; }
        if (bombsAntes !== null && P.bombs < bombsAntes) { R.granadas += bombsAntes - P.bombs; }
        bombsAntes = P.bombs;
        const ru = typeof ruAbiertaDe === 'function' && ruAbiertaDe(0);
        if (ru && !ruedaAntes) R.ruedaVeces++; if (ru) R.ruedaSeg += 1 / 60; ruedaAntes = ru;
        if (P.dead && !muertoAntes) { m.muertes++;
          R.muertes.push({ mision: mis(), tramo: tramo(), causa: nombreDe(P.causa), seg: segMision(), jefe: !!(lock && lock.a && (lock.a.boss || lock.a.mini)) });
          hito('muere en la misión ' + mis() + ' (' + nombreDe(P.causa) + ')'); guardar(); }
        muertoAntes = P.dead;
      } catch (e) {}
    });
  } catch (e) {}

  // ---------- qué control usa ----------
  addEventListener('keydown', e => { if (panel && panel.contains(e.target)) return; R.teclas[e.code] = (R.teclas[e.code] || 0) + 1; }, true);
  addEventListener('pointerdown', e => { if (e.pointerType === 'touch') R.toques++; else if (e.pointerType === 'mouse') R.mouse++; }, true);
  const padAntes = {};
  setInterval(() => {
    try { const l = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of l) { if (!g) continue; R.joystick.id = g.id;
      g.buttons.forEach((b, i) => { const k = g.index + ':' + i; if (b.pressed && !padAntes[k]) R.joystick.botones++; padAntes[k] = b.pressed; }); } } catch (e) {}
    R.msJugados = ahora() - t0; guardar();
  }, 200);
  addEventListener('pagehide', guardar);

  // ---------- resumen ----------
  const s1 = x => Math.round(x);
  function resumen(r) {
    const min = r.msJugados / 60000, L = [];
    L.push(`ÓXIDO · PRUEBA CON PERSONAS · persona ${r.persona} · ${r.inicio.slice(0, 16).replace('T', ' ')}`);
    L.push(`Tiempo con el juego abierto: ${min.toFixed(1)} min · partidas: ${r.partidas}`);
    L.push(`Intro: ${r.intro ? r.intro.como + ' en ' + r.intro.segundos + ' s (llegó al paso ' + r.intro.llegoAlPaso + ' de 6)' : 'no la vio'}`);
    const pis = r.pistasIntro || []; L.push(`Entró a la misión 1 sin ayuda: ${r.intro ? (r.intro.sinAyuda ? 'SÍ' : 'NO') : '-'} · indicaciones por atascarse: ${pis.length}${pis.length ? ' (' + pis.map(p => 'paso ' + p.paso + ' ' + p.tecla + ' a los ' + p.seg + ' s').join(', ') + ')' : ''}`);
    if (r.terreno && r.terreno.v2) for (const [k, x] of Object.entries(r.terreno.v2)) L.push(`${k === 'ruedas' ? 'RESORTE' : 'VENTARRÓN'}: ${Math.round(x.seg)} s arriba · golpes ${x.golpes} · muertes ${x.muertes}${k === 'ruedas' ? ' · de parado al 90 %: ' + (x.acel.length ? x.acel.join(', ') + ' s' : '-') : ' · en el aire ' + Math.round(x.aire) + ' s · sin combustible volando ' + x.sinNafta + ' · choques en el aire ' + x.choquesAire}`);
    if (r.terreno && r.terreno.vapor && (r.terreno.vapor.lanzamientos || r.terreno.vapor.entraEnAviso)) { const v = r.terreno.vapor; L.push(`VAPOR (M5): ${v.lanzamientos} lanzamientos · cae en plataforma ${v.caePlataforma} · cae sobre enemigos ${v.caeSobreEnemigo} · golpes en 1,5 s ${v.golpesTrasLanzar} · se mete durante el aviso ${v.entraEnAviso}`); }
    if (r.terreno && r.terreno.luz && (r.terreno.luz.subidas || r.terreno.luz.caidasPorApagado)) { const l = r.terreno.luz; L.push(`LUZ (M9): se sube a las plataformas ${l.subidas} veces · se cae porque se apagaron ${l.caidasPorApagado} · después (1,5 s): ${l.golpesTrasCaida} golpes y ${l.muertesTrasCaida} muertes`); }
    if (r.terreno && r.terreno.corriente && r.terreno.corriente.seg > 0.5) { const c = r.terreno.corriente; L.push(`CORRIENTE (M2): ${Math.round(c.seg)} s nadando en ella · golpes ${c.golpes} · muertes ${c.muertes} · cruces ${c.cruces.join(', ') || '-'} s`); }
    if (r.terreno && r.terreno.aceite) { const a = r.terreno.aceite; L.push(`ACEITE (M1): se prendió con la persona cerca ${a.encendidosCerca} veces · golpes ardiendo ${a.golpesArdiendo} · muertes ardiendo ${a.muertesArdiendo} · golpes resbalando ${a.golpesResbalando}`); }
    if (r.terreno) L.push(`TERRENO: ${r.terreno.muertes} muertes paradas en una zona${Object.keys(r.terreno.porMision || {}).length ? ' (' + Object.entries(r.terreno.porMision).map(([m, n]) => 'M' + m + ' ' + n).join(', ') + ')' : ''} · cambios de la zona con la persona adentro ${r.terreno.cambiosEncima} (${r.terreno.cambiosEnElAire || 0} en el aire) · después de un cambio (1,5 s): ${r.terreno.golpesTrasCambio} golpes y ${r.terreno.muertesTrasCambio} muertes · golpes dentro de una zona ${r.terreno.golpesEnZona || 0} (${r.terreno.golpesEnZonaAire || 0} en el aire)`);
    const ca = r.caidas || []; if (ca.length) L.push('AL CAER: ' + ca.map(c => c.eligio + ' en misión ' + c.mision + ' tramo ' + (c.tramo ?? '-')).join(' · '));
    L.push('MISIONES:');
    for (const [k, m] of Object.entries(r.misiones)) L.push(`  Misión ${k}: ${s1(m.segundos)} s jugando · ${m.muertes} muertes (${m.segundos ? (m.muertes / (m.segundos / 60)).toFixed(2) : '-'} por minuto) · jefe chico ${m.llegoJefe ? 'sí' : 'no'} · villano ${m.llegoVillano ? 'sí' : 'no'} · ganada ${m.ganada ? 'sí' : 'no'}${m.nota ? ' · nota ' + m.nota.letra + ' (' + m.nota.v + ')' : ''}${m.tramos.length ? ' · tramos ' + m.tramos.map(t => t.n + ' ' + t.tipo + ' ' + t.seg + ' s').join(', ') : ''}`);
    L.push('MUERTES:');
    for (const d of r.muertes) L.push(`  misión ${d.mision} · tramo ${d.tramo ?? '-'} · ${d.causa}${d.jefe ? ' (pelea de jefe)' : ''} · a los ${d.seg ?? '-'} s`);
    L.push('ARMAS (segundos): ' + Object.entries(r.armas).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + s1(v)).join(' · '));
    L.push(`Granadas: ${r.granadas} · avión: ${r.aviones} · rueda de armas: ${r.ruedaVeces} veces (${s1(r.ruedaSeg)} s) · vehículos: ${Object.entries(r.vehiculos).map(([k, v]) => k + ' ' + s1(v) + ' s').join(', ') || 'ninguno'}`);
    const tk = Object.entries(r.teclas).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => k.replace(/^Key|^Arrow/, '') + ' ' + v).join(' · ');
    L.push(`Control: teclas ${tk || 'ninguna'} · joystick ${r.joystick.id ? r.joystick.botones + ' botones (' + r.joystick.id.slice(0, 30) + ')' : 'no'} · toques ${r.toques} · clics ${r.mouse}`);
    if (r.caminosM2 && r.misiones[2]) L.push(`MISIÓN 2, CAMINOS: arriba (grúas) ${r.caminosM2.arriba ? 'sí' : 'no'} · abajo (nadando) ${r.caminosM2.abajo ? 'sí' : 'no'} · arpón ${r.caminosM2.arpon ? 'sí' : 'no'} · sala secreta ${r.caminosM2.salaSecreta ? 'sí' : 'no'}`);
    if (r.fines.length) L.push('FINES: ' + r.fines.map(f => f.como + ' en misión ' + f.mision + ' tramo ' + (f.tramo ?? '-')).join(' · '));
    L.push('LO QUE PASÓ: ' + r.hitos.slice(-40).join(' | '));
    L.push('DATOS: ' + JSON.stringify(r, (k, v) => typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 10) / 10 : v));
    return L.join('\n');
  }
  let panel = null, boton = null;
  function abrir() {
    try { if (typeof state !== 'undefined' && state === 'play') state = 'pause'; } catch (e) {}
    R.msJugados = ahora() - t0; guardar();
    const texto = [...todo.personas, R].map(resumen).join('\n\n— — —\n\n');
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;inset:5%;z-index:99999;background:#120c18;color:#fff;font:14px ui-monospace,Menlo,monospace;padding:12px;display:flex;flex-direction:column;gap:8px;border:2px solid #ffe066';
    panel.innerHTML = '<b>REGISTRO DE LA PRUEBA</b><textarea readonly style="flex:1;background:#1c1424;color:#fff;font:12px ui-monospace,Menlo,monospace"></textarea>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button data-a="copiar">COPIAR RESUMEN</button><button data-a="bajar">DESCARGAR</button><button data-a="nueva">NUEVA PERSONA</button><button data-a="cerrar">CERRAR</button><span data-a="msg"></span></div>';
    panel.querySelector('textarea').value = texto;
    for (const b of panel.querySelectorAll('button')) b.style.cssText = 'font:bold 16px ui-monospace,Menlo,monospace;padding:10px 14px;background:#ffe066;color:#120c18;border:0';
    const msg = s => { panel.querySelector('[data-a=msg]').textContent = s; };
    panel.addEventListener('click', async e => {
      const a = e.target.dataset && e.target.dataset.a; if (!a) return; e.stopPropagation();
      if (a === 'copiar') { try { await navigator.clipboard.writeText(texto); msg('Copiado.'); } catch (err) { const t = panel.querySelector('textarea'); t.focus(); t.select(); msg('Elegí el texto y copialo a mano.'); } }
      if (a === 'bajar') { const u = URL.createObjectURL(new Blob([texto], { type: 'text/plain' })); const l = document.createElement('a'); l.href = u; l.download = 'oxido-prueba-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.txt'; l.click(); msg('Descargado.'); }
      if (a === 'nueva') { todo.personas.push(R); todo.actual = null; guardar(); msg('Guardada. Se recarga para la persona siguiente.'); setTimeout(() => location.reload(), 700); }
      if (a === 'cerrar') { panel.remove(); panel = null; }
    });
    // mientras el panel está abierto, el teclado es del panel (no del juego)
    for (const ev of ['keydown', 'keyup']) panel.addEventListener(ev, e => e.stopPropagation());
    document.body.appendChild(panel);
  }
  addEventListener('keydown', e => { if (panel) e.stopImmediatePropagation(); }, true);
  const ponerBoton = () => {
    boton = document.createElement('button'); boton.textContent = 'REGISTRO';
    boton.style.cssText = 'position:fixed;top:2px;left:50%;transform:translateX(-50%);z-index:99998;font:bold 10px ui-monospace,Menlo,monospace;padding:2px 6px;background:rgba(18,12,24,.6);color:#ffe066;border:1px solid #ffe066;opacity:.55';
    boton.addEventListener('pointerdown', e => e.stopPropagation(), true);
    boton.addEventListener('click', e => { e.stopPropagation(); if (!panel) abrir(); });
    document.body.appendChild(boton);
    window.OXIDO_PRUEBA = { resumen: () => resumen(R), datos: () => R, abrir };
  };
  if (document.readyState === 'complete') ponerBoton(); else addEventListener('load', ponerBoton);
})();
