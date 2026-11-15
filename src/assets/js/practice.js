// Practice page: a box that writes Tibetan as you type Wylie, and a game that asks for a word at
// a time. Both convert in the page with the converter that draws the cheat sheet (ewts.js), so
// they work on any computer and phone without a Tibetan keyboard installed.
// Ported from the course's TypingPractice component; keep the behaviour in sync.
import { checkAnswer, fromWylie, nextHint } from "./ewts.js";

const { copy, words } = JSON.parse(document.getElementById("practice-data").textContent);

const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const SVG = "http://www.w3.org/2000/svg";
const total = String(words.length);
const position = (n) => copy.position.replace("{n}", String(n)).replace("{total}", total);

for (const root of document.querySelectorAll("[data-typing-practice]")) {
  const find = (role) => root.querySelector(`[data-role="${role}"]`);

  const freeInput = find("free-input");
  const freeOutput = find("free-output");
  freeInput.addEventListener("input", () => {
    freeOutput.textContent = fromWylie(freeInput.value);
  });

  const game = find("game");
  const target = find("target");
  const meaning = find("meaning");
  const positionLabel = find("position");
  const answer = find("answer");
  const answerOutput = find("answer-output");
  const feedback = find("feedback");

  let index = 0;
  // Set once the reader has been told the tsheg is missing: the next Enter moves on rather than
  // saying it again.
  let acceptedWithoutTsheg = false;

  // A line of copy, with `{wylie}` filled and every backticked run set as a key. Built from
  // nodes, never from HTML.
  const line = (template, wylie = "") =>
    template
      .replace("{wylie}", wylie)
      .split("`")
      .map((part, i) => {
        if (i % 2 === 0) return document.createTextNode(part);
        const key = document.createElement("kbd");
        key.textContent = part;
        return key;
      });

  // tone: right | almost | notyet | note
  const say = (tone, lines) => {
    const box = document.createElement("div");
    box.className = `say say--${tone}`;
    if (tone === "right" || tone === "almost") {
      const svg = document.createElementNS(SVG, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("class", "say__icon");
      svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(SVG, "path");
      path.setAttribute("d", CHECK);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "2.5");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.append(path);
      box.append(svg);
    }
    const text = document.createElement("div");
    text.className = "say__text";
    for (const nodes of lines) {
      const p = document.createElement("p");
      p.append(...nodes);
      text.append(p);
    }
    box.append(text);
    feedback.replaceChildren(box);
  };

  const quiet = () => feedback.replaceChildren();
  const markInput = (right) => answer.classList.toggle("is-right", right);

  const show = (i) => {
    index = (i + words.length) % words.length;
    const word = words[index];
    target.textContent = fromWylie(`${word.wylie} `);
    meaning.textContent = word.meaning;
    positionLabel.textContent = position(index + 1);
    answer.value = "";
    answerOutput.textContent = "";
    acceptedWithoutTsheg = false;
    markInput(false);
    quiet();
    answer.focus();
  };

  const wylie = () => words[index].wylie;

  // As the reader types: the Tibetan under the box, and the green as soon as the word is
  // perfect. Nothing else is said while typing: "bla m" is on its way to "bla ma", and telling
  // the reader off for it mid-word would be telling them off for typing.
  answer.addEventListener("input", () => {
    answerOutput.textContent = fromWylie(answer.value);
    acceptedWithoutTsheg = false;
    const perfect = checkAnswer(wylie(), answer.value) === "perfect";
    markInput(perfect);
    if (perfect) say("right", [line(copy.perfect), line(copy.pressEnter)]);
    else quiet();
  });

  // Enter: move on if the word is right, or say what is still wrong.
  game.addEventListener("submit", (event) => {
    event.preventDefault();
    const verdict = checkAnswer(wylie(), answer.value);
    if (verdict === "perfect" || (verdict === "no-tsheg" && acceptedWithoutTsheg)) {
      show(index + 1);
      return;
    }
    if (verdict === "no-tsheg") {
      acceptedWithoutTsheg = true;
      markInput(true);
      say("almost", [line(copy.noTsheg), line(copy.pressEnterAgain)]);
      return;
    }
    const hint = nextHint(wylie(), answer.value);
    if (verdict === "missing-vowel" && hint) say("notyet", [line(copy.missingVowel, hint.wylie)]);
    else if (hint) say("notyet", [line(copy.notYet, hint.wylie)]);
  });

  find("hint").addEventListener("click", () => {
    const hint = nextHint(wylie(), answer.value);
    if (hint) say("note", [line(copy.hintText, hint.wylie)]);
    answer.focus();
  });

  find("reveal").addEventListener("click", () => {
    say("note", [line(copy.answerText, wylie().replace(/[‘’]/g, "'"))]);
    answer.focus();
  });

  find("next").addEventListener("click", () => show(index + 1));
  find("previous").addEventListener("click", () => show(index - 1));
}
