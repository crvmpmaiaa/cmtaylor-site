/* Paper-cut backgrounds, in the manner of Matisse's gouaches decoupees.
 *
 * The shapes are generated here rather than reproduced from any painting, so
 * nothing is licensed from anyone. The vocabulary is taken from "The Sheaf"
 * and "The Parakeet and the Mermaid":
 *
 *   coral  — a stem with finger lobes branching off it, rounded at every tip
 *   fan    — a spray of long blades opening from one base, like a palm
 *   berry  — the small stalked blobs scattered in the gaps
 *
 * Everything is drawn with thick round-capped strokes, which is what gives the
 * bulbous ends of hand-cut paper. Flat colour only — no gradients, no shading.
 *
 * The palette is the same on every page; the arrangement is not.
 *
 * To change how strong it is, set --art-opacity on .cutouts.
 * Nothing here is content: the layer is aria-hidden and never takes a click.
 */
(function () {
  "use strict";

  var PALETTE = [
    /* No black or near-black. At this opacity over cream a dark ink does not
       read as black, it reads as grey-brown — which is what made these look
       like lumps rather than leaves. Clean, saturated hues only. */
    "#1b6fd4", /* blue      */
    "#2f9e8f", /* teal      */
    "#4aab3a", /* green     */
    "#f0b323", /* yellow    */
    "#e8730a", /* orange    */
    "#d8365a", /* rose      */
    "#8e5bc4"  /* violet    */
  ];

  /* ---- geometry ---------------------------------------------------------
     One shape only: a solid leaf, pinched to a point at both ends, fattest
     around the middle, with a gently scalloped edge. The two sides are
     deliberately out of phase, so the leaf is never a mirror of itself —
     hand-cut paper never is.

     No stem, no branches, no round caps. The branching version read as tubes
     rather than cut paper; this is a single closed outline.
     -------------------------------------------------------------------- */

  var PTS;          /* every point drawn, so the artwork can be framed exactly */

  /* one closed, rounded outline through a ring of points */
  function smooth(p) {
    var n = p.length, d = "M" + p[0][0].toFixed(1) + "," + p[0][1].toFixed(1), i;
    for (i = 0; i < n; i++) {
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)
         + " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)
         + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d + "Z";
  }

  function keep(pts) { for (var i = 0; i < pts.length; i++) PTS.push(pts[i]); }
  function turn(x, y, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  }

  /* ---- the hand ---------------------------------------------------------
     Nothing Matisse cut is symmetrical. A rosette with eight identical petals
     or a star with four identical points reads as generated, however good the
     silhouette is — the eye spots the repeat instantly. So every radial shape
     runs its radius through this: three sine waves at unrelated frequencies
     with phases hashed off the shape's own seed. Smooth, closed (so the shape
     still joins up), different for every shape on the page, and stable for a
     given one. This is the difference between a diagram and a splodge.
     -------------------------------------------------------------------- */
  function wobbler(seed) {
    function ph(n) {
      var v = Math.sin((seed + 1) * n) * 43758.5453;
      return (v - Math.floor(v)) * Math.PI * 2;
    }
    var p1 = ph(12.9898), p2 = ph(78.233), p3 = ph(39.425);
    var f1 = 2, f2 = 3, f3 = 5;
    return function (a) {
      return 0.54 * Math.sin(a * f1 + p1) +
             0.31 * Math.sin(a * f2 + p2) +
             0.15 * Math.sin(a * f3 + p3);
    };
  }

  /* the outline of one leaf: base at the origin, tip pointing up */
  function leafPts(len, wid, lobes, bend) {
    var steps = lobes * 2, pts = [], i, t, y, ax, env;

    function axis(t) { return bend * Math.sin(Math.PI * t) * len * 0.22; }
    /* pinches to nothing at both ends, so the leaf comes to a point */
    function env_(t) { return Math.pow(Math.sin(Math.PI * t), 0.72); }

    for (i = 0; i <= steps; i++) {                 /* up one side */
      t = i / steps; y = -len * t; ax = axis(t); env = env_(t);
      pts.push([ax + wid * env * (i % 2 === 0 ? 1 : 0.70), y]);
    }
    for (i = steps - 1; i >= 1; i--) {             /* and down the other, out of phase */
      t = i / steps; y = -len * t; ax = axis(t); env = env_(t);
      pts.push([ax - wid * env * (i % 2 === 1 ? 1 : 0.70), y]);
    }
    return pts;
  }

  function leaf(o) {
    var pts = leafPts(o.len, o.wid, o.lobes || 5, o.bend || 0);
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>';
  }

  /* FROND — three to five blades opening from one base, like a palm. The outer
     blades are shorter than the middle one, which is what stops it reading as a
     fan of identical strips. Blades share a fill, so where they meet they union
     into one silhouette for free — exactly what overlapping cut paper does. */
  function frond(o) {
    var n = 3 + (o.lobes % 3);
    /* Capped at 0.57. Of twelve fronds shown, the two with the widest splay
       (0.588 and 0.608) were both rejected and nothing kept went above
       0.576 — the only clean signal in the picks. Blade count and width
       overlapped completely between kept and rejected, so they are left
       alone rather than narrowed on a pattern that isn't there. */
    var spread = 0.40 + 0.17 * ((o.bend + 1) / 2);
    var d = "", i, k;
    for (i = 0; i < n; i++) {
      var f = n === 1 ? 0.5 : i / (n - 1);
      var a = (f - 0.5) * 2 * spread;
      var len = o.len * (0.66 + 0.34 * Math.cos(a * 1.4));
      var pts = leafPts(len, o.wid * 0.80, Math.max(3, (o.lobes || 5) - 1), o.bend * 0.5);
      for (k = 0; k < pts.length; k++) pts[k] = turn(pts[k][0], pts[k][1], a);
      keep(pts);
      d += '<path d="' + smooth(pts) + '"/>';
    }
    return d;
  }

  /* STAR — the four- and six-pointed stars that sit between the fronds in the
     late gouaches. Sharp tips with the sides scooped hollow between them, so
     it reads as cut rather than drawn. Built from quadratic curves rather than
     the smoothing above, because smoothing would round the points off. */
  function star(o) {
    var n = 4 + 2 * (o.lobes % 2);
    var R = o.len * 0.5, r = R * (0.26 + 0.16 * ((o.bend + 1) / 2));
    var cy = -o.len * 0.5, pts = [], i, d;

    function P(rad, ang) { return [rad * Math.cos(ang), cy + rad * Math.sin(ang)]; }

    var w = wobbler(o.seed || 1);
    /* every point a different length, every gap a different depth, and the
       points not evenly spaced round the circle */
    function ang(i) {
      return -Math.PI / 2 + (i / n) * Math.PI * 2 + 0.24 * w(i * 1.7);
    }
    function tipR(i) { return R * (1 + 0.26 * w(i * 2.3 + 0.5)); }
    function gapR(i) { return r * (1 + 0.34 * w(i * 3.1 + 1.4)); }

    var t0 = P(tipR(0), ang(0));
    d = "M" + t0[0].toFixed(1) + "," + t0[1].toFixed(1);
    pts.push(t0);
    for (i = 1; i <= n; i++) {
      var a0 = ang(i - 1);
      var a1 = ang(i);
      var c = P(gapR(i), (a0 + a1) / 2), t = P(tipR(i % n), a1);
      d += "Q" + c[0].toFixed(1) + "," + c[1].toFixed(1) + " " +
                 t[0].toFixed(1) + "," + t[1].toFixed(1);
      pts.push(c, t);
    }
    keep(pts);
    return '<path d="' + d + 'Z"/>';
  }

  /* ALGAE — the seaweed blobs. A closed ring whose radius wanders on two
     harmonics, so the edge lobes are uneven and it never closes into an
     oval. Slightly taller than wide, as the cut ones are. */
  function algae(o) {
    var n = 28, pts = [], i, a, rad;
    var R = o.len * 0.40, cy = -o.len * 0.5;
    var k1 = 3 + (o.lobes % 3), k2 = k1 + 2, wa = wobbler(o.seed || 1);
    for (i = 0; i < n; i++) {
      a = (i / n) * Math.PI * 2;
      rad = R * (1 + 0.26 * Math.sin(k1 * a + o.bend) + 0.13 * Math.sin(k2 * a + 1.7))
              * (1 + 0.20 * wa(a));
      pts.push([rad * Math.cos(a), cy + rad * Math.sin(a) * 1.16]);
    }
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>';
  }

  /* PALMETTE — the shape from "La Gerbe" itself: a spray of blunt fingers
     joined at the base into one silhouette. The tips are round, not pointed,
     which is the whole difference between this and the frond, and it is what
     makes it read as cut with scissors rather than drawn. */
  function palmette(o) {
    /* Not fingers radiating from a point - that reads as a hand, or worse, a
       bird's footprint. This is one broad fan with deep slits cut into it, which
       is how the forms in "La Gerbe" actually work: a single piece of paper,
       scissored most of the way through, so the lobes stay joined by a body.
       Polar sweep from the base: the radius carries a lobe wave, and the whole
       arc tapers at its edges so the outer lobes are shorter. */
    var S = 0.80 + 0.32 * ((o.bend + 1) / 2);      /* half-angle of the fan */
    var lobes = 3 + (o.lobes % 3);
    var cut = 0.30 + 0.12 * ((o.bend + 1) / 2);    /* how deep the slits go */
    var pts = [], i, t, th, r, wave, taper, N = lobes * 14;

    for (i = 0; i <= N; i++) {
      t = i / N; th = -S + 2 * S * t;
      wave  = 1 - cut + cut * Math.abs(Math.cos(lobes * th * 0.5 * Math.PI / S));
      taper = 0.66 + 0.34 * Math.cos(th * 0.95);
      r = o.len * 0.92 * taper * wave;
      pts.push([r * Math.sin(th), -r * Math.cos(th)]);
    }
    /* back down to a narrow base, so it grows from a stem rather than floating */
    pts.push([o.len * 0.05, -o.len * 0.06]);
    pts.push([-o.len * 0.05, -o.len * 0.06]);

    keep(pts);
    return '<path d="' + smooth(pts) + '"/>';
  }

  /* FLOWER — a rosette of round petals. One closed ring whose radius swings on
     a single harmonic, so every petal is the same and the whole thing stays
     symmetrical: the one regular shape in the set, which is what makes it read
     as a flower next to all the irregular ones. */
  function flower(o) {
    var n = 5 + (o.lobes % 4);                 /* 5-8 petals */
    var R = o.len * 0.42, cy = -o.len * 0.5;
    /* deeper cuts between the petals, so it has the bite the stars have
       rather than sitting there as a soft round blob */
    var k = 0.42 + 0.14 * ((o.bend + 1) / 2);
    var w = wobbler(o.seed || 1), w2 = wobbler((o.seed || 1) + 17.3);
    var pts = [], i, a, rad, steps = n * 8;
    for (i = 0; i < steps; i++) {
      a = (i / steps) * Math.PI * 2;
      /* petals of unequal length, and an edge that never quite repeats */
      rad = R * (1 - k + k * Math.pow(Math.abs(Math.cos(n * a / 2)), 0.72))
              * (1 + 0.32 * w(a)) * (1 + 0.13 * w2(a * 3.7));
      /* and the whole head sits off its own centre */
      pts.push([rad * Math.cos(a) + R * 0.10 * w(0.7),
                cy + rad * Math.sin(a) + R * 0.10 * w2(1.9)]);
    }
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>';
  }

  /* CRESCENT — the curved horn that turns up all through "Les Betes de la Mer".
     A band swept along an arc, thickest in the middle and closing to a point at
     both ends, so it reads as a scythe rather than a doughnut segment. */
  function crescent(o) {
    var R = o.len * 0.46, cy = -o.len * 0.5;
    var span = 2.1 + 0.9 * ((o.bend + 1) / 2);   /* radians of arc */
    var th = o.len * (0.15 + 0.07 * ((o.lobes % 3) / 2));
    var a0 = -Math.PI / 2 - span / 2;
    var wb = wobbler(o.seed || 1);
    var pts = [], i, t, a, w, N = 16;

    for (i = 0; i <= N; i++) {                  /* outer edge */
      t = i / N; a = a0 + t * span;
      w = th * Math.sin(Math.PI * t) * (1 + 0.30 * wb(t * 4.1));
      pts.push([(R + w * 0.5) * (1 + 0.06 * wb(t * 2.2)) * Math.cos(a),
                cy + (R + w * 0.5) * (1 + 0.06 * wb(t * 2.2)) * Math.sin(a)]);
    }
    for (i = N; i >= 0; i--) {                  /* inner edge, back the other way */
      t = i / N; a = a0 + t * span;
      w = th * Math.sin(Math.PI * t) * (1 + 0.30 * wb(t * 4.1));
      pts.push([(R - w * 0.5) * (1 + 0.06 * wb(t * 2.2)) * Math.cos(a),
                cy + (R - w * 0.5) * (1 + 0.06 * wb(t * 2.2)) * Math.sin(a)]);
    }
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>';
  }

  /* ---- second round -----------------------------------------------------
     Taken off the two paintings themselves rather than from memory: "La Gerbe"
     (sprigs, splayed palms, gapped rosettes) and "La Perruche et la Sirene"
     (striped fans, branching corals, lobed oak leaves, stalked berries).

     Most of them are built from capsules — a tapered bar with a round cap at
     each end. That single primitive is what hand-cut paper actually gives you:
     no sharp corners anywhere, thick where the scissors ran straight, blunt
     where they turned. Same fill, so overlapping capsules union into one
     silhouette exactly as overlapping paper does.
     -------------------------------------------------------------------- */

  /* a tapered bar from a to b, rounded at both ends */
  function capsule(ax, ay, bx, by, wa, wb) {
    var dx = bx - ax, dy = by - ay, L2 = Math.hypot(dx, dy) || 1;
    var ux = dx / L2, uy = dy / L2, nx = -uy, ny = ux;
    var pts = [], i, t;
    for (i = 0; i <= 5; i++) {                    /* cap at b */
      t = (i / 5) * Math.PI - Math.PI / 2;
      pts.push([bx + nx * wb * Math.cos(t) + ux * wb * Math.sin(t),
                by + ny * wb * Math.cos(t) + uy * wb * Math.sin(t)]);
    }
    for (i = 0; i <= 5; i++) {                    /* cap at a */
      t = (i / 5) * Math.PI + Math.PI / 2;
      pts.push([ax + nx * wa * Math.cos(t) + ux * wa * Math.sin(t),
                ay + ny * wa * Math.cos(t) + uy * wa * Math.sin(t)]);
    }
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>';
  }

  /* SPRIG — the form that carries "La Gerbe", rebuilt off the painting rather
     than off memory. The first attempt had a wire stem with small teardrops
     hung off it and scored 4 out of 12; the real thing is nothing like that.

     What the painting actually shows: a THICK spine, and lobes nearly as broad
     as the spine that merge straight into it, so the whole sprig is one solid
     silhouette with no thin joins anywhere. The lobes are short relative to the
     height — they read as bites out of a solid form, not as leaves on a twig. */
  function sprig(o) {
    var w = wobbler(o.seed || 1);
    var n = 3 + (o.lobes % 3);                 /* 3-5 pairs */
    var spineW = o.len * 0.090;                /* was 0.060 - far too thin */
    var tipX = o.bend * o.len * 0.10;
    var d = capsule(0, 0, tipX, -o.len * 0.90, spineW * 1.05, spineW * 0.80);

    for (var i = 0; i < n; i++) {
      var t = 0.22 + 0.62 * (i / Math.max(1, n - 1));
      var sy = -o.len * t, sx = tipX * t;
      /* short and fat: about a third of the height, and thick enough that the
         join to the spine disappears */
      var lob = o.len * (0.36 - 0.10 * t) * (1 + 0.20 * w(i * 2.1));
      var lw  = o.len * 0.135 * (1 + 0.22 * w(i * 1.7));
      for (var sgn = -1; sgn <= 1; sgn += 2) {
        var a = sgn * (0.72 + 0.28 * w(i * 1.3 + sgn));
        /* start the lobe INSIDE the spine so the two union cleanly */
        d += capsule(sx - Math.sin(a) * spineW * 0.5,
                     sy + Math.cos(a) * spineW * 0.5,
                     sx + Math.sin(a) * lob,
                     sy - Math.cos(a) * lob * 0.78,
                     lw * 0.72, lw);
      }
    }
    return d;
  }

  /* PALM — the big blue and black forms at the top of "La Gerbe": four or five
     THICK blunt fingers rising off a solid body. This is what palmette was
     reaching for and missed twice, by making the fingers thin and even. Here
     they are heavy, unequal, and sunk into a body that is itself a shape. */
  function palm(o) {
    var w = wobbler(o.seed || 1);
    var n = 4 + (o.lobes % 2);
    var spread = 0.62 + 0.26 * ((o.bend + 1) / 2);
    var bodyH = o.len * 0.26;
    var d = capsule(0, 0, o.bend * o.len * 0.06, -bodyH,
                    o.len * 0.165, o.len * 0.205);
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0.5 : i / (n - 1);
      var a = (f - 0.5) * 2 * spread + 0.16 * w(i * 1.9);
      var len = o.len * (0.38 + 0.20 * Math.cos(a * 1.1)) * (0.86 + 0.28 * w(i * 2.4));
      var fw = o.len * 0.175 * (0.84 + 0.32 * w(i * 3.2));
      d += capsule(o.bend * o.len * 0.06, -bodyH * 0.65,
                   o.bend * o.len * 0.06 + Math.sin(a) * len,
                   -bodyH * 0.65 - Math.cos(a) * len,
                   fw * 0.85, fw);
    }
    return d;
  }

  /* SHELL — the striped fan. Blades radiate from a base and stay apart, so the
     ground shows between them; that white gap is the whole point. */
  function shell(o) {
    var w = wobbler(o.seed || 1);
    var n = 5 + (o.lobes % 4);
    var spread = 1.05 + 0.35 * ((o.bend + 1) / 2);
    var d = "";
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0.5 : i / (n - 1);
      var a = (f - 0.5) * 2 * spread;
      var len = o.len * (0.72 + 0.28 * Math.cos(a * 0.9)) * (1 + 0.16 * w(i * 1.9));
      var bw = o.len * 0.150 * (1 + 0.30 * w(i * 2.7));
      d += capsule(Math.sin(a) * o.len * 0.015, -Math.cos(a) * o.len * 0.015,
                   Math.sin(a) * len, -Math.cos(a) * len,
                   bw * 0.58, bw);
    }
    return d;
  }

  /* CORAL — branching antlers. Two generations of forks, each arm thinner and
     shorter than its parent, angles knocked off true by the wobble. */
  function coral(o) {
    var w = wobbler(o.seed || 1), d = "", c = 0;
    function arm(x, y, ang, len, wid, depth) {
      var ex = x + Math.sin(ang) * len, ey = y - Math.cos(ang) * len;
      d += capsule(x, y, ex, ey, wid, wid * (depth > 0 ? 0.80 : 0.52));
      if (depth <= 0) return;
      var k = 2 + (Math.abs(w(c * 1.7)) > 0.55 ? 1 : 0);
      for (var i = 0; i < k; i++) {
        c++;
        var off = (i - (k - 1) / 2) * (0.62 + 0.30 * w(c * 2.3));
        arm(ex, ey, ang + off, len * (0.62 + 0.16 * w(c * 3.1)),
            wid * 0.80, depth - 1);
      }
    }
    arm(0, 0, o.bend * 0.25, o.len * 0.42, o.len * 0.115, 2);
    return d;
  }

  /* OAKLEAF — one leaf, deep round lobes down both sides, on a short stalk. */
  function oakleaf(o) {
    var w = wobbler(o.seed || 1);
    var lobes = 3 + (o.lobes % 3);
    var R = o.len * 0.46, cy = -o.len * 0.52;
    var pts = [], i, a, rad, steps = lobes * 20;
    for (i = 0; i < steps; i++) {
      a = (i / steps) * Math.PI * 2;
      /* an ellipse, cut into on both sides by a lobe wave */
      var lobe = 1 - 0.34 * Math.pow(Math.abs(Math.sin(lobes * a)), 0.6);
      rad = R * lobe * (1 + 0.14 * w(a));
      pts.push([rad * Math.cos(a) * 0.72, cy + rad * Math.sin(a) * 1.28]);
    }
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>' +
           capsule(0, cy + R * 1.18, 0, 0, o.len * 0.030, o.len * 0.024);
  }

  /* ROSETTE — petals that do NOT join into one outline. Each is its own
     capsule radiating from a small hub, so the ground shows between them.
     That gap is what separates this from the flower. */
  function rosette(o) {
    var w = wobbler(o.seed || 1);
    var n = 6 + (o.lobes % 3);
    var cy = -o.len * 0.5, d = "";
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + 0.30 * w(i * 1.4);
      var len = o.len * 0.44 * (1 + 0.24 * w(i * 2.6));
      d += capsule(Math.cos(a) * o.len * 0.07, cy + Math.sin(a) * o.len * 0.07,
                   Math.cos(a) * len, cy + Math.sin(a) * len,
                   o.len * 0.038, o.len * 0.125 * (1 + 0.22 * w(i * 3.3)));
    }
    return d;
  }

  /* BERRY — the little stalked blobs dotted through "La Perruche". Small by
     nature; useful as the thing that fills a gap without filling it. */
  function berry(o) {
    var w = wobbler(o.seed || 1);
    var R = o.len * 0.30, cy = -o.len * 0.42;
    var pts = [], i, a, rad;
    for (i = 0; i < 20; i++) {
      a = (i / 20) * Math.PI * 2;
      rad = R * (1 + 0.16 * w(a));
      pts.push([rad * Math.cos(a), cy + rad * Math.sin(a) * 1.06]);
    }
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>' +
           capsule(0, cy + R * 0.9, o.bend * o.len * 0.10, o.len * 0.02,
                   o.len * 0.026, o.len * 0.018);
  }

  /* FEUILLE — the blue leaf. This is the one everybody pictures when they say
     "a Matisse", and it is a single closed silhouette, not an assembly:

       - a thick spine, slightly wandering
       - lobes that ALTERNATE left and right, staggered, never paired
       - sinuses cut deep and narrow, almost to the spine, rounded at the end
       - every tip blunt; there is not one sharp point in the original
       - a tail at the base, a crown of lobes at the top
       - lobes growing a little as they go up

     Built by walking up the right edge and back down the left, with the two
     sides half a lobe out of phase. That phase offset is the whole trick: it
     is what makes it read as hand-cut rather than stamped. */
  function feuille(o) {
    /* Three goes at this as a width-along-the-spine function produced a
       caterpillar, then a zigzag, then a row of wedges. A single width per
       height CANNOT make a rounded paddle - the outline has to curve back on
       itself, and a function of y never does. So: build it the way paper is
       built. A thick spine, and each lobe its own blunt blob merged into it.
       Same fill, so they union into one silhouette and the joins vanish. */
    var w = wobbler(o.seed || 1);
    var n = 5 + (o.lobes % 3);                 /* lobes in total, alternating */
    var spineW = o.len * 0.085;
    var tipX = o.bend * o.len * 0.10;

    /* spine: a tail at the bottom, thickest through the body */
    var d = capsule(0, 0, tipX * 0.5, -o.len * 0.30, spineW * 0.55, spineW * 1.05);
    d += capsule(tipX * 0.5, -o.len * 0.30, tipX, -o.len * 0.86, spineW * 1.05, spineW * 0.80);

    for (var i = 0; i < n; i++) {
      var t = 0.20 + 0.66 * (i / Math.max(1, n - 1));
      var sgn = (i % 2) ? 1 : -1;              /* strictly alternating */
      var sx = tipX * t, sy = -o.len * t;

      /* angle up and out; lobes near the crown stand more upright */
      var a = sgn * (1.02 - 0.42 * t + 0.16 * w(i * 1.9));
      /* reach and fatness both grow a little toward the top */
      var reach = o.len * (0.26 + 0.10 * t) * (1 + 0.18 * w(i * 2.3));
      var fat   = o.len * (0.115 + 0.045 * t) * (1 + 0.16 * w(i * 3.1));

      d += capsule(sx - Math.sin(a) * spineW * 0.6,
                   sy + Math.cos(a) * spineW * 0.6,
                   sx + Math.sin(a) * reach,
                   sy - Math.cos(a) * reach * 0.62,
                   fat * 0.60, fat);
    }

    /* a blunt lobe closing the top, so it has a crown rather than a stump */
    d += capsule(tipX, -o.len * 0.80, tipX + o.bend * o.len * 0.04, -o.len * 0.97,
                 spineW * 0.9, o.len * 0.115);
    return d;
  }

  /* ---- drawn by hand ----------------------------------------------------
     Everything above this line is generated from formulas, and formulas are
     bad at "a shape somebody cut with scissors" — four attempts at the blue
     leaf produced a caterpillar, a zigzag, a row of wedges and finally
     something merely adjacent. So these are traced instead: each outline is a
     hand-picked list of anchor points walked anticlockwise from the base,
     smoothed by the same routine the rest of the file uses.

     Per shape the points are then nudged by the wobbler, so a shape used eight
     times on a page is eight different cuts of the same leaf rather than one
     leaf stamped eight times. Base at the origin, tip pointing up, drawn at a
     nominal height of 100.
     -------------------------------------------------------------------- */

  var HAND = {
    /* the framed blue leaf: bold lobes alternating up a spine, staggered so
       the two sides never pair off, blunt at every tip */
    feuilleBlue: [
      [0,0],[6,-6],[10,-14],
      [24,-16],[36,-22],[38,-33],[28,-37],[16,-33],[11,-38],
      [26,-45],[39,-52],[40,-63],[29,-66],[17,-61],[12,-64],
      [24,-74],[34,-84],[31,-95],[20,-97],[12,-92],
      [2,-98],
      [-10,-95],[-22,-97],[-32,-90],[-30,-79],[-20,-75],[-12,-79],[-10,-70],
      [-24,-68],[-37,-60],[-38,-49],[-27,-45],[-15,-50],[-11,-44],
      [-25,-40],[-36,-32],[-34,-21],[-23,-18],[-13,-23],[-8,-16],
      [-5,-8]
    ],

    /* a broad leaf with slits cut in from the edge, the big blue ones */
    palmSlit: [
      [0,0],[14,-10],[24,-26],[30,-44],
      [22,-52],[30,-62],[28,-74],
      [18,-70],[20,-84],[12,-92],
      [0,-88],
      [-13,-92],[-20,-84],[-17,-70],
      [-27,-74],[-30,-62],[-21,-52],
      [-29,-44],[-23,-26],[-13,-10]
    ],

    /* three round lobes on a short body — clover-ish, very cut-paper */
    trefoil: [
      [0,0],[9,-10],[22,-14],[32,-24],[30,-38],[18,-44],
      [24,-58],[20,-72],[8,-80],
      [-6,-78],[-18,-70],[-22,-56],[-16,-44],
      [-28,-38],[-32,-24],[-22,-14],[-9,-10]
    ],

    /* a plain bold petal, slightly bent — the quiet one in any arrangement */
    petal: [
      [0,0],[8,-10],[14,-25],[16,-45],[12,-66],[5,-84],[0,-95],
      [-6,-84],[-12,-66],[-15,-45],[-13,-25],[-7,-10]
    ],

    /* long spear with two lobes at the base */
    spear: [
      [0,0],[10,-4],[18,-12],[16,-26],[12,-44],[7,-66],[2,-88],
      [-3,-66],[-8,-44],[-13,-26],[-15,-12],[-9,-4]
    ]
  };

  /* Draw a traced outline, nudged so it is never the same cut twice. Each
     point moves along its own radius from the shape's middle, by a smooth
     function of its position round the outline — so neighbours move together
     and the silhouette stays legible instead of turning to noise. */
  function drawHand(name, o) {
    var src = HAND[name], n = src.length, i;
    var w = wobbler(o.seed || 1);
    var cx = 0, cy = 0;
    for (i = 0; i < n; i++) { cx += src[i][0]; cy += src[i][1]; }
    cx /= n; cy /= n;

    var k = o.len / 100;                    /* the tracings are drawn at 100 */
    var mirror = (o.seed || 0) % 2 < 1 ? 1 : -1;
    var pts = [];
    for (i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var f = 1 + 0.13 * w(a * 2);
      pts.push([(cx + (src[i][0] - cx) * f) * k * mirror,
                (cy + (src[i][1] - cy) * f) * k]);
    }
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>';
  }

  function handShape(name) { return function (o) { return drawHand(name, o); }; }

  /* ---- real leaves -------------------------------------------------------
     The invented forms (sprig, palm, shell, coral, rosette) were the wrong
     direction. These are actual leaf silhouettes from botanical morphology,
     cut flat: cordate (heart, notched base), palmate (maple, radiating lobes),
     ovate (egg, widest below the middle), reniform (kidney, wider than long),
     pinnate-lobed (oak, rounded lobes down a midrib) and ginkgo (fan with a
     split). Each keeps the hand-cut wobble so none of them is symmetrical.
     -------------------------------------------------------------------- */

  /* a notch scooped out of an outline at angle na, width nw, depth nd */
  function notch(a, na, nw, nd) {
    var d = a - na;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return 1 - nd * Math.exp(-(d / nw) * (d / nw));
  }

  /* every leaf below is a closed polar outline plus a stalk */
  function leafBody(o, radius, sx, sy, stalk) {
    stalk = 0;   /* no petioles: a thin stalk reads as a wire, which is the
                    mistake that sank palmette, shell, coral and palm */
    var pts = [], i, a, r, N = 96;
    for (i = 0; i < N; i++) {
      a = (i / N) * Math.PI * 2;
      r = radius(a);
      pts.push([r * Math.cos(a) * sx, -o.len * 0.5 + r * Math.sin(a) * sy]);
    }
    keep(pts);
    var d = '<path d="' + smooth(pts) + '"/>';
    if (stalk) d += capsule(0, stalk, 0, 0, o.len * 0.028, o.len * 0.022);
    return d;
  }

  /* CORDATE — heart-shaped: a notch where the stalk meets the blade, tapering
     to a point at the tip. A cardioid does the job almost exactly. */
  function cordate(o) {
    var w = wobbler(o.seed || 1), R = o.len * 0.30;
    return leafBody(o, function (a) {
      return R * (1 + 0.72 * Math.sin(a)) * (1 + 0.13 * w(a));
    }, 1.00, 1.24, o.len * 0.44);
  }

  /* PALMATE — the maple: lobes radiating from one point, pointed, with deep
     sinuses between them. The exponent is what sharpens the tips. */
  function palmate(o) {
    var w = wobbler(o.seed || 1), R = o.len * 0.46;
    var n = 5 + 2 * (o.lobes % 2);            /* 5 or 7 lobes */
    return leafBody(o, function (a) {
      /* 0.55 not 1.35: broad blunt lobes, not botanical points */
      var lobe = Math.pow(Math.abs(Math.cos(n * a / 2)), 0.55);
      return R * (0.36 + 0.64 * lobe) * (1 + 0.15 * w(a)) *
             notch(a, Math.PI / 2, 0.30, 0.42);
    }, 1.00, 1.02, o.len * 0.40);
  }

  /* OVATE — the plainest leaf there is. Egg-shaped, widest below the middle,
     drawn to a point at the tip. */
  function ovate(o) {
    var w = wobbler(o.seed || 1), R = o.len * 0.40;
    return leafBody(o, function (a) {
      var taper = 1 - 0.34 * Math.sin(a);      /* narrower toward the tip */
      return R * taper * (1 + 0.11 * w(a)) *
             (1 - 0.12 * Math.pow(Math.max(0, -Math.sin(a)), 3));
    }, 0.74, 1.26, o.len * 0.40);
  }

  /* RENIFORM — kidney: wider than it is long, blunt at the tip, with a deep
     round notch where the stalk goes in. */
  function reniform(o) {
    var w = wobbler(o.seed || 1), R = o.len * 0.40;
    return leafBody(o, function (a) {
      return R * (1 + 0.12 * w(a)) * notch(a, Math.PI / 2, 0.46, 0.62);
    }, 1.30, 0.88, o.len * 0.40);
  }

  /* PINNATE-LOBED — the oak: rounded lobes stepping down both sides of a
     midrib, deeper toward the base. */
  function oaklobe(o) {
    var w = wobbler(o.seed || 1), R = o.len * 0.40;
    var n = 3 + (o.lobes % 3);
    return leafBody(o, function (a) {
      var lobe = 0.62 + 0.38 * Math.pow(Math.abs(Math.cos(n * a)), 0.62);
      var taper = 1 - 0.26 * Math.sin(a);
      return R * lobe * taper * (1 + 0.12 * w(a));
    }, 0.80, 1.28, o.len * 0.40);
  }

  /* GINKGO — a fan on a long stalk, split up the middle. Not a polar loop
     round a centre: a sweep out from the base and back. */
  function ginkgo(o) {
    var w = wobbler(o.seed || 1);
    var S = 0.72 + 0.20 * ((o.bend + 1) / 2);
    var R = o.len * 0.74;
    var pts = [], i, t, a, r, N = 40;
    for (i = 0; i <= N; i++) {
      t = i / N; a = -S + 2 * S * t;
      r = R * (1 + 0.10 * w(a * 3)) * (1 - 0.30 * Math.exp(-(a / 0.26) * (a / 0.26)));
      pts.push([Math.sin(a) * r, -Math.cos(a) * r]);
    }
    pts.push([o.len * 0.045, -o.len * 0.05]);
    pts.push([-o.len * 0.045, -o.len * 0.05]);
    keep(pts);
    return '<path d="' + smooth(pts) + '"/>' +
           capsule(0, o.len * 0.30, 0, 0, o.len * 0.026, o.len * 0.022);
  }

  var SHAPES = {
    leaf: leaf, frond: frond, star: star, algae: algae,
    palmette: palmette, flower: flower, crescent: crescent,
    sprig: sprig, palm: palm, shell: shell, coral: coral,
    feuille: feuille,
    feuilleBlue: handShape("feuilleBlue"), palmSlit: handShape("palmSlit"),
    trefoil: handShape("trefoil"), petal: handShape("petal"),
    spear: handShape("spear"),
    cordate: cordate, palmate: palmate, ovate: ovate,
    reniform: reniform, oaklobe: oaklobe, ginkgo: ginkgo,
    oakleaf: oakleaf, rosette: rosette, berry: berry
  };

  /* ---- placement --------------------------------------------------------
     The painting is an allover field: shapes cover the whole surface in loose
     rows, close together but never touching, each one sitting in its own clear
     ground. So the layout is a jittered grid rather than a scatter — one shape
     per cell, nudged off centre, and sized to stay inside its cell. That gives
     the density of the original while making overlap impossible by
     construction rather than by hoping.

     In the original every frond stands upright. These are turned instead, each
     to its own angle, so the field reads as a pattern rather than a copy.

     Each shape is its own small SVG placed in viewport percentages and sized in
     vh — one fixed viewBox with preserveAspectRatio="slice" would crop the
     outer rows away on any screen that is not 4:3.
     -------------------------------------------------------------------- */

  var PHI = 1.6180339887498949;
  var INV = 0.6180339887498949;      /* 1/phi */

  function golden(i, offset) { return (offset + i * INV) % 1; }

  /* One shape per cell of a cols x rows grid — but a grid you should not be
     able to see. Three things break it up: alternate rows are offset by half a
     cell, sizes vary widely rather than stepping through a fixed ladder, and
     roughly one cell in six is left empty. Each shape then gets whatever
     jitter its own size leaves room for, so the small ones wander a long way
     and the big ones barely move. */
  function field(cols, rows, colours, offset, startIdx, spin, shapes) {
    var out = [], cw = 100 / cols, ch = 100 / rows, i, j, k = 0;
    shapes = shapes && shapes.length ? shapes : ["leaf"];
    var cap = Math.min(cw, ch) * 0.90;

    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        k++;
        var g1 = golden(k * 3 + 1, offset);
        var g2 = golden(k * 5 + 2, offset + 0.19);
        var g3 = golden(k * 7 + 3, offset + 0.41);
        var g4 = golden(k * 11 + 4, offset + 0.63);
        var g5 = golden(k * 13 + 5, offset + 0.87);

        if (g4 < 0.10) continue;                    /* leave a gap */

        /* still a wide range, but weighted large — the previous curve was
           squared, which produced mostly small shapes */
        var size = cap * (0.58 + 0.42 * g1);

        /* whatever room the shape leaves in its cell, it may wander into */
        var budX = Math.max(0, cw * 0.5 - size * 0.5);
        var budY = Math.max(0, ch * 0.5 - size * 0.5);

        /* alternate rows offset by half a cell, so no column lines up */
        var x = (i + 0.5) * cw + (j % 2 ? cw * 0.5 : 0) + (g2 - 0.5) * 2 * budX * 0.92;
        var y = (j + 0.5) * ch + (g3 - 0.5) * 2 * budY * 0.92;
        /* A shape must sit fully inside the viewport on both axes. size is in
           vmin, so on the worst-case screen 1vmin is 1% of whichever axis we
           are testing — treating it that way for both is conservative and
           means nothing is ever cut off, on any shape of screen. */
        var half = size * 0.5;
        if (x - half < 0.5 || x + half > 99.5) continue;
        if (y - half < 0.5 || y + half > 99.5) continue;

        out.push({
          /* Deal them round, don't roll for them. Picking the shape from a
             random-ish number gave four spears on one page and four berries on
             another — with only nine cells, chance clumps badly. Cycling
             through the list as shapes are placed makes the counts even by
             construction; the positions are jittered and the rotations vary,
             so it still reads as scattered rather than as a sequence. */
          shape: shapes[(out.length + startIdx) % shapes.length],
          x: x, y: y, size: size,
          rot: (g3 - 0.5) * 46 + (spin % 17) - 8,
          /* the variety now comes from the leaf itself: how many scallops it
             carries, how broad it is, and how much its spine curves */
          seed: k * 7.13 + offset * 131.7 + spin * 0.37,
          lobes: 5 + Math.floor(g5 * 4),
          widf: 0.21 + g2 * 0.14,
          bend: (g5 - 0.5) * 2.0,
          fill: colours[(startIdx + Math.floor(g2 * colours.length)) % colours.length]
        });
      }
    }
    return out;
  }

  var C = PALETTE;

  /* ---- the compositions -------------------------------------------------
     Same field on every page, but a different grid, colour order, shape mix
     and rotation, so no two pages read the same.
     -------------------------------------------------------------------- */

  var DESIGNS = {
    /* Weighting is done by repeating a name: shapes are dealt round the list in
       turn, so a name listed twice comes up twice as often.

       flower, frond, feuilleBlue and palmSlit lead. spear and berry are on
       most pages now but never doubled, so they punctuate the others rather
       than competing with them — they were down to one page each, which read
       as absent rather than restrained. */

    /* Contact: the page is a short form and a lot of empty paper, so it wants
       the densest field on the site rather than the sparsest — a 4x3 grid
       instead of 3x3, and six shapes so nothing repeats near itself. */
    sheaf:       function () { return field(4, 3, C, 0.13, 0,  18,
                   ["flower", "feuilleBlue", "palmSlit", "algae", "frond", "berry"]); },
    /* Books: the blue leaf twice over. */
    column:      function () { return field(3, 3, C, 0.29, 3, 200,
                   ["feuilleBlue", "feuilleBlue", "frond", "trefoil", "spear"]); },
    /* Films index: the widest mix on the site. Doubling the fronds here made
       them dominate a page that already has strong poster artwork competing
       for attention, so nothing is doubled — six shapes, one or two of each. */
    band_:       function () { return field(4, 3, C, 0.41, 5,  95,
                   ["feuilleBlue", "frond", "palmSlit", "flower", "algae", "spear"]); },
    /* A single book: quiet behind a long read. */
    corners:     function () { return field(3, 3, C, 0.07, 2, 300,
                   ["algae", "palmSlit", "feuilleBlue", "petal", "berry"]); },
    /* Unused — kept so the names still line up with pick(). */
    corners_alt: function () { return field(4, 3, C, 0.31, 6, 140,
                   ["frond", "algae", "palmSlit", "feuilleBlue", "berry"]); },
    /* Essays: flowers leading. */
    scatter:     function () { return field(4, 3, C, 0.19, 1, 250,
                   ["flower", "flower", "palmSlit", "berry", "frond"]); },
    /* About: the slit leaf with fronds and colour between. */
    arch:        function () { return field(3, 3, C, 0.03, 4,  60,
                   ["palmSlit", "frond", "flower", "algae", "spear"]); }
  };

  /* which page gets which */
  function pick() {
    var p = location.pathname.replace(/\/index\.html?$/, "/").replace(/\.html?$/, "");
    if (/\/books\/[^/]+$/.test(p)) return "corners";
    /* An individual film page is near-black on purpose: the poster, the stills
       and the Vimeo embed have to read cleanly against it, and anything laid
       behind them is working against the reason the black is there. The films
       INDEX is cream like the rest of the site, so it keeps its pattern. */
    if (/\/films\/[^/]+$/.test(p)) return null;
    if (/\/contact$/.test(p)) return "sheaf";
    if (/\/about$/.test(p))   return "arch";
    if (/\/books$/.test(p))   return "column";
    if (/\/films$/.test(p))   return "band_";
    if (/\/essays$/.test(p))  return "scatter";
    return null;                       /* the homepage is video; leave it be */
  }

  /* ---- putting it on the page ------------------------------------------
     The layer sits at z-index -1, which only works if the page's background
     colour is on <html> rather than <body> — otherwise body's own background
     paints straight over it. So the colour is lifted up one level. Any page
     using a background *image* is left alone rather than clobbered.
     -------------------------------------------------------------------- */

  var L = 100;   /* every shape is drawn at this nominal length; the CSS width
                    alone decides how big it actually appears */

  /* Build one shape's SVG, framed to what it actually drew. Every point is
     collected in PTS, so the box is the exact square that holds the artwork,
     turned about its own middle — nothing is ever cut off at any angle, and no
     space is wasted, so the shape fills the size it is given.

     Shared by the page and by shape-picker.html, so what the picker shows is
     exactly what ships rather than a copy that drifts out of step. */
  function svgFor(it, positioned) {
    it.len = it.len || L;
    it.wid = it.wid || L * (it.widf || 0.25);
    PTS = [];
    var body = SHAPES[it.shape](it);

    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, k;
    for (k = 0; k < PTS.length; k++) {
      if (PTS[k][0] < x0) x0 = PTS[k][0];
      if (PTS[k][0] > x1) x1 = PTS[k][0];
      if (PTS[k][1] < y0) y0 = PTS[k][1];
      if (PTS[k][1] > y1) y1 = PTS[k][1];
    }
    var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, rad = 0, d;
    for (k = 0; k < PTS.length; k++) {
      d = Math.hypot(PTS[k][0] - mx, PTS[k][1] - my);
      if (d > rad) rad = d;
    }
    rad *= 1.01;

    var style = positioned
      ? ' style="left:' + it.x.toFixed(2) + '%;top:' + it.y.toFixed(2) +
        '%;--s:' + it.size.toFixed(2) + '"'
      : '';

    return '<svg viewBox="' + (mx - rad).toFixed(1) + ' ' + (my - rad).toFixed(1) + ' ' +
           (2 * rad).toFixed(1) + ' ' + (2 * rad).toFixed(1) + '"' + style +
           ' focusable="false"><g transform="rotate(' + (it.rot || 0).toFixed(1) + ' ' +
           mx.toFixed(1) + ' ' + my.toFixed(1) + ')" fill="' + it.fill +
           '" stroke="none">' + body + '</g></svg>';
  }

  function start() {
    var name = pick();
    if (!name || !DESIGNS[name]) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-transparency: reduce)").matches) return;

    var cs = getComputedStyle(document.body);
    if (cs.backgroundImage && cs.backgroundImage !== "none") return;
    var paper = cs.backgroundColor;
    if (!paper || paper === "transparent" || /rgba\(0, 0, 0, 0\)/.test(paper)) {
      paper = getComputedStyle(document.documentElement).backgroundColor;
    }
    document.documentElement.style.backgroundColor = paper;
    document.body.style.backgroundColor = "transparent";

    var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(paper);
    var lum = m ? (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255 : 1;
    var dark = lum < 0.5;

    /* An allover field sits under the words everywhere, not just in the
       margins, so it has to be lighter than a few shapes at the edges could
       afford to be. --art-opacity is the knob. */
    var css = document.createElement("style");
    css.textContent =
      ".cutouts{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:-1;" +
        "--art-opacity:" + (dark ? 0.52 : 0.46) + ";--art-scale:1;}" +
      ".cutouts svg{position:absolute;width:calc(var(--s)*1vmin*var(--art-scale));height:auto;" +
        "transform:translate(-50%,-50%);opacity:var(--art-opacity);}" +
      "@media (max-width:700px){.cutouts{--art-opacity:" + (dark ? 0.40 : 0.35) +
        ";--art-scale:0.72;}}" +
      "@media print{.cutouts{display:none;}}";
    document.head.appendChild(css);

    var items = DESIGNS[name](), i, html = "";
    for (i = 0; i < items.length; i++) html += svgFor(items[i], true);

    var box = document.createElement("div");
    box.className = "cutouts";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = html;
    document.body.insertBefore(box, document.body.firstChild);
  }

  /* the picker reads these; nothing on the site does */
  window.CMTCutouts = { SHAPES: SHAPES, PALETTE: PALETTE, svgFor: svgFor, DESIGNS: DESIGNS };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
