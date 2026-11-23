// Óxido · registra el service worker para jugar sin conexión.
// Solo en la web (http o https). Con doble clic (file://) o dentro de la app de Mac no hace nada.
// Si una actualización quedó para después (ahorro de datos o celular, ver sw.js), se vuelve a probar al pasar a wifi.
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.protocol !== 'http:') return;
  addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(function (reg) {
      var c = navigator.connection;
      if (c && c.addEventListener) c.addEventListener('change', function () {
        if (!c.saveData && c.type !== 'cellular') reg.update().catch(function () {});
      });
    }).catch(function () {});
  });
})();
