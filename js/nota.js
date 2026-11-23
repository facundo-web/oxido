'use strict';
// Óxido · Mejor tiempo y NOTA por misión (S, A, B, C)  — propuesta 3 de Investigación (notas/investigacion/propuestas.md)
// (Segundo programador. Va después de reloj.js e intro.js, antes de juego.js.)
//
// La nota es de la MISIÓN ENTERA (no la pelea con el villano: esa tiene ORO, PLATA y BRONCE en reloj.js). Otra escala
// (letras) y otro lugar (la línea del avance de la placa y la fila MISIÓN de la elección), para que no se confundan.
// Se arma con 100 puntos:
//   TIEMPO   25 · todo si tardás la mitad del tiempo par (JT_PAR de reloj.js) o menos; nada desde 1,25 veces el par.
//   RESCATES 20 · la parte de prisioneros liberados (si la misión no tiene, todo).
//   DAÑO     35 · sin golpes, todo; cada golpe recibido resta 5 (7 golpes o más, nada).
//   PUNTOS   20 · los puntos de la misión sin los bonus del final (bajas, cajas, tramos), contra NM_PREF de cada misión.
//   S desde 85 · A desde 70 · B desde 50 · C abajo.
// Medido con el bot el 23 nov (40 corridas: --3 y --lento, 10 misiones; todas ganadas): el bot tarda ~el par/1,6, rescata
// casi todo, hace 35–48 mil puntos y, como juega invulnerable, se le cuentan los golpes que habría recibido: 18 a 108 por
// misión. Así el bot saca B (≈61: tiempo 21 + rescates 20 + daño 0 + puntos 20). Una persona que esquiva (2–3 golpes)
// llega a A; S pide pocos golpes, rápido y rescatando todo. A ajustar con personas (notas/mecanicas/nota.md).
// Mejor tiempo y mejor nota se guardan por misión y dificultad en 'oxido-misiones' (aparte del historial de récords y
// logros, que no se tocan). Con AYUDAS se ve la nota pero no se guarda (igual que los récords).
// Para la placa (cumplida.js) y la elección de misión (hud.js): NM_avance() da el texto y NM_dibujarSelect(i,y) dibuja.
// El bot lee NM.log. Prefijo NM_.
const NM_CORTES=[[85,'S','#ff8ad8'],[70,'A','#7dff9a'],[50,'B','#9ad0ff'],[0,'C','#c8b8a0']];
// puntos de referencia por misión: mediana del bot (sin los bonus del final) ×0,7. El bot no pierde el bonus SIN DAÑO de
// cada tramo porque es invulnerable; una persona sí, por eso el margen.
const NM_PREF=[25000,26300,32400,29600,29100,30300,28400,28400,30700,28700];
const NM={log:[],res:null,golpes:0,resc0:0,pris0:0};
const NM_KEY='oxido-misiones';
function NM_leer(){try{const o=JSON.parse(store.get(NM_KEY)||'null');if(o&&typeof o==='object'&&!Array.isArray(o))return o;}catch(e){}return{};}
let NM_G=NM_leer();
ON_START.push(()=>{NM.golpes=0;NM.res=null;NM.resc0=rescued;NM.pris0=prisoners.length;});
ON_EVENT.push((t,d)=>{
  if(t==='hurt')NM.golpes++;
  if(t==='missionWin')NM_cerrar(d||{});
});
const NM_letra=v=>NM_CORTES.find(c=>v>=c[0]);
// cuenta la nota con los datos de la misión que se acaba de ganar
function NM_calcular(o){
  const par=(typeof JT_PAR!=='undefined'?JT_PAR[o.lvl]:240)||240,k=typeof JT_escala==='function'?1+(JT_escala()-1)*0.5:1,p=par*k;
  const T=25*clamp((1.25*p-o.secs)/(0.75*p),0,1);
  const R=o.pris>0?20*clamp(o.resc/o.pris,0,1):20;
  const D=35*Math.max(0,1-o.golpes/7);
  const Pn=20*clamp(o.pts/(NM_PREF[o.lvl]||28000),0,1);
  const v=Math.round(T+R+D+Pn);
  return{v,letra:NM_letra(v)[1],col:NM_letra(v)[2],T:Math.round(T),R:Math.round(R),D:Math.round(D),P:Math.round(Pn)};
}
function NM_cerrar(d){
  const lvl=d.level??levelIdx,secs=typeof JT!=='undefined'?JT.mis/60:(d.time||0);
  const st=stats||{},bonus=(st.tb||0)+(st.lb||0)+(st.mb||0)+(st.rb||0);
  const pts=Math.max(0,score-(typeof PC_mis!=='undefined'&&PC_mis?PC_mis.score0:0)-bonus);
  const resc=Math.max(0,rescued-NM.resc0),pris=Math.max(NM.pris0,resc);
  const o={lvl,secs,pts,resc,pris,golpes:NM.golpes,dif:difficulty};
  const n=NM_calcular(o);
  const key=difficulty+'|'+lvl,prev=NM_G[key]||null,ay=typeof partida!=='undefined'&&partida&&partida.ayudas;
  const mejorT=!prev||prev.t==null||secs<prev.t,mejorN=!prev||!prev.n||n.v>(prev.v||0);
  NM.res={...o,...n,mejorT:!!(prev&&mejorT),mejorN:!!(prev&&mejorN),antes:prev};
  if(!ay){NM_G[key]={t:+(mejorT?secs:prev.t).toFixed(1),n:mejorN?n.letra:prev.n,v:mejorN?n.v:prev.v,f:Date.now()};store.set(NM_KEY,JSON.stringify(NM_G));}
  NM.log.push({mision:lvl+1,segs:+secs.toFixed(1),pts,resc:resc+'/'+pris,golpes:NM.golpes,golpesBot:typeof ECO!=='undefined'?ECO.golpesBot:null,nota:n.letra,v:n.v,partes:[n.T,n.R,n.D,n.P]});
}
// ---------- la placa: una línea junto al avance ("MISIÓN n DE 10 · NOTA A · MEJOR 2:31") ----------
function NM_avance(){
  const r=NM.res;if(!r||r.lvl!==levelIdx)return'';
  const best=NM_G[r.dif+'|'+r.lvl],tb=best&&best.t!=null?best.t:r.secs;
  return' · NOTA '+r.letra+(r.mejorN?' ¡SUBISTE!':'')+' · '+(r.mejorT?'¡MEJOR TIEMPO! '+JT_fmt(r.secs):'MEJOR '+JT_fmt(tb));
}
// la letra de la nota de esta misión, con su color (por si la placa la quiere dibujar aparte)
function NM_nota(){const r=NM.res;return r&&r.lvl===levelIdx?{letra:r.letra,col:r.col,v:r.v}:null;}
// ---------- la elección de misión: cuadradito con la mejor nota y el mejor tiempo, al lado de "MISIÓN" ----------
function NM_dibujarSelect(i,ry,x){
  const b=NM_G[difficulty+'|'+i];if(!b||!b.n)return;
  const c=NM_CORTES.find(c=>c[1]===b.n)||NM_CORTES[3],x0=x??78,y0=ry+1.5;
  ctx.fillStyle='#120c18';ctx.fillRect(x0-0.5,y0-0.5,8,8);ctx.fillStyle=c[2];ctx.fillRect(x0,y0,7,7);
  txt(b.n,x0+3.5,y0+1,5,'#120c18','center',false);
  if(b.t!=null)txt(JT_fmt(b.t),x0+10,y0+1.5,4,'#b9adc8','left',false);
}
