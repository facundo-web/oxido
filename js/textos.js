'use strict';
// Óxido · Textos: todo lo que lee el jugador, en un solo lugar.
// Dueño: Escritor de textos (notas/textos/). Código reemplaza los textos sueltos por estas claves, de a una pantalla.
//
// Cómo se usa:
//   TX.menu.jugar                        → 'JUGAR'
//   tx(TX.fin.faltan,{n:1200})            → 'A 1.200 puntos de tu récord'   (los números ≥ 1000 salen con punto)
//   tx(TX.pausa.pie,{seguir:btn('opt'),salir:btn('quit')})
//   txPl(3,TX.palabras.baja,TX.palabras.bajas) → '3 BAJAS'
// Reglas (notas/textos/voz.md):
//   · Nunca escribir una tecla a mano: las plantillas traen {seguir}, {salir}, {ok}… y el código pone btn('…').
//   · Las frases van enteras con {huecos}: no armar frases sumando pedazos (en inglés cambia el orden).
//   · La lógica compara ids, nunca el texto que se ve (si no, cambiar una palabra rompe un menú).
// Para sumar inglés: copiar TEXTOS.es a TEXTOS.en, traducir y cambiar IDIOMA. Lo que falte en 'en' sale en castellano.
// Prefijo: TX, tx, txPl, txNum, IDIOMA, TEXTOS.

