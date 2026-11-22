'use strict';
// Óxido · Fuente pixel y globos de diálogo
// · Fuente bitmap propia de 3×5 (M, N, W, ♥ más anchas), alineada a la grilla: 1 pixel de la fuente = 1 pixel del
//   arte del juego. Mayúsculas (las minúsculas se pasan a mayúscula), ÁÉÍÓÚÑÜ, ¡!¿?, números, + − × ♥ y signos.
//   pfTxt(s,x,y,col,align,borde) la escribe; pfW(s) mide. Cada texto se arma una vez en un lienzo chico y se reusa.
// · Globos: globo(s, x, y, {grito, t, dur}) dibuja el globo con la colita apuntando a (x, y) (la cabeza del que habla).
//   "habla": esquinas recortadas, relleno crema, borde #120c18, 1 px de sombra abajo, colita escalonada.
//   "grito": borde con picos, como una explosión chiquita.
//   Entra con un pop (0 → 1,2 → 1 en ~6 cuadros), flota apenas y se va achicándose. Nunca se corta en el borde, no pisa el HUD y no se encima con otro
//   globo del mismo cuadro (el que llega después sube). GL_reset() al empezar cada cuadro (drawWorld).
// Carteles, HUD y menús siguen con la letra de siempre.
const PF={
  A:[".#.","#.#","###","#.#","#.#"],B:["##.","#.#","##.","#.#","##."],C:[".##","#..","#..","#..",".##"],D:["##.","#.#","#.#","#.#","##."],
  E:["###","#..","##.","#..","###"],F:["###","#..","##.","#..","#.."],G:[".##","#..","#.#","#.#",".##"],H:["#.#","#.#","###","#.#","#.#"],
  I:["###",".#.",".#.",".#.","###"],J:["..#","..#","..#","#.#",".#."],K:["#.#","#.#","##.","#.#","#.#"],L:["#..","#..","#..","#..","###"],
  M:["#...#","##.##","#.#.#","#...#","#...#"],N:["#..#","##.#","#.##","#..#","#..#"],O:[".#.","#.#","#.#","#.#",".#."],P:["##.","#.#","##.","#..","#.."],
  Q:[".#.","#.#","#.#","##.",".##"],R:["##.","#.#","##.","#.#","#.#"],S:[".##","#..",".#.","..#","##."],T:["###",".#.",".#.",".#.",".#."],
  U:["#.#","#.#","#.#","#.#","###"],V:["#.#","#.#","#.#","#.#",".#."],W:["#...#","#...#","#.#.#","##.##","#...#"],X:["#.#","#.#",".#.","#.#","#.#"],
  Y:["#.#","#.#",".#.",".#.",".#."],Z:["###","..#",".#.","#..","###"],
  0:["###","#.#","#.#","#.#","###"],1:[".#.","##.",".#.",".#.","###"],2:["##.","..#",".#.","#..","###"],3:["##.","..#",".#.","..#","##."],
  4:["#.#","#.#","###","..#","..#"],5:["###","#..","##.","..#","##."],6:[".##","#..","###","#.#","###"],7:["###","..#",".#.",".#.",".#."],
  8:["###","#.#","###","#.#","###"],9:["###","#.#","###","..#","##."],
  '!':["#","#","#",".","#"],'¡':["#",".","#","#","#"],'?':["##.","..#",".#.","...",".#."],'¿':[".#.","...",".#.","#..",".##"],
  '+':["...",".#.","###",".#.","..."],'−':["...","...","###","...","..."],'-':["...","...","###","...","..."],'×':["...","#.#",".#.","#.#","..."],
  '♥':[".#.#.","#####","#####",".###.","..#.."],'.':[".",".",".",".","#"],',':[".",".",".","#","#"],':':[".","#",".","#","."],
  '·':[".",".","#",".","."],"'":["#","#",".",".","."],'/':["..#","..#",".#.","#..","#.."],'%':["#.#","..#",".#.","#..","#.#"],
  '(':[".#","#.","#.","#.",".#"],')':["#.",".#",".#",".#","#."],'∞':[".....","##.##","#.#.#","##.##","....."]};
