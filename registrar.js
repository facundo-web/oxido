// Óxido · registra el service worker para jugar sin conexión.
// Solo en la web (http o https). Con doble clic (file://) o dentro de la app de Mac no hace nada.
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.protocol !== 'http:') return;
  addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {});
  });
})();
