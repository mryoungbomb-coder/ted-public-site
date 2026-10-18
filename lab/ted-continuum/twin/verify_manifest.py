"""Verify included local files, not remote media or long-term availability."""
import hashlib, json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
failures = []
for name, expected in manifest['sha256'].items():
    path = (root / name).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        failures.append(name)
    elif hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        failures.append(name)
if failures:
    raise SystemExit('Verification failed: ' + ', '.join(failures))
print(f"Verified {len(manifest['sha256'])} local files. Remote media are references, not backups.")
