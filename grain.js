/* Animated film-grain / white-noise overlay.
   Ported from jackcrump.com / jamescrump.co.uk. Self-contained: injects its own
   fixed canvas above everything, pointer-events:none. Pre-generates 6 greyscale
   noise frames at 1/3 viewport resolution and cycles them every 3rd RAF tick for
   a subtle analogue static. To remove: delete the <script src="grain.js"> tags
   from the pages and this file. */
(function () {
  var c = document.createElement('canvas');
  c.className = 'grain js-grain';
  c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;opacity:0.04;';
  document.body.appendChild(c);

  var ctx = c.getContext('2d');
  var W, H, frames = [], N = 6, idx = 0, tick = 0;

  function build() {
    W = Math.round(window.innerWidth / 3);
    H = Math.round(window.innerHeight / 3);
    c.width = W; c.height = H;
    frames = [];
    for (var f = 0; f < N; f++) {
      var img = ctx.createImageData(W, H), d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
      frames.push(img);
    }
  }

  build();
  window.addEventListener('resize', build);

  (function loop() {
    tick++;
    if (tick % 3 === 0) {
      ctx.putImageData(frames[idx], 0, 0);
      idx = (idx + 1) % N;
    }
    requestAnimationFrame(loop);
  })();
})();
