'use strict';
// Óxido · Recolectar: los premios viajan al HUD y los puntos salen en chapitas que se atraen
// Va antes de juego.js. Usa ON_START, ON_STEP, ON_DRAW y ON_HUD (base.js).
//
// La lógica del juego no cambia: munición, granadas, vidas, puntos, etc. se actualizan al instante como siempre
// (el balance y el bot no se enteran). Lo que se anima es lo que MUESTRA el HUD: cada número es un contador que
// persigue al valor real. Mientras un premio viaja, su parte queda retenida (hold); al llegar, el número sube de a poco.
//
// Ganchos en otros archivos:
//   combate.js  collect(): RC_foto() antes y RC_junto() después · kill() y dmgCrate(): RC_soltar() (chapitas)
//   jefes.js    bossReward(): RC_jefe() (la vida y la salud del premio por jefe)
//   medallas.js checkMedals(): RC_fotos() antes, RC_medalla() y RC_avion() después (la medalla vuela a la insignia,
//               lo que da a cada jugador vuela a su lugar, y el avión gratis vuela al avión)
//   jugador.js  escudo que se recarga solo (LEYENDA): RC_sumaJug()
//   hud.js / grillo.js: RC_ver(clave,real) da el número a mostrar, RC_salto(clave) el golpecito del ícono,
//               RC_luz(clave) si está sumando, RC_ancla(clave,x,y) anota dónde está cada cosa en el HUD.
// Claves: sc puntos · lv vidas · fl aviones gratis · md medalla (insignia) · y por jugador s (0 o 1): am{s} arma
//   (am{s}{arma} su munición; como ancla, el iconito de esa arma cuando no es la que tenés en la mano),
//   gr{s} granadas · hp{s} corazones · sh{s} escudo · gri{s} cabina del Grillo (ar{s} su blindaje).

// ================== contadores del HUD ==================
const RC_cnt={};                  // clave → {get, hold, shown, rate, bump, mudo, fijo, dur}
const RC_anc={};                  // destino → {x,y,b} en pantalla (b: golpecito al llegar algo)
const RC_ANC0={sc:[49,8],lv:[67,7],fl:[W-40,20],md:[12,12],am0:[W-30,8],gr0:[W-62,20],hp0:[30,16],sh0:[50,16],gri0:[W-31,12],
  am1:[W-74,H-7],gr1:[W-14,H-7],hp1:[W-50,H-16],sh1:[W-30,H-16],gri1:[W-52,H-7]};
