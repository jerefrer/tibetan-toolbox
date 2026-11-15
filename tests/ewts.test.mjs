import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, fromWylie, nextHint } from '../src/assets/js/ewts.js';

/*
 * The Wylie converter behind the practice page and the cheat sheet — see
 * src/assets/js/ewts.js, ported from the Tibetan course site, whose tests these are. The
 * expected strings are the Unicode a Tibetan reader would write, checked
 * against REFERENCE.md in bkntr/tibetan-keyboard, which is the keyboard the
 * Windows video installs.
 */

describe('fromWylie', () => {
  const cases = [
    ['sangs rgyas', 'སངས་རྒྱས'],
    ['bsgribs', 'བསྒྲིབས'],
    ['dbang', 'དབང'],
    ['brgyad', 'བརྒྱད'],
    ['lha', 'ལྷ'],
    ['bla ma', 'བླ་མ'],
    ["mkha' 'gro", 'མཁའ་འགྲོ'],
    ['dkyil', 'དཀྱིལ'],
    ['dwags', 'དྭགས'],
    ['rlung', 'རླུང'],
    ["dge 'dun", 'དགེ་འདུན'],
    ['byang chub', 'བྱང་ཆུབ'],
    ["sems dpa'", 'སེམས་དཔའ'],
    ['phywa', 'ཕྱྭ'],
    ['rnying', 'རྙིང'],
    ['ston pa', 'སྟོན་པ'],
    ['gzhan', 'གཞན'],
    ["'od gsal", 'འོད་གསལ'],
    ['tshe', 'ཚེ'],
    ['dzam', 'ཛམ'],
  ];
  for (const [wylie, tibetan] of cases) {
    it(`should write ${wylie} as ${tibetan}`, () => {
      assert.equal(fromWylie(wylie), tibetan);
    });
  }

  it('should stack a standard stack without being told to', () => {
    assert.equal(fromWylie('gyon'), 'གྱོན');
  });

  it('should keep letters apart across a dot', () => {
    assert.equal(fromWylie('g.yon'), 'གཡོན');
  });

  it('should stack anything joined by a plus', () => {
    assert.equal(fromWylie('sat+t+wa'), 'སཏྟྭ');
    assert.equal(fromWylie('pad+ma'), 'པདྨ');
  });

  it('should leave letters unstacked where no standard stack fits', () => {
    assert.equal(fromWylie('padma'), 'པདམ');
  });

  it('should put a-chen under a vowel that opens a syllable', () => {
    assert.equal(fromWylie('a'), 'ཨ');
    assert.equal(fromWylie('e ma ho'), 'ཨེ་མ་ཧོ');
    assert.equal(fromWylie('oM'), 'ཨོཾ');
  });

  it('should write the long vowels either way', () => {
    assert.equal(fromWylie('graa'), 'གྲཱ');
    assert.equal(fromWylie('grA'), 'གྲཱ');
    assert.equal(fromWylie('kI'), 'ཀཱི');
    assert.equal(fromWylie('kii'), 'ཀཱི');
    assert.equal(fromWylie('hUM'), 'ཧཱུཾ');
  });

  it('should tell the retroflex capitals from the lower case', () => {
    assert.equal(fromWylie('Ni'), 'ཎི');
    assert.equal(fromWylie('ta'), 'ཏ');
    assert.equal(fromWylie('Ta'), 'ཊ');
  });

  it('should write punctuation, digits and an ordinary space', () => {
    assert.equal(fromWylie('rgyas/'), 'རྒྱས།');
    assert.equal(fromWylie('bod yig_dang'), 'བོད་ཡིག དང');
    assert.equal(fromWylie('bodxyig'), 'བོད ཡིག');
    assert.equal(fromWylie('108'), '༡༠༨');
  });

  it('should read a phone’s curly apostrophe as an a-chung', () => {
    assert.equal(fromWylie('’od'), 'འོད');
  });
});

describe('checkAnswer', () => {
  it('should call an answer that ends on its tsheg perfect', () => {
    assert.equal(checkAnswer('bla ma', 'bla ma '), 'perfect');
  });

  it('should accept another spelling of the same Tibetan', () => {
    assert.equal(checkAnswer('graa', 'grA '), 'perfect');
  });

  it('should accept an answer without its final tsheg, and say so', () => {
    assert.equal(checkAnswer('bla ma', 'bla ma'), 'no-tsheg');
  });

  it('should refuse a syllable typed without its vowel, though it writes the same letter', () => {
    assert.equal(checkAnswer('bla ma', 'bla m'), 'missing-vowel');
    assert.equal(checkAnswer('bla ma', 'bla m '), 'missing-vowel');
  });

  it('should refuse a different word', () => {
    assert.equal(checkAnswer('rgya mtsho', 'rgya mtsh'), 'wrong');
  });

  it('should refuse an empty answer', () => {
    assert.equal(checkAnswer('chos', ''), 'wrong');
  });
});

describe('nextHint', () => {
  it('should point at the first syllable that is not yet right', () => {
    assert.deepEqual(nextHint('byang chub sems dpa’', 'byang chu'), { index: 1, wylie: 'chub' });
  });

  it('should start at the first syllable when nothing is typed', () => {
    assert.deepEqual(nextHint('sangs rgyas', ''), { index: 0, wylie: 'sangs' });
  });

  it('should say nothing once the word is complete', () => {
    assert.equal(nextHint('sangs rgyas', 'sangs rgyas'), null);
  });

  it('should point at a syllable typed without its vowel', () => {
    assert.deepEqual(nextHint('bla ma', 'bla m'), { index: 1, wylie: 'ma' });
  });
});
