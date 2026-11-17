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
// Stern–Gerlach: SI deflection, random orientations and spin-1/2 filters.
const { MU_B, beamSpeedSq, deflection: sgDeflection, classicalMuZ, quantumMuZ, probUp, gradientProfile } = await import('./sims/sterngerlach.js');
assert.ok(Math.abs(sgDeflection(MU_B, 1000, .035, beamSpeedSq(1300)) / 7.9e-5 - 1) < .05);
const orientations = Array.from({ length: 1001 }, (_, i) => classicalMuZ(2 * i / 1000 - 1));
assert.ok(Math.abs(orientations.reduce((a, b) => a + b, 0) / orientations.length / MU_B) < 1e-12);
assert.equal(classicalMuZ(-1), -MU_B);
assert.equal(classicalMuZ(1), MU_B);
assert.equal(quantumMuZ(true), MU_B);
assert.equal(quantumMuZ(false), -MU_B);
for (const [angle, expected] of [[0, 1], [Math.PI / 2, .5], [Math.PI, 0]]) assert.ok(Math.abs(probUp(angle) - expected) < 1e-12);
// Start with a prepared z-up beam: half survive x-up, half of those exit z-down.
assert.ok(Math.abs(probUp(Math.PI / 2) * (1 - probUp(Math.PI / 2)) - .25) < 1e-12);
assert.equal(gradientProfile(0), 1);
assert.equal(gradientProfile(-1), 0);
assert.equal(gradientProfile(1), 0);
// De Broglie: Coulomb orbits, phase closure and measured matter-wave scales.
const { H, ME, A0, ALPHA_C, debroglie, orbitSpeed, turns, orbitEnergy, residual } = await import('./sims/debroglie.js');
const { RY_EV } = await import('./sims/bohr.js');
assert.ok(Math.abs(debroglie(ME, ALPHA_C) / (2 * Math.PI * A0) - 1) < 1e-6);
for (let n = 1; n <= 5; n++) {
  const r = n ** 2 * A0;
  assert.ok(Math.abs(turns(r) - n) < 1e-9);
  assert.ok(Math.abs(ME * orbitSpeed(r) * r / (n * H / (2 * Math.PI)) - 1) < 1e-9);
}
for (const multiple of [.64, 2.3, 6.25, 17.7, 30.25]) assert.ok(Math.abs(turns(multiple * A0) - Math.sqrt(multiple)) < 1e-9);
assert.ok(Math.abs(orbitEnergy(4 * A0) + RY_EV / 4) < 1e-12);
assert.equal(residual(3), 1);
assert.ok(residual(2.5) < 1e-9);
assert.ok(residual(2.9) > 0 && residual(2.9) < 1);
const davissonGermer = H / Math.sqrt(2 * ME * 1.602176634e-19 * 54);
assert.ok(Math.abs(davissonGermer / 1.67e-10 - 1) < .005);
assert.ok(Math.abs(debroglie(.145, 40) / 1.142e-34 - 1) < .01);
// Davisson–Germer: surface-row diffraction and incoherent two-slit limits.
{
  const { electronWavelengthNm, peakAngleDeg, scatterModel, twoSlit, sampleTwoSlit } = await import('./sims/davisson.js');
  assert.ok(Math.abs(electronWavelengthNm(54) / .1669 - 1) < .005);
  assert.ok(Math.abs(peakAngleDeg(54) - 50.9) < .2);
  assert.ok(Number.isNaN(peakAngleDeg(20)));
  assert.equal(twoSlit(0, 'both'), 1);
  assert.ok(twoSlit(.5, 'both') < 1e-12);
  assert.ok(twoSlit(.5, 'detector') > .1);
  const integrals = ['both', 'detector', 'one'].map(mode => {
    let sum = 0;
    for (let i = 0; i < 12000; i++) sum += twoSlit(-6 + (i + .5) * .001, mode) * .001;
    return sum;
  });
  assert.ok(Math.abs(integrals[0] / integrals[1] - 1) < .02);
  assert.ok(Math.abs(integrals[2] / integrals[1] - .5) < 1e-12);
  assert.ok(scatterModel(peakAngleDeg(54), 54) > 2 * scatterModel(peakAngleDeg(54), 54, false));
  let seed = 1927;
  const rng = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
  for (const mode of ['both', 'one', 'detector']) {
    for (let i = 0; i < 1000; i++) { const u = sampleTwoSlit(mode, rng); assert.ok(u >= -6 && u <= 6); }
  }
}
// Solvay: pure-state duality, screen limits and Gaussian recoil blur.
{
  const { visibility, screen, slitBlurFringes, recoilArgument } = await import('./sims/solvay.js');
  assert.equal(visibility(0), 1);
  assert.equal(visibility(1), 0);
  assert.ok(Math.abs(visibility(.6) - .8) < 1e-12);
  assert.equal(screen(0, 1), 1);
  assert.ok(screen(.5, 1) < 1e-12);
  const x = Math.PI * .5 * .25;
  assert.ok(Math.abs(screen(.5, 0) - .5 * (Math.sin(x) / x) ** 2) < 1e-12);
  assert.ok(screen(.5, 0) > .4);
  for (const D of [.2, .5, .9]) assert.ok(Math.abs(slitBlurFringes(recoilArgument(D)) - visibility(D)) < 1e-9);
  assert.equal(slitBlurFringes(recoilArgument(0)), 1);
  assert.equal(slitBlurFringes(recoilArgument(1)), 0);
}
// Heisenberg: numerical Fourier widths and the microscope's SI product.
{
  const { H_SI, HBAR_SI, packet, spreadX, spreadK, microscope } = await import('./sims/heisenberg.js');
  const widths = new Map();
  for (const sigma of [.3, 1, 2, 3]) {
    const x = Array.from({ length: 2401 }, (_, i) => (24 * i / 2400 - 12) / sigma);
    const { re, im } = packet(x, 10, sigma);
    const k = Array.from({ length: 201 }, (_, i) => 10 + sigma * (10 * i / 200 - 5));
    const w = k.map(value => Math.exp(-((value - 10) ** 2) / (2 * sigma ** 2)));
    const dx = spreadX(x, re, im), dk = spreadK(k, w);
    widths.set(sigma, dx);
    assert.ok(Math.abs(dx * dk / .5 - 1) < .01, `Gaussian uncertainty sigma=${sigma}`);
    assert.ok(Math.abs(dx * 1e-9 * dk * HBAR_SI * 1e9 / (HBAR_SI / 2) - 1) < .01);
  }
  assert.ok(Math.abs(widths.get(1) / widths.get(2) / 2 - 1) < .01);
  for (const lambda of [.001, .01, 1, 500, 1000]) {
    for (const degrees of [5, 30, 60]) {
      const a = microscope(lambda, degrees * Math.PI / 180);
      const b = microscope(lambda / 2, degrees * Math.PI / 180);
      assert.ok(Math.abs(a.product / H_SI - 1) < 1e-12);
      assert.ok(Math.abs(a.dx * 1e-9 * a.dp / H_SI - 1) < 1e-12);
      assert.ok(Math.abs(b.dx / a.dx - .5) < 1e-12);
      assert.ok(Math.abs(b.dp / a.dp - 2) < 1e-12);
    }
  }
}
// Schrodinger: finite-well eigenvalues, barrier limits and unitary time evolution.
{
  const { C, HBAR, numerov, wellPotential, boundStates, transmission, evolve } = await import('./sims/schrodinger.js');
  const levels = boundStates(4, 1);
  assert.equal(levels.length, 4);
  [0.2623, 1.0362, 2.2699, 3.7539].forEach((E, i) => assert.ok(Math.abs(levels[i] - E) < .002));
  // A 400 eV well is still 3.793% below infinity; 1600 eV reaches 2%.
  assert.ok(Math.abs(boundStates(1600, 1)[0] / (Math.PI ** 2 * C) - 1) < .02);
  const free = numerov(1, () => 0, 0, 1, 1000), k = Math.sqrt(1 / C);
  assert.ok(free.x instanceof Float64Array && free.psi instanceof Float64Array);
  assert.equal(free.psi[0], 0); assert.equal(free.psi[1], 1e-6);
  assert.ok(Math.abs(free.psi[1000] / (1e-6 * Math.sin(k) / Math.sin(k / 1000)) - 1) < 1e-9);
  assert.equal(wellPotential(4, 1)(0), 0); assert.equal(wellPotential(4, 1)(.5), 4);
  for (const E of [.2, 1, 3]) assert.ok(Math.abs(transmission(E, 0, .4) - 1) < 1e-12);
  assert.ok(Math.abs(transmission(1, 1.5, .4) - .1800) < .001);
  let previous = 1;
  for (let j = 2; j <= 10; j++) {
    const T = transmission(1, 1.5, j / 10); assert.ok(T < previous); previous = T;
  }
  assert.ok(Math.abs(transmission(1.5 - 1e-6, 1.5, .4) - transmission(1.5 + 1e-6, 1.5, .4)) < 1e-4);
  assert.ok(Math.abs(transmission(1.5, 1.5, .4) - 1 / (1 + 1.5 * .4 ** 2 / (4 * C))) < 1e-12);
  // Above-barrier interference has unit-transmission resonances.
  assert.ok(Math.abs(transmission(1.5 + C * (Math.PI / .4) ** 2, 1.5, .4) - 1) < 1e-12);
  const dx = .04, re = new Float64Array(2001), im = new Float64Array(2001), V = new Float64Array(2001);
  for (let i = 1; i < re.length - 1; i++) {
    const x = -40 + i * dx, a = Math.exp(-((x + 5) ** 2) / (4 * 2.5 ** 2)), phase = Math.sqrt(1 / C) * x;
    re[i] = a * Math.cos(phase); im[i] = a * Math.sin(phase); V[i] = x >= 0 && x <= .4 ? 1.5 : 0;
  }
  const norm = () => re.reduce((sum, value, i) => sum + (value * value + im[i] ** 2) * dx, 0);
  const normalization = Math.sqrt(norm());
  for (let i = 0; i < re.length; i++) { re[i] /= normalization; im[i] /= normalization; }
  evolve(re, im, V, dx, .04, 500);
  assert.ok(Math.abs(norm() - 1) < 1e-6);
  assert.equal(re[0], 0); assert.equal(im.at(-1), 0); assert.equal(HBAR, .6582119569);
}
console.log('ok');