const RC_DUR=42;                  // cuadros que dura, como mucho, la cuenta de un número (~0,7 s)
let RC_ticT=-9,RC_llegaT=-9,RC_llegaN=0;
function RC_contador(key,get,antes){
  let c=RC_cnt[key];
  if(!c){const v=antes??get();if(v==null)return null;c=RC_cnt[key]={get,hold:0,shown:v,rate:0,bump:0,a:v,b:v,mudo:false,fijo:false};}
  return c;
}
// número que muestra el HUD: nunca más que el real (lo que baja, como un disparo o un golpe, baja al instante)
function RC_ver(key,real){const c=RC_cnt[key];if(!c)return real;return Math.min(real,Math.max(0,Math.ceil(c.shown-1e-6)));}
// golpecito del ícono o del número: −2, −1 o 0 px
function RC_salto(key){const c=RC_cnt[key],a=RC_anc[key],b=Math.max(c?c.bump:0,a?a.b:0);return b>6?-2:b>2?-1:0;}
function RC_luz(key){const c=RC_cnt[key],a=RC_anc[key];return (!!c&&c.bump>0)||(!!a&&a.b>0);}
function RC_ancla(key,x,y){const a=RC_anc[key];if(a){a.x=x;a.y=y;}else RC_anc[key]={x,y,b:0};}
function RC_donde(key){let a=RC_anc[key];if(!a){const d=RC_ANC0[key]||[W/2,8];a=RC_anc[key]={x:d[0],y:d[1],b:0};}return a;}
// cuadros de cuenta según cuánto falta: +1 al toque, +2 en 20 cuadros, de 4 en adelante ~0,7 s
const RC_frames=(d,max)=>d<=1?1:Math.min(max,d*10);
function RC_pasoCnt(){
  for(const key in RC_cnt){
    const c=RC_cnt[key],real=c.get();
    if(real==null){delete RC_cnt[key];continue;}
    const tgt=Math.max(0,real-c.hold);
    if(c.shown>tgt){c.shown=tgt;c.rate=0;}
    else if(c.shown<tgt){
      const d=tgt-c.shown;
      const dur=c.dur||RC_DUR;if(c.rate<=0||d/c.rate>dur+4){c.rate=d/RC_frames(d,dur);c.a=c.shown;c.b=tgt;}
      const antes=Math.ceil(c.shown-1e-6);c.shown=Math.min(tgt,c.shown+c.rate);
      if(Math.ceil(c.shown-1e-6)>antes){c.bump=Math.max(c.bump,3);
        // tic suave por paso, espaciado (como mucho uno cada 3 cuadros); sube de tono mientras cuenta
        if(!c.mudo&&T-RC_ticT>=3){RC_ticT=T;SFX.rcTic(clamp((c.shown-c.a)/Math.max(1,c.b-c.a),0,1));}}
    }else c.rate=0;
    if(c.bump>0)c.bump--;
    if(!c.fijo&&c.hold<=0&&c.shown>=real&&c.bump<=0)delete RC_cnt[key];
  }
  for(const k in RC_anc)if(RC_anc[k].b>0)RC_anc[k].b--;
}

// ================== premios que vuelan al HUD ==================
const RC_vuelos=[];               // en pantalla: {ico,sx,sy,anc,key,amt,t,pop,dur,slot,chapa,x,y,px,py,qx,qy}
const RC_brillos=[];              // destellos donde llegó algo
function RC_vuela(ico,sx,sy,anc,key,amt,o){
  const a=RC_donde(anc),dist=Math.hypot(a.x-sx,a.y-sy),ch=!!o.chapa;
  RC_vuelos.push({ico,sx,sy,anc,key,amt,t:0,pop:o.pop??7,dur:o.dur||Math.round(clamp(dist/7,20,36)),slot:o.slot||0,chapa:ch,
    big:!!o.big,ph:o.ph||0,lvl:o.lvl||0,x:sx,y:sy,px:sx,py:sy,qx:sx,qy:sy});
}
// un premio juntado: su parte queda retenida en el contador hasta que el ícono llegue
// o (opcional): pop (cuadros que se queda en el lugar antes de salir; sirve para escalonar varios premios juntos),
// lvl (nivel de la medalla), mudo (el número no se ve: no hace tic al contar)
function RC_premio(ico,sx,sy,anc,key,get,antes,ahora,slot,o){
  const amt=Math.max(0,(ahora||0)-(antes||0));
  if(key){const c=RC_contador(key,get,antes);if(c){c.hold+=amt;if(o&&o.mudo)c.mudo=true;}}
  RC_vuela(ico,sx,sy,anc,key,amt,{slot,pop:o&&o.pop,lvl:o&&o.lvl});
}
function RC_pasoVuelos(){
  for(let i=RC_vuelos.length-1;i>=0;i--){const f=RC_vuelos[i];f.t++;
    if(f.t<=f.pop)continue; // "pop": aparece en el lugar donde se agarró
    const a=RC_donde(f.anc),u=Math.min(1,(f.t-f.pop)/f.dur),e=u*u*(2.2-1.2*u); // arranca lento y entra al HUD con envión
    const cx=f.chapa?f.sx+(a.x-f.sx)*0.5:f.sx+(a.x-f.sx)*0.18,cy=Math.min(f.sy,a.y)-(f.chapa?12:30),m=1-e;
    f.qx=f.px;f.qy=f.py;f.px=f.x;f.py=f.y;
    f.x=m*m*f.sx+2*m*e*cx+e*e*a.x;f.y=m*m*f.sy+2*m*e*cy+e*e*a.y;
    if(u>=1){RC_llega(f);RC_vuelos.splice(i,1);}
  }
  for(let i=RC_brillos.length-1;i>=0;i--)if(++RC_brillos[i].t>=RC_brillos[i].max)RC_brillos.splice(i,1);
}
function RC_llega(f){
  const c=f.key&&RC_cnt[f.key],a=RC_donde(f.anc);
  if(c){c.hold=Math.max(0,c.hold-f.amt);
    // a la cabina del Grillo: esa munición no se ve en el HUD, se acomoda sin contar
    if(f.anc.startsWith('gri')&&!f.key.startsWith('ar')){const r=c.get();if(r!=null)c.shown=Math.max(0,r-c.hold);}}
  a.b=Math.max(a.b,f.chapa?5:9);
  if(!f.chapa||RC_brillos.length<5)RC_brillos.push({x:a.x,y:a.y,t:0,max:f.chapa?8:12,chapa:f.chapa});
  if(!f.chapa)RC_sonLlega();
}
// el "tuc-tin" de llegada: uno cada 6 cuadros como mucho; si llegan varios seguidos sube de tono
// y después del cuarto se calla (no se apila con muchos premios juntos)
function RC_sonLlega(){
  if(Math.abs(T-RC_llegaT)<6)return;
  RC_llegaN=T-RC_llegaT>40?0:RC_llegaN+1;RC_llegaT=T;
  if(RC_llegaN<4)SFX.rcLlega(RC_llegaN);
}

