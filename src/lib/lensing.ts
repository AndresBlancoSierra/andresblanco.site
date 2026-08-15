import * as THREE from 'three';

/** Einstein radius of the black hole lens, in scene units. */
export const EINSTEIN_R = 0.55;

/**
 * Point-lens (Einstein ring) displacement used by the black hole event.
 *
 * For a background source at radius `r` from the lens, the image radius `theta`
 * is the positive root of `theta^2 - r*theta - R^2 = 0`. Stars pile up into a
 * ring at the Einstein radius `R` while the region at the lens centre is swept
 * clear — the classic weak-lensing signature. `strength` blends between the
 * original position and the fully-lensed one (0..1), so the effect can fade in
 * and out with the black hole.
 */
export function lensPoint(
  out: THREE.Vector3,
  point: THREE.Vector3,
  hole: THREE.Vector3,
  einsteinR: number,
  strength: number,
): THREE.Vector3 {
  out.copy(point);
  if (strength <= 0) return out;

  const dx = point.x - hole.x;
  const dy = point.y - hole.y;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < 1e-4) {
    out.set(hole.x, hole.y, point.z);
    return out;
  }

  const theta = 0.5 * (r + Math.sqrt(r * r + 4 * einsteinR * einsteinR));
  const lx = hole.x + (dx / r) * theta;
  const ly = hole.y + (dy / r) * theta;

  out.set(point.x + (lx - point.x) * strength, point.y + (ly - point.y) * strength, point.z);
  return out;
}

/** GLSL twin of `lensPoint`, run in the star-field vertex shader. */
export const LENSING_GLSL = /* glsl */ `
  vec2 lensDir(vec2 p) {
    return (uHole.xy - p) / max(length(uHole.xy - p), 0.0001);
  }
  vec3 lensed(vec3 p) {
    vec2 d = p.xy - uHole.xy;
    float r = length(d);
    if (r < 0.0001) return vec3(uHole.xy, p.z);
    float th = 0.5 * (r + sqrt(r * r + 4.0 * uEinstein * uEinstein));
    vec2 dir = d / r;
    vec2 lensedXY = uHole.xy + dir * th;
    return vec3(mix(p.xy, lensedXY, uHoleStrength), p.z);
  }
`;
