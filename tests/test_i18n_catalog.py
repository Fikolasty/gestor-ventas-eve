"""Translation contract: every new visible string has ES/EN and matching variables."""
import json
import pathlib
import re
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
SRC=ROOT/'src'
class TranslationContract(unittest.TestCase):
    def test_catalog_has_both_languages_and_interpolation_matches(self):
        d=json.loads((SRC/'i18n/ui.json').read_text(encoding='utf-8'))
        self.assertGreaterEqual(len(d),70)
        for key,entry in d.items():
            with self.subTest(key=key):
                self.assertEqual(set(entry),{'es','en'})
                self.assertTrue(all(isinstance(v,str) and v.strip() for v in entry.values()))
                slots=lambda x:set(re.findall(r'\{([a-zA-Z][a-zA-Z0-9_]*)\}',x))
                self.assertEqual(slots(entry['es']),slots(entry['en']))
    def test_all_static_message_references_exist(self):
        catalog=json.loads((SRC/'i18n/ui.json').read_text(encoding='utf-8'))
        # All JS source modules, not just the three initial renderers. This
        # blocks new tx(key) typos in login, shipping, settings and mining.
        paths=sorted(SRC.rglob('*.js'))
        keys=set()
        for path in paths:
            data=path.read_text(encoding='utf-8')
            keys.update(re.findall(r"tx\(['\"]([a-z][a-zA-Z0-9_.]*)['\"]",data))
        self.assertFalse(keys-set(catalog),'Untranslated UI messages: '+repr(keys-set(catalog)))
        self.assertIn('picker.estimatedProfit',keys)
        self.assertIn('picker.feesPartial',keys)
        self.assertIn('verdict.freight',keys)
        self.assertIn('decision.marketCharges',keys)
    def test_build_consumes_exactly_one_catalog(self):
        script=(SRC/'js/ui/format.js').read_text(encoding='utf-8')
        builder=(ROOT/'build.py').read_text(encoding='utf-8')
        self.assertEqual(script.count('/*__UI_CATALOG__*/{}'),1)
        self.assertIn("rd('i18n', 'ui.json')",builder)
        self.assertIn("js.replace('/*__UI_CATALOG__*/{}'",builder)

if __name__=='__main__':
    unittest.main()