// lo que tenía el jugador antes de juntar (collect lo pide al empezar)
function RC_foto(){const p=P;return{w:{...p.weapons},b:p.bombs,sh:p.shield,hp:p.hp,lv:lives,fl:flares,ar:p.ride?p.ride.armor:0};}
// collect() terminó: cada cosa vuela a su lugar del HUD del jugador que la agarró (en el Grillo, a su cabina)
function RC_junto(kind,x,y,a){
  if(state!=='play')return;
  const p=P,s=p.slot,sx=HX(x+5),sy=HY(y+5),cab=p.ride?'gri'+s:null,w=DROPMAP[kind],ps=()=>players[s];
  // munición de un arma que no tenés en la mano: vuela a su iconito (el número no se ve, así que no hace tic)
  const chico=w&&!cab&&p.weapon!==w&&RC_anc['am'+s+w],ak=chico?'am'+s+w:cab||'am'+s;
  if(w)RC_premio(w,sx,sy,ak,'am'+s+w,()=>ps()?ps().weapons[w]||0:null,a.w[w]||0,p.weapons[w]||0,s,{mudo:p.weapon!==w});
  else if(kind==='G')RC_premio('grenade',sx,sy,cab||'gr'+s,'gr'+s,()=>ps()?ps().bombs:null,a.b,p.bombs,s);
  else if(kind==='E')RC_premio('shield',sx,sy,cab||'sh'+s,'sh'+s,()=>ps()?ps().shield:null,a.sh,p.shield,s);
  else if(kind==='V')RC_premio('vida',sx,sy,'lv','lv',()=>lives,a.lv,lives,s);
  else if(kind==='A')RC_premio('plane',sx,sy,'fl','fl',()=>flares,a.fl,flares,s);
  else if(p.ride)RC_premio('fix',sx,sy,cab,'ar'+s,()=>ps()&&ps().ride?ps().ride.armor:null,a.ar,p.ride.armor,s);
  else RC_premio('heart',sx,sy,'hp'+s,'hp'+s,()=>ps()?ps().hp:null,a.hp,p.hp,s);
}
// premio por jefe (jefes.js): la vida vuela a las vidas y la salud de cada uno a sus corazones
function RC_jefe(lv,hps,o){
  if(state!=='play')return;
  RC_premio('vida',HX(o.x+o.w/2),HY(o.y-2),'lv','lv',()=>lives,lv,lives,0);
  players.forEach((p,s)=>{if(p.dead||!(p.hp>hps[s]))return;const c=pCenter(p);
    RC_premio('heart',HX(c.x),HY(c.y-8),'hp'+s,'hp'+s,()=>players[s]?players[s].hp:null,hps[s],p.hp,s);});
}

