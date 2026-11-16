// Physics sanity checks for the sims. Run: node check.mjs
import assert from 'node:assert/strict';
import { planck, rayleighJeans, wien, peak, SIGMA } from './sims/blackbody.js';

const T = 5800;
// Numeric argmax of Planck matches Wien's displacement law.
let best = 0, arg = 0;
for (let nm = 100; nm <= 3000; nm += 0.1) { const v = planck(nm * 1e-9, T); if (v > best) { best = v; arg = nm * 1e-9; } }
assert.ok(Math.abs(arg / peak(T) - 1) < 1e-3, `peak ${arg} vs ${peak(T)}`);
// Classical limit (long λ) and Wien limit (short λ).
assert.ok(Math.abs(rayleighJeans(1e-3, T) / planck(1e-3, T) - 1) < 2e-3);
assert.ok(Math.abs(wien(300e-9, 3000) / planck(300e-9, 3000) - 1) < 1e-6);
// Stefan–Boltzmann: π∫B_λ dλ = σT⁴.
let sum = 0; const dl = 1e-9;
for (let l = dl; l < 1e-3; l += dl) sum += planck(l, T) * dl;
assert.ok(Math.abs(Math.PI * sum / (SIGMA * T ** 4) - 1) < 1e-3);
console.log('ok');
