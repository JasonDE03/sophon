"""Apply the learning layer (tldr, predict, dfn, quiz, collapsible maths/sources) to an episode page.
Usage: python3 learnify.py <content.md> <EP-key> <page.html> <lang>"""
import html, re, sys

LABELS = {'vi': ('Trong 30 giây', 'Tự kiểm tra', '(có thể bỏ qua)', 'Toán vừa đủ', 'Nguồn', 'Hệ quả'),
          'en': ('In 30 seconds', 'Check yourself', '(optional)', 'Just enough maths', 'Sources', 'What came next')}


def parse(md, key):
    block = re.search(rf'^## {re.escape(key)}\b.*?$(.*?)(?=^## |\Z)', md, re.S | re.M).group(1)
    out = {'tldr': re.search(r'^TLDR: (.*)$', block, re.M).group(1).strip()}
    def ask(chunk):
        lines = [l.rstrip() for l in chunk.strip('\n').split('\n')]
        q = re.sub(r'^\s*(Q|PREDICT): ', '', lines[0]).strip()
        opts, ans, why = [], None, ''
        for l in lines[1:]:
            s = l.strip()
            if s.startswith('- '):
                t = s[2:]
                if '[ANSWER]' in t: ans = len(opts); t = t.replace('[ANSWER]', '').strip()
                opts.append(t)
            elif s.startswith('WHY: '): why = s[5:]
        assert ans is not None and why, chunk
        return q, opts, ans, why
    out['predict'] = ask(re.search(r'^PREDICT: .*?(?=^DFN:)', block, re.S | re.M).group(0))
    dfn = re.search(r'^DFN:\n(.*?)(?=^QUIZ:)', block, re.S | re.M).group(1)
    out['dfn'] = [tuple(x.strip() for x in l.strip()[2:].split(' | ', 1)) for l in dfn.strip().split('\n')]
    quiz = re.search(r'^QUIZ:\n(.*)', block, re.S | re.M).group(1)
    out['quiz'] = [ask(c) for c in re.split(r'(?=^ Q: )', quiz, flags=re.M) if c.strip()]
    return out


def ask_html(q, opts, ans, why, predict=False):
    cls = 'ask predict' if predict else 'ask'
    buttons = ''.join(f'<button type="button">{o}</button>' for o in opts)
    return (f'<div class="{cls}" data-answer="{ans}">\n<p class="ask-q">{q}</p>\n'
            f'<div class="ask-options">{buttons}</div>\n<p class="ask-why" hidden>{why}</p>\n</div>')


SKIP_TAGS = {'head', 'title', 'h1', 'h2', 'summary', 'a', 'script', 'style', 'button', 'dfn'}
SKIP_CLASSES = {'tldr', 'ask', 'lede', 'sources', 'year', 'quiz'}
VOID = {'br', 'img', 'meta', 'link', 'input', 'hr'}


def _add_one(doc, term, definition):
    tokens = re.split(r'(<[^>]+>)', doc)
    stack, out, done = [], [], False
    for tok in tokens:
        if tok.startswith('<'):
            m = re.match(r'<\s*(/)?\s*([a-zA-Z0-9]+)([^>]*)>', tok)
            if m and not tok.startswith('<!'):
                closing, tag, attrs = m.group(1), m.group(2).lower(), m.group(3)
                if closing:
                    while stack and stack.pop()[0] != tag: pass
                elif tag not in VOID and not attrs.rstrip().endswith('/'):
                    cls = set((re.search(r'class="([^"]*)"', attrs) or [None, ''])[1].split())
                    stack.append((tag, cls))
            out.append(tok); continue
        skipping = any(t in SKIP_TAGS or c & SKIP_CLASSES for t, c in stack) or not any(t == 'main' for t, _ in stack)
        if done or skipping or not tok.strip():
            out.append(tok); continue
        parts = re.split(r'(\$\$.*?\$\$|\$[^$]*\$)', tok, flags=re.S)
        variants = {term, term[:1].upper() + term[1:]}
        pat = re.compile(r'(?<![\w])(' + '|'.join(map(re.escape, variants)) + r')(?![\w])')
        for i in range(0, len(parts), 2):
            mm = pat.search(parts[i])
            if mm:
                d = html.escape(definition, quote=True)
                parts[i] = parts[i][:mm.start()] + f'<dfn tabindex="0" data-def="{d}">{mm.group(1)}</dfn>' + parts[i][mm.end():]
                done = True; break
        out.append(''.join(parts))
    assert done, f'term not found: {term}'
    return ''.join(out)


def add_dfns(doc, terms):
    for term, definition in terms:
        doc = _add_one(doc, term, definition)
    return doc


def strip_dfns(doc):
    pat = re.compile(r'<dfn tabindex="0" data-def="[^"<>]*">([^<]*)</dfn>')
    while True:
        new = pat.sub(r'\1', doc)
        if new == doc: return doc
        doc = new


def wrap_section(doc, heading, summary_html):
    """Turn <h2>heading</h2> ... (until next <h2> / <section> / </main>) into <details class="deep">."""
    m = re.search(rf'<h2>{re.escape(heading)}</h2>\n(.*?)(?=\n<h2>|\n<section|\n</main>)', doc, re.S)
    assert m, heading
    return doc[:m.start()] + f'<details class="deep"><summary>{summary_html}</summary>\n{m.group(1).rstrip()}\n</details>' + doc[m.end():]


def main(md_path, key, page, lang):
    c = parse(open(md_path).read(), key)
    L = LABELS[lang]
    doc = open(page).read()
    assert 'class="tldr"' not in doc, 'already applied'
    doc = re.sub(r'(<p class="lede">.*?</p>)', lambda m: m.group(1) + f'\n<aside class="tldr"><p class="tldr-label">{L[0]}</p><p>{c["tldr"]}</p></aside>', doc, count=1, flags=re.S)
    doc = doc.replace('<div class="sim" id="sim"></div>', ask_html(*c['predict'], predict=True) + '\n<div class="sim" id="sim"></div>', 1)
    quiz = f'<section class="quiz">\n<h2>{L[1]}</h2>\n' + '\n'.join(ask_html(*q) for q in c['quiz']) + '\n</section>\n\n'
    assert doc.count(f'<h2>{L[5]}</h2>') == 1
    doc = doc.replace(f'<h2>{L[5]}</h2>', quiz + f'<h2>{L[5]}</h2>', 1)
    doc = wrap_section(doc, L[3], f'{L[3]} <span class="skip">{L[2]}</span>')
    doc = wrap_section(doc, L[4], L[4])
    if 'learn.js' not in doc:
        doc = doc.replace('</head>', '<script type="module" src="../learn.js"></script>\n</head>', 1)
    doc = add_dfns(doc, c['dfn'])
    open(page, 'w').write(doc)
    print('ok', page)


if __name__ == '__main__':
    if sys.argv[1] == '--redfn':
        md, key, page = sys.argv[2:5]
        d = strip_dfns(open(page).read()); d = add_dfns(d, parse(open(md).read(), key)['dfn']); open(page, 'w').write(d); print('redfn ok', page)
    else:
        main(*sys.argv[1:])
