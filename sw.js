// Mis Recetas: guarda la app en el móvil para que abra sin cobertura
var V='mr-v4';
var CORE=['./','index.html','manifest-v2.webmanifest','apple-touch-icon-v2.png','icon-192-v2.png','icon-512-v2.png','favicon-v2.svg','favicon-32-v2.png'];
var LIBS=['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'];
var EXT=/^https:\/\/(www\.gstatic\.com\/firebasejs\/|unpkg\.com\/html5-qrcode@|fonts\.googleapis\.com\/|fonts\.gstatic\.com\/)/;
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(V).then(function(c){
    return c.addAll(CORE).then(function(){return Promise.all(LIBS.map(function(u){return fetch(u,{mode:'no-cors'}).then(function(r){return c.put(u,r)}).catch(function(){})}))});
  }).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
function timeout(p,ms){return new Promise(function(res,rej){var t=setTimeout(function(){rej('timeout')},ms);p.then(function(r){clearTimeout(t);res(r)},function(x){clearTimeout(t);rej(x)})})}
self.addEventListener('fetch',function(e){
  var req=e.request;if(req.method!=='GET')return;
  var u=new URL(req.url);
  if(u.origin===self.location.origin){
    if(req.mode==='navigate'||/\/$|\.html$/.test(u.pathname)){
      // Primero internet (para recibir las versiones nuevas); si no hay o tarda, la copia guardada
      var net=fetch(req.url,{cache:'no-cache',credentials:'same-origin'}).then(function(r){if(r&&r.ok){var c=r.clone();caches.open(V).then(function(ca){ca.put('index.html',c)})}return r});
      e.respondWith(timeout(net,4000).catch(function(){return caches.match('index.html').then(function(m){return m||net})}));
      return;
    }
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(m){
      var n=fetch(req).then(function(r){if(r&&r.ok){var c=r.clone();caches.open(V).then(function(ca){ca.put(req,c)})}return r}).catch(function(){return m});
      return m||n;
    }));
    return;
  }
  if(EXT.test(req.url)){
    e.respondWith(caches.match(req.url).then(function(m){
      return m||fetch(req).then(function(r){var c=r.clone();caches.open(V).then(function(ca){ca.put(req.url,c)});return r});
    }));
  }
});