// lo que tenía cada jugador (para las medallas, que le dan algo a todos)
function RC_fotos(){return players.map(p=>({hp:p.hp,sh:p.shield,b:p.bombs}));}
// un jugador ganó salud, escudo o granadas sin agarrar nada (medalla, escudo que se recarga):
// sale de su cabeza y vuela a su lugar del HUD. que: 'hp' | 'sh' | 'gr'. pop: para escalonar varios.
function RC_sumaJug(p,que,antes,pop){
  if(state!=='play'||!p||p.dead)return;
  const s=p.slot,c=pCenter(p),sx=HX(c.x),sy=HY(c.y-10),ps=()=>players[s];
  if(que==='hp'&&p.hp>antes)RC_premio('heart',sx,sy,'hp'+s,'hp'+s,()=>ps()?ps().hp:null,antes,p.hp,s,{pop});
  else if(que==='sh'&&p.shield>antes)RC_premio('shield',sx,sy,'sh'+s,'sh'+s,()=>ps()?ps().shield:null,antes,p.shield,s,{pop});
  else if(que==='gr'&&p.bombs>antes)RC_premio('grenade',sx,sy,p.ride?'gri'+s:'gr'+s,'gr'+s,()=>ps()?ps().bombs:null,antes,p.bombs,s,{pop});
}
// dónde pasó (en pantalla): la baja que la ganó o, si no hay, el jugador que va adelante
function RC_aca(o){if(o)return o;const p=leadP(),c=pCenter(p);return{x:HX(c.x),y:HY(c.y-12)};}
// medalla nueva (medallas.js): la insignia sale donde cayó la baja y vuela a la insignia del HUD;
// lo que da a cada jugador sale de su cabeza un poquito después, de a uno
function RC_medalla(lvl,o,antes){
  if(state!=='play')return;
  const a=RC_aca(o);
  RC_premio('medalla',a.x,a.y,'md','md',()=>medals,lvl-1,lvl,0,{pop:12,lvl});
  players.forEach((p,s)=>{const f=antes[s];if(!f)return;let pop=16;
    for(const[k,v]of[['hp',f.hp],['sh',f.sh],['gr',f.b]]){const n=k==='hp'?p.hp:k==='sh'?p.shield:p.bombs;if(n>v){RC_sumaJug(p,k,v,pop);pop+=6;}}});
}
// avión gratis cada 30 bajas (medallas.js): sale donde cayó la baja y vuela al avión del HUD
function RC_avion(o,antes){if(state!=='play')return;const a=RC_aca(o);RC_premio('plane',a.x,a.y,'fl','fl',()=>flares,antes,flares,0,{pop:10});}

