/**
 * Wylie (EWTS) to Tibetan Unicode, for the practice page and the cheat sheet.
 *
 * Ported from the Tibetan course site (src/lib/ewts.ts in
 * tibetan-course-with-wulstan) and to be kept in sync with it: change one,
 * change the other, tests included (tests/ewts.test.mjs).
 *
 * Written here rather than taken from npm. The obvious package, BUDA's jsewts,
 * converts more than this does — but the practice exists to rehearse one
 * keyboard, bkntr/tibetan-keyboard, the one the Windows video installs, and
 * that keyboard's REFERENCE.md is exhaustive at the token level. So this
 * implements that document and nothing else: its consonant, vowel, mark and
 * punctuation tables, its list of the stacks that form without `+`, and its
 * two operators. Where the keyboard and the standard differ, the keyboard
 * wins: `x` is a word space, and `//` is two shads rather than a nyis shad.
 *
 * Left out, because a learner never needs them and a wrong guess at them
 * would be worse than their absence: `[literal]` text, `\u` escapes, and the
 * hyphenated spellings of the retroflex letters (`-t` for `T`).
 *
 * Framework-free plain ESM: the practice page imports it in the browser
 * (<script type="module">), and Eleventy imports it at build time to draw the
 * cheat sheet — which is what keeps the sheet and the practice from ever
 * disagreeing.
 */

const cp = (...points) => String.fromCodePoint(...points);

/*
 * Each consonant's letter at the top of a stack and its subjoined form below
 * one, from the keyboard's table. Most subjoined forms sit 0x50 above the
 * letter; the exceptions are written out.
 */
const CONSONANTS = {
  k: { base: cp(0x0f40), sub: cp(0x0f90) },
  kh: { base: cp(0x0f41), sub: cp(0x0f91) },
  g: { base: cp(0x0f42), sub: cp(0x0f92) },
  gh: { base: cp(0x0f42, 0x0fb7), sub: cp(0x0f92, 0x0fb7) },
  ng: { base: cp(0x0f44), sub: cp(0x0f94) },
  c: { base: cp(0x0f45), sub: cp(0x0f95) },
  ch: { base: cp(0x0f46), sub: cp(0x0f96) },
  j: { base: cp(0x0f47), sub: cp(0x0f97) },
  ny: { base: cp(0x0f49), sub: cp(0x0f99) },
  T: { base: cp(0x0f4a), sub: cp(0x0f9a) },
  Th: { base: cp(0x0f4b), sub: cp(0x0f9b) },
  D: { base: cp(0x0f4c), sub: cp(0x0f9c) },
  Dh: { base: cp(0x0f4c, 0x0fb7), sub: cp(0x0f9c, 0x0fb7) },
  N: { base: cp(0x0f4e), sub: cp(0x0f9e) },
  t: { base: cp(0x0f4f), sub: cp(0x0f9f) },
  th: { base: cp(0x0f50), sub: cp(0x0fa0) },
  d: { base: cp(0x0f51), sub: cp(0x0fa1) },
  dh: { base: cp(0x0f51, 0x0fb7), sub: cp(0x0fa1, 0x0fb7) },
  n: { base: cp(0x0f53), sub: cp(0x0fa3) },
  p: { base: cp(0x0f54), sub: cp(0x0fa4) },
  ph: { base: cp(0x0f55), sub: cp(0x0fa5) },
  b: { base: cp(0x0f56), sub: cp(0x0fa6) },
  bh: { base: cp(0x0f56, 0x0fb7), sub: cp(0x0fa6, 0x0fb7) },
  m: { base: cp(0x0f58), sub: cp(0x0fa8) },
  ts: { base: cp(0x0f59), sub: cp(0x0fa9) },
  tsh: { base: cp(0x0f5a), sub: cp(0x0faa) },
  dz: { base: cp(0x0f5b), sub: cp(0x0fab) },
  dzh: { base: cp(0x0f5b, 0x0fb7), sub: cp(0x0fab, 0x0fb7) },
  w: { base: cp(0x0f5d), sub: cp(0x0fad) },
  zh: { base: cp(0x0f5e), sub: cp(0x0fae) },
  z: { base: cp(0x0f5f), sub: cp(0x0faf) },
  "'": { base: cp(0x0f60), sub: cp(0x0fb0) },
  y: { base: cp(0x0f61), sub: cp(0x0fb1) },
  r: { base: cp(0x0f62), sub: cp(0x0fb2) },
  l: { base: cp(0x0f63), sub: cp(0x0fb3) },
  sh: { base: cp(0x0f64), sub: cp(0x0fb4) },
  Sh: { base: cp(0x0f65), sub: cp(0x0fb5) },
  s: { base: cp(0x0f66), sub: cp(0x0fb6) },
  h: { base: cp(0x0f67), sub: cp(0x0fb7) },
  W: { base: cp(0x0f5d), sub: cp(0x0fba) },
  Y: { base: cp(0x0f61), sub: cp(0x0fbb) },
  R: { base: cp(0x0f6a), sub: cp(0x0fbc) },
  f: { base: cp(0x0f55, 0x0f39), sub: cp(0x0fa5, 0x0f39) },
  v: { base: cp(0x0f56, 0x0f39), sub: cp(0x0fa6, 0x0f39) },
};

