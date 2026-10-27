import * as THREE from "three";

export interface CamKey {
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

/**
 * Scroll choreography: a guided cinematic orbit around the towers:
 * 0.00  wide establishing shot          0.52  worm's-eye between the towers
 * 0.16  dolly toward the skybridge      0.70  crown & spire close-up
 * 0.34  skybridge fly-by                0.86  frontal elevation
 * 1.00  final pull-back
 */
export const CAM_KEYS: CamKey[] = [
  { p: 0.0,  pos: [-112, 24, 174], look: [0, 50, 0], fov: 40 },
  { p: 0.16, pos: [-62, 44, 94],  look: [-4, 56, 0], fov: 42 },
  { p: 0.34, pos: [-24, 60, 54],  look: [0, 57, 0],  fov: 46 },
  { p: 0.52, pos: [30, 9, 64],    look: [2, 88, -4], fov: 56 },
  { p: 0.7,  pos: [74, 92, -22],  look: [0, 98, 0],  fov: 45 },
  { p: 0.86, pos: [6, 32, 170],   look: [0, 60, 0],  fov: 40 },
  { p: 1.0,  pos: [-90, 56, 136], look: [0, 54, 0],  fov: 42 },
];

export interface CamState {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export function evalCamera(p: number, out: CamState): void {
  const keys = CAM_KEYS;
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;

  const a = keys[i];
  const b = keys[i + 1];
  const span = Math.max(b.p - a.p, 1e-5);
  const t = smooth(Math.min(Math.max((p - a.p) / span, 0), 1));

  out.pos.set(
    a.pos[0] + (b.pos[0] - a.pos[0]) * t,
    a.pos[1] + (b.pos[1] - a.pos[1]) * t,
    a.pos[2] + (b.pos[2] - a.pos[2]) * t
  );
  out.look.set(
    a.look[0] + (b.look[0] - a.look[0]) * t,
    a.look[1] + (b.look[1] - a.look[1]) * t,
    a.look[2] + (b.look[2] - a.look[2]) * t
  );
  out.fov = a.fov + (b.fov - a.fov) * t;
}