// con acento o tilde: la letra de base y una marquita en la fila de arriba (-1)
const PF_ACENTO={Á:['A',[2]],É:['E',[2]],Í:['I',[2]],Ó:['O',[2]],Ú:['U',[2]],Ñ:['N',[1,2]],Ü:['U',[0,2]]};
function pfGlifo(ch){
  let c=ch.toUpperCase();if(c==='ß')c='S';
  if(PF[c])return{rows:PF[c],marca:null};
  if(PF_ACENTO[c]){const[b,m]=PF_ACENTO[c];return{rows:PF[b],marca:m};}
  return null;
}
function pfW(s){let w=0;for(const ch of s){if(ch===' '){w+=3;continue;}const g=pfGlifo(ch);if(g)w+=g.rows[0].length+1;}return Math.max(0,w-1);}
// pixeles de un texto, con la fila 0 = fila de acentos (el cuerpo de la letra va en las filas 1 a 5)
function pfPixeles(s,fn){let x=0;for(const ch of s){if(ch===' '){x+=3;continue;}const g=pfGlifo(ch);if(!g)continue;
  g.rows.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#')fn(x+i,j+1);});if(g.marca)for(const i of g.marca)fn(x+i,0);x+=g.rows[0].length+1;}}
const PF_CACHE=new Map();
function pfLienzo(s,col,borde){
  const k=s+'|'+col+'|'+(borde||'');let c=PF_CACHE.get(k);if(c)return c;
  const w=pfW(s),m=borde?1:0;c=document.createElement('canvas');c.width=w+2*m;c.height=6+2*m;const g=c.getContext('2d');
  if(borde){g.fillStyle=borde;pfPixeles(s,(x,y)=>{for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]])g.fillRect(x+m+dx,y+m+dy,1,1);});}
  g.fillStyle=col;pfPixeles(s,(x,y)=>g.fillRect(x+m,y+m,1,1));
  if(PF_CACHE.size>300)PF_CACHE.clear();PF_CACHE.set(k,c);return c;
}
// escribe un texto en pixel: (x, y) arriba (align 'left' | 'center' | 'right'); borde = color del contorno o nada
function pfTxt(s,x,y,col='#fff',align='left',borde){
  const c=pfLienzo(String(s),col,borde),m=borde?1:0,w=c.width-2*m;
  const x0=align==='center'?x-w/2:align==='right'?x-w:x;
  ctx.drawImage(c,Math.round(x0)-m,Math.round(y)-m);
}
// ---------- globos ----------
const GL_TINTA='#120c18',GL_CREMA='#f4e7c6',GL_CREMA_GRITO='#fff0b4',GL_SOMBRA='rgba(18,12,24,0.45)';
const GL_CACHE=new Map();
// arma el globo en un lienzo de 1 px por unidad. Devuelve {c, tx, ty}: la punta de la colita está en (tx, ty)
function glLienzo(s,grito,lado){
  const k=s+'|'+(grito?1:0)+'|'+lado;let o=GL_CACHE.get(k);if(o)return o;
  const tw=pfW(s),w=tw+6,h=10,M=2;                    // M: margen para los picos del grito
  const c=document.createElement('canvas');c.width=w+2*M;c.height=h+4+2*M;const g=c.getContext('2d');
  const px=(x,y,col)=>{g.fillStyle=col;g.fillRect(x+M,y+M,1,1);};
  // sombra abajo (1 px)
  g.fillStyle=GL_SOMBRA;g.fillRect(M+2,M+h,w-4,1);
  // relleno y borde con las esquinas recortadas
  g.fillStyle=grito?GL_CREMA_GRITO:GL_CREMA;g.fillRect(M+1,M+1,w-2,h-2);
  g.fillStyle=GL_TINTA;g.fillRect(M+2,M,w-4,1);g.fillRect(M+2,M+h-1,w-4,1);g.fillRect(M,M+2,1,h-4);g.fillRect(M+w-1,M+2,1,h-4);
  px(1,1,GL_TINTA);px(w-2,1,GL_TINTA);px(1,h-2,GL_TINTA);px(w-2,h-2,GL_TINTA);
  if(grito){ // picos: cada 4 px arriba y abajo, y uno en cada costado
    for(let x=3;x<w-3;x+=4){px(x,-1,GL_TINTA);px(x+1,-1,GL_TINTA);px(x,-2,GL_TINTA);}
    for(let x=5;x<w-3;x+=4){if(Math.abs(x-(lado<0?3:lado>0?w-4:w>>1))<4)continue;px(x,h,GL_TINTA);px(x+1,h,GL_TINTA);px(x,h+1,GL_TINTA);}
    for(const x of[-1,w]){px(x,4,GL_TINTA);px(x,5,GL_TINTA);px(x<0?-2:w+1,4,GL_TINTA);}
    px(-1,1,GL_TINTA);px(w,1,GL_TINTA);px(-1,h-2,GL_TINTA);px(w,h-2,GL_TINTA);
  }
  // colita escalonada: al centro, o corrida a un lado si el globo se tuvo que mover
  const tx=lado<0?3:lado>0?w-4:w>>1,fill=grito?GL_CREMA_GRITO:GL_CREMA;
  g.fillStyle=fill;g.fillRect(M+tx-1,M+h-1,3,1);                              // abre el borde
  px(tx-2,h-1,GL_TINTA);px(tx+2,h-1,GL_TINTA);
  px(tx-1,h,GL_TINTA);g.fillStyle=fill;g.fillRect(M+tx,M+h,2,1);px(tx+2,h,GL_TINTA);
  px(tx,h+1,GL_TINTA);px(tx+1,h+1,GL_TINTA);px(tx+1,h+2,GL_TINTA);
  // texto
  g.fillStyle=GL_TINTA;pfPixeles(s,(x,y)=>g.fillRect(x+M+3,y+M+1,1,1));
  o={c,tx:tx+M+1.5,ty:h+M+3,w,h,M};if(GL_CACHE.size>80)GL_CACHE.clear();GL_CACHE.set(k,o);return o;
}
let GL_rects=[];
function GL_reset(){GL_rects=[];}
// escala del pop: 0 → 1,2 → 1 en 6 cuadros; al final se achica en 5
function glEscala(t,dur){if(t<3)return 1.2*t/3;if(t<6)return 1.2-0.2*(t-3)/3;if(dur&&t>dur-5)return Math.max(0,(dur-t)/5);return 1;}
// dibuja un globo con la colita en (ax, ay), en coordenadas del mundo
function globo(s,ax,ay,o={}){
  const t=o.t??99,dur=o.dur??0,sc=glEscala(t,dur);if(sc<=0.02)return;
  let w=pfW(s)+6,h=10;
  // dónde va el globo: arriba de la cabeza, sin salirse de la pantalla ni pisar el HUD, y sin encimarse con otro
  const xMin=camX+2,xMax=camX+VW-2,yMin=camY+28/ZOOM;
  let bx=Math.round(ax)-(w>>1),by=Math.round(ay)-h-3;
  by+=Math.round(Math.sin((T+ax*3)/14)*0.6);
  let lado=0;if(bx<xMin){bx=xMin;lado=-1;}else if(bx+w>xMax){bx=xMax-w;lado=1;}
  for(let k=0;k<6;k++){const r=GL_rects.find(r=>bx<r.x+r.w+1&&bx+w>r.x-1&&by<r.y+r.h+2&&by+h>r.y-2);if(!r)break;by=r.y-h-3;}
  if(by<yMin)by=Math.max(yMin,by);
  GL_rects.push({x:bx,y:by,w,h});
  const L=glLienzo(s,!!o.grito,lado),tipX=bx+(L.tx-L.M-1.5),tipY=by+h+2;
  ctx.save();
  if(sc!==1){ctx.translate(tipX,tipY);ctx.scale(sc,sc);ctx.translate(-tipX,-tipY);}
  ctx.drawImage(L.c,bx-L.M,by-L.M);
  ctx.restore();
}
// texto que flota (+N, −1 ♥, etc.): pixel con borde oscuro
function pfFlota(s,x,y,col,a){ctx.globalAlpha=a;pfTxt(s,x,y,col||'#ffe08a','center',GL_TINTA);ctx.globalAlpha=1;}
// los globos de los que piden ayuda (prisionero atado y gatito en la jaula): se anota en cada paso desde cuándo hay alguien
// cerca, así el pop sale una vez al acercarse y después queda a tamaño completo (no depende de cuántas veces se dibuje)
ON_STEP.push(()=>{
  for(const pr of prisoners){const cerca=pr.state==='tied'&&nearAny(pr.x+5,110);if(cerca&&pr.glT0===undefined)pr.glT0=T;else if(!cerca)pr.glT0=undefined;}
  const c=typeof gatoJaula!=='undefined'?gatoJaula:null;
  if(c){const cerca=nearAny(c.x+8,120);if(cerca&&c.glT0===undefined)c.glT0=T;else if(!cerca)c.glT0=undefined;}
});
