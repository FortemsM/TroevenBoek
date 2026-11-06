// Exercise domain rules independently from React Native and the display layer.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const compiled = ts.transpileModule(fs.readFileSync('src/game.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const domain = { exports: {} };
new Function('exports', 'require', 'module', compiled)(domain.exports, require, domain);
const { cardsForRound, exactBidPoints, validatePoints, totals, isSession } = domain.exports;
const session = () => ({ id: 'table', name: 'Vrijdag', game: 'kleurenwiezen', players: ['A', 'B', 'C', 'D'], rounds: [], created: '2026-11-07T00:00:00Z', finished: false, maxCards: 7 });
test('dealing decreases to one and increases without repeating endpoints', () => {
  assert.deepEqual(Array.from({ length: 13 }, (_, i) => cardsForRound(i, 4)), [4,3,2,1,2,3,4,3,2,1,2,3,4]);
  assert.deepEqual(Array.from({ length: 5 }, (_, i) => cardsForRound(i, 2)), [2,1,2,1,2]);
});
test('an exact prediction gives zero strikes, a mismatch gives one', () => {
  assert.deepEqual(exactBidPoints([2,1,0,2], [2,0,1,2], 5), [0,1,1,0]);
  assert.throws(() => exactBidPoints([0,0], [1,1], 3));
  assert.throws(() => exactBidPoints([4,0], [3,0], 3));
  assert.throws(() => exactBidPoints([1.5,0], [3,0], 3));
});
test('manual points reject non-integers and non-zero-sum Wiezen', () => {
  assert.equal(validatePoints('kleurenwiezen', [9,-3,-3,-3]), null);
  assert.ok(validatePoints('kleurenwiezen', [9,0,0,0]));
  assert.ok(validatePoints('kingen', [NaN,0,0,0]));
  assert.ok(validatePoints('kingen', [1.2,0,0,0]));
  assert.equal(validatePoints('kingen', [-10,-20,30,5]), null);
});
test('corrected round totals replace rather than accumulate old points', () => {
  const s = session();
  s.rounds = [{ id: '1', game: s.game, contract: 'Alleen', points: [9,-3,-3,-3] }, { id: '2', game: s.game, contract: 'Alleen', points: [-3,9,-3,-3] }];
  assert.deepEqual(totals(s), [6,6,-6,-6]);
  s.rounds[0].points = [-9,3,3,3];
  assert.deepEqual(totals(s), [-12,12,0,0]);
  assert.ok(isSession(JSON.parse(JSON.stringify(s))));
});
test('damaged saved data is rejected without throwing', () => {
  for (const bad of [null, {}, { ...session(), rounds: [null] }, { ...session(), players: ['A','a','B','C'] }, { ...session(), maxCards: 50 }, { ...session(), created: 'bad' }]) assert.equal(isSession(bad), false);
  assert.ok(isSession(session()));
});
test('stored Poepen round must match bids, trick count and strikes', () => {
  const s = { ...session(), game: 'poepen', maxCards: 4, rounds: [{ id: '1', game: 'poepen', contract: 'Exact voorspellen', bids: [1,1,1,1], tricks: [2,1,1,0], points: [1,0,0,1] }] };
  assert.ok(isSession(s));
  s.rounds[0].points = [0,0,0,0];
  assert.equal(isSession(s), false);
});