/* The vowel signs. `a` is the inherent vowel and writes nothing after a
 * consonant; at the head of a syllable every vowel sits on a-chen. */
const VOWELS = {
  a: '',
  A: cp(0x0f71),
  aa: cp(0x0f71),
  i: cp(0x0f72),
  I: cp(0x0f71, 0x0f72),
  ii: cp(0x0f71, 0x0f72),
  u: cp(0x0f74),
  U: cp(0x0f71, 0x0f74),
  uu: cp(0x0f71, 0x0f74),
  e: cp(0x0f7a),
  ai: cp(0x0f7b),
  o: cp(0x0f7c),
  au: cp(0x0f7d),
  '-i': cp(0x0f80),
  '-I': cp(0x0f71, 0x0f80),
};

const A_CHEN = cp(0x0f68);

/* Marks that follow the vowel on the same stack. */
const MARKS = {
  M: cp(0x0f7e),
  '~M`': cp(0x0f82),
  '~M': cp(0x0f83),
  H: cp(0x0f7f),
  X: cp(0x0f37),
  '~X': cp(0x0f35),
  '?': cp(0x0f84),
  '^': cp(0x0f39),
};

/* Everything that ends a syllable, and what it writes. */
const SEPARATORS = {
  ' ': cp(0x0f0b),
  _: ' ',
  x: ' ',
  '/': cp(0x0f0d),
  ';': cp(0x0f0f),
  '|': cp(0x0f11),
  '!': cp(0x0f08),
  ':': cp(0x0f14),
  '*': cp(0x0f0c),
  '=': cp(0x0f34),
  '<': cp(0x0f3a),
  '>': cp(0x0f3b),
  '(': cp(0x0f3c),
  ')': cp(0x0f3d),
  '@': cp(0x0f04),
  '#': cp(0x0f05),
  $: cp(0x0f06),
  '%': cp(0x0f07),
  '&': cp(0x0f85),
  ...Object.fromEntries([...'0123456789'].map((digit) => [digit, cp(0x0f20 + Number(digit))])),
};

/* Longest first, so that `tsh` is read before `ts` and `ts` before `t`. */
const byLength = (names) => [...names].sort((a, b) => b.length - a.length);
const CONSONANT_NAMES = byLength(Object.keys(CONSONANTS));
const VOWEL_NAMES = byLength(Object.keys(VOWELS));
const MARK_NAMES = byLength(Object.keys(MARKS));

