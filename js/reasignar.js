'use strict';
// Óxido · Reasignar controles (OPCIONES → CONTROLES → TECLAS / JOYSTICK)
// Para cada acción del juego: elegirla y apretar la tecla o el botón nuevo. Si esa tecla ya la usa otra acción, se
// intercambian y se avisa ("YA LA USABA DISPARAR: AHORA ES X"). Las teclas fijas (ESC, ⌫, P, Q, ENTER, N, M, F, 1–6)
// no se pueden usar. RESTABLECER vuelve a las de fábrica. Se guarda en localStorage ('oxido-teclas', 'oxido-botones').
// btn() de input.js y los controles dibujados de Arte (controles.js) muestran la tecla reasignada: REA_tecla(acción).
// Solo el teclado de 1 jugador con controles COMPLETOS y el joystick; los SIMPLES y el de a 2 con un teclado, no.
// Prefijo REA_.
const REA_ACC_TECLA=[['jump','SALTAR'],['shoot','DISPARAR'],['bomb','GRANADA'],['armaAnt','ARMA ANTERIOR'],['armaSig','ARMA SIGUIENTE'],['air','RUEDA Y AVIÓN'],['left','IZQUIERDA'],['right','DERECHA'],['up','ARRIBA Y APUNTAR'],['down','ABAJO Y AGACHARSE']];
const REA_ACC_PAD=[['jump','SALTAR'],['shoot','DISPARAR'],['bomb','GRANADA'],['swap','RUEDA DE ARMAS'],['air','AVIÓN']];
const REA_FIJAS=new Set(['Escape','Backspace','KeyP','Enter','KeyN','KeyM','KeyF','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','MetaLeft','MetaRight','ControlLeft','ControlRight','AltLeft','AltRight','ShiftLeft','ShiftRight']);
// de fábrica (copias de input.js, para RESTABLECER)
const REA_KEYMAP0={...KEYMAP},REA_PAD0={jump:0,shoot:2,bomb:1,swap:3,air:10}; // L1/R1 quedan para cambiar de arma
let REA_pad={...REA_PAD0};
let REA=null; // {modo:'teclado'|'pad', sel, esperando, aviso:{s,t}}
// teclas de fábrica de antes del 23 nov (un solo esquema, flechas): si lo guardado es igual a esto, no se tocó nada y
// se usan las nuevas; si es distinto, la persona las cambió y se respetan (sumando Q/E de arma si están libres)
const REA_VIEJO={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',KeyZ:'shoot',KeyX:'jump',Space:'jump',KeyC:'bomb',KeyS:'air',Tab:'air',
  KeyN:'music',KeyM:'mute',KeyP:'pause',Escape:'back',Backspace:'back',KeyQ:'quit',Enter:'start'};
function REA_cargar(){
  try{const t=JSON.parse(store.get('oxido-teclas')||'null');
    if(t&&typeof t==='object'){
      const nuevo=Object.values(t).includes('armaAnt')||Object.values(t).includes('armaSig');
      const igualViejo=!nuevo&&Object.keys(REA_VIEJO).length===Object.keys(t).length&&Object.keys(t).every(c=>t[c]===REA_VIEJO[c]);
      if(igualViejo)store.set('oxido-teclas',JSON.stringify(KEYMAP)); // nada reasignado: pasa a las nuevas
      else{for(const c in KEYMAP)delete KEYMAP[c];Object.assign(KEYMAP,t);
        if(!nuevo){if(KEYMAP.KeyQ==='quit')delete KEYMAP.KeyQ;if(!KEYMAP.KeyQ)KEYMAP.KeyQ='armaAnt';if(!KEYMAP.KeyE)KEYMAP.KeyE='armaSig';}}}}catch(e){}
  try{const b=JSON.parse(store.get('oxido-botones')||'null');if(b&&typeof b==='object')REA_pad={...REA_PAD0,...b};}catch(e){}
  REA_etiquetas();
}
function REA_guardar(){store.set('oxido-teclas',JSON.stringify(KEYMAP));store.set('oxido-botones',JSON.stringify(REA_pad));REA_etiquetas();}
// nombre corto de una tecla para mostrar
function REA_nombre(code){if(!code)return'—';const m={ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'ESPACIO',Tab:'TAB',Comma:',',Period:'.',Slash:'/',Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Minus:'-',Equal:'=',Backquote:'`',IntlBackslash:'<'};
  if(m[code])return m[code];if(KB_NOMBRE[code])return KB_NOMBRE[code];return code.replace(/^Key|^Digit|^Numpad/,'').toUpperCase();}
