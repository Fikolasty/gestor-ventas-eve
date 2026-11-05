"""Container cascade audit: full composition plus responsive boundary states.

Run: python tests/audit_containers197.py BEFORE.html AFTER.html OUTPUT_DIR
Synthetic data only; the shared runner blocks external requests.
"""
from pathlib import Path
import json
import sys
import audit_headings196 as audit


def run(before, after, output):
 original_snapshot = audit.SNAPSHOT
 try:
  audit.SNAPSHOT = original_snapshot.replace(
   "'height','min-height'",
   "'width','min-width','grid-auto-rows','flex-direction','height','min-height'")
  audit.run(before, after, output/'composition')
  audit.run(before, after, output/'boundaries',
   widths=(981,861,860,761,760), states=('complete',))
 finally:
  audit.SNAPSHOT = original_snapshot
 reports=[json.loads((output/name/'report.json').read_text(encoding='utf-8'))
          for name in ('composition','boundaries')]
 summary=dict(states=sum(r['states'] for r in reports),
              screenshotPairs=sum(r['screenshotPairs'] for r in reports),
              reports=reports)
 (output/'report.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
 print(f"PASS {summary['states']} states, {summary['screenshotPairs']} identical screenshot pairs")


if __name__=='__main__':run(*(Path(p) for p in sys.argv[1:]))
