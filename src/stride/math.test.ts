import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBarZ,
  computeSection2Metrics,
  computeTravellerPose,
  easeSlide,
  evalArcPose,
  mixHex,
  modFlavour,
  type BarPose,
} from './math';
import {
  ABOUT_CONTENT,
  COMPANY_BRAND,
  FLAVOURS,
  HARDWARE_BITS,
  PRODUCTS_CATALOG,
  SOLUTIONS_LIST,
  buildWhatsAppUrl,
} from './data';

test('easeSlide starts fast and ends cleanly at 0..1', () => {
  assert.equal(easeSlide(0), 0);
  assert.equal(easeSlide(1), 1);
  assert.ok(easeSlide(0.2) >= 0.45, `Expected fast start at t=0.2, got ${easeSlide(0.2)}`);
  assert.ok(easeSlide(0.5) > easeSlide(0.2));
});

test('evalArcPose places centre slot and mirrors negative k', () => {
  const centre = evalArcPose(0, 720, 372, 1, 1, 0, true);
  assert.equal(centre.x, 720);
  assert.equal(centre.y, 372);
  assert.equal(centre.h, 470);
  assert.equal(centre.rz, 0);
  assert.equal(centre.ry, 0);
  assert.equal(centre.op, 1);

  const right1 = evalArcPose(1, 720, 372, 1, 1, 0, true);
  const left1 = evalArcPose(-1, 720, 372, 1, 1, 0, true);
  assert.equal(right1.x - 720, 350);
  assert.equal(720 - left1.x, 350);
  assert.equal(right1.rz, 4);
  assert.equal(left1.rz, -4);
  assert.equal(right1.ry, 13);
  assert.equal(left1.ry, -13);
  assert.equal(right1.z, -34);

  // Confine to 5 cards: slot 2 is visible and symmetrically spaced at dx=642
  const slot2 = evalArcPose(2, 720, 372, 1, 1, 0, true);
  assert.equal(slot2.x - 720, 642);
  assert.equal(slot2.op, 1);
  const slot3 = evalArcPose(3, 720, 372, 1, 1, 0, true);
  assert.equal(slot3.op, 0);

  const farOut = evalArcPose(3.9, 720, 372, 1, 1, 0, true);
  assert.equal(farOut.op, 0);
});

test('computeBarZ creates smooth sculpted cutout relief profile', () => {
  const edgeZ = computeBarZ(0, 0.5);
  assert.ok(Math.abs(edgeZ - 0.008) < 1e-6);

  const cornerZ = computeBarZ(0, 0);
  assert.ok(Math.abs(cornerZ - 0.008) < 1e-6);

  const centreZ = computeBarZ(0.5, 0.5);
  assert.ok(Math.abs(centreZ - 0.046) < 1e-6);
});

test('computeSection2Metrics tracks single-scroll transition and pinY cleanly', () => {
  const entering = computeSection2Metrics(450, 900, 900);
  assert.ok(Math.abs(entering.p - 0.5) < 1e-6);
  assert.equal(entering.step, 0);
  assert.equal(entering.q, 0);
  assert.equal(entering.pinY, 450);

  const aligned = computeSection2Metrics(0, 900, 900);
  assert.equal(aligned.p, 1);
  assert.equal(aligned.q, 0);
  assert.equal(aligned.pinY, 0);

  const leaving = computeSection2Metrics(-300, 900, 900);
  assert.equal(leaving.p, 1);
  assert.equal(leaving.q, 0);
  assert.equal(leaving.pinY, -300);
});

test('computeTravellerPose interpolates A -> B -> C', () => {
  const poseA: BarPose = { x: 100, y: 200, h: 400, rz: 0, ry: 0, rx: 0, z: 0, op: 1, sx: 1, sy: 1, shadow: 1 };
  const poseB: BarPose = { x: 500, y: 400, h: 600, rz: 14, ry: 180, rx: 0, z: 0, op: 1, sx: 1, sy: 1, shadow: 1 };
  const poseC: BarPose = { x: 700, y: 500, h: 250, rz: 0, ry: 360, rx: 0, z: 30, op: 1, sx: 1, sy: 1, shadow: 0.7 };

  assert.deepEqual(computeTravellerPose(poseA, poseB, poseC, 0, 0), poseA);
  assert.deepEqual(computeTravellerPose(poseA, poseB, poseC, 1, 0), poseB);
  assert.deepEqual(computeTravellerPose(poseA, poseB, poseC, 1, 1), poseC);
});

test('JB IT catalog, WhatsApp inquiry links, Solutions, and About data are valid', () => {
  assert.equal(COMPANY_BRAND.name, 'JB IT');
  assert.equal(FLAVOURS.length, 5);
  assert.equal(HARDWARE_BITS.length, 5);
  for (const div of FLAVOURS) {
    assert.equal(div.specs.length, 7);
    assert.ok(div.imageUrl.startsWith('/src/assets/images/'));
    assert.ok(div.ingredients.length > 10);
    assert.ok(div.offerings.groups.length >= 4);
    assert.ok(div.offerings.brands.length >= 5);
    assert.ok(div.offerings.categoryTitle.length > 5);
  }
  assert.ok(PRODUCTS_CATALOG.length >= 5);
  for (const prod of PRODUCTS_CATALOG) {
    assert.ok(prod.name.length > 4);
    assert.ok(
      prod.imageUrl.startsWith('/src/assets/products/') ||
      prod.imageUrl.startsWith('/src/assets/images/')
    );
    const waUrl = buildWhatsAppUrl(prod.name);
    assert.ok(waUrl.startsWith(`https://wa.me/${COMPANY_BRAND.whatsappPhone}?text=`));
  }
  assert.equal(SOLUTIONS_LIST.length, 3);
  assert.ok(ABOUT_CONTENT.transitionPhrases.length >= 3);
  assert.equal(modFlavour(-1, 5), 4);
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
});