// teclas de una acción (la primera es la que se muestra)
const REA_teclas=a=>Object.keys(KEYMAP).filter(c=>KEYMAP[c]===a);
const REA_tecla=a=>REA_teclas(a)[0]||null;
// btn() lee BTN_KB y BTN_PAD: se actualizan con lo reasignado
// la tecla de una acción en el esquema que se está usando (input.js: kbEsquema); si no tiene, la primera que haya
function REA_teclaEsq(a){const ts=REA_teclas(a),esq=typeof kbEsquema!=='undefined'?kbEsquema:'wasd',otro=esq==='wasd'?'flechas':'wasd';
  return ts.find(c=>KB_DE[c]===esq&&c!=='Space')||ts.find(c=>KB_DE[c]!==otro&&c!=='Space')||ts.find(c=>KB_DE[c]!==otro)||ts[0]||null;}
function REA_etiquetas(){
  const n=a=>REA_nombre(REA_teclaEsq(a));
  BTN_KB.jump=n('jump');BTN_KB.shoot=BTN_KB.r1=BTN_KB.r2=n('shoot');BTN_KB.bomb=BTN_KB.l2=n('bomb');
  BTN_KB.armaAnt=n('armaAnt');BTN_KB.armaSig=n('armaSig');
  // cambiar de arma / rueda: en WASD, Q/E; con flechas, TAB
  BTN_KB.swap=BTN_KB.air=(typeof kbEsquema==='undefined'||kbEsquema==='wasd')&&REA_tecla('armaAnt')?n('armaAnt')+'/'+n('armaSig'):n('air');
  BTN_KB.up=n('up');BTN_KB.down=n('down');BTN_KB.left=n('left');BTN_KB.right=n('right');
  BTN_PAD.jump=REA_pad.jump;BTN_PAD.shoot=REA_pad.shoot;BTN_PAD.bomb=REA_pad.bomb;BTN_PAD.swap=REA_pad.swap;BTN_PAD.air=REA_pad.air;
}
// el joystick: input.js readPad pregunta qué botón es cada acción
const REA_boton=(a,def)=>REA_pad[a]!==undefined?REA_pad[a]:def;
const REA_padCambiado=a=>REA_pad[a]!==REA_PAD0[a];
// ---------- la pantalla ----------
function REA_abrir(modo){REA={modo,sel:0,esperando:false,aviso:null,t:0,ant:null};state='reasignar';try{SFX.swap();}catch(e){}}
const REA_filas=()=>{const l=REA.modo==='pad'?REA_ACC_PAD:REA_ACC_TECLA;return[...l,['_rest','RESTABLECER'],['_volver','VOLVER']];};
function REA_avisar(s){REA.aviso={s,t:150};}
function REA_asignarTecla(a,code){
  if(REA_FIJAS.has(code)){REA_avisar('ESA TECLA ES FIJA: ELEGÍ OTRA');return;}
  const otra=KEYMAP[code],todas=REA_teclas(a),fl=todas.filter(c=>KB_DE[c]!=='flechas'&&c!=='Space'),mias=fl.length?fl:todas; // cambia la del esquema WASD (las flechas quedan)
  if(otra===a){REA_avisar('YA ERA ESA');return;}
  for(const c of mias)delete KEYMAP[c];
  if(otra&&otra!==a&&REA_ACC_TECLA.some(([k])=>k===otra)){ // la usaba otra acción: se intercambian
    if(mias[0])KEYMAP[mias[0]]=otra;
    const nom=REA_ACC_TECLA.find(([k])=>k===otra)[1];
    REA_avisar('YA LA USABA '+nom+': AHORA '+nom+' ES '+REA_nombre(mias[0]));
  }else if(otra){REA_avisar('ESA TECLA ES FIJA: ELEGÍ OTRA');for(const c of mias)KEYMAP[c]=a;return;}
  KEYMAP[code]=a;REA_guardar();try{SFX.pick();}catch(e){}
}
function REA_asignarBoton(a,i){
  const otra=Object.keys(REA_pad).find(k=>REA_pad[k]===i&&k!==a);
  if(otra){const nom=REA_ACC_PAD.find(([k])=>k===otra)[1];REA_pad[otra]=REA_pad[a];REA_avisar('YA LO USABA '+nom+': SE INTERCAMBIARON');}
  if(i===8||i===9){REA_avisar('ESE BOTÓN ES FIJO (PAUSA Y VOLVER): ELEGÍ OTRO');return;}
  REA_pad[a]=i;REA_guardar();try{SFX.pick();}catch(e){}
}
function REA_restablecer(){if(REA.modo==='pad')REA_pad={...REA_PAD0};else{for(const c in KEYMAP)delete KEYMAP[c];Object.assign(KEYMAP,REA_KEYMAP0);}REA_guardar();REA_avisar('VOLVIERON LAS DE FÁBRICA');try{SFX.swap();}catch(e){}}
// teclado: la tecla nueva se toma antes que nadie (captura) mientras se espera
addEventListener('keydown',e=>{
  if(!REA||state!=='reasignar'||!REA.esperando||REA.modo!=='teclado')return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.code==='Escape'){REA.esperando=false;REA_avisar('SIN CAMBIOS');return;}
  REA_asignarTecla(REA_filas()[REA.sel][0],e.code);REA.esperando=false;
},true);
// joystick: el botón nuevo (el primero que se aprieta y antes no estaba apretado)
function REA_botonNuevo(){
  const gps=navigator.getGamepads?navigator.getGamepads():[];
  for(const gp of gps){if(!gp)continue;const ahora=gp.buttons.map(b=>!!(b&&b.pressed));
    const ant=REA.ant&&REA.ant[gp.index];REA.ant=REA.ant||{};REA.ant[gp.index]=ahora;
    if(ant)for(let i=0;i<ahora.length;i++)if(ahora[i]&&!ant[i]&&i<12)return i;}
  return -1;
}
function REA_upd(){
  const r=REA;if(!r){state='opciones';return;}r.t++;if(r.aviso&&--r.aviso.t<=0)r.aviso=null;
  if(r.esperando){if(r.modo==='pad'){const i=REA_botonNuevo();if(i>=0){if(i===8){r.esperando=false;REA_avisar('SIN CAMBIOS');}else{REA_asignarBoton(REA_filas()[r.sel][0],i);r.esperando=false;}}}
    else if(r.modo==='pad'&&pressed.back){r.esperando=false;}
    return;}
  if(r.modo==='pad')REA_botonNuevo(); // lleva el estado de los botones, así el que abre la espera no cuenta como nuevo
  const f=REA_filas();
  if(pressed.up){r.sel=(r.sel+f.length-1)%f.length;SFX.swap();}
  else if(pressed.down){r.sel=(r.sel+1)%f.length;SFX.swap();}
  else if(pressed.back&&r.t>6){state='opciones';REA=null;SFX.swap();}
  else if(pressed.start||pressed.jump||pressed.shoot){REA_elegir(r.sel);}
}
function REA_elegir(i){const r=REA,k=REA_filas()[i][0];r.sel=i;
  if(k==='_volver'){state='opciones';REA=null;SFX.swap();return;}
  if(k==='_rest'){REA_restablecer();return;}
  r.esperando=true;r.aviso=null;r.ant=null;if(r.modo==='pad')REA_botonNuevo();try{SFX.swap();}catch(e){}}
