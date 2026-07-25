/* ==========================================================================
   C. M. Taylor — diagonal wave page-turn
   The video page peels away along a soft wave that travels from the
   bottom-left corner to the top-right corner (à la jackcrump.com), revealing
   the next page (loaded beneath in an iframe).
   Exposes window.CMTFold.play(href).
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("foldCanvas");

  // The "book": two page-leaves. Section→section slides the next leaf in over
  // the current one (a 2D page-slide — iframes can't be 3D-flipped in Chrome).
  var book   = document.getElementById("book");
  var leafA  = document.getElementById("destLayer");
  var leafB  = document.getElementById("destLayerB");
  var front = leafA;                                      // the leaf currently on top
  function backLeaf() { return front === leafA ? leafB : leafA; }
  function clearLeaf(l) {
    if (!l) return;
    l.removeAttribute("src");
    l.style.transition = "none";
    l.style.transform = "translateX(0)";
    l.style.boxShadow = "";
    l.style.zIndex = "";
  }
  function resetBook() {
    clearLeaf(leafA); clearLeaf(leafB);
    front = leafA;
  }

  var VERT = [
    "uniform float u_progress;",
    "uniform vec2 u_screen;",
    "uniform vec2 u_sweep;",   // unit direction the peel travels (from start corner)
    "varying vec2 vUv;",
    "varying float vPeel;",
    "varying float vShade;",
    "void main() {",
    "  vec2 uv = position.xy + 0.5;",
    "  vUv = uv;",
    "  /* progress along the sweep: 0 at the start corner, 1 at the far corner */",
    "  float dN = dot(uv - 0.5, u_sweep) * 0.70710678 + 0.5;",
    "  float band = 0.34;",
    "  float front = u_progress * (1.0 + 2.0 * band) - band;",
    "  float rel = dN - front;",              // + ahead (still covering), - behind (peeled)
    "  float t = clamp(-rel / band, 0.0, 1.0);",
    "  vPeel = t;",
    "  /* soft wave ridge riding the fold line */",
    "  float curl = exp(-(rel * rel) / (0.16 * band * band));",
    "  vShade = curl;",
    "  vec2 pos = position.xy * u_screen;",
    "  pos += u_sweep * curl * u_screen.y * 0.13;",                        // lift the ridge
    "  pos += u_sweep * t * (u_screen.x * 0.32 + u_screen.y * 0.10);",     // peeled sheet slides off
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "uniform sampler2D u_texture;",
    "varying vec2 vUv;",
    "varying float vPeel;",
    "varying float vShade;",
    "void main() {",
    "  vec4 tex = texture2D(u_texture, vUv);",
    "  float a = tex.a * (1.0 - smoothstep(0.62, 1.0, vPeel));",   // fade as it peels away
    "  vec3 rgb = tex.rgb * (1.0 - vShade * 0.32) + vShade * 0.05;", // shadow + sheen at the ridge
    "  gl_FragColor = vec4(rgb, a);",
    "}"
  ].join("\n");

  // Try to bring up WebGL. If the context can't be created (GPU unavailable,
  // hardware acceleration off, too many live contexts), hasGL stays false and
  // the shell degrades to an INSTANT cut into the book — never a black screen,
  // and never a fall-through to a standalone/cached page. The 2D page-slide
  // (flip) and plain swap (nav) are pure CSS and work either way.
  var hasGL = false;
  var renderer, scene, camera, off, offCtx, tex, geo, mat;
  if (window.THREE && window.gsap && canvas) {
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(
        -window.innerWidth / 2, window.innerWidth / 2,
        window.innerHeight / 2, -window.innerHeight / 2, -1, 1
      );

      off = document.createElement("canvas");
      offCtx = off.getContext("2d");
      tex = new THREE.CanvasTexture(off);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;

      geo = new THREE.PlaneGeometry(1, 1, 320, 320);
      mat = new THREE.ShaderMaterial({
        uniforms: {
          u_progress: { value: 0 },
          u_screen: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          u_sweep: { value: new THREE.Vector2(0.70710678, 0.70710678) },
          u_texture: { value: tex }
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthTest: false
      });
      scene.add(new THREE.Mesh(geo, mat));
      hasGL = true;
    } catch (e) { hasGL = false; }   // no WebGL → instant-cut fallback below
  }

  var SCALE = 1;          // offscreen canvas scale (kept modest — re-uploaded each frame)
  var live = false;       // true when the video can be read into the canvas (http)
  var textSpecs = [];     // cached hero text, measured once while the hero is visible

  /* Measure the hero's text once, so we can repaint it each frame without
     re-reading the (now hidden) DOM. Positions are in offscreen-canvas pixels. */
  function measureText() {
    textSpecs = [];
    function add(el) {
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (!r.width) return;
      var cs = getComputedStyle(el);
      var txt = el.textContent;
      if (cs.textTransform === "uppercase") txt = txt.toUpperCase();
      var font = cs.fontStyle + " " + cs.fontWeight + " " + (parseFloat(cs.fontSize) * SCALE) + 'px ' + cs.fontFamily;
      // Read the element's true text baseline directly (exact for any padding/
      // border/line-height), so the drawn text lands where the browser draws it.
      var probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      el.appendChild(probe);
      var baselineY = probe.getBoundingClientRect().top;
      probe.remove();
      textSpecs.push({
        text: txt, font: font, color: cs.color,
        x: r.left * SCALE, y: baselineY * SCALE,
        ls: (parseFloat(cs.letterSpacing) || 0) * SCALE
      });
    }
    add(document.querySelector(".hero h1"));
    document.querySelectorAll(".hero nav.enter a").forEach(add);
    document.querySelectorAll(".hero .corner a").forEach(add);
  }

  /* Repaint the folding surface: current video frame (or fallback) + scrim +
     the cached hero text. Called every frame while folding, so the video keeps
     playing as the page turns. */
  function paintSurface() {
    var g = offCtx, W = off.width, H = off.height;
    var vid = document.getElementById("heroVideo");
    if (live && vid && vid.videoWidth) {
      var s = Math.max(W / vid.videoWidth, H / vid.videoHeight);
      var dw = vid.videoWidth * s, dh = vid.videoHeight * s;
      g.drawImage(vid, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      fillFallback(g, W, H);
    }
    // hero scrim — matches the page's ::after (bottom + top darkening)
    var scb = g.createLinearGradient(0, H, 0, H * 0.6);
    scb.addColorStop(0, "rgba(10,10,14,0.55)"); scb.addColorStop(1, "rgba(10,10,14,0)");
    g.fillStyle = scb; g.fillRect(0, 0, W, H);
    var sct = g.createLinearGradient(0, 0, 0, H * 0.18);
    sct.addColorStop(0, "rgba(10,10,14,0.45)"); sct.addColorStop(1, "rgba(10,10,14,0)");
    g.fillStyle = sct; g.fillRect(0, 0, W, H);
    // hero text, exactly where it sits on screen (no jump, no drift).
    // Use the canvas's native letterSpacing (same layout engine as CSS) so the
    // spacing matches the live hero; fall back to per-char only if unsupported.
    g.textBaseline = "alphabetic";
    var nativeLS = ("letterSpacing" in g);
    for (var i = 0; i < textSpecs.length; i++) {
      var t = textSpecs[i];
      g.font = t.font; g.fillStyle = t.color;
      if (nativeLS) {
        g.letterSpacing = (t.ls || 0) + "px";
        g.fillText(t.text, t.x, t.y);
      } else if (t.ls) {
        var x = t.x;
        for (var c = 0; c < t.text.length; c++) { g.fillText(t.text[c], x, t.y); x += g.measureText(t.text[c]).width + t.ls; }
      } else {
        g.fillText(t.text, t.x, t.y);
      }
    }
    if (nativeLS) g.letterSpacing = "0px";
    tex.needsUpdate = true;
  }

  function fillFallback(g, W, H) {
    var grd = g.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, "#20408f"); grd.addColorStop(1, "#10233f");
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
  }

  function render() { renderer.render(scene, camera); }

  window.CMTFold = {
    /* debug: freeze at a given progress, for screenshotting the geometry */
    pose: function (p) {
      SCALE = Math.min(window.devicePixelRatio, 1.5);
      off.width = Math.round(window.innerWidth * SCALE);
      off.height = Math.round(window.innerHeight * SCALE);
      live = false;
      measureText();
      paintSurface();
      mat.uniforms.u_screen.value.set(window.innerWidth, window.innerHeight);
      mat.uniforms.u_progress.value = p;
      canvas.style.visibility = "visible";
      var layer = document.getElementById("destLayer"); if (layer) layer.style.display = "block";
      var hero = document.querySelector(".hero"); if (hero) hero.style.visibility = "hidden";
      render();
    },
    play: function (href, rect, duration) {
      // No WebGL: instant cut into the book (still no black screen).
      if (!hasGL) {
        resetBook();
        if (front && href) { front.setAttribute("src", href); front.style.zIndex = "2"; }
        if (book) book.classList.add("show");
        var h0 = document.querySelector(".hero"); if (h0) h0.style.visibility = "hidden";
        if (canvas) canvas.style.visibility = "hidden";
        return;
      }
      SCALE = Math.min(window.devicePixelRatio, 1.5);
      off.width = Math.round(window.innerWidth * SCALE);
      off.height = Math.round(window.innerHeight * SCALE);
      // peel from the corner nearest the button: sweep points from the button
      // toward the centre (uv space, y-up), so the button's corner lifts first.
      var vw = window.innerWidth, vh = window.innerHeight;
      var sx = 0.70710678, sy = 0.70710678;
      if (rect) {
        var bx = (rect.left + rect.width / 2) / vw;
        var byUv = 1 - (rect.top + rect.height / 2) / vh;
        var dx = 0.5 - bx, dy = 0.5 - byUv, len = Math.hypot(dx, dy) || 1;
        sx = dx / len; sy = dy / len;
      }
      mat.uniforms.u_sweep.value.set(sx, sy);
      measureText(); // while the hero is still visible

      // probe whether the video can be read into the canvas (blocked on file://)
      live = false;
      var vid = document.getElementById("heroVideo");
      if (vid && vid.videoWidth) {
        try { offCtx.drawImage(vid, 0, 0, 1, 1); offCtx.getImageData(0, 0, 1, 1); live = true; }
        catch (e) { live = false; off.width = off.width; /* un-taint */ }
      }
      try { paintSurface(); } catch (e) {}

      mat.uniforms.u_screen.value.set(window.innerWidth, window.innerHeight);
      mat.uniforms.u_progress.value = 0;
      // Entering from the homepage: reset the book to its front leaf, load the
      // chosen section there, and reveal the book beneath the peeling video.
      resetBook();
      if (front && href) { front.setAttribute("src", href); front.style.zIndex = "2"; }
      if (book) book.classList.add("show");
      var hero = document.querySelector(".hero"); if (hero) hero.style.visibility = "hidden";
      canvas.style.visibility = "visible";
      try { render(); } catch (e) {}

      var proxy = { p: 0 };
      window.gsap.to(proxy, {
        p: 1,
        duration: duration || 2.0,
        ease: "power1.inOut",
        onUpdate: function () {
          if (live) { try { paintSurface(); } catch (e) {} } // keep the video playing as it folds
          mat.uniforms.u_progress.value = proxy.p;
          try { render(); } catch (e) {}
        },
        onComplete: function () {
          // Leave the address bar on the shell (index.html) so a refresh keeps
          // the fold available on every click, rather than dropping onto a
          // standalone page. The section is shown live in the iframe beneath.
          canvas.style.visibility = "hidden";
        }
      });
    },
    /* Reverse fold: the video homepage sweeps back over the current page
       (shown in the iframe), returning to the hero. Triggered from a Home link
       inside the embedded destination page (via postMessage). */
    home: function () {
      var hero = document.querySelector(".hero");
      if (!hero) return;
      // No WebGL: instant cut back to the homepage.
      if (!hasGL) {
        hero.style.visibility = "visible";
        if (canvas) canvas.style.visibility = "hidden";
        if (book) book.classList.remove("show");
        resetBook();
        return;
      }
      SCALE = Math.min(window.devicePixelRatio, 1.5);
      off.width = Math.round(window.innerWidth * SCALE);
      off.height = Math.round(window.innerHeight * SCALE);
      // the video sweeps back in from the top-right (where Home sits)
      mat.uniforms.u_sweep.value.set(0.70710678, 0.70710678);
      measureText(); // hero is visibility:hidden but still laid out

      live = false;
      var vid = document.getElementById("heroVideo");
      if (vid && vid.videoWidth) {
        try { offCtx.drawImage(vid, 0, 0, 1, 1); offCtx.getImageData(0, 0, 1, 1); live = true; }
        catch (e) { live = false; off.width = off.width; }
      }
      try { paintSurface(); } catch (e) {}
      mat.uniforms.u_screen.value.set(window.innerWidth, window.innerHeight);
      mat.uniforms.u_progress.value = 1;   // start fully peeled — the page shows beneath
      canvas.style.visibility = "visible";
      try { render(); } catch (e) {}

      function finish() {
        hero.style.visibility = "visible";            // reveal the live homepage
        canvas.style.visibility = "hidden";
        if (book) book.classList.remove("show");      // hide the book, reset to front leaf
        resetBook();
      }
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }

      var proxy = { p: 1 };
      window.gsap.to(proxy, {
        p: 0,
        duration: 2.0,
        ease: "power1.inOut",
        onUpdate: function () {
          if (live) { try { paintSurface(); } catch (e) {} }
          mat.uniforms.u_progress.value = proxy.p;
          try { render(); } catch (e) {}
        },
        onComplete: finish
      });
    }
  };

  // --- Page slide (section → section): the next section slides in over the
  //     current page like turning to the next page. No video, no homepage. ---
  window.CMTFold.flip = function (href) {
    if (!book || !href) return;
    book.classList.add("show");
    var cur = front, nxt = backLeaf();
    if (!nxt) { if (cur) cur.setAttribute("src", href); return; }
    nxt.setAttribute("src", href);
    nxt.style.zIndex = "3"; if (cur) cur.style.zIndex = "2";
    nxt.style.boxShadow = "-24px 0 70px -14px rgba(20,18,14,0.35)";
    nxt.style.transition = "none";
    nxt.style.transform = "translateX(100%)";
    void nxt.offsetWidth;                                  // reflow so the slide animates
    nxt.style.transition = "transform 0.72s cubic-bezier(.66,0,.34,1)";
    nxt.style.transform = "translateX(0)";
    front = nxt;
    setTimeout(function () { if (nxt) nxt.style.boxShadow = ""; }, 780);
  };
  // --- Plain swap (section → an individual book/film): no turn at all. ---
  window.CMTFold.nav = function (href) {
    if (front && href) front.setAttribute("src", href);
  };

  // Navigation requests from a page shown inside the book:
  //  • "home" → reverse video-peel back to the homepage (wordmark / Home)
  //  • "flip" → section → section: turn the current page over
  //  • "nav"  → section → an individual book/film: plain swap, no turn
  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.cmt === "home") window.CMTFold.home();
    else if (e.data.cmt === "flip" && e.data.href) window.CMTFold.flip(e.data.href);
    else if (e.data.cmt === "nav" && e.data.href) window.CMTFold.nav(e.data.href);
  });

  window.addEventListener("resize", function () {
    if (!hasGL) return;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.left = -window.innerWidth / 2; camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2; camera.bottom = -window.innerHeight / 2;
    camera.updateProjectionMatrix();
    mat.uniforms.u_screen.value.set(window.innerWidth, window.innerHeight);
  });
})();