function tokenize(input) {
  /* A phone's keyboard turns ' into ’ unasked, and an a-chung is the commonest
   * letter to begin a syllable with — so both curly quotes count as one. */
  const text = input.replace(/[‘’]/g, "'");
  const tokens = [];
  let at = 0;

  const match = (names) => names.find((name) => text.startsWith(name, at));

  while (at < text.length) {
    /* Vowels before consonants, for `-i`; and `a` is a vowel, never a letter,
     * since a-chen is written by the syllable rather than typed. */
    const vowel = match(VOWEL_NAMES);
    if (vowel) {
      tokens.push({ kind: 'vowel', name: vowel });
      at += vowel.length;
      continue;
    }
    const consonant = match(CONSONANT_NAMES);
    if (consonant) {
      tokens.push({ kind: 'consonant', name: consonant });
      at += consonant.length;
      continue;
    }
    const mark = match(MARK_NAMES);
    if (mark) {
      tokens.push({ kind: 'mark', text: MARKS[mark] });
      at += mark.length;
      continue;
    }
    const char = text[at];
    if (char === '+') tokens.push({ kind: 'plus' });
    else if (char === '.') tokens.push({ kind: 'dot' });
    else if (char in SEPARATORS) tokens.push({ kind: 'separator', text: SEPARATORS[char] });
    else tokens.push({ kind: 'other', text: char });
    at += 1;
  }
  return tokens;
}

/*
 * The stacks that form without `+`, copied from the keyboard's "Standard
 * stacks" table, as runs of consonant names: "rgya" is r|g|y.
 */
const STANDARD_STACKS = new Set(
  [
    'rka rga rnga rja rnya rta rda rna rba rma rtsa rdza',
    'lka lga lnga lca lja lta lda lpa lba lha',
    'ska sga snga snya sta sda sna spa sba sma stsa',
    'kya khya gya pya phya bya mya',
    'kra khra gra tra thra dra nra pra phra bra mra dzra shra sra hra',
    'kla gla bla rla sla zla',
    'kwa khwa gwa cwa nywa twa dwa tswa tshwa zhwa zwa rwa lwa shwa swa hwa',
    'rkya rgya rmya rbwa rgwa rtswa',
    'skya sgya spya sbya smya',
    'skra sgra snra spra sbra smra',
    'grwa drwa phywa',
  ]
    .join(' ')
    .split(' ')
    .map((word) =>
      tokenize(word.slice(0, -1))
        .map((token) => (token.kind === 'consonant' ? token.name : '?'))
        .join('|'),
    ),
);

function stack(names) {
  return names.map((name, i) => (i === 0 ? CONSONANTS[name].base : CONSONANTS[name].sub)).join('');
}

/*
 * The consonants between two vowels (or before the first, or after the
 * last), written as letters and stacks.
 *
 * `+` decides wherever it appears: letters it joins are one stack, and the
 * rest stand alone. Otherwise, when the cluster carries a vowel, the longest
 * standard stack that ends it is the stack and anything before it is a
 * prefix — `bsgr` is b + sgr, `dky` is d + ky — and a `.` cuts the cluster
 * so that `g.y` can never be read as gy. A cluster after the vowel and
 * carrying none is suffixes, every one its own letter.
 */
function writeCluster(items, carriesVowel) {
  if (items.some((item) => item.kind === 'plus')) {
    const groups = [];
    let joinNext = false;
    for (const item of items) {
      if (item.kind === 'plus') joinNext = true;
      else if (item.kind === 'dot') joinNext = false;
      else {
        if (joinNext && groups.length > 0) groups[groups.length - 1].push(item.name);
        else groups.push([item.name]);
        joinNext = false;
      }
    }
    return groups.map(stack).join('');
  }

  const segments = [[]];
  for (const item of items) {
    if (item.kind === 'dot') segments.push([]);
    else if (item.kind === 'consonant') segments[segments.length - 1].push(item.name);
  }
  const last = segments.pop();
  const before = segments.flat().map((name) => CONSONANTS[name].base).join('');
  if (!carriesVowel) return before + last.map((name) => CONSONANTS[name].base).join('');

  for (let start = 0; start < last.length; start++) {
    const candidate = last.slice(start);
    if (candidate.length === 1 || STANDARD_STACKS.has(candidate.join('|'))) {
      return before + last.slice(0, start).map((name) => CONSONANTS[name].base).join('') + stack(candidate);
    }
  }
  return before;
}

