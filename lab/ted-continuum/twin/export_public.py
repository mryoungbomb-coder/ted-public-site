"""Explicit public export gate. Never reads the private database automatically."""
import datetime, json, sys
from pathlib import Path

def approved(record):
    try:
        datetime.date.fromisoformat(record['as_of'])
    except (KeyError, TypeError, ValueError):
        return False
    return (record.get('visibility') == 'public' and record.get('owner_approved') is True
            and bool(record.get('id')) and bool(record.get('statement'))
            and isinstance(record.get('source_ids'), list) and bool(record['source_ids'])
            and all(isinstance(s, str) and s.strip() for s in record['source_ids'])
            and record.get('evidence_status') in ('self-reported', 'source-supported'))

if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: python export_public.py candidate.jsonl NEW-output.jsonl')
    source, output = map(Path, sys.argv[1:])
    records = [json.loads(line) for line in source.read_text(encoding='utf-8').splitlines() if line.strip()]
    selected = [r for r in records if approved(r)]
    with output.open('x', encoding='utf-8') as handle:
        for record in selected:
            handle.write(json.dumps(record, ensure_ascii=False) + '\n')
    print(f'Exported {len(selected)} / {len(records)} records; source preserved.')