// ================== chapitas de puntos ==================
// Tuercas de chatarra (y engranajes en los jefes) que saltan de cada baja o caja rota, flotan un momento
// y van como imán al jugador vivo más cercano. Al tocarlo tintinean y vuelan al marcador.
// Los puntos ya se sumaron con addScore (el total no cambia): el marcador retiene su parte hasta que llegan.
const RC_chapas=[];
const RC_MAXCH=48;                // tope de chapitas vivas (si hay más, esos puntos se ven directo en el marcador)
const RC_VIDA=240;                // si en 4 s no llegó al jugador (muerto, fin de misión…), vuela sola al marcador
let RC_racha=0,RC_rachaT=-99,RC_tinT=-9;
const RC_cuantas=v=>v<=100?2:v<=150?3:v<=250?4:5;
function RC_soltar(v,x,y,n){
  const c=RC_cnt.sc;
  if(!(v>0)||state!=='play'||!c)return;
  n=Math.min(n||RC_cuantas(v),RC_MAXCH-RC_chapas.length);
  if(n<=0)return;
  c.hold+=v;
  const base=Math.floor(v/n);
  for(let i=0;i<n;i++){const val=base+(i===0?v-base*n:0);
    RC_chapas.push({x:x+rand(-3,3),y:Math.min(GROUND-4,y+rand(-3,3)),vx:rand(-1.3,1.3),vy:rand(-3,-1.7),t:0,v:val,big:val>=200,
      ph:rand(0,6.3),sale:30+i*3+(Math.random()*5|0),fase:0,ac:0.25});}
}
function RC_destino(p){return p.ride?{x:p.ride.x+p.ride.w/2,y:p.ride.y+8}:{x:p.x+4,y:p.y+9};} // en el Grillo, a la cabina
function RC_pasoChapas(){
  const fin=winT>0;
  for(let i=RC_chapas.length-1;i>=0;i--){const k=RC_chapas[i];k.t++;
    if(k.fase===0){ // salta y rebota
      k.vy+=0.16;k.x+=k.vx;k.y+=k.vy;k.vx*=0.98;
      if(k.y>GROUND-4){k.y=GROUND-4;k.vy=-Math.abs(k.vy)*0.45;k.vx*=0.7;}
      if(k.t>=20)k.fase=1;
    }else if(k.fase===1){ // flota un momento
      k.vx*=0.85;k.vy=k.vy*0.8-0.03;k.x+=k.vx;k.y+=k.vy;if(k.y>GROUND-4)k.y=GROUND-4;
      if(k.t>=k.sale||fin)k.fase=2;
    }else{ // imán: va al jugador vivo más cercano, cada vez más rápido
      const p=nearestPlayer(k.x,k.y);
      if(p.dead){k.vx*=0.9;k.vy*=0.9;k.x+=k.vx;k.y+=k.vy;}
      else{
        const d0=RC_destino(p),dx=d0.x-k.x,dy=d0.y-k.y,d=Math.hypot(dx,dy)||1;
        if(d<7){RC_toca(k);RC_chapas.splice(i,1);continue;}
        k.ac=Math.min(1.3,k.ac+(fin?0.12:0.05));
        k.vx=(k.vx+dx/d*k.ac)*0.9;k.vy=(k.vy+dy/d*k.ac)*0.9;
        const sp=Math.hypot(k.vx,k.vy);if(sp>7.5){k.vx*=7.5/sp;k.vy*=7.5/sp;}
        k.x+=k.vx;k.y+=k.vy;
      }
    }
    if(k.t>RC_VIDA||(fin&&winT>150)){RC_aMarcador(k);RC_chapas.splice(i,1);}
  }
}
// tocó al jugador: tintineo (sube de tono si vienen seguidas; la racha se corta si pasa ~1 s) y vuela al marcador
function RC_toca(k){
  if(T-RC_rachaT>60)RC_racha=0;else RC_racha++;RC_rachaT=T;
  if(T-RC_tinT>=2){RC_tinT=T;SFX.rcChapa(RC_racha);}
  parts.push({k:'p',x:k.x,y:k.y,vx:rand(-0.5,0.5),vy:-0.8,g:0.04,life:10,maxl:10,size:1,col:k.big?'#fff0b0':'#f2c070'});
  RC_aMarcador(k);
}
function RC_aMarcador(k){
  const sx=HX(k.x),sy=HY(k.y),a=RC_donde('sc');
  RC_vuela('chapa',sx,sy,'sc','sc',k.v,{pop:0,dur:Math.round(clamp(Math.hypot(a.x-sx,a.y-sy)/9,14,26)),chapa:true,big:k.big,ph:k.ph});
}

