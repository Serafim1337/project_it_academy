// ! api

async function getApiText(numberOfParagraphs, numberOfSentences) {
  const url = `http://metaphorpsum.com/paragraphs/${numberOfParagraphs}/${numberOfSentences}?p=true`;
  const options = {
    method: "GET",
    headers: {},
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();
    return result;
  } catch (error) {
    console.error(error);
  }
}

let mockText = `<p>The. Test test, test, test.</p>

  <p>The first scalelike crook is, in its own way, a gorilla. The fratchy planet reveals itself as a leisure example to those who look. A paling indonesia without vibraphones is truly a paul of staple cabinets. As far as we can estimate, they were lost without the wasted tenor that composed their coil.</p>
  
  <p>Their connection was, in this moment, a closer year. The gaited botany reveals itself as a regent suede to those who look. Recent controversy aside, a sound is an inmost open. They were lost without the immersed oxygen that composed their helmet.</p>
  
  <p>Unfortunately, that is wrong; on the contrary, few can name a shickered woolen that isn't a comfy swallow. Extending this logic, the friction of a note becomes a freckly bridge. A lion is a dying minute. This could be, or perhaps a raincoat can hardly be considered a dormy vault without also being a biology.</p>
  
  <p>The foggy rest comes from an unchecked preface. Before oranges, bells were only hells. Some sixfold Sundaies are thought of simply as talks. The numbing business reveals itself as a logy grass to those who look.</p>`;

// ! state
let testState = "beforeStart";
// beforeStart - before user started typing
// testOngoing - user is typing test
// testFinished - timer is out, user receives results

// ! local storage

let typeTestConfig = JSON.parse(localStorage.typeTestConfig);

const TIMER_DURATION_MINUTES = typeTestConfig.timer / 60;

// ! configs
const NUMBER_OF_PARAGRAPHS = 2;
const NUMBER_OF_SENTENCES = 2;

// !logics

function createTypeText() {
  const textBlock = document.querySelector(".text-block");
  const string = document.getElementsByClassName("string")[0];
  switch (testState) {
    case "beforeStart":
      getApiText(NUMBER_OF_PARAGRAPHS, NUMBER_OF_SENTENCES).then((data) => {
        string.innerHTML = data;
        for (let paragraph of string.children) {
          const paragraphContent = paragraph.textContent.split("");
          paragraph.innerHTML = "";
          paragraph.dataset.order = "nextParagraph";
          for (let char of paragraphContent) {
            const charSpan = document.createElement("span");
            charSpan.classList.add("character");
            charSpan.dataset.order = "nextChar";
            charSpan.textContent = char;
            paragraph.append(charSpan);
          }
        }

        const currentParagraph = string.firstElementChild;
        currentParagraph.dataset.order = "currentParagraph";
        const currentChar = currentParagraph.firstElementChild;
        currentChar.dataset.order = "currentChar";

        string.style.top =
          textBlock.offsetHeight / 2 - currentChar.offsetHeight + "px";
        string.style.visibility = "visible";
      });

      break;
    case "testOngoing":
      getApiText(NUMBER_OF_PARAGRAPHS, NUMBER_OF_SENTENCES).then((data) => {
        string.insertAdjacentHTML("beforeend", data);
      });
      for (let paragraph of string.children) {
        if (!paragraph.hasAttribute(order)) {
        }
      }
  }
}

createTypeText();

const cpmField = document.querySelector(".cpm-data");
const wpmField = document.querySelector(".wpm-data");
const errorsField = document.querySelector(".errors-data");

const stats = {
  _charCounter: 0,
  _wordsCounter: 0,
  _errorsCounter: 0,

  get charCounter() {
    return Math.round((this._charCounter / TIMER_DURATION_MINUTES) * 100) / 100;
  },
  set charCounter(value) {
    this._charCounter = value;
    showCharCounter(cpmField);
  },
  get wordsCounter() {
    return (
      Math.round((this._wordsCounter / TIMER_DURATION_MINUTES) * 100) / 100
    );
  },
  set wordsCounter(value) {
    this._wordsCounter = value;
    showWordsCounter(wpmField);
  },
  get errorsCounter() {
    return (
      Math.round((this._errorsCounter / TIMER_DURATION_MINUTES) * 100) / 100
    );
  },
  set errorsCounter(value) {
    this._errorsCounter = value;
    showErrorsCounter(errorsField);
  },
};

function showCharCounter(field) {
  let cpmValue =
    Math.round((stats.charCounter / TIMER_DURATION_MINUTES) * 100) / 100;
  field.textContent = cpmValue;
}

function showWordsCounter(field) {
  let wpmValue =
    Math.round((stats.wordsCounter / TIMER_DURATION_MINUTES) * 100) / 100;
  field.textContent = wpmValue;
}

function showErrorsCounter(field) {
  field.textContent = stats.errorsCounter;
}

// ! type logics

const minutesField = document.querySelector(".minutes");
const secondsField = document.querySelector(".seconds");

document.addEventListener("keydown", typeHandler);

function typeHandler(e) {
  e.preventDefault();
  switch (testState) {
    case "beforeStart":
      startTimer(typeTestConfig.timer, minutesField, secondsField);
      if (e.key !== "Shift") {
        checkChar(e.key);
      }

      testState = "testOngoing";
      break;
    case "testOngoing":
      // console.log("key", e.key);
      if (e.key !== "Shift") {
        checkChar(e.key);
      }
      break;
    case "testFinished":
      // todo
      break;
  }
}

function checkChar(char) {
  const string = document.querySelector(".string");
  let currentParagraph = document.querySelector(
    '[data-order="currentParagraph"]'
  );
  let currentChar = document.querySelector('[data-order="currentChar"]');
  console.log(char);

  if (char === currentChar.textContent) {
    if (!currentChar.dataset.state) {
      currentChar.dataset.state = "correct";
      ++stats.charCounter;
    }

    if (currentChar.textContent === ".") {
      ++stats.wordsCounter;
    }

    if (currentChar.textContent === ",") {
      ++stats.wordsCounter;
    }

    if (
      currentChar.textContent === " " &&
      currentChar.previousElementSibling.textContent != "." &&
      currentChar.previousElementSibling.textContent != ","
    ) {
      ++stats.wordsCounter;
    }

    currentChar.dataset.order = "prevChar";

    if (currentChar.nextElementSibling === null) {
      currentParagraph.dataset.order = "prevParagraph";
      let nextParagraph = currentParagraph.nextElementSibling;
      nextParagraph.dataset.order = "currentParagraph";
      nextParagraph.firstElementChild.dataset.order = "currentChar";
      checkEndOfLine(string, currentChar, nextParagraph.firstElementChild);
      currentParagraph = nextParagraph;
    } else {
      currentChar.nextElementSibling.dataset.order = "currentChar";
      checkEndOfLine(string, currentChar, currentChar.nextElementSibling);
    }
  } else {
    currentChar.dataset.state = "incorrect";
    ++stats.errorsCounter;
  }
}

function checkEndOfLine(string, prev, curr) {
  if (prev.offsetTop !== curr.offsetTop) {
    string.style.top = string.offsetTop - curr.offsetHeight + "px";
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
    type: "Page",
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

  const testDuration = modal.querySelector(".timer-data");
  const cpmResult = modal.querySelector(".cpm-data");
  const wpmResult = modal.querySelector(".wpm-data");
  const errorsResult = modal.querySelector(".errors-data");

  testDuration.textContent = `${TIMER_DURATION_MINUTES} min`;
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