function REA_dibujar(){
  const r=REA;if(!r)return;dim(0.6);
  txt(r.modo==='pad'?'JOYSTICK':'TECLAS',W/2,14,13,'#ffe08a','center');
  const f=REA_filas(),muchas=f.length>10,st=muchas?10.5:12,y0=muchas?30:36,x0=58,w=204,bh=muchas?9.5:11; // con Q/E son 12 filas
  f.forEach(([k,nm],i)=>{const y=y0+i*st,on=i===r.sel;
    zona(x0,y-2,w,bh,{sobre:()=>{if(!r.esperando&&r.sel!==i){r.sel=i;SFX.swap();}},clic:()=>{if(!r.esperando)REA_elegir(i);}});
    ctx.fillStyle=on?'rgba(243,201,105,0.16)':'rgba(18,12,24,0.6)';ctx.fillRect(x0,y-2,w,bh);
    if(on){ctx.strokeStyle='#f3c969';ctx.lineWidth=1;ctx.strokeRect(x0+0.5,y-1.5,w-1,bh-1);}
    if(k[0]==='_'){txt(nm,W/2,y,6,on?'#ffe08a':'#aaa','center');return;}
    txt(nm,x0+7,y+0.5,5,on?'#ffe08a':'#aaa','left',false);
    let v;if(r.modo==='pad'){const lab=PAD_LBL[(padInfo[devAny]&&padInfo[devAny].brand)||'ps'];v=lab[REA_pad[k]]||('BOTÓN '+REA_pad[k]);}
    else v=REA_teclas(k).map(REA_nombre).join(' o ')||'—';
    if(on&&r.esperando){v=(T>>4)%2?'APRETÁ…':'';}
    txt(v,x0+w-30,y,6,on&&r.esperando?'#7dff9a':'#fff','center');});
  const ya=y0+f.length*st+3;
  if(r.aviso)txt(r.aviso.s,W/2,ya,5,'#ffb36b','center',false);
  else if(r.esperando)txt(r.modo==='pad'?'Apretá el botón nuevo · '+btn('back')+' cancela':'Apretá la tecla nueva · ESC cancela',W/2,ya,5,'#7dff9a','center',false);
  txt('↑ ↓ elegir · '+btn('ok')+' cambiar · '+btn('back')+' volver',W/2,H-12,5,'#aaa','center');
}
REA_cargar();
