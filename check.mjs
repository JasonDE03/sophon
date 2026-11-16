// Physics sanity checks for the sims. Run: node check.mjs
import assert from 'node:assert/strict';
import { planck, rayleighJeans, wien, peak, SIGMA } from './sims/blackbody.js';
import { H_EV, C, photonEnergy, kmax, stoppingVoltage, thresholdFreq, thresholdWavelength, METALS } from './sims/photoelectric.js';

import { closestApproach, deflection, impactParameter, minDistance, dsigma, fractionBeyond, thomsonMaxDeflection, trajectory, METALS as RUTHERFORD_METALS } from './sims/rutherford.js';

import { energyLevel, transitionEnergy, wavelength, orbitRadius, A0_NM, balmerFormula, classicalCollapseTime, MEASURED_BALMER, seriesOf } from './sims/bohr.js';

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
// Rutherford: analytic limits and independently integrated Coulomb orbits.
assert.ok(Math.abs(closestApproach(7.7, 79) - 29.55) < .05);
for (const degrees of [10, 45, 90, 170]) {
  const theta = degrees * Math.PI / 180;
  assert.ok(Math.abs(deflection(impactParameter(theta, 7.7, 79), 7.7, 79) - theta) < 1e-12);
}
assert.ok(Math.abs(deflection(1e-6, 7.7, 79) - Math.PI) < 1e-3);
assert.ok(deflection(1e6, 7.7, 79) < 1e-4);
assert.equal(minDistance(0, 7.7, 79), closestApproach(7.7, 79));
assert.ok(Math.abs(dsigma(15 * Math.PI / 180, 7.7, 79) / dsigma(150 * Math.PI / 180, 7.7, 79) - 2999) < 1);
assert.ok(Math.abs(fractionBeyond(Math.PI / 2, 7.7, 79, 5.90e28, 1e-6) / 4.05e-5 - 1) < .02);
assert.ok(thomsonMaxDeflection(7.7, 79, 1.4e5) * 180 / Math.PI < .02);
assert.deepEqual(Object.values(RUTHERFORD_METALS).map(m => m.Z), [79, 78, 47, 13]);
for (const b of [20, 5]) {
  const orbit = trajectory(b, 7.7, 79);
  assert.ok(Math.abs(orbit.angle - deflection(b, 7.7, 79)) < .5 * Math.PI / 180, `orbit b=${b}: ${orbit.angle}`);
  assert.ok(orbit.points.every(p => p.every(Number.isFinite)));
}
// Bohr: reduced-mass hydrogen, vacuum wavelengths and the Ritz combination rule.
assert.ok(Math.abs(energyLevel(1) + 13.598) < .001);
assert.equal(energyLevel(Infinity), 0);
assert.ok(Math.abs(wavelength(3, 2) - 656.47) < .02);
assert.ok(Math.abs(wavelength(2, 1) - 121.57) < .02);
assert.ok(Math.abs(wavelength(Infinity, 2) - 364.71) < .05);
assert.ok(Math.abs((transitionEnergy(3, 2) + transitionEnergy(2, 1)) / transitionEnergy(3, 1) - 1) < 1e-12);
for (const { m, nm } of MEASURED_BALMER) assert.ok(Math.abs(nm / wavelength(m, 2) - 1) < .00005);
assert.ok(Math.abs(balmerFormula(3) - 656.21) < .01);
// Balmer used air wavelengths; Bohr here predicts vacuum wavelengths.
assert.ok(Math.abs(balmerFormula(3) / wavelength(3, 2) - 1) < .0005);
assert.equal(orbitRadius(2), 4 * A0_NM);
assert.ok(classicalCollapseTime() > 1.5e-11 && classicalCollapseTime() < 1.6e-11);
assert.deepEqual([1, 2, 3, 4].map(seriesOf), ['Lyman', 'Balmer', 'Paschen', 'Brackett']);
console.log('ok');
