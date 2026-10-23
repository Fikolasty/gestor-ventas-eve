"""Regression checks for shared visual tokens, live guide and ES/EN labels."""
import json
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"

def read(*parts):
    return SRC.joinpath(*parts).read_text(encoding="utf-8")

class SharedUiTests(unittest.TestCase):
    def test_modules_and_guide_share_sales_headings(self):
        html = read("shell.html")
        for section in ("mining", "skills", "help"):
            start = html.index('id="' + section + '"')
            self.assertIn('mm-section-head mm-module-heading', html[start:start + 600], section)
        self.assertNotIn('Skill Plan</span>', html)
        self.assertIn('Planes de habilidades</span>', html)
        self.assertNotIn('No pide tu contraseña de EVE ni inicio de sesión', html)
        self.assertIn('ABRIR PASOS A SEGUIR', html)
        self.assertIn('Privacidad y acceso a EVE', html)

    def test_skills_visual_tokens_are_synced_from_main(self):
        parent = read('skills.js')
        child = read('skills_preview.html')
        builder = (ROOT / "build.py").read_text(encoding="utf-8")
        self.assertIn("const themeMessage=()=>", parent)
        self.assertIn("getComputedStyle(document.documentElement)", parent)
        self.assertIn("getComputedStyle(document.body)", parent)
        for token in ['txt', 'surface-card', 'surface-panel', 'r-md']:
            self.assertIn("'" + token + "'", parent)
        self.assertIn("mm-skills-theme", builder)
        self.assertIn("m.tokens", builder)
        self.assertIn("--mm-surface-panel", child)
        self.assertIn("font-family:var(--mm-font)", child)
        self.assertIn("html.mm-light", child)

    def test_mining_uses_main_surfaces_and_fonts(self):
        css = read('mining.css')
        self.assertIn("background:var(--surface-card)!important", css)
        self.assertIn("font-family:var(--f-ui)!important", css)
        self.assertNotIn('<header class="mn-module-intro">', read('mining.js'))

    def test_dynamic_labels_have_english_translations(self):
        strings = json.loads(read('i18n','en.json'))
        for key in ['Planes de habilidades','Primeros pasos','Rutas de venta',
                    'Glosario','Privacidad y acceso a EVE',
                    '¿Nuevo en EVE? Usa mi enlace y recibe',
                    '1 millón de Skill Points','gratis','Mercado principal',
                    'COMPARA NAVES, RENDIMIENTO Y PLANES OMEGA',
                    'DEL INVENTARIO A LA MEJOR RUTA DE VENTA']:
            self.assertTrue(strings.get(key), key)
        js = read('js','i18n','translator.js')
        self.assertIn('const m=String(s).match(/^(\\s*)([\\s\\S]*?)(\\s*)$/)', js)
        self.assertIn('const marker=/\\b',js)

if __name__ == '__main__':
    unittest.main()
