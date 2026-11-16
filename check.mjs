// Physics sanity checks for the sims. Run: node check.mjs
import assert from 'node:assert/strict';
import { planck, rayleighJeans, wien, peak, SIGMA } from './sims/blackbody.js';
import { H_EV, C, photonEnergy, kmax, stoppingVoltage, thresholdFreq, thresholdWavelength, METALS } from './sims/photoelectric.js';

const T = 5800;
// Numeric argmax of Planck matches Wien's displacement law.
let best = 0, arg = 0;
for (let nm = 100; nm <= 3000; nm += 0.1) { const v = planck(nm * 1e-9, T); if (v > best) { best = v; arg = nm * 1e-9; } }
assert.ok(Math.abs(arg / peak(T) - 1) < 1e-3, `peak ${arg} vs ${peak(T)}`);
// Classical limit (long λ) and Wien limit (short λ).
assert.ok(Math.abs(rayleighJeans(1e-3, T) / planck(1e-3, T) - 1) < 2e-3);
assert.ok(Math.abs(wien(300e-9, 3000) / planck(300e-9, 3000) - 1) < 1e-6);
// Rubens–Kurlbaum regime: Planck grows nearly linearly; Wien nearly saturates.
const longWaveRatio = planck(50e-6, 2000) / planck(50e-6, 1000);
assert.ok(longWaveRatio > 2.1 && longWaveRatio < 2.2);
assert.ok(wien(50e-6, 2000) / wien(50e-6, 1000) < 1.2);
// Stefan–Boltzmann: π∫B_λ dλ = σT⁴.
let sum = 0; const dl = 1e-9;
for (let l = dl; l < 1e-3; l += dl) sum += planck(l, T) * dl;
assert.ok(Math.abs(Math.PI * sum / (SIGMA * T ** 4) - 1) < 1e-3);
// Zinc under the 253.7 nm mercury line.
const mercury = C / 253.7e-9;
assert.ok(Math.abs(photonEnergy(mercury) - 4.887) < 0.005);
assert.ok(Math.abs(kmax(mercury, 4.33) - 0.557) < 0.005);
for (const { phi } of METALS) {
  const threshold = thresholdFreq(phi), nu1 = threshold * 1.2, nu2 = threshold * 1.8;
  assert.ok(Math.abs(kmax(threshold, phi)) < 1e-12);
  assert.equal(kmax(threshold * (1 - 1e-9), phi), 0);
  const slope = (kmax(nu2, phi) - kmax(nu1, phi)) / (nu2 - nu1);
  assert.ok(Math.abs(slope / H_EV - 1) < 1e-12);
  for (const nu of [threshold * 0.9, threshold, nu1, nu2]) assert.equal(stoppingVoltage(nu, phi), kmax(nu, phi));
}
const csThreshold = thresholdWavelength(METALS.find(m => m.id === 'Cs').phi);
assert.ok(csThreshold > 380e-9 && csThreshold < 750e-9);
assert.ok(Math.abs(csThreshold * 1e9 - 579) < 1);
assert.ok(thresholdWavelength(METALS.find(m => m.id === 'Pt').phi) < 250e-9);
console.log('ok');
