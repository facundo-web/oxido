'use strict';
// Óxido · Bocetos del PERSONAJE NUEVO (el que se destraba con 6 engranajes dorados)
// Tres candidatos para que Facu elija. Cada uno tiene la misma forma que una entrada de CHARS (personajes.js):
// name, desc (~28 caracteres), perk (~34), pal, head (7 filas), torso (5 filas) y helmet (color de muestra). Así, el
// elegido se suma con CHARS.push(PJ_BOCETOS[n]) y anda con el mismo esqueleto (piernas, caja de golpe, colores).
// Los rasgos de juego (hp, speed, jump, bombs, cd…) son una propuesta: los decide Código con Dirección.
// Los tres son propios de Óxido (el nombre se puede cambiar por el de alguien de la familia).
// Prefijo PJ_.
const PJ_BOCETOS=[
  { // 1 · TUERCA: un robotito armado con lo que quedó en la Zona Óxido. Un ojo grande, foquito en la antena.
    name:'TUERCA',desc:'Robot de chatarra',perk:'Atrae tuercas · granadas imán',
    hp:3,speed:1.4,jump:6.0,bombs:10,cd:1,start:null,iman:true,
    pal:{...PAL_P,h:'#8a96a4',H:'#c8d0da',S:'#3a4450',e:'#6ff0ff',r:'#3a4450',v:'#b86a3a',V:'#8a4a28',p:'#5a6470',P:'#3a4450',b:'#2a2a30',z:'#ffd25a',s:'#8a96a4'},
    head:[".....k........","....kzk.......","...kkkkkkkk...","..khhhhhhhhk..","..khhhkeeekk..","..khhhkeeek...","...kSSSSSSk..."],
    torso:["...krrrrrrrk..","..kvvvvvvvvvk.","..kvzvvVvvvvk.","..kvvvvVvvzvk.","..kVVVVVVVVVk."],
    helmet:'#8a96a4'},
  { // 2 · RITA: la mecánica del taller. Careta de soldar levantada, overol con llave inglesa en el bolsillo.
    name:'RITA',desc:'La mecánica',perk:'Arregla vehículos · fusión más rápida',
    hp:3,speed:1.5,jump:6.2,bombs:8,cd:1,start:null,mecanica:true,
    pal:{...PAL_P,h:'#4a4e58',H:'#6a707c',G:'#2a6a4a',y:'#3a2418',s:'#d89a6a',S:'#a86a48',e:'#1a1a1a',r:'#e8e0d0',v:'#3a6aa8',V:'#2a4a80',z:'#c8ccd4',p:'#3a6aa8',P:'#2a4a80',b:'#6a3a1a'},
    head:["...kkkkkkk....","..khhhhhhhk...","..khGGGGGhk...","..kyykkkkkkk..","..kyysssssesk.","..kyyssssssk..","...kkSSSSSk..."],
    torso:["...krrrrrrrk..","..krvvvvvvvrk.","..kvvzvVvvvvk.","..kvvzvVvvvvk.","..kVVVVVVVVVk."],
    helmet:'#4a4e58'},
  { // 3 · NIEBLA: exploradora de los pantanos. Capucha, máscara de gas con un ojo ámbar y bufanda que flamea.
    name:'NIEBLA',desc:'Exploradora',perk:'Se desliza · ve en la oscuridad',
    hp:3,speed:1.65,jump:6.3,bombs:8,cd:0.95,start:null,desliz:true,
    pal:{...PAL_P,h:'#6a7a5a',H:'#8a9a72',s:'#5a4a3a',S:'#3a3028',e:'#ffb040',r:'#c8402a',v:'#7a6a4a',V:'#5a4a32',b:'#3a2a1a',p:'#4a4a3a',P:'#34342a'},
    head:["....kkkkkk....","...khhhhhhk...","..khhhhhhhhk..",".khhhkkkkkkk..","khhhkssseek...","khhhksssSSSk..",".kkhhkkkkSk..."],
    torso:["rrrkrrrrrrrk..",".rrkvvvVvvvvk.","..kvvvvVvvvvk.","..kbbbbbbbbbk.","..kVVVVVVVVVk."],
    helmet:'#6a7a5a'}];
// sprites armados de cada boceto (para la galería y, el día que se elija, para el juego)
const PJ_sets=()=>PJ_BOCETOS.map(c=>build(c.pal,c.head,c.torso,typeof LEG_CORTE==='number'?LEG_CORTE:0));
// ---------- elegido por Facu (22 nov 2026): 1 · TUERCA ----------
const PJ_ELEGIDO=0;
// sus 4 colores, como COLORES en personajes.js (el 0 es el de siempre): lata azul, bronce y óxido rojo.
// Cambian la lata de la cabeza (h/H) y el cuerpo (v/V).
const PJ_COLORES=[{},{h:'#4a7ab8',H:'#8ab4e8',v:'#3a5a8a',V:'#2a4068'},{h:'#a8803a',H:'#d8b060',v:'#8a6a2a',V:'#6a4e18'},{h:'#a84a3a',H:'#d87a60',v:'#6a3a2a',V:'#4a2818'}];