// ================== dibujo ==================
// tuerca hexagonal de óxido (5 px) o engranaje de chatarra (7 px) que gira: de frente, de tres cuartos o de canto
const RC_COL={k:'#120c18',n:['#c47a35','#f2c070','#6a3a1a'],g:['#cfa84a','#fff0b0','#7a5a20']};
function RC_dibChapa(cx,cy,big,giro){
  cx=Math.round(cx);cy=Math.round(cy);const s=Math.abs(Math.cos(giro)),[b,l,d]=big?RC_COL.g:RC_COL.n;
  ctx.fillStyle=RC_COL.k;
  if(big){
    if(s>0.6){ctx.fillRect(cx-4,cy-1,9,3);ctx.fillRect(cx-1,cy-4,3,9);ctx.fillRect(cx-3,cy-3,7,7);
      ctx.fillStyle=b;ctx.fillRect(cx-2,cy-2,5,5);ctx.fillRect(cx-3,cy,7,1);ctx.fillRect(cx,cy-3,1,7);
      ctx.fillStyle=l;ctx.fillRect(cx-2,cy-2,2,1);ctx.fillRect(cx-2,cy-1,1,1);ctx.fillStyle=d;ctx.fillRect(cx+1,cy+2,2,1);ctx.fillStyle=RC_COL.k;ctx.fillRect(cx,cy,1,1);}
    else if(s>0.25){ctx.fillRect(cx-2,cy-3,5,7);ctx.fillRect(cx-1,cy-4,3,9);ctx.fillStyle=b;ctx.fillRect(cx-1,cy-2,3,5);ctx.fillRect(cx,cy-3,1,7);ctx.fillStyle=l;ctx.fillRect(cx-1,cy-2,1,4);}
    else{ctx.fillRect(cx-1,cy-4,3,9);ctx.fillStyle=l;ctx.fillRect(cx,cy-3,1,7);}
  }else{
    if(s>0.6){ctx.fillRect(cx-3,cy-1,7,3);ctx.fillRect(cx-2,cy-2,5,5);ctx.fillRect(cx-1,cy-3,3,7);
      ctx.fillStyle=b;ctx.fillRect(cx-2,cy-1,5,3);ctx.fillRect(cx-1,cy-2,3,5);
      ctx.fillStyle=l;ctx.fillRect(cx-1,cy-2,1,1);ctx.fillRect(cx-2,cy-1,1,1);ctx.fillStyle=d;ctx.fillRect(cx+1,cy+1,1,1);ctx.fillStyle=RC_COL.k;ctx.fillRect(cx,cy,1,1);}
    else if(s>0.25){ctx.fillRect(cx-2,cy-2,4,5);ctx.fillRect(cx-1,cy-3,2,7);ctx.fillStyle=b;ctx.fillRect(cx-1,cy-2,2,5);ctx.fillStyle=l;ctx.fillRect(cx-1,cy-1,1,3);}
    else{ctx.fillRect(cx-1,cy-3,3,7);ctx.fillStyle=l;ctx.fillRect(cx,cy-2,1,5);}
  }
}
// chapitas en el mundo (ON_DRAW, con la cámara puesta)
function RC_dibChapas(){
  for(const k of RC_chapas){
    if(k.x<camX-10||k.x>camX+VW+10)continue;
    const bob=k.fase===1?Math.sin(k.t*0.22+k.ph)*0.9:0;
    if(k.fase===2&&k.ac>0.6){ctx.fillStyle=k.big?'rgba(255,240,176,0.45)':'rgba(242,192,112,0.45)';ctx.fillRect(Math.round(k.x-k.vx*1.6),Math.round(k.y-k.vy*1.6),1,1);}
    RC_dibChapa(k.x,k.y+bob,k.big,k.t*(k.fase===2?0.45:0.22)+k.ph);
    if(k.fase===1&&((k.t+(k.ph*10|0))%40)<3){ctx.fillStyle='#fff';ctx.fillRect(Math.round(k.x)-1,Math.round(k.y+bob)-2,1,1);} // brillito
  }
}
// ícono del premio en vuelo (en pantalla)
function RC_dibIcono(f,x,y){
  const ic=f.ico;
  if(ic==='chapa'){RC_dibChapa(x,y,f.big,f.t*0.5+f.ph);return;}
  if(ic==='medalla'){drawBadge(Math.round(x),Math.round(y),f.lvl,5);return;}
  if(ic==='comida'){if(typeof CAT_dibIcono==='function')CAT_dibIcono(x,y);return;} // comida del gato (gatito.js)
  if(ic==='vida'){const p=players[f.slot]||players[0];if(!p)return;ctx.fillStyle=RC_COL.k;ctx.fillRect(Math.round(x)-8,Math.round(y)-5,16,10);
    ctx.drawImage(playerSet(p).idle[0],0,0,14,8,Math.round(x)-7,Math.round(y)-4,14,8);return;}
  if(ic==='fix'){x=Math.round(x);y=Math.round(y);ctx.fillStyle=RC_COL.k;ctx.fillRect(x-4,y-4,9,9);ctx.fillStyle='#e8e2d6';ctx.fillRect(x-3,y-3,7,7);
    ctx.fillStyle='#d93a2b';ctx.fillRect(x-1,y-2,3,5);ctx.fillRect(x-2,y-1,5,3);return;}
  const map=HUD_ICONS[ic];if(!map)return;
  hudPix(map,Math.round(x-hudIW(map)/2),Math.round(y-hudIH(map)/2));
}
function RC_dibHUD(){
  for(const b of RC_brillos){const a=1-b.t/b.max,r=(b.chapa?2:3)+b.t*(b.chapa?0.5:0.7);
    ctx.strokeStyle=b.chapa?`rgba(242,192,112,${a})`:`rgba(255,240,180,${a})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x,b.y,r,0,7);ctx.stroke();
    if(!b.chapa){ctx.fillStyle=`rgba(255,255,255,${a})`;const o=r+1.5;
      ctx.fillRect(b.x-o,b.y-o,1,1);ctx.fillRect(b.x+o,b.y-o,1,1);ctx.fillRect(b.x-o,b.y+o,1,1);ctx.fillRect(b.x+o,b.y+o,1,1);}}
  for(const f of RC_vuelos){
    if(f.t<=f.pop){ // aparece en el lugar con un saltito: crece hasta 1,3 y se asienta
      const k=f.t/Math.max(1,f.pop),sc=k<0.6?0.5+k/0.6*0.8:1.3-(k-0.6)/0.4*0.3;
      ctx.save();ctx.translate(f.sx,f.sy);ctx.scale(sc,sc);
      ctx.fillStyle='rgba(255,240,180,0.35)';circle(0,0,7);RC_dibIcono(f,0,0);ctx.restore();continue;}
    if(!f.chapa){ // estela y halo: se ve que viaja
      ctx.globalAlpha=0.18;RC_dibIcono(f,f.qx,f.qy);ctx.globalAlpha=0.38;RC_dibIcono(f,f.px,f.py);ctx.globalAlpha=1;
      ctx.fillStyle='rgba(255,240,180,0.22)';circle(f.x,f.y,6);
    }
    RC_dibIcono(f,f.x,f.y);
  }
}

// ================== ganchos ==================
// deja todo al día: nada retenido, nada volando (cambio de misión, fin de misión, fin del juego)
function RC_vaciar(){
  RC_chapas.length=0;RC_vuelos.length=0;RC_brillos.length=0;
  for(const k in RC_cnt){const c=RC_cnt[k];c.hold=0;c.rate=0;c.bump=0;const r=c.get();if(r!=null)c.shown=r;}
}
ON_START.push(()=>{
  RC_vaciar();for(const k in RC_cnt)delete RC_cnt[k];
  RC_cnt.sc={get:()=>score,hold:0,shown:score,rate:0,bump:0,a:score,b:score,mudo:true,fijo:true,dur:30}; // el marcador siempre rueda (~0,5 s)
  RC_racha=0;RC_rachaT=-99;
});
ON_STEP.push(()=>{RC_pasoChapas();RC_pasoVuelos();RC_pasoCnt();});
ON_DRAW.push(()=>{if(RC_chapas.length)RC_dibChapas();});
ON_HUD.push(()=>{
  if(state==='win'||state==='over'){if(RC_chapas.length||RC_vuelos.length||RC_cnt.sc&&RC_cnt.sc.shown!==score)RC_vaciar();return;}
  if(RC_vuelos.length||RC_brillos.length)RC_dibHUD();
});
