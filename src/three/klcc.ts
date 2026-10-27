import * as THREE from "three";
import {
  makeBridgeTexture,
  makeDotTexture,
  makePoolTexture,
  makeWindowTexture,
} from "./textures";

/* ------------------------------------------------------------------ */
/*  Eight-pointed star footprint (Rub el Hizb): the towers' plan      */
/* ------------------------------------------------------------------ */
function starShape(scale: number): THREE.Shape {
  const R = 11 * scale;
  const r = R * 0.7654; // inner radius of the interleaved squares
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < 8; i++) {
    const aOut = (i * 45 * Math.PI) / 180;
    const aIn = ((i * 45 + 22.5) * Math.PI) / 180;
    pts.push(new THREE.Vector2(Math.cos(aOut) * R, Math.sin(aOut) * R));
    pts.push(new THREE.Vector2(Math.cos(aIn) * r, Math.sin(aIn) * r));
  }
  const shape = new THREE.Shape();
  shape.setFromPoints(pts);
  shape.closePath();
  return shape;
}

/* ------------------------------------------------------------------ */
/*  Custom UVs: side walls get facade windows, caps stay dark          */
/* ------------------------------------------------------------------ */
const facadeUV: NonNullable<THREE.ExtrudeGeometryOptions["UVGenerator"]> = {
  generateTopUV() {
    const dark = new THREE.Vector2(0.015, 0.015);
    return [dark.clone(), dark.clone(), dark.clone()];
  },
  generateSideWallUV(
    _geometry: THREE.ExtrudeGeometry,
    vertices: number[],
    indexA: number,
    indexB: number,
    indexC: number,
    indexD: number
  ) {
    const u = (i: number) => (vertices[i * 3] + vertices[i * 3 + 1]) * 0.14;
    const v = (i: number) => vertices[i * 3 + 2] * 0.07;
    return [
      new THREE.Vector2(u(indexA), v(indexA)),
      new THREE.Vector2(u(indexB), v(indexB)),
      new THREE.Vector2(u(indexC), v(indexC)),
      new THREE.Vector2(u(indexD), v(indexD)),
    ];
  },
};

/* ------------------------------------------------------------------ */
/*  Tower: stacked star-shaped setbacks + crown + spire               */
/* ------------------------------------------------------------------ */
const TIERS: Array<[height: number, scale: number]> = [
  [48, 1.0],
  [20, 0.93],
  [14, 0.855],
  [9, 0.78],
  [6, 0.695],
  [4, 0.575],
];

export interface Beacon {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  phase: number;
}

function buildTower(
  wallMat: THREE.MeshStandardMaterial,
  capMat: THREE.MeshStandardMaterial,
  crownMat: THREE.MeshStandardMaterial,
  steelMat: THREE.MeshStandardMaterial,
  edgeMat: THREE.LineBasicMaterial,
  beaconMat: THREE.MeshBasicMaterial
): { group: THREE.Group; beacon: Beacon } {
  const group = new THREE.Group();
  let y = 0;

  for (const [h, s] of TIERS) {
    const geo = new THREE.ExtrudeGeometry(starShape(s), {
      depth: h,
      bevelEnabled: false,
      steps: 1,
      UVGenerator: facadeUV,
    });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, y, 0);

    const mesh = new THREE.Mesh(geo, [capMat, wallMat]);
    group.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 15),
      edgeMat
    );
    group.add(edges);

    y += h;
  }

  // tapered crown
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 7.0, 6, 8, 1),
    crownMat
  );
  crown.rotation.y = Math.PI / 8;
  crown.position.y = y + 3;
  group.add(crown);

  // collar + spire mast
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 2.4, 8),
    steelMat
  );
  collar.rotation.y = Math.PI / 8;
  collar.position.y = y + 7.2;
  group.add(collar);

  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.42, 19, 6),
    steelMat
  );
  spire.position.y = y + 17.9;
  group.add(spire);

  // aviation beacon
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), beaconMat);
  tip.position.y = y + 28.2;
  group.add(tip);

  const light = new THREE.PointLight(0xffc46b, 26, 90, 2);
  light.position.y = y + 28.2;
  group.add(light);

  return {
    group,
    beacon: { mesh: tip, light, phase: Math.random() * Math.PI * 2 },
  };
}

/* ------------------------------------------------------------------ */
/*  Full scene assembly                                                */
/* ------------------------------------------------------------------ */
export interface KLCCScene {
  scene: THREE.Scene;
  klcc: THREE.Group;
  beacons: Beacon[];
  update: (t: number) => void;
  dispose: () => void;
}