const TEXTOS={es:{
  // ---------- palabras sueltas que se repiten ----------
  palabras:{
    vida:'VIDA',vidas:'VIDAS',corazon:'♥',baja:'BAJA',bajas:'BAJAS',rescate:'RESCATE',rescates:'RESCATES',
    punto:'PUNTO',puntos:'PUNTOS',mision:'MISIÓN',tramo:'TRAMO',vuelta:'VUELTA',mundo:'MUNDO',
    jefeChico:'JEFE CHICO',villano:'VILLANO',guardian:'GUARDIÁN',emboscada:'EMBOSCADA',gatito:'OLIVER',
    si:'SÍ',no:'NO',normal:'NORMAL',grande:'GRANDE',volver:'VOLVER',jugador:'JUGADOR {n}',
    vez:'vez',veces:'veces',
  },

  // ---------- título ----------
  menu:{
    jugar:'JUGAR',comoJugar:'CÓMO JUGAR',opciones:'OPCIONES',logros:'LOGROS',records:'RÉCORDS',
    titulo:'ÓXIDO',record:'RÉCORD {n}',elegir:'{ok} ELEGIR', // record: {n} va como texto de 7 cifras (0001500), estilo arcade
    pie:'↑↓ · {ok} ELEGIR',pieTactil:'PALANCA ↑↓ · {ok} ELEGIR',
  },

  // ---------- OPCIONES ----------
  opciones:{
    titulo:'OPCIONES',pie:'↑↓ ELEGIR · ←→ O {ok} CAMBIAR · {volver} VOLVER',
    tamano:'TAMAÑO',tamanoAyuda:'GRANDE: el mundo se ve más de cerca',
    musica:'MÚSICA',sonido:'SONIDO',
    controles:'CONTROLES',controlesAyuda:'Tipo, disparo, rueda, teclas y práctica',
    practicar:'PRACTICAR CONTROLES',practicarAyuda:'Jugá de nuevo la intro de la misión 1',
    botones:'BOTONES EN PANTALLA',acomodar:'ACOMODAR ▶',botonesAyuda:'Mové y agrandá los botones',
    accesibilidad:'ACCESIBILIDAD',accesibilidadAyuda:'Movimiento, texto y contraste',
    ayudas:'AYUDAS',ayudasActivadas:'ACTIVADAS',ayudasAyuda:'Vidas infinitas, menos daño, más lento',
    clima:'CLIMA',
    // CONTROLES
    tipo:'TIPO',simples:'SIMPLES',completos:'COMPLETOS',
    simplesAyuda:'SIMPLES: ↑ salta y el arma apunta sola',completosAyuda:'COMPLETOS: un botón para cada cosa',
    disparo:'DISPARO',disparoNormal:'NORMAL',disparoAuto:'AUTOMÁTICO',disparoAlternado:'ALTERNADO',
    disparoNormalAyuda:'Un tiro cada vez que apretás',
    disparoAutoAyuda:'Mantené apretado: ráfaga sin parar',
    disparoAlternadoAyuda:'Tocá para empezar y otra vez para parar',
    rueda:'RUEDA DE ARMAS',ruedaMantener:'MANTENER',ruedaTocar:'TOCAR',
    ruedaMantenerAyuda:'Se abre mientras mantenés apretado',
    ruedaTocarAyuda:'Tocá para abrirla y otra vez para cerrarla',
    teclas:'TECLAS',teclasAyuda:'Elegí qué tecla hace cada cosa',
    joystick:'JOYSTICK',joystickAyuda:'Elegí qué botón hace cada cosa',
    // ACCESIBILIDAD
    movimiento:'MOVIMIENTO',reducido:'REDUCIDO',movimientoAyuda:'REDUCIDO: sin sacudidas fuertes, destellos ni parpadeos',
    texto:'TEXTO',textoAyuda:'GRANDE: letras una vez y media más grandes',
    balas:'BALAS ENEMIGAS',altoContraste:'ALTO CONTRASTE',balasAyuda:'ALTO CONTRASTE: borde blanco y otra forma',
    // AYUDAS (mismos nombres en OPCIONES y en PAUSA)
    vidasInf:'VIDAS INFINITAS',vidasInfCorto:'VIDAS ∞',vidasInfAyuda:'La partida no se termina nunca',
    menosDano:'MENOS DAÑO',menosDanoAyuda:'Los golpes te sacan la mitad',
    masLento:'MÁS LENTO',masLentoAyuda:'Todo va un 25 % más despacio',
    conAyudas:'Con ayudas, el récord va aparte y algunos logros no cuentan.',
    conAyudasCorto:'CON AYUDAS: RÉCORD APARTE', // celular: si no entra la larga, va esta (nunca nada)
    // CLIMA (clima.js)
    climaReal:'REAL',climaDelDia:'DEL DÍA',climaApagado:'APAGADO',
    climaRealAyuda:'Usa tu ubicación aproximada para saber si llueve donde estás',
    climaRealSinPermiso:'Sin permiso de ubicación: va el clima del día',
    climaDelDiaAyuda:'Un clima distinto cada día, sin usar tu ubicación',
    climaApagadoAyuda:'Siempre despejado',
    climaDatos:'CLIMA CON DATOS MÓVILES',
    climaDatosSi:'Consulta el clima también con datos del celular',
    climaDatosNo:'Consulta el clima solo con wifi o cable',
    climaFuente:'Datos del clima: Open-Meteo.com',climaSinUbicacion:'sin ubicación',
  },

  // ---------- OPCIONES › TECLAS / JOYSTICK (reasignar.js) ----------
  teclas:{
    tituloTeclas:'TECLAS',tituloJoystick:'JOYSTICK',
    saltar:'SALTAR',disparar:'DISPARAR',granada:'GRANADA',ruedaYAvion:'RUEDA Y AVIÓN',rueda:'RUEDA DE ARMAS',avion:'AVIÓN',
    izquierda:'IZQUIERDA',derecha:'DERECHA',arriba:'ARRIBA Y APUNTAR',abajo:'ABAJO Y AGACHARSE',
    espacio:'ESPACIO',tab:'TAB',boton:'BOTÓN {n}',
    restablecer:'RESTABLECER',volver:'VOLVER',
    esperando:'APRETÁ…',
    pedirBoton:'Apretá el botón nuevo · {volver} cancela',
    pedirTecla:'Apretá la tecla nueva · {volver} cancela',
    teclaFija:'ESA TECLA ES FIJA: ELEGÍ OTRA',
    botonFijo:'ESE BOTÓN ES FIJO: ELEGÍ OTRO',
    yaEra:'YA ERA ESA',
    cambiada:'{otra} PASA A {tecla}',
    intercambio:'CAMBIADA CON {otra}',
    fabrica:'VOLVIERON LAS DE FÁBRICA',
    sinCambios:'SIN CAMBIOS',
  },

  // ---------- PAUSA (juego.js) ----------
  pausa:{
    titulo:'PAUSA',controles:'CONTROLES',
    pie:'{seguir} SEGUIR  ·  {salir} SALIR AL MENÚ',pieTactil:'{ok} SEGUIR  ·  SALIR AL MENÚ', // táctil: las dos palabras se tocan; {ok} = ✕ // táctil: los botones de la pantalla (Código, pedido de Publicación)
    confirmarSalir:'¿SALIR AL MENÚ? {salir} OTRA VEZ',
    dificultad:'DIFICULTAD',
    joyVolvio:'JOYSTICK CONECTADO',joyVolvioSub:'Apretá {seguir} para seguir',
    joyFuera:'JOYSTICK DESCONECTADO',joyFueraSub:'Conectalo de nuevo o seguí con el teclado',
    joy2Fuera:'SE DESCONECTÓ EL JOYSTICK 2',joy2FueraSub:'Conectalo para que siga jugando',
  },

  // ---------- dificultad (juego.js) ----------
  dificultad:{
    facil:'FÁCIL',facilAyuda:'4 vidas · los enemigos tiran menos',
    normal:'NORMAL',normalAyuda:'2 vidas · como fue pensado',
    dificil:'DIFÍCIL',dificilAyuda:'1 vida · enemigos más duros',
  },

  // ---------- elegir personaje y misión (hud.js, personajes.js) ----------
  elegir:{
    uno:'ELEGÍ TU PERSONAJE',dos:'ELIJAN SUS PERSONAJES',
    statVida:'♥',statRapidez:'RAPIDEZ',statSalto:'SALTO',color:'COLOR',mision:'MISIÓN',dificultad:'DIFICULTAD',
    bloqueada:'GANÁ LA MISIÓN {n} PARA ABRIRLA',
    pie:'↑↓ FILA  ·  ←→ CAMBIAR  ·  {ok} JUGAR',
    pieTactil:'PALANCA ↑↓ FILA · ←→ CAMBIAR · TOCÁ OTRA VEZ: JUGAR',
    p2Elegir:'JUGADOR 2: ←→ ELEGIR · ↑↓ COLOR · {salir} SALIR',
    p2Sumarse:'JUGADOR 2: {ok} PARA SUMARTE',
    p2Teclado:'JUGADOR 2 EN ESTE TECLADO: {ok}',
    deADosTeclado:'DE A 2 CON UN TECLADO',deADosTecladoSub:'controles simples',
  },
  personajes:{ // según notas/guion/biblia.md (FACU papá, JOSE mamá, LAUTI hijo, TUERCA robotito)
    facu:{nombre:'FACU',rol:'El veterano',ayuda:'15 granadas · explotan más'},
    jose:{nombre:'JOSE',rol:'La rápida',ayuda:'Doble salto · dispara rápido'},
    lauti:{nombre:'LAUTI',rol:'Chico y duro',ayuda:'4 ♥ · escopeta · aguanta un golpe'},
    tuerca:{nombre:'TUERCA',rol:'El robotito',ayuda:'Se prende con 6 engranajes dorados'},
    // TUERCA es el ROBOT de arte-personaje.js. RITA y NIEBLA son bocetos que no se eligieron: sin textos
    rita:{nombre:'RITA',rol:'La mecánica',ayuda:'Arregla vehículos · fusiona más rápido'},
    niebla:{nombre:'NIEBLA',rol:'La sombra',ayuda:'Se desliza · ve en la oscuridad'},
    robot:{nombre:'ROBOT',rol:'Robot de chatarra',ayuda:'Atrae tuercas · granadas imán'},
  },

  // ---------- HUD y carteles del juego ----------
  hud:{
    mision:'MISIÓN {n}',bajas:'{n} BAJAS',adelante:'¡ADELANTE! ▶',
    sinSonido:'SIN SONIDO · {tecla}',sinMusica:'SIN MÚSICA · {tecla}',
    sinVidas:'SIN VIDAS',yaVuelve:'YA VUELVE…',
    musicaSi:'MÚSICA: SÍ',musicaNo:'MÚSICA: NO',
  },
  carteles:{
    peligro:'¡PELIGRO!',emboscada:'¡EMBOSCADA!',zonaDespejada:'¡ZONA DESPEJADA!',
    algoGrande:'¡ALGO GRANDE SE ACERCA!',disparale:'¡DISPARALE!',
    objetivo:'AVANZÁ → Y VENCÉ A {villano}',objetivoSinNombre:'AVANZÁ → Y VENCÉ AL VILLANO',avanza:'AVANZÁ',
  },

  // ---------- prisioneros, aliados y gatito ----------
  aliados:{
    hayPrisionero:'¡PRISIONERO! PASÁ PARA LIBERARLO',
    liberado:'¡PRISIONERO LIBERADO!',seSuma:'¡UN AMIGO SE SUMA!',perdiste:'¡PERDISTE UN AMIGO!',
    hayGatito:'¡ES OLIVER! PASÁ PARA LIBERARLO',gatitoSeSuma:'¡OLIVER SE SUMA!', // el gato se llama OLIVER (feedback de 2 jugadores, 25 nov)
  },
  globos:{ // fuente pixel fija: 12 caracteres ideal, 18 máximo. A completar con el Guionista.
    ayuda:'¡AYUDA!',gracias:'¡GRACIAS!',vamos:'¡VAMOS!',ay:'¡AY!',miau:'¡MIAU!',gol:'¡GOL!',
  },
  ono:{pum:'¡PUM!',crash:'¡CRASH!',zas:'¡ZAS!',boom:'¡BOOM!',clic:'¡CLIC!',dong:'¡DONG!',error:'ERROR'},

  // ---------- premios y cofres (combate.js, reloj.js, jefes.js) ----------
  premios:{
    cofre:'¡COFRE ABIERTO!',granadas:'GRANADAS +{n}',escudo:'ESCUDO · AGUANTA 3 GOLPES',escudoRoto:'¡ESCUDO ROTO!',
    vidaExtra:'¡VIDA EXTRA!',vidasLlenas:'VIDAS LLENAS · +{n}',corazonesLlenos:'♥ LLENOS',
    vidaYCorazones:'¡+1 VIDA! · ♥ LLENOS',vida:'¡+1 VIDA!',
    avionGratis:'AVIÓN GRATIS · {n}',blindaje:'BLINDAJE +{n}',blindajeOk:'BLINDAJE REPARADO',
    armaMejorada:'ARMA MEJORADA · MUNICIÓN LLENA',
  },

  // ---------- armas, rueda y avión ----------
  armas:{
    pistola:'PISTOLA',ametralladora:'AMETRALLADORA',escopeta:'ESCOPETA',lanzallamas:'LANZALLAMAS',lanzamisiles:'LANZAMISILES',arpon:'ARPÓN',
    sinMunicion:'SIN MUNICIÓN',sinArmas:'SIN ARMAS',necesitas:'NECESITÁS {arma}',noTenes:'NO TENÉS {arma}',
    enChatarraNo:'EN LA CHATARRA NO',
  },
  avion:{
    nombre:'AVIÓN',enCamino:'¡AHÍ VIENE EL AVIÓN!',llamado:'¡AVIÓN! · −1 ♥',enVuelo:'AVIÓN EN VUELO',
    gratis:'AVIÓN GRATIS',cuesta:'AVIÓN · −1 ♥',faltan:'NECESITÁS 2 ♥ PARA EL AVIÓN',faltanCorto:'AVIÓN · NECESITÁS 2 ♥',
    comoPedir:'{avion} O LA RUEDA',comoPedirRueda:'{rueda}: ELEGILO EN LA RUEDA',
    intro:'Gratis si tenés uno; si no, cuesta 1 ♥',
  },

  // ---------- arpón, engranajes y tuerca (secretos) ----------
  secreto:{
    arpon:'¡ARPÓN! · 2 TIROS',arponSub:'Elegilo en la rueda',arponPista:'ARPÓN: GRANADA JUNTO A LA ARGOLLA',
    arponQueda1:'ARPÓN · QUEDA 1 TIRO',arponFin:'SE TERMINÓ EL ARPÓN',
    engranaje:'¡ENGRANAJE DORADO!',engranajeRepetido:'ESTE ENGRANAJE YA LO TENÍAS',desbloqueado:'¡DESBLOQUEADO!',
    argollaRota:'¡ARGOLLA ROTA! SECRETO CERRADO',
    misionSecreta:'MISIÓN SECRETA 11',chatarraDorada:'CHATARRA DORADA',tuerca:'TUERCA',
    tuercaAyuda:'Se destraba con 6 engranajes dorados',tuercaFaltan:'Te faltan {n}',
  },

  // ---------- fusión y vehículos ----------
  fusion:{grito:'¡FUSIÓN!',mantener:'MANTENÉ ↓: FUSIONAR',tocar:'TOCÁ ↓: FUSIONAR'},
  vehiculos:{
    nombres:{chatarra:'CHATARRA',gaviota:'GAVIOTA',libelula:'LIBÉLULA',planeador:'PLANEADOR',farol:'FAROL',tabla:'TABLA',
      iman:'IMÁN',ptero:'PTERO',campana:'CAMPANA',montacargas:'MONTACARGAS'},
    como:{ // ↑ y ↓ son direcciones, no teclas: se dejan
      chatarra:'↑ EN EL AIRE: VOLAR',gaviota:'MANTENÉ ↑: VOLAR BAJO',libelula:'MANTENÉ ↑: SUBIR · PLANEA SOLA',
      planeador:'↑ EN EL AIRE: PLANEAR',farol:'MANTENÉ ↑: INFLAR · TIRA ABAJO',tabla:'↑ DOS VECES: DOBLE SALTO',
      iman:'↑ JUNTO A TECHO O PARED: PEGARSE',ptero:'TOCÁ ↑ EN EL AIRE: ALETEAR',campana:'MANTENÉ ↑: VOLAR · SUENA AL ATACAR',
      montacargas:'↑ SUBE LA JAULA · ↓ LA BAJA'},
    ataques:{gancho:'GANCHO',bomba:'BOMBA',embestida:'EMBESTIDA',fogonazo:'FOGONAZO',abanico:'ABANICO',pulso:'PULSO IMÁN',picada:'PICADA',dong:'¡DONG!'},
    aBordo:'¡A BORDO {de} {nombre}!',noDaMas:'¡{el} {nombre} NO DA MÁS!',subir:'↑ SUBIR {a} {nombre}',bajar:'{tecla}: BAJAR',
    aLaVista:'¡VEHÍCULO A LA VISTA!',sinCombustible:'¡SIN COMBUSTIBLE!',sinProyectiles:'SIN PROYECTILES',
    vuelo:'VUELO',altura:'ALTURA',alas:'ALAS',canon:'CAÑÓN {n}',jet:'JET CARGANDO',enVuelo:'EN VUELO',
  },

  // ---------- de a 2 (caminos.js, jugador.js) ----------
  deados:{
    pantallaPartida:'PANTALLA PARTIDA',
    burbuja:'¡JUGADOR {n} A LA BURBUJA! −1 VIDA',quedoAtras:'JUGADOR {n} SE QUEDÓ SIN VIDAS',
    quedasteAtras:'¡QUEDASTE ATRÁS!',noTeQuedes:'¡NO TE QUEDES ATRÁS!',
    vuelve:'¡VUELVE EL JUGADOR {n}!',alFrente:'¡DE NUEVO AL FRENTE!',sinVidas:'JUGADOR {n}: SIN VIDAS',
  },

  // ---------- viñeta de entrada de jefe (dibujito.js, pagina.js) ----------
  vineta:{jefeChico:'¡JEFE CHICO!',villano:'¡EL VILLANO!',guardian:'¡GUARDIÁN DEL MUNDO {n}!'},

  // ---------- tramos, vuelta y continuar (partida.js) ----------
  tramo:{
    cabeza:'TRAMO {n} · {tipo} · {tiempo}',
    tipos:{tramo:'TRAMO',villano:'VILLANO',jefeChico:'JEFE CHICO',emboscada:'EMBOSCADA'},
    gatito:'OLIVER',punteria:'PUNTERÍA {n} %',sinDano:'SIN DAÑO',racha:'RACHA {n}',sinBonus:'ESTA VEZ, SIN BONUS',
    vuelta:'VUELTA {n}',vueltaSub:'ENEMIGOS MÁS DUROS Y MÁS RÁPIDOS',
    continuar:'CONTINUAR {n} DE {de}',continuarSub:'MITAD DE LOS PUNTOS · {vidas}',
  },

  // ---------- placa MISIÓN CUMPLIDA (cumplida.js) ----------
  cumplida:{
    mision:'¡MISIÓN CUMPLIDA!',mundo:'¡MUNDO {n} COMPLETO!',puntos:'+{n} PUNTOS',
    avance:'MISIÓN {n} DE {de}',mejor:'¡NUEVO RÉCORD DE MISIÓN!',cerca:'A {n} PUNTOS DE TU RÉCORD DE MISIÓN',
    logro:'+1 LOGRO',logros:'+{n} LOGROS',siguiente:'SIGUIENTE: MISIÓN {n} · {nombre}',
    seguir:'{tecla} SEGUIR',pausa:'{tecla} PAUSA',toca:'TOCÁ',
    mundoAbierto:'¡{mundo} ABIERTO!',mundoAbiertoSub:'Venciste al guardián del {mundo}',
    tiempos:'MISIÓN EN {mision} · VILLANO EN {villano}',
  },

  // ---------- resumen de misión (hud.js) ----------
  resumen:{
    mision:'MISIÓN {n}',vueltaCompleta:'¡VUELTA {n} COMPLETA!',misionCumplida:'¡MISIÓN {n} CUMPLIDA!',
    col:{tramo:'TRAMO',bajas:'BAJAS',rescates:'RESCATES',tiempo:'TIEMPO',puntos:'PUNTOS',racha:'RACHA',sinDano:'SIN DAÑO',bonus:'BONUS'},
    bonusTramos:'Bonus por tramos',bonusTiempo:'Bonus por tiempo ({t})',bajasMision:'BAJAS EN LA MISIÓN: {n}',
    misionMas:'MISIÓN +{n}',total:'TOTAL {n}',nuevoRecord:'¡NUEVO RÉCORD!',record:'RÉCORD {n}',
  },

  // ---------- ¡CAÍSTE! (fin.js) ----------
  caiste:{
    titulo:'¡CAÍSTE!',donde:'MISIÓN {n} · TRAMO {t}',tuMejor:'TU MEJOR: TRAMO {t}',masLejos:'¡MÁS LEJOS QUE NUNCA!',
    consejo:'CONSEJO',meta:'PRÓXIMA META',
    sinContinuar:'YA NO PODÉS CONTINUAR',
    ofrecerAyuda:'¿QUERÉS UNA AYUDA PARA ESTE TRAMO?',
    ofrecerAyudaSub:'Menos daño · se cambia en PAUSA · el récord va aparte',
    botonAyuda:'AYUDA: MENOS DAÑO',
    continuar:'CONTINUAR',terminar:'TERMINAR',
    alTramo:'al tramo {t}',alMitad:'a la mitad del tramo 1',alPrincipio:'al principio',
    contLargo:'Volvés {adonde} de la misión {n} con {vidas} y la mitad de los puntos · {quedan}',
    contCorto:'Misión {n}, {adonde} · {vidas} · mitad de los puntos · {quedan}',
    queda1:'queda 1 vez',quedan:'quedan {n} veces',
    // quién te ganó (prueba con personas: el consejo nombra lo que te mató, con su dibujo chico). Código lo agregó; Textos lo puede pulir
    teGano:'TE GANÓ: {quien}',
    quien:{soldier:'UN SOLDADO',grenadier:'UN GRANADERO',shield:'EL DEL ESCUDO',rocket:'EL DEL LANZACOHETES',drone:'UN DRON',turret:'UNA TORRETA',
      endo:'UN ROBOT DE CHATARRA',endoG:'EL ROBOT GRANDE',stalker:'EL CAZADOR',bat:'UN MURCIÉLAGO',escarabajo:'UN ESCARABAJO',mudling:'UN BICHO DEL BARRO',
      momia:'UNA MOMIA',vigia:'EL VIGÍA',brote:'UN BROTE',garra:'LA GARRA',m7Bicho:'UN BICHO',m10Vibora:'UNA VÍBORA',m9Sabana:'UNA SÁBANA',m9Farol:'UN FAROL',
      bullet:'UNA BALA',egren:'UNA GRANADA',bomb:'UNA BOMBA',fuego:'EL FUEGO',mud:'EL BARRO',onda:'LA ONDA',perdigon:'UN PERDIGÓN',ecohete:'UN COHETE',shell:'UN OBÚS'},
  },

  // ---------- FIN DEL JUEGO (fin.js) ----------
  fin:{
    titulo:'FIN DEL JUEGO',puntos:'{n} PUNTOS',nuevoRecord:'¡NUEVO RÉCORD!',faltan:'A {n} puntos de tu récord',
    llegaste:'Llegaste hasta {donde}',tuMejor:'Tu mejor: {donde}',loMasLejos:'¡Es lo más lejos que llegaste!',
    mision:'misión {n}',meta:'PRÓXIMA META',
    otraVez:'OTRA VEZ',menu:'MENÚ',verDetalle:'VER DETALLE',ocultarDetalle:'OCULTAR DETALLE',
    det:{puntos:'PUNTOS',tiempo:'TIEMPO',bajas:'BAJAS',rescates:'RESCATES',jefes:'JEFES VENCIDOS',misiones:'MISIONES GANADAS',
      punteria:'PUNTERÍA',continuaste:'VECES QUE CONTINUASTE'},
    vacio:'Jugá una partida y acá ves cómo te fue.',
  },

  // ---------- consejos al morir y metas (consejos.js) ----------
  // Fórmula: "señal: qué hacer." · ideal 70 caracteres, máximo 90 · sin teclas a mano.
  consejos:{
    jefes:{
      escarabajo:'El Escarabajo no sube al andamio de la izquierda: tirale desde ahí.',
      bulon:'Don Bulón pisa fuerte y la onda corre por el piso: saltala.',
      libelula:'La Libélula baja en pasada rasante: agachate.',
      ceniza:'Chorro alto: agachate. Chorro bajo: saltalo. No pises el fuego.',
      chapaleador:'Hélice a un costado: viene la embestida. Saltala.',
      yuyo:'Cortale todas las cabezas a Madre Yuyo: así se abre el bulbo.',
      chacal:'El Chacal se agacha y gruñe antes de saltar: saltá las dos ondas.',
      polvo:'Tormenta: fila baja, saltá. Fila alta, agachate.',
      lechuza:'Foco rojo: salí del círculo.',
      niebla:'Donde tiembla el piso cae la garra: alejate y saltá la onda.',
      moscardon:'Línea de la mira: viene la ráfaga. Salí de ahí.',
      placa:'Barrido bajo: saltá. Barrido alto: agachate. Mirá los guiones ámbar.',
      remendon:'Punto azul en el piso: ahí va el soplete. Saltá la llama.',
      marana:'Franjas naranjas: ahí cae el latigazo. No te quedes encima.',
      topador:'Si rasca el piso y baja la cabeza, embiste: saltalo.',
      pisatrueno:'Línea roja en el piso: viene el pisotón. Saltá la onda.',
      lumbrera:'Círculo en el piso: ahí cae la araña. Salí.',
      casero:'Franjas en el piso: viene el sillazo. Salí de ahí.',
      tatu:'Flecha en el piso: viene la embestida. Saltala o subite.',
      custodio:'Sombra en el piso: ahí cae el puño. Alejate y saltá la onda.',
    },
    general:{ // la clave es el type del enemigo (consejos.js CONS_TIPO); endo = robots de chatarra; piso = por defecto
      soldier:'Si el soldado levanta el arma, va a tirar: agachate o saltá la bala.',
      grenadier:'La granada tarda en explotar: alejate de donde cae.',
      shield:'Al del escudo: granada por arriba o pegale por la espalda.',
      drone:'Los drones tiran desde arriba: mantené ↑ para apuntarles.',
      turret:'La torreta gira despacio: pasale por abajo del caño.',
      endoG:'El robot grande aguanta mucho: granadas, y no te le pegues.',
      stalker:'Destello amarillo entre las hojas: el cazador va a tirar. Movete, el dardo es lento.',
      endo:'Los robots de chatarra aguantan más: no sueltes el disparo.',
      piso:'Mirá el piso: las marcas y las sombras avisan antes de que pase algo.',
    },
    metas:{
      record:'Te faltan {n} puntos para tu récord.',
      ganale:'Ya llegaste a {donde}. La próxima, ganale.',
      engranaje1:'Te falta 1 engranaje dorado para {premio}.',
      engranajes:'Te faltan {n} engranajes dorados para {premio}.',
      logro:'Logro {nombre}: {que}. Te faltan {n} {unidad}.',logro1:'Logro {nombre}: {que}. Te falta 1 {unidad}.',
      premioTuerca:'despertar a TUERCA',premioOtro:'abrir la {premio}',
    },
  },

  // ---------- LOGROS (historial.js, reloj.js) ----------
  // Nombre: chiste corto (ideal 14, máx. 18). Qué hacer: verbo en vos + qué (ideal 32, máx. 40).
  logros:{
    titulo:'LOGROS',nuevo:'¡LOGRO!',ganado:'Lo ganaste el {fecha}',todavia:'Todavía no',oculto:'???',
    // la clave es el id del logro en el juego (historial.js, reloj.js): TX.logros.lista[a.id] = [nombre, qué hacer, unidad?]
    // unidad = [uno, varios], solo en los que tienen progreso (la usa la PRÓXIMA META)
    lista:{
      mini1:['PRIMER SUSTO','Vencé a tu primer jefe chico'],
      villano1:['A LA LONA','Vencé a tu primer villano'],
      bulon:['CHAU, BULÓN','Vencé a Don Bulón en la misión 1'],
      ceniza:['HECHO CENIZAS','Vencé al Sargento Ceniza en la misión 2'],
      yuyo:['DESMALEZADO','Vencé a Madre Yuyo en la misión 3'],
      vill4:['A DORMIR, MAJESTAD','Vencé al Rey Polvo en la misión 4'],
      vill5:['SE HIZO LA LUZ','Vencé a Don Niebla en la misión 5'],
      vill6:['FUERA DE SERVICIO','Vencé a Placa Madre en la misión 6'],
      vill7:['CABLES PROLIJOS','Vencé a la Maraña en la misión 7'],
      vill8:['A PASTAR','Vencé a Pisatrueno en la misión 8'],
      vill9:['MUDANZA','Vencé al Casero en la misión 9'],
      vill10:['QUE VUELVA A GIRAR','Vencé al Custodio en la misión 10'],
      intacto:['NI UN RASPÓN','Ganá una misión sin perder ♥'],
      rescate:['NADIE SE QUEDA','Rescatá a todos en una misión'],
      gatito:['SIETE VIDAS','Ganá una misión con OLIVER vivo'], // ícono: '7' en vez de 'M'
      arsenal:['FERRETERÍA','Usá las 5 armas en una partida'],
      cien:['MANO PESADA','Hacé 100 bajas en una partida'],
      k500:['DESARMADERO','Sumá 500 bajas en total',['baja','bajas']],
      k2000:['CHATARRERÍA','Sumá 2.000 bajas en total',['baja','bajas']],
      vuelta2:['OTRA VUELTA','Empezá la vuelta 2'],
      vuelta3:['VUELTA Y VUELTA','Empezá la vuelta 3'],
      dupla:['CODO A CODO','Ganá una misión de a 2'],
      dificil:['SIN MIEDO','Ganá una misión en DIFÍCIL'],
      cofre:['CAJA FUERTE','Abrí un cofre blindado'],
      avion10:['PIDE PISTA','Llamá al avión 10 veces',['vez','veces']],
      sinavion:['A PULMÓN','Ganá una misión sin llamar al avión'],
      oro:['BAÑADO EN ORO','Llegá a la medalla de ORO en una partida'],
      leyenda:['DE LEYENDA','Llegá a LEYENDA en una partida'],
      grillo:['CHATARRA FURIOSA','30 bajas con la Chatarra en una partida'],
      rescatista:['RESCATISTA','Sumá 50 rescates en total',['rescate','rescates']],
      tres:['TODA LA FAMILIA','Jugá con FACU, JOSE y LAUTI',['personaje','personajes']],
      veterano:['DE LA CASA','Jugá 10 partidas',['partida','partidas']],
      jtOro:['A TIEMPO','Vencé a un villano con medalla de ORO'],
      jtOro5:['RELOJ DE ORO','Sacá 5 medallas de ORO con villanos',['medalla','medallas']],
      jtRapida:['CONTRARRELOJ','Ganá una misión en menos de 2:00'],
    },
  },

  // ---------- RÉCORDS y nombre (historial.js) ----------
  records:{
    titulo:'RÉCORDS',tuLugar:'TU LUGAR EN EL RANKING',conAyudas:' · CON AYUDAS',
    verSinAyudas:'←→ récords sin ayudas',verConAyudas:'←→ récords con ayudas',
    // con TEXTO GRANDE, mejor sacar columnas (FECHA, TIEMPO) que abreviar: nada de PTS, DIF., NOM.
    col:{puesto:'#',nombre:'NOMBRE',personaje:'PERSONAJE',hasta:'HASTA',dificultad:'DIFICULTAD',puntos:'PUNTOS',bajas:'BAJAS',
      rescates:'RESCATES',tiempo:'TIEMPO',fecha:'FECHA'},
    totales:'EN TOTAL, EN ESTA COMPU',totalesCorto:'EN TOTAL: {n}',
    tot:{partidas:'PARTIDAS',bajas:'BAJAS',rescates:'RESCATES',tiempo:'TIEMPO',jefes:'JEFES',mejorVuelta:'MEJOR VUELTA',logros:'LOGROS'},
    nuevo:'¡NUEVO RÉCORD!',puesto:'PUESTO {n} · {p} PUNTOS',hasta:'VUELTA {v} · MISIÓN {m}',
    escribi:'ESCRIBÍ TU NOMBRE',minimo:'Escribí al menos una letra',
    ultimo:'Es el de la última vez · {ok} para usarlo',
    ayudaTeclado:'Escribí con el teclado · {borrar} borra · {ok} listo',
    ayudaTactil:'Tocá ESCRIBIR o usá las flechas · ○ borra · ✕ listo',
    ayudaJoystick:'↑↓ letra · ←→ mover · {borrar} borra · {ok} listo',
    medallas:{oro:'ORO',leyenda:'LEYENDA'},
  },

  // ---------- medallas (medallas.js, reloj.js) ----------
  medallas:{
    nombres:{bronce:'BRONCE',plata:'PLATA',oro:'ORO',platino:'PLATINO',diamante:'DIAMANTE',leyenda:'LEYENDA'},
    premio:{bronce:'Disparás más rápido',plata:'+1 ♥ máximo',oro:'Escudo y +10 granadas',platino:'Todas las armas pegan ×1,5',
      diamante:'+1 ♥ máximo',leyenda:'El escudo se recarga solo'},
    ahoraSos:'¡AHORA SOS DE {medalla}!',ahoraLeyenda:'¡AHORA SOS UNA LEYENDA!',avionGratis:'¡AVIÓN GRATIS!',
    de:'MEDALLA DE {medalla}',ninguna:'SIN MEDALLA TODAVÍA',sinMedalla:'SIN MEDALLA',
    tiempo:'TIEMPO {t}',hasta:'{medalla} HASTA {t}',elJefe:'el jefe',
  },

  // ---------- mundos (mundos.js) ----------
  mundos:{nombres:['MUNDO 1','MUNDO 2','MUNDO 3','FINAL'],fase:'¡FASE {n}!'},

  // ---------- misiones: nombre largo (cartel) y corto (listas) ----------
  misiones:[
    ['MISIÓN 1 · ZONA ÓXIDO','ZONA ÓXIDO'],['MISIÓN 2 · PUERTO CENIZA','PUERTO CENIZA'],['MISIÓN 3 · PANTANO TÓXICO','PANTANO TÓXICO'],
    ['MISIÓN 4 · ARENAS DEL REY','ARENAS DEL REY'],['MISIÓN 5 · CIUDAD SIN LUNA','CIUDAD SIN LUNA'],['MISIÓN 6 · CIUDAD DE DATOS','CIUDAD DE DATOS'],
    ['MISIÓN 7 · NAVE A LA DERIVA','NAVE A LA DERIVA'],['MISIÓN 8 · VALLE DEL TRUENO','VALLE DEL TRUENO'],
    ['MISIÓN 9 · CIUDAD EMBRUJADA','CIUDAD EMBRUJADA'],['MISIÓN 10 · TEMPLO PERDIDO','TEMPLO PERDIDO'],
  ],
  // avisos propios de cada misión
  enMision:{
    m4:{tormenta:'¡SE LEVANTA UNA TORMENTA!',tormentaComo:'¡ABAJO SALTÁ · ARRIBA AGACHATE!'},
    m5:{reflector:'¡EL REFLECTOR BARRE LA CALLE!',hotel:'HOTEL',bar:'BAR'},
    m6:{reflejos:'REFLEJOS',reflejosAyuda:'Saltá entre las balas: el tiempo se frena',reflejosFin:'REFLEJOS AGOTADOS',reflejosLlenos:'¡REFLEJOS AL MÁXIMO!'},
    m7:{ductos:'¡ALGO SE MUEVE EN LOS DUCTOS!',arriba:'¡CUIDADO ARRIBA!'},
    m8:{acerca:'¡ALGO GRANDE SE ACERCA!',escondete:'¡ESCONDETE EN EL TRONCO!',noTeVio:'¡NO TE VIO!',noTeVioPremio:'+{n} por esconderte',
      seAleja:'SE ALEJA…',escuchaste:'¿ESCUCHASTE ESO?',escuchasteSub:'Algo enorme camina por la selva',
      garras:'GARRAS',garrasAyuda:'Cazan de a dos · si se agachan, saltan'},
    m9:{fantasmas:'¡FANTASMAS EN LA CALLE!',brillan:'¡PEGALES CUANDO BRILLAN!'},
    m10:{rueda:'¡UNA RUEDA DENTADA! ¡CORRÉ ▶!',tiembla:'¡TIEMBLA EL TEMPLO!',teAlcanzo:'¡TE ALCANZÓ LA RUEDA!',
      alcanzoA:'¡LA RUEDA ALCANZÓ AL JUGADOR {n}!',limpia:'¡CARRERA LIMPIA! +{n}',trabo:'¡LA RUEDA SE TRABÓ!',
      terminasteVuelta:'¡TERMINASTE LA VUELTA {n}!',terminaste:'¡TERMINASTE LAS 10 MISIONES!',sigue:'SIGUE LA VUELTA {n} · TODO MÁS DURO'},
  },

  // ---------- jefes: nombre y avisos (a completar con el Guionista) ----------
  jefes:{
    escarabajo:{nombre:'ESCARABAJO DE ÓXIDO'},bulon:{nombre:'DON BULÓN'},
    libelula:{nombre:'LIBÉLULA DE HIERRO',sinCombustible:'¡SE QUEDÓ SIN COMBUSTIBLE!'},
    ceniza:{nombre:'SARGENTO CENIZA',quemado:'¡OLOR A QUEMADO!'},
    chapaleador:{nombre:'CHAPALEADOR',barro:'¡EL BARRO BURBUJEA!',marchita:'¡SE ESTÁ MARCHITANDO!'},
    yuyo:{nombre:'MADRE YUYO',bulbo:'¡EL BULBO QUEDÓ ABIERTO!',cabeza:'¡LE CRECE OTRA CABEZA!',furiosa:'¡ESTÁ FURIOSA!'},
    chacal:{nombre:'CHACAL DE BRONCE',recalienta:'¡EL CHACAL SE RECALIENTA!'},
    polvo:{nombre:'REY POLVO',sarcofago:'¡EL SARCÓFAGO SE ESTÁ ABRIENDO!',arena:'¡SE DESHACE EN ARENA!',ahora:'¡AHORA!',
      aturdido:'¡ESTÁ ATURDIDO: PEGALE AHORA!',enfurece:'¡EL REY POLVO SE ENFURECE!'},
    lechuza:{nombre:'LECHUZA BLINDADA',humo:'¡LA LECHUZA ECHA HUMO!',agachate:'¡AGACHATE!'},
    niebla:{nombre:'DON NIEBLA',sombra:'¡UNA SOMBRA ENTRE LAS NUBES!',apago:'¡DON NIEBLA APAGÓ EL REFLECTOR!',
      globo:'¡SE LE PINCHÓ EL GLOBO!',volvio:'¡VOLVIÓ EL REFLECTOR Y LO MARCA!'},
    moscardon:{nombre:'MOSCARDÓN'},
    placa:{nombre:'PLACA MADRE',prende:'¡SE PRENDE EL SISTEMA!',caido:'¡SISTEMA CAÍDO!',copia:'¡SE COPIÓ! UNA SOLA ES LA REAL'},
    remendon:{nombre:'EL REMENDÓN',descontrola:'¡EL REMENDÓN SE DESCONTROLA!',ducto:'¡VIENEN POR EL DUCTO!'},
    marana:{nombre:'LA MARAÑA',crece:'¡ALGO CRECE EN EL REACTOR!',apaga:'¡LA MARAÑA SE APAGA!',despierta:'¡LA MARAÑA SE DESPIERTA!',
      raspadores:'¡RASPADORES EN EL DUCTO!'},
    topador:{nombre:'TOPADOR',enfurece:'¡EL TOPADOR SE ENFURECE!'},
    pisatrueno:{nombre:'PISATRUENO',tiembla:'¡LA TIERRA TIEMBLA!',cayo:'¡CAYÓ EL GIGANTE!',placas:'¡SE LE CAEN LAS PLACAS!'},
    lumbrera:{nombre:'LA LUMBRERA',enciende:'¡LA LUMBRERA SE ENCIENDE!'},
    casero:{nombre:'EL CASERO',mansion:'¡LA MANSIÓN SE DESPIERTA!',desarma:'¡EL CASERO SE DESARMA!',paciencia:'¡EL CASERO PIERDE LA PACIENCIA!',
      paredes:'¡SE METE EN LAS PAREDES!'},
    tatu:{nombre:'EL TATÚ CAVADOR',cava:'¡ALGO CAVA BAJO EL PISO!',saqueador:'¡EL SAQUEADOR SALE CORRIENDO!',recalienta:'¡EL TATÚ RECALIENTA!'},
    custodio:{nombre:'EL CUSTODIO',altar:'¡EL ALTAR SE MUEVE!',apaga:'¡EL CUSTODIO SE APAGA!',enciende:'¡EL CUSTODIO SE ENCIENDE!',
      desarma:'¡EL CUSTODIO SE DESARMA!',esquiva:'¡AGACHATE O SUBITE!'},
  },

  // ---------- historia "EL ENGRANAJE DORADO" (guion: notas/guion/) ----------
  // Globos en fuente pixel 3×5: MAYÚSCULAS, '\n' separa los 2 renglones (máx. 18 letras y 72 px cada uno).
  // La fuente no tiene '…' ni '$' ni comillas: se usa '...'. g1 = momento, g2 = vehículo, g3 = después de la página del villano.
  // Cada globo tiene la versión de quien juega: facu, jose, lauti, tuerca.
  historia:{
    apertura:'¡OLIVER!', // escena inicial: lo grita quien juega cuando la banda se lleva al gato (notas/guion/apertura.md)
    carteles:{compro:'COMPRO ORO',comproTodo:'COMPRO TODO',vendido:'VENDIDO',seVende:'SE VENDE',noSeVende:'NO SE VENDE',
      desarmadero:'DESARMADERO',vuelvo:'VUELVO EN\n5 MINUTOS'},
    misiones:[
      { // M1 · ZONA ÓXIDO
        prisionero:'¡SE LLEVARON\nTODO!',
        g1:{facu:'¡EY! ¡ESO ES\nNUESTRO!',jose:'¿QUIÉN VENDIÓ\nLA CASA?',lauti:'¡NOS VENDIERON\nLA CASA!',tuerca:'¿BIP?'},
        g2:{facu:'TRANQUI,\nYO TE ARREGLO.',jose:'¡ARRIBA,\nQUE NOS VAMOS!',lauti:'¡FICHAJE\nNUEVO!',tuerca:'♥'},
        g3:{facu:'¡SENTADO!',jose:'¡HELADERA\nCON PATAS!',lauti:'¡SALE EL\nLOCAL!',tuerca:'¡BIP!'},
        entrada:'¡CHATARRA,\nA CASA!',pierde:'¡QUÉ GRANDE\nESTÁS, HIJO!',
      },
      { // M2 · PUERTO CENIZA
        prisionero:'¡NO VENDIMOS\nNADA!',
        g1:{facu:'¡ESA BARCAZA!',jose:'¡SE NOS\nESCAPA!',lauti:'¡Y SE VA,\nSE VA...!',tuerca:'¿BIP?'},
        g2:{facu:'VOLÁ BAJITO,\n¿EH?',jose:'¡YO MANEJO!',lauti:'¡QUÉ GOLAZO\nDE LANCHA!',tuerca:'¡BIP BIP!'},
        g3:{facu:'¡QUIETO AHÍ!',jose:'¡EL SOPLETE\nCON BOTAS!',lauti:'¡SALE A LA\nCANCHA!',tuerca:'¡BIP!'},
        entrada:'¡TODO SE FUNDE\nY SE VENDE!',pierde:'¡COF! ¡ME\nAPAGARON!',
      },
      { // M3 · PANTANO TÓXICO (guardiana)
        prisionero:'¡EL YUYO SE\nTRAGÓ TODO!',
        g1:{facu:'ESTO NO ME\nGUSTA NADA.',jose:'NO TOQUEN\nLAS PLANTAS.',lauti:'¿ESO SE\nMOVIÓ?',tuerca:'¿BIP?'},
        g2:{facu:'TRANQUI,\nNO MUERDO.',jose:'¿Y VOS DE\nQUÉ LADO SOS?',lauti:'¡OTRO\nFICHAJE!',tuerca:'♥'},
        g3:{facu:'¡ABAJO,\nPLANTA!',jose:'¡LA LECHUGA\nCON DIENTES!',lauti:'¡QUÉ PLANTEL\nQUE TIENE!',tuerca:'¡BIP!'},
        entrada:'¡ÑAAAM!',pierde:'¿ÑAM?',
      },
      { // M4 · ARENAS DEL REY
        prisionero:'¡DESPERTARON\nAL REY!',
        g1:{facu:'ALGO LOS\nASUSTÓ.',jose:'¡ESO,\nCORRAN!',lauti:'¡SE VAN AL\nVESTUARIO!',tuerca:'¿BIP?'},
        g2:{facu:'AGARRATE\nFUERTE.',jose:'¡AL FIN ALGO\nRÁPIDO!',lauti:'¡VUELA, VUELA\nEL NUEVE!',tuerca:'¡BIIIP!'},
        g3:{facu:'¡SENTADO,\nMAJESTAD!',jose:'¡EL REY DEL\nPOLVILLO!',lauti:'¡LLEGÓ EL\nREY DE COPAS!',tuerca:'...BIP'},
        entrada:'¡EL TIEMPO\nES MÍO!',pierde:'TENGO...\nSUEÑO...',grito:'¡MÍO!',
      },
      { // M5 · CIUDAD SIN LUNA
        prisionero:'¡DEVUELVAN\nLA LUZ!',
        g1:{facu:'BIEN,\nVECINOS.',jose:'¡NOS ESTÁN\nAYUDANDO!',lauti:'¡ALIENTA LA\nHINCHADA!',tuerca:'♥'},
        g2:{facu:'VOS ALUMBRÁ,\nYO DISPARO.',jose:'¡POR FIN\nUNA LUZ!',lauti:'¡SE PRENDIÓ\nEL ESTADIO!',tuerca:'¡BIP!'},
        g3:{facu:'¡ABAJO,\nGLOBITO!',jose:'¡EL CHORIZO\nVOLADOR!',lauti:'¡APAGÓN EN\nLA CANCHA!',tuerca:'¿BIP?'},
        entrada:'¡APAGUEN\nTODO!',pierde:'¡EH! ¡ME\nDESINFLO!',
      },
      { // M6 · CIUDAD DE DATOS (guardiana)
        prisionero:'¡MIRÁ LA\nLISTA GRANDE!',
        g1:{facu:'AHÍ ESTÁ\nTODO.',jose:'¡NOS FALTAN\nCINCO!',lauti:'¡LA LISTA DE\nFIGURITAS!',tuerca:'¡BIP BIP!'},
        g2:{facu:'¿Y ESTO CÓMO\nSE FRENA?',jose:'¡ESTO ME\nENCANTA!',lauti:'¡CAÑO\nDIGITAL!',tuerca:'¡BIIIP!'},
        g3:{facu:'¡APAGATE\nSOLA!',jose:'¡LA TELE DE\nLA ABUELA!',lauti:'¡A REVISAR\nLA JUGADA!',tuerca:'¿BIP?'},
        entrada:'SU PRECIO:\nCERO.',pierde:'FUERA DE\nSERVICIO...',
      },
      { // M7 · NAVE A LA DERIVA
        prisionero:'¡EL REACTOR\nTIENE VIDA!',
        g1:{facu:'ESTO SE VA\nA PIQUE.',jose:'¡SE CAYÓ\nUN DIENTE!',lauti:'¡SE NOS VA\nAL DESCENSO!',tuerca:'¡BIP!'},
        g2:{facu:'¡ESO,\nPEGATE!',jose:'¡CAMINO POR\nEL TECHO!',lauti:'¡CHILENA\nDESDE ARRIBA!',tuerca:'♥'},
        g3:{facu:'¡QUIETOS,\nCABLES!',jose:'¡EL PLATO\nDE FIDEOS!',lauti:'¡UN NUDO\nEN EL ÁREA!',tuerca:'...BIP'},
        entrada:'¡CHSSSS!',pierde:'...BZZT.',
      },
      { // M8 · VALLE DEL TRUENO
        prisionero:'¡SE LO LLEVÓ\nEL GRANDOTE!',
        g1:{facu:'ESTÁ VACÍA.',jose:'¿Y EL\nDIENTE?',lauti:'¡SE LO LLEVÓ\nALGO GRANDE!',tuerca:'¿BIP?'},
        g2:{facu:'¡SENTADO!\n¡ESO, BIEN!',jose:'¡ARRIBA,\nBICHO!',lauti:'¡ARQUERO\nVOLADOR!',tuerca:'¡BIIIP!'},
        g3:{facu:'¡QUIETO,\nGRANDOTE!',jose:'¡EL EDIFICIO\nCON PATAS!',lauti:'¡QUÉ CENTRAL\nQUE TIENE!',tuerca:'...BIP'},
        entrada:'¡BRRRUUUM!',pierde:'¿MUUU?',
      },
      { // M9 · CIUDAD EMBRUJADA (guardián). De a 2 con LAUTI: él dice su g1 y el otro contesta "ENTRAMOS TODOS."
        prisionero:'¡LOS MUEBLES\nCAMINAN!',
        g1:{facu:'ENTRAMOS\nTODOS.',jose:'¿QUIÉN\nTIENE MIEDO?',lauti:'YO AHÍ\nNO ENTRO.',tuerca:'...BIP'},
        g2:{facu:'TOCALA\nFUERTE.',jose:'¡AFUERA,\nFANTASMAS!',lauti:'¡PITAZO\nFINAL!',tuerca:'¡DONG!'},
        g3:{facu:'¡ABAJO,\nROPERO!',jose:'¡EL ROPERO\nDE LA TÍA!',lauti:'¡JUEGA DE\nLOCAL, EH!',tuerca:'¡BIP!'},
        entrada:'¡NO SE TOCAN\nMIS COSAS!',pierde:'QUÉ SUEÑO\nQUE TENGO...',
      },
      { // M10 · TEMPLO PERDIDO (final)
        prisionero:'¡VAN POR\nEL EJE!',
        g1:{facu:'¿A MÍ? ¿UN\nPRECIO?',jose:'¡ME PUSO\nPRECIO!',lauti:'¡NO ME\nVENDO!',tuerca:'¡BIP!'},
        g2:{facu:'¡ARRIBA!\nDESPACITO.',jose:'ROBADO,\nPERO NUESTRO.',lauti:'¡SUBE EL\nASCENSOR!',tuerca:'¡BIP BIP!'},
        g3:{facu:'¡QUIETO,\nPIEDRA!',jose:'¡EL SEÑOR\nLADRILLO!',lauti:'¡LA FINAL\nDEL MUNDO!',tuerca:'¡BIP!'},
        entrada:'...LADRONES.',entradaTuerca:'¿...TUERCA?\n¿CON ELLOS?',faseOro:'...NO\nPASAN.',pierde:'...TRAEN...\nLOS DIENTES.',
        tatuEntrada:'¡LOS LLEVO\nA TODOS!',tatuPierde:'¡CERRADO\nPOR HOY!',liquidacion:'¡LIQUIDACIÓN!',
      },
    ],
    final:{
      tasador:'¿Y SI LO\nHABLAMOS?',
      ultimoDiente:{facu:'ESTO SE\nARREGLA.',jose:'LISTO.\nA CASA.',lauti:'¡GOOOL!',tuerca:'♥'},
      clic:'¡CLIC!',clicClac:'¡CLIC-CLAC!',
      faltanPinones:'MISIÓN SECRETA 11 · TE FALTAN {n}', // letra normal (no globo)
    },
  },

  // ---------- CÓMO JUGAR y tarjeta de controles (ayuda.js, controles.js, hud.js) ----------
  controles:{
    comoJugar:'CÓMO JUGAR',
    tarjetas:{teclado:'TECLADO',flechas:'TECLADO · FLECHAS',wasd:'TECLADO · WASD',simples:'TECLADO · SIMPLES',deados:'TECLADO · DE A 2',
      joystick:'JOYSTICK',tactil:'PANTALLA TÁCTIL'},
    mover:'MOVER',moverApuntar:'MOVER Y APUNTAR',moverApuntarCorto:'MOVER · APUNTAR',
    saltar:'SALTAR',disparar:'DISPARAR',granada:'GRANADA',agacharse:'AGACHARSE',agacharseBajar:'AGACHARSE · ×2 BAJAR',
    cambiarArma:'CAMBIAR ARMA',armaAnterior:'ARMA ANTERIOR',armaSiguiente:'ARMA SIGUIENTE',mantenerRueda:'MANTENER: RUEDA',
    armaRueda:'ARMA · MANTENER: RUEDA',tocarRueda:'TOCAR: RUEDA',deslizarArma:'DESLIZAR: ARMA',mantenerVolar:'MANTENER: VOLAR',
    apuntarArriba:'APUNTAR ARRIBA',izquierda:'IZQUIERDA',derecha:'DERECHA',
    apuntaSolo:'APUNTA SOLO',apuntanSolos:'APUNTAN SOLOS',
    armaDirecta:'ARMA DIRECTA · {avion}: AVIÓN',pausa:'PAUSA',pausaO:'PAUSA (O {alt})',
    manoIzq:'MANO IZQUIERDA',manoDer:'MANO DERECHA',enElJuego:'EN EL JUEGO',mostrando:'MOSTRANDO: {que}',apretar:'APRETAR: {que}',
    cambiadas:'TECLAS CAMBIADAS EN OPCIONES',
    // lista de la pausa con teclado (hud.js): la tecla la pone btn()
    acc:{arriba:'apuntar arriba sin frenar',granada:'granada / cañón',bajarChatarra:'bajar de la Chatarra',
      cambiarArma:'cambiar arma',rueda:'rueda de armas y avión',directa:'arma directa · {avion} avión',
      salir:'salir (en pausa)',sonido:'sonido · música',pantalla:'pantalla completa',disparar:'disparar (apunta solo)',
      dosVeces:'igual que {tecla} dos veces'},
    j1:'JUGADOR 1',j2:'JUGADOR 2',solos:'Apuntan solos · {pausa} pausa',
    teclaNoAnda:'¿Una tecla no anda? Soltá las otras.',
    // CÓMO JUGAR (ayuda.js)
    agacharseAyuda:'{abajo} AGACHARSE',saltaApunta:'{saltar} SALTÁ · APUNTA SOLO',dispararArriba:'↑ DISPARÁ ARRIBA SIN FRENAR',
    enElAire:'EN EL AIRE: {abajo} DISPARÁ ABAJO',enElAireSolo:'EN EL AIRE APUNTA SOLO ABAJO',granadaAyuda:'{granada} GRANADA',
    deados:'De a 2: en el otro joystick, {saltar} al elegir personaje.',
    deadosConectar:'De a 2: conectá otro joystick y apretá {saltar} al elegir.',
  },

  // ---------- joystick desconocido (input.js) ----------
  joystick:{desconocido:'NO RECONOZCO ESTE JOYSTICK',desconocidoSub:'Puede que los botones estén cambiados.'},

  // ---------- intro (intro.js) ----------
  intro:{omitir:'OMITIR',omitirCon:'{tecla} OMITIR',omitirIntro:'{tecla} OMITIR INTRO'},
}};

let IDIOMA='es';
// lo que falte en otro idioma sale en castellano
function TX_mezclar(base,otro){if(!otro)return base;const r=Array.isArray(base)?base.slice():{...base};
  for(const k in otro)r[k]=(base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))?TX_mezclar(base[k],otro[k]):otro[k];return r;}
let TX=TEXTOS.es; // (no es T: T es el contador de cuadros del juego, juego.js)
function TX_idioma(id){IDIOMA=TEXTOS[id]?id:'es';TX=IDIOMA==='es'?TEXTOS.es:TX_mezclar(TEXTOS.es,TEXTOS[IDIOMA]);}
// número con separador de miles (1.500)
function txNum(n){return typeof n==='number'?n.toLocaleString(IDIOMA==='es'?'es-AR':IDIOMA):String(n);}
// rellena {huecos}; si falta un dato, deja el hueco a la vista para que se note en las pruebas
function tx(s,d){return String(s).replace(/\{(\w+)\}/g,(m,k)=>d&&d[k]!==undefined&&d[k]!==null?txNum(d[k]):m);}
// "1 BAJA" / "3 BAJAS"
function txPl(n,uno,varios){return txNum(n)+' '+(n===1?uno:varios);}