function writeSyllable(tokens) {
  let out = '';
  let cluster = [];
  let sawVowel = false;

  for (const token of tokens) {
    if (token.kind === 'consonant' || token.kind === 'plus' || token.kind === 'dot') {
      cluster.push(token);
    } else if (token.kind === 'vowel') {
      const hasLetter = cluster.some((item) => item.kind === 'consonant');
      out += hasLetter ? writeCluster(cluster, true) : A_CHEN;
      out += VOWELS[token.name];
      cluster = [];
      sawVowel = true;
    } else if (token.kind === 'mark') {
      out += writeCluster(cluster, !sawVowel) + token.text;
      cluster = [];
    }
  }
  /* A syllable typed without any vowel still has one: `rgy` is rgya. */
  return out + writeCluster(cluster, !sawVowel);
}

/**
 * Tibetan Unicode for a string of Wylie, as the keyboard would type it.
 *
 * @param {string} input
 * @returns {string}
 */
export function fromWylie(input) {
  let out = '';
  let syllable = [];
  for (const token of tokenize(input)) {
    if (token.kind === 'separator' || token.kind === 'other') {
      out += writeSyllable(syllable) + token.text;
      syllable = [];
    } else {
      syllable.push(token);
    }
  }
  return out + writeSyllable(syllable);
}

/**
 * Whether a syllable of Wylie writes its vowel. `m` and `ma` give the same
 * མ — the converter, like the keyboard, supplies the inherent a — but a
 * learner who types `m` has not spelt the syllable, and the practice is
 * there to teach the spelling (user request, 2026-11-13).
 */
function writesItsVowel(syllable) {
  return tokenize(syllable).some((token) => token.kind === 'vowel');
}

/** A syllable typed as the answer has it: the same Tibetan, vowel written. */
function syllableIsRight(typed, wanted) {
  return fromWylie(typed) === fromWylie(wanted) && writesItsVowel(typed);
}

/**
 * The practice's verdict on what was typed (user request, 2026-11-13).
 *
 * - `perfect`: the same Tibetan as the answer, every vowel written, and the
 *   final tsheg typed — a word in a Tibetan text ends on one, and the
 *   practice shows every word with it.
 * - `no-tsheg`: all of that but the tsheg. Accepted, since the word is
 *   spelt right, but the practice says what is missing.
 * - `missing-vowel`: the same letters, with a syllable's `a` left to the
 *   converter. Not accepted.
 * - `wrong`: anything else, including nothing.
 *
 * Compared as Tibetan, so that `grA` and `graa` are both right.
 *
 * @param {string} answer
 * @param {string} typed
 * @returns {'perfect' | 'no-tsheg' | 'missing-vowel' | 'wrong'}
 */
export function checkAnswer(answer, typed) {
  const body = typed.trim();
  if (body === '' || fromWylie(body) !== fromWylie(answer.trim())) return 'wrong';
  if (!body.split(/\s+/).every(writesItsVowel)) return 'missing-vowel';
  return /\s$/.test(typed) ? 'perfect' : 'no-tsheg';
}

/**
 * The syllable to suggest next: the first one of the answer that the typing
 * does not yet write correctly — vowel included — or null when it all does.
 *
 * @param {string} answer
 * @param {string} typed
 * @returns {{ index: number, wylie: string } | null}
 */
export function nextHint(answer, typed) {
  const want = answer.trim().split(/\s+/);
  const have = typed.trim().split(/\s+/).filter(Boolean);
  const index = want.findIndex((syllable, i) => have[i] === undefined || !syllableIsRight(have[i], syllable));
  return index === -1 ? null : { index, wylie: want[index].replace(/[‘’]/g, "'") };
}
