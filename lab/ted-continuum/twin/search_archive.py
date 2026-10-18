"""Search the bundled public archive; no model or network dependency."""
import json, re, sys
from pathlib import Path

def search(query):
    records = json.loads((Path(__file__).parent.parent / 'data/archive.json').read_text(encoding='utf-8'))
    tokens = re.findall(r'[a-z0-9]+|[\u4e00-\u9fff]{2,}', query.lower())
    scored = []
    for record in records:
        if record['kind'] not in ('project', 'note'):
            continue
        title = ' '.join(str(record.get(k, '')) for k in ('title', 'subtitle', 'topic')).lower()
        body = json.dumps(record, ensure_ascii=False).lower()
        score = sum(4 * (t in title) + (t in body) for t in tokens)
        if score:
            scored.append((score, record))
    return [dict(id=r['id'], title=r['title'], summary=r.get('summary'), url=r.get('url'), evidence=r.get('source', r.get('evidence')))
            for _, r in sorted(scored, key=lambda x: x[0], reverse=True)[:3]]

if __name__ == '__main__':
    print(json.dumps(search(' '.join(sys.argv[1:])), ensure_ascii=False, indent=2))
