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
  "ceremony",
  "gents",
  "obvious",
  "stew",
  "annotate",
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
  "sharply",
  "daylight",
  "fantasize",
  "paramedic",
  "trouble",
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

let testState = "beforeStart";
// beforeStart - before user started typing
// testOngoing - user is typing test
// testFinished - timer is out, user receives results

let typeTestConfig = JSON.parse(localStorage.typeTestConfig);

const TIMER_DURATION_MINUTES = typeTestConfig.timer / 60;

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

const cpmField = document.querySelector(".cpm-data");
const wpmField = document.querySelector(".wpm-data");
const errorsField = document.querySelector(".errors-data");

const stats = {
  _charCounter: 0,
  _wordsCounter: 0,
  _errorsCounter: 0,

  get charCounter() {
    return this._charCounter;
  },
  set charCounter(value) {
    this._charCounter = value;
    showCharCounter(cpmField);
  },
  get wordsCounter() {
    return this._wordsCounter;
  },
  set wordsCounter(value) {
    this._wordsCounter = value;
    showWordsCounter(wpmField);
  },
  get errorsCounter() {
    return this._errorsCounter;
  },
  set errorsCounter(value) {
    this._errorsCounter = value;
    showErrorsCounter(errorsField);
  },
};

function showCharCounter(field) {
  field.textContent = stats.charCounter / TIMER_DURATION_MINUTES;
}

function showWordsCounter(field) {
  field.textContent = stats.wordsCounter / TIMER_DURATION_MINUTES;
}

function showErrorsCounter(field) {
  field.textContent = stats.errorsCounter;
}

document.addEventListener("keypress", typeHandler);

const minutesField = document.querySelector(".minutes");
const secondsField = document.querySelector(".seconds");

function typeHandler(e) {
  e.preventDefault();
  switch (testState) {
    case "beforeStart":
      if (e.code.startsWith("Key")) {
        startTimer(1, minutesField, secondsField);
        const char = e.code.slice(-1).toLowerCase();
        checkChar(char);
      } else if (e.code === "Space") {
        checkChar(" ");
      }
      testState = "testOngoing";
      break;
    case "testOngoing":
      if (e.code.startsWith("Key")) {
        const char = e.code.slice(-1).toLowerCase();
        checkChar(char);
      } else if (e.code === "Space") {
        checkChar(" ");
      }
      break;
    case "testFinished":
      // todo
      break;
  }
}

function checkChar(char) {
  const currentChar = document.querySelector('[data-order="current"]');
  if (char === currentChar.textContent) {
    if (!currentChar.dataset.state) {
      currentChar.dataset.state = "correct";
      if (currentChar.textContent !== " ") {
        ++stats.charCounter;
      }
    }

    currentChar.dataset.order = "prev";
    if (currentChar.textContent === " ") {
      ++stats.wordsCounter;
    }
    currentChar.nextElementSibling.dataset.order = "current";
    string.style.left = string.offsetLeft - currentChar.offsetWidth + "px";
  } else {
    currentChar.dataset.state = "incorrect";
    ++stats.errorsCounter;
  }
}

function startTimer(duration, minutesDisplay, secondsDisplay) {
  let start = Date.now(),
    diff,
    minutes,
    seconds;
  let ticksCounter = 0;

  function timer() {
    diff = duration - (((Date.now() - start) / 1000) | 0);

    minutes = (diff / 60) | 0;
    seconds = diff % 60 | 0;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    minutesDisplay.textContent = minutes;
    secondsDisplay.textContent = seconds;

    ticksCounter++;
  }

  timer();
  let interval = setInterval(() => {
    timer();
    if (ticksCounter > duration) {
      clearInterval(interval);
      setTimeout(endOfTestHandler, 0);
    }
  }, 1000);
}

function endOfTestHandler() {
  testState = "testFinished";
  document.removeEventListener("keypress", typeHandler);
  saveResults();
  openFinishModal();
}

function saveResults() {
  let typeTestConfig = JSON.parse(localStorage.typeTestConfig);
  const currentResults = {
    time: TIMER_DURATION_MINUTES,
    cpm: stats.charCounter,
    wpm: stats.wordsCounter,
    errors: stats.errorsCounter,
  };
  typeTestConfig.records.push(currentResults);
  localStorage.typeTestConfig = JSON.stringify(typeTestConfig);
}

function openFinishModal() {
  document.body.classList.toggle("body-lock");
  const modalOverlay = document.querySelector(".overlay");
  modalOverlay.style.display = "flex";

  const modal = document.querySelector(".modal-finish");

  const testContent = document.querySelector(".test-content");
  const testString = document.querySelector(".string");
  testContent.append(testString);

  const cpmResult = modal.querySelector(".cpm-data");
  const wpmResult = modal.querySelector(".wpm-data");
  const errorsResult = modal.querySelector(".errors-data");

  showCharCounter(cpmResult);
  showWordsCounter(wpmResult);
  showErrorsCounter(errorsResult);
}

const modalMainButton = document.querySelector(".modal-button-main");
const modalRetryButton = document.querySelector(".modal-button-retry");

modalMainButton.addEventListener("click", function (e) {
  window.open("../../pages/main/main.html", "_self");
});

modalRetryButton.addEventListener("click", function (e) {
  location.reload();
});
