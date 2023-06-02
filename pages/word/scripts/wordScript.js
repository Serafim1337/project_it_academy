// ! api
async function getAPIWords() {
  const url = "https://random-word-api.vercel.app/api?words=10";
  const options = {
    method: "GET",
    headers: {},
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

let mockWords = [
  "ceremony",
  "gents",
  "obvious",
  "stew",
  "annotate",
  "sharply",
  "daylight",
  "fantasize",
  "paramedic",
  "trouble",
];

// ! logics

function createTypeWords() {
  const wordsBatch = mockWords;
  const wordsBlock = document.querySelector(".words-block");

  const string = document.createElement("div");
  string.classList.add("string");
  string.style.left = wordsBlock.offsetWidth / 2 + "px";

  for (let word of wordsBatch) {
    for (let char of word) {
      const charSpan = document.createElement("span");
      charSpan.classList.add("character");
      charSpan.dataset.order = "next";
      charSpan.textContent = char;
      string.append(charSpan);
    }
    const space = document.createElement("span");
    space.textContent = " ";
    space.classList.add("character");
    string.append(space);
  }
  string.firstElementChild.dataset.order = "current";
  wordsBlock.append(string);
}

createTypeWords();

const string = document.querySelector(".string");
const chars = document.querySelectorAll(".character");

const stats = {
  _charCounter: 0,
  _wordsCounter: 0,
  get charCounter() {
    return this._charCounter;
  },
  set charCounter(value) {
    this._charCounter = value;
    charCounterChanged();
  },
  get wordsCounter() {
    return this._wordsCounter;
  },
  set wordsCounter(value) {
    this._wordsCounter = value;
    wordsCounterChanged();
  },
};

function charCounterChanged() {}

function wordsCounterChanged() {
  if (stats.wordsCounter > 2) {
    mockWords = mockWords.concat(mockWords);
    console.log(mockWords);
  }
}

document.addEventListener("keypress", typeHandler);

function typeHandler(e) {
  if (e.code.startsWith("Key")) {
    const char = e.code.slice(-1).toLowerCase();
    console.log(char);
    checkChar(char);
  } else if (e.code === "Space") {
    checkChar(" ");
  }
}

function checkChar(char) {
  const currentChar = document.querySelector('[data-order="current"]');
  if (char === currentChar.textContent) {
    if (!currentChar.dataset.state) {
      currentChar.dataset.state = "correct";
    }

    currentChar.dataset.order = "prev";
    if (currentChar.textContent === " ") {
      ++stats.wordsCounter;
      console.log(stats.wordsCounter);
    }
    currentChar.nextElementSibling.dataset.order = "current";
    string.style.left = string.offsetLeft - currentChar.offsetWidth + "px";
  } else {
    currentChar.dataset.state = "incorrect";
  }
}
