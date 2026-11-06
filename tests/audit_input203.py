"""Differential inventory-input CSS audit; synthetic data, network blocked.

Run: python tests/audit_input203.py BEFORE.html AFTER.html OUTPUT_DIR
Reuses the complete composition/boundary comparator, including focus and PNGs.
"""
from pathlib import Path
import sys
import audit_headings196 as headings
import audit_containers197 as containers


def run(before, after, output):
    original = headings.SNAPSHOT
    try:
        headings.SNAPSHOT = original.replace(
            "'height','min-height'", "'resize','max-height','height','min-height'")
        # Fail if a future template reintroduces the retired footer controls.
        headings.SNAPSHOT = headings.SNAPSHOT.replace(
            "const nodes=", "if(document.querySelector('.paste-foot,#bClear'))"
            "throw new Error('Retired inventory footer reintroduced');const nodes=")
        containers.run(before, after, output)
    finally:
        headings.SNAPSHOT = original


if __name__ == '__main__':
    run(*(Path(p) for p in sys.argv[1:]))
