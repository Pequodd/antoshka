#!/usr/bin/env python3
"""Russian typography for the site's texts: non-breaking spaces so a line never ends on a preposition,
conjunction or particle, never starts with a dash, and numbers stay with their units.
Only Cyrillic words and digits are touched, so HTML markup and JS code around the texts stay as they are.
Idempotent. Usage: python3 tools/typograf.py FILE..."""
import re, sys

NB = ' '
W = 'А-Яа-яЁё'
# short words that should not hang at a line end: prepositions, conjunctions, particles
SHORT = ('в во к ко с со о об обо у и а но да на по за из от до не ни для без при про над под '
         'что как или ли же бы то их мы вы он она оно они я ее её его все всё уже еще ещё это эти '
         'чем где там тут так при через перед между после около').split()
SHORT_RE = re.compile(r'(?<![%s\w-])(%s)[ \t]+(?=[^\s<])' % (W, '|'.join(sorted(set(SHORT), key=len, reverse=True))), re.I)
DASH_RE = re.compile(r'[ \t]+([—–])(?=[ \t\n])')                         # dash keeps to the word before it
PART_RE = re.compile(r'(?<=[%s])[ \t]+(ли|же|бы|ль)(?![%s\w])' % (W, W))  # particles keep to the word before
NUM_RE = re.compile(r'(\d)[ \t]+(?=[%s₽°])' % W)                          # 25 м², 900 ₽, 8 лет, 3 года
# thousands only when the number is followed by a unit or a word, so SVG coordinates and code numbers stay untouched
THOU_RE = re.compile(r'(?<![\d.,])(\d{1,3})[ \t](\d{3})(?=(?:[ \t\u00a0]\d{3})*[ \t\u00a0]?(?:₽|[%s]))' % W)
PHONE_RE = re.compile(r'(\+7|8)[ \t](\d{3})[ \t](\d{3})-(\d{2})-(\d{2})')
NUMPRE_RE = re.compile(r'(?<![%s\w])(№|до|от|на|по|за|в|с)%s?[ \t]+(?=\d)' % (W, NB), re.I)  # «до 25», «№ 3»

def typograf(s):
    s = DASH_RE.sub(NB + r'\1', s)
    s = PART_RE.sub(NB + r'\1', s)
    for _ in range(2): s = SHORT_RE.sub(lambda m: m.group(1) + NB, s)   # twice: «и в нём»
    for _ in range(3): s = THOU_RE.sub(r'\1' + NB + r'\2', s)
    s = NUM_RE.sub(r'\1' + NB, s)
    s = PHONE_RE.sub(lambda m: f'{m[1]}{NB}{m[2]}{NB}{m[3]}-{m[4]}-{m[5]}', s)
    s = NUMPRE_RE.sub(lambda m: m.group(1) + NB, s)
    return s

def run(path):
    src = open(path, encoding='utf-8').read(); out = typograf(src)
    if out != src: open(path, 'w', encoding='utf-8').write(out)
    return src.count(NB), out.count(NB)

if __name__ == '__main__':
    for p in sys.argv[1:]:
        a, b = run(p); print(f'{p}: {b - a} non-breaking spaces added')