export function buildKLCCScene(): KLCCScene {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04060c, 0.0034);

  const winTex = makeWindowTexture();
  const bridgeTex = makeBridgeTexture();
  const dotTex = makeDotTexture();
  const poolTex = makePoolTexture();

  /* ---------------- materials ---------------- */
  const wallMat = new THREE.MeshStandardMaterial({
    color: "#0d1119",
    roughness: 0.38,
    metalness: 0.72,
    emissive: 0xffffff,
    emissiveMap: winTex,
    emissiveIntensity: 1.18,
  });

  const capMat = new THREE.MeshStandardMaterial({
    color: "#0a0e16",
    roughness: 0.6,
    metalness: 0.7,
  });

  const crownMat = new THREE.MeshStandardMaterial({
    color: "#10141d",
    roughness: 0.35,
    metalness: 0.8,
    emissive: 0xffffff,
    emissiveMap: winTex,
    emissiveIntensity: 0.65,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: "#2a3140",
    roughness: 0.3,
    metalness: 0.95,
  });

  const bridgeMat = new THREE.MeshStandardMaterial({
    color: "#0c1018",
    roughness: 0.4,
    metalness: 0.6,
    emissive: 0xffffff,
    emissiveMap: bridgeTex,
    emissiveIntensity: 1.05,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: "#11151f",
    roughness: 0.5,
    metalness: 0.8,
  });

  const edgeMat = new THREE.LineBasicMaterial({
    color: "#e3b873",
    transparent: true,
    opacity: 0.12,
  });

  const beaconMat = new THREE.MeshBasicMaterial({
    color: "#ffd9a0",
    transparent: true,
    opacity: 0.95,
  });

  /* ---------------- towers + bridge ---------------- */
  const klcc = new THREE.Group();

  const towerA = buildTower(wallMat, capMat, crownMat, steelMat, edgeMat, beaconMat);
  towerA.group.position.x = -15;
  const towerB = buildTower(wallMat, capMat, crownMat, steelMat, edgeMat, beaconMat);
  towerB.group.position.x = 15;
  klcc.add(towerA.group, towerB.group);

  // skybridge (levels 41 & 42)
  const bridge = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.CapsuleGeometry(1.9, 20, 4, 12), bridgeMat);
  deck.rotation.z = Math.PI / 2;
  deck.position.y = 57;
  bridge.add(deck);

  const rail = new THREE.Mesh(new THREE.BoxGeometry(21, 0.35, 3.6), trimMat);
  rail.position.y = 59.15;
  bridge.add(rail);

  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(10.5, 0.32, 6, 40, Math.PI),
    trimMat
  );
  arch.rotation.z = Math.PI;
  arch.position.y = 55.4;
  bridge.add(arch);

  for (const side of [-1, 1]) {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 10, 6),
      trimMat
    );
    strut.position.set(side * 4.6, 52.4, 0);
    strut.rotation.z = side * 0.49;
    bridge.add(strut);
  }
  klcc.add(bridge);

  const bridgeGlow = new THREE.PointLight(0xffc46b, 42, 70, 1.8);
  bridgeGlow.position.set(0, 55, 0);
  klcc.add(bridgeGlow);

  // podiums + plaza
  const podiumMat = new THREE.MeshStandardMaterial({
    color: "#0b0f17",
    roughness: 0.5,
    metalness: 0.6,
    emissive: 0xffffff,
    emissiveMap: winTex,
    emissiveIntensity: 0.35,
  });
  for (const side of [-1, 1]) {
    const podium = new THREE.Mesh(new THREE.BoxGeometry(17, 2.6, 17), podiumMat);
    podium.position.set(side * 15, 1.3, 0);
    klcc.add(podium);
  }
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(50, 1.0, 28), capMat);
  plaza.position.y = 0.5;
  klcc.add(plaza);

  scene.add(klcc);

  /* ---------------- mirrored reflection ---------------- */
  const reflection = klcc.clone(true);
  const dimMaterial = (m: THREE.Material) => {
    const c = m.clone();
    c.transparent = true;
    c.opacity = 0.2;
    c.depthWrite = false;
    const std = c as THREE.MeshStandardMaterial;
    if ("emissiveIntensity" in std) std.emissiveIntensity *= 0.5;
    if ("metalness" in std) std.metalness *= 0.4;
    return c;
  };
  reflection.traverse((obj) => {
    if ((obj as THREE.PointLight).isPointLight) {
      (obj as THREE.PointLight).intensity *= 0.2;
      return;
    }
    const mesh = obj as THREE.Mesh;
    if (mesh.material) {
      const mat = mesh.material as THREE.Material | THREE.Material[];
      mesh.material = Array.isArray(mat) ? mat.map(dimMaterial) : dimMaterial(mat);
    }
  });
  reflection.scale.y = -1;
  reflection.renderOrder = 1;
  scene.add(reflection);

  /* ---------------- ground ---------------- */
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(420, 64),
    new THREE.MeshStandardMaterial({
      color: "#04060a",
      roughness: 0.42,
      metalness: 0.6,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.renderOrder = 0;
  scene.add(ground);

  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(170, 170),
    new THREE.MeshBasicMaterial({
      map: poolTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.18;
  pool.renderOrder = 2;
  scene.add(pool);

  /* ---------------- distant skyline ---------------- */
  const skylineMat = new THREE.MeshStandardMaterial({
    color: "#060a12",
    roughness: 0.6,
    metalness: 0.4,
    emissive: 0xffffff,
    emissiveMap: winTex,
    emissiveIntensity: 0.16,
  });
  const skyline = new THREE.Group();
  for (let i = 0; i < 52; i++) {
    const w = 5 + Math.random() * 10;
    const h = 4 + Math.random() * 15;
    const d = 5 + Math.random() * 8;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), skylineMat);
    const a = Math.random() * Math.PI * 2;
    const rad = 125 + Math.random() * 175;
    b.position.set(Math.cos(a) * rad, h / 2, Math.sin(a) * rad);
    b.rotation.y = Math.random() * Math.PI;
    skyline.add(b);
  }
  scene.add(skyline);

  /* ---------------- city lights ---------------- */
  const cityPos: number[] = [];
  const cityCol: number[] = [];
  const warm = new THREE.Color(0xffb45e);
  const cool = new THREE.Color(0x7fb4ff);
  for (let i = 0; i < 700; i++) {
    const a = Math.random() * Math.PI * 2;
    const rad = 55 + Math.pow(Math.random(), 0.72) * 250;
    cityPos.push(Math.cos(a) * rad, 0.4 + Math.random() * 2.6, Math.sin(a) * rad);
    const c = (Math.random() < 0.78 ? warm : cool).clone();
    c.multiplyScalar(0.35 + Math.random() * 0.65);
    cityCol.push(c.r, c.g, c.b);
  }
  const cityGeo = new THREE.BufferGeometry();
  cityGeo.setAttribute("position", new THREE.Float32BufferAttribute(cityPos, 3));
  cityGeo.setAttribute("color", new THREE.Float32BufferAttribute(cityCol, 3));
  const city = new THREE.Points(
    cityGeo,
    new THREE.PointsMaterial({
      size: 1.7,
      map: dotTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  city.renderOrder = 3;
  scene.add(city);

  /* ---------------- stars ---------------- */
  const starPos: number[] = [];
  const starCol: number[] = [];
  const starTint = new THREE.Color();
  for (let i = 0; i < 900; i++) {
    const v = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 0.9 + 0.1,
      Math.random() * 2 - 1
    )
      .normalize()
      .multiplyScalar(380);
    starPos.push(v.x, v.y, v.z);
    starTint.setHSL(0.58 + Math.random() * 0.08 - 0.04, 0.35, 0.72 + Math.random() * 0.28);
    starCol.push(starTint.r, starTint.g, starTint.b);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.Float32BufferAttribute(starCol, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 3.2,
      map: dotTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    })
  );
  stars.renderOrder = 4;
  scene.add(stars);

  /* ---------------- lighting ---------------- */
  scene.add(new THREE.HemisphereLight(0x32405e, 0x05070c, 0.75));
  const key = new THREE.DirectionalLight(0xffd9a6, 1.4);
  key.position.set(-70, 90, 60);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4a7dd8, 0.6);
  rim.position.set(80, 40, -80);
  scene.add(rim);

  /* ---------------- animation ---------------- */
  const beacons = [towerA.beacon, towerB.beacon];
  const update = (t: number) => {
    for (const b of beacons) {
      const s = 0.5 + 0.5 * Math.sin(t * 2.6 + b.phase);
      b.light.intensity = 10 + s * 26;
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = 0.45 + s * 0.5;
    }
  };

  const dispose = () => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    winTex.dispose();
    bridgeTex.dispose();
    dotTex.dispose();
    poolTex.dispose();
  };

  return { scene, klcc, beacons, update, dispose };
}
