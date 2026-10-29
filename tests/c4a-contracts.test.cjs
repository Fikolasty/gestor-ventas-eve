'use strict';
// C.4a: protect existing Settings, Guide and single-file build contracts.
// These tests inspect source, without ESI, credentials or production writes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const bundle = require('./source-bundle.cjs');

const requiredIds = [
  'settings', 'help', 'stReset', 'stOpenAll', 'stCloseAll',
  'themeLight', 'langSel', 'nullMarketMode', 'marketPicker',
  'marketTrigger', 'marketOptions', 'cTax', 'cBroker',
  'cBrokerNull', 'cScc', 'rTax', 'rSkill', 'bbOn', 'bbTax',
  'paste', 'pRepro', 'pCtr'
];

test('C.4a: original control IDs are present exactly once in the HTML source', () => {
  const shell = read('src', 'shell.html');
  const ids = [...shell.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
  const occurrences = new Map();
  ids.forEach(id => occurrences.set(id, (occurrences.get(id) || 0) + 1));
  assert.equal(ids.length, occurrences.size, 'Duplicate DOM IDs would break settings and lookups');
  requiredIds.forEach(id => assert.equal(occurrences.get(id), 1, 'Missing original control #' + id));
});

test('C.4a: Settings persistence keeps its key and original form controls', () => {
  const source = read('src', 'js', 'app', 'settings-persistence.js');
  assert.match(source, /const ST_KEY='gestorVentas\.ajustes\.v1'/);
  assert.match(source, /#settings input,#settings select,#settings textarea/);
  assert.match(source, /function stSaveNow\(\)/);
  assert.match(source, /function stRestore\(\)/);
  assert.match(source, /localStorage\.removeItem\(ST_KEY\)/);
});

test('C.4a: Settings, Guide, translator and persistence keep the supported bundle order', () => {
  const config = read('src', 'build_sources.py');
  const markers = [
    '/*__MODULE_MATERIAL_ECONOMICS__*/',
    '/*__MODULE_PLANNING__*/',
    '/*__MODULE_SETTINGS_UI__*/',
    '/*__MODULE_TRANSLATOR__*/',
    '/*__MODULE_SETTINGS_PERSISTENCE__*/',
    '/*__MODULE_EVE_SSO__*/'
  ];
  const positions = markers.map(marker => {
    const position = config.indexOf(marker);
    assert.notEqual(position, -1, 'Missing assembly marker ' + marker);
    assert.equal(config.indexOf(marker, position + 1), -1, 'Duplicated marker ' + marker);
    return position;
  });
  positions.slice(1).forEach((position, i) =>
    assert.ok(position > positions[i], 'Bundling order changed for ' + markers[i + 1]));

  const assembled = bundle.script();
  assert.match(assembled, /const S=\{/);
  assert.match(assembled, /function computePlan\(\)/);
  assert.match(assembled, /function selectAppModule\(name\)/);
  assert.match(assembled, /function stRestore\(\)/);
  assert.match(assembled, /function setLang\(l\)/);
  assert.doesNotMatch(assembled, /\/\*__MODULE_[A-Z_]+__\*\//);
  assert.match(read('build.py'), /UI_MESSAGES = json\.loads/);
});

test('C.4a: all single-file injection points remain unambiguous', () => {
  const assembled = bundle.script();
  const shell = read('src', 'shell.html');
  const count = (source, marker) => source.split(marker).length - 1;
  [
    '/*__REFINE__*/', '/*__MINING__*/', '/*__SKILLS__*/',
    '/*__I18N__*/{}', '/*__UI_CATALOG__*/{}'
  ].forEach(marker => assert.equal(count(assembled, marker), 1, marker));
  ['/*__STYLE_SOURCES__*/', '/*__SCRIPT__*/'].forEach(marker =>
    assert.equal(count(shell, marker), 1, marker));
});
