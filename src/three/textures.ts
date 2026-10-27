import * as THREE from "three";

/**
 * Procedural night-facade texture: a grid of warm lit windows on near-black.
 * The pixel at (0,0) is kept dark so extruded cap faces (mapped to that corner)
 * read as plain dark roof surfaces.
 */
export function makeWindowTexture(): THREE.CanvasTexture {
  const W = 256;
  const H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#05070d";
  ctx.fillRect(0, 0, W, H);

  const cols = 6;
  const rows = 9;
  const cw = W / cols;
  const ch = H / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rand = Math.random();
      const x = c * cw + 5;
      const y = r * ch + 6;
      const w = cw - 12;
      const h = ch - 12;

      if (rand < 0.62) {
        // bright warm window
        const l = 52 + Math.random() * 22;
        ctx.fillStyle = `hsla(${36 + Math.random() * 10}, 82%, ${l}%, ${
          0.75 + Math.random() * 0.25
        })`;
      } else if (rand < 0.85) {
        // dim window
        ctx.fillStyle = `hsla(40, 60%, ${18 + Math.random() * 12}%, 0.8)`;
      } else if (rand < 0.93) {
        // cool fluorescent
        ctx.fillStyle = `hsla(${190 + Math.random() * 30}, 55%, ${
          42 + Math.random() * 14
        }%, 0.7)`;
      } else {
        // dark / vacant
        ctx.fillStyle = "#070a12";
      }
      ctx.fillRect(x, y, w, h);

      // subtle vertical mullion
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(x + w / 2 - 1, y, 2, h);
    }
  }

  // dark corner for cap faces
  ctx.fillStyle = "#04060c";
  ctx.fillRect(0, 0, 8, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Horizontal strip of windows for the skybridge capsule. */
export function makeBridgeTexture(): THREE.CanvasTexture {
  const W = 512;
  const H = 64;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#05070d";
  ctx.fillRect(0, 0, W, H);

  const n = 26;
  const cw = W / n;
  for (let i = 0; i < n; i++) {
    const rand = Math.random();
    const x = i * cw + 4;
    if (rand < 0.7) {
      ctx.fillStyle = `hsla(${38 + Math.random() * 8}, 80%, ${
        50 + Math.random() * 20
      }%, ${0.7 + Math.random() * 0.3})`;
    } else {
      ctx.fillStyle = "rgba(10,14,22,0.9)";
    }
    ctx.fillRect(x, 14, cw - 8, H - 34);
  }
  // dark top/bottom edges for caps
  ctx.fillStyle = "#04060c";
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H - 8, W, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft radial glow sprite for particles / beacons. */
export function makeDotTexture(): THREE.CanvasTexture {
  const S = 64;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Warm light pool for the plaza ground. */
export function makePoolTexture(): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,196,120,0.34)");
  g.addColorStop(0.4, "rgba(200,140,70,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
