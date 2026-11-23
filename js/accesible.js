'use strict';
// Óxido · Accesibilidad y ayudas: el estado de las opciones y lo que usan los demás archivos
// Se guarda en localStorage ('oxido-acc', JSON). De fábrica:
//   · MOVIMIENTO: REDUCIDO si el sistema lo pide (prefers-reduced-motion); si no, NORMAL.
//   · TEXTO: GRANDE en aparatos táctiles (celular, tablet); si no, NORMAL.
// Lo que usan los demás:
//   MOV_reducido()   movimiento reducido: grano quieto, sin parpadeo ni rayas de película, sacudida a 1/3, sin cuadro
//                    congelado, destellos de un cuadro y suaves, sin "de a dos", viñetas con fundido, líneas mínimas.
//   TXT_k()          1 o 1,5 (texto grande). TXT_ajuste(size) es lo que usa txt() de base.js.
//   FL_puede()       límite de destellos de pantalla: nunca más de 3 por segundo (WCAG 2.3.1), también en NORMAL.
//                    FL_k(): cuánto de fuerte (0,35 en REDUCIDO).
//   ACC.disparo      'normal' | 'auto' (mantener = ráfaga continua) | 'alternado' (tocar empieza, tocar para)
//   ACC.rueda        'mantener' | 'tocar' (la rueda de armas se abre y se cierra tocando, sin mantener)
//   ACC.contraste    balas enemigas en alto contraste (borde blanco y forma distinta)
//   ACC.ayVidas / ACC.ayDano / ACC.ayLento   ayudas: vidas infinitas, daño reducido, juego más lento.
//                    AYUDAS_on(): si hay alguna (los récords van a otra tabla y los logros de desafío no cuentan).
// Prefijo ACC_ (y MOV_, TXT_, FL_, AYUDAS_ para lo que se usa de afuera).
const ACC_DEF=()=>({
  mov:(()=>{try{return window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?'reducido':'normal';}catch(e){return'normal';}})(),
  txt:(()=>{try{return(navigator.maxTouchPoints>0&&matchMedia('(pointer: coarse)').matches)?'grande':'normal';}catch(e){return'normal';}})(),
  disparo:'normal',rueda:'mantener',contraste:false,ayVidas:false,ayDano:false,ayLento:false});
const ACC=(()=>{let o={};try{o=JSON.parse(store.get('oxido-acc')||'{}')||{};}catch(e){o={};}return{...ACC_DEF(),...o};})();
function ACC_guardar(){store.set('oxido-acc',JSON.stringify(ACC));}
function ACC_poner(k,v){ACC[k]=v;ACC_guardar();}
const MOV_reducido=()=>ACC.mov==='reducido';
const TXT_k=()=>ACC.txt==='grande'?1.5:1;
// texto grande: lo chico crece más que lo grande (los títulos ya se leen)
// en celulares y tablets (pantalla chica, se mira de más lejos) crece más: lo más chico pasa a 7 (≈ 15–18 px)
const TXT_tactil=(()=>{try{return navigator.maxTouchPoints>0&&matchMedia('(pointer: coarse)').matches;}catch(e){return false;}})();
function TXT_ajuste(s){if(ACC.txt!=='grande')return s;
  if(TXT_tactil||(typeof onTouch==='function'&&onTouch()))return s<=4?7:s<=7?Math.round(s*1.5):s<=10?s+3:s;
  return s<=4?s+2:s<=7?Math.round(s*1.4):s<=10?s+2:s;}
const AYUDAS_on=()=>!!(ACC.ayVidas||ACC.ayDano||ACC.ayLento);
// ---------- destellos: como mucho 3 por segundo ----------
const FL_hist=[];
function FL_puede(){const ahora=T;while(FL_hist.length&&ahora-FL_hist[0]>60)FL_hist.shift();if(FL_hist.length>=3)return false;FL_hist.push(ahora);return true;}
const FL_k=()=>MOV_reducido()?0.35:1;
ON_START.push(()=>{FL_hist.length=0;});
// ---------- DISPARO: ALTERNADO (tocar empieza, tocar otra vez para) y AUTOMÁTICO ----------
// input.js: con ALTERNADO, held('shoot') devuelve este estado; cada toque nuevo del botón lo da vuelta (una vez por cuadro)
const ACC_fuego=[false,false],ACC_fuegoT=[-1,-1];
function ACC_fuegoAlt(){const k=inSlot?1:0,toque=inSlot?!!pressed2.shoot:!!pressed.shoot;
  if(toque&&ACC_fuegoT[k]!==T){ACC_fuego[k]=!ACC_fuego[k];ACC_fuegoT[k]=T;}return ACC_fuego[k];}
ON_START.push(()=>{ACC_fuego[0]=ACC_fuego[1]=false;});
// AUTOMÁTICO: mantener disparo tira tan seguido como tocando rápido (la pistola no queda más lenta por mantener)
const ACC_auto=()=>ACC.disparo==='auto'||ACC.disparo==='alternado';
