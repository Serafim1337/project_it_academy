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

const cpmField = document.querySelector(".cpm-data");
const wpmField = document.querySelector(".wpm-data");
const errorsField = document.querySelector(".errors-data");
const minutesField = document.querySelector(".minutes");
const secondsField = document.querySelector(".seconds");
const modalMainButton = document.querySelector(".modal-button-main");
const modalRetryButton = document.querySelector(".modal-button-retry");

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
        for (let paragraph of string.children) {
          if (!paragraph.hasAttribute("data-order")) {
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
        }
      });
  }
}

const stats = {
  charCounter: 0,
  wordsCounter: 0,
  _errorsCounter: 0,

  get errorsCounter() {
    return this._errorsCounter;
  },
  set errorsCounter(value) {
    this._errorsCounter = value;
    showErrorsCounter(errorsField);
  },
};

document.addEventListener("keydown", typeHandler);
modalMainButton.addEventListener("click", function (e) {
  window.open("../../pages/main/main.html", "_self");
});
modalRetryButton.addEventListener("click", function (e) {
  location.reload();
});

createTypeText();

function showCPMCounter(secFromStart, field) {
  const minFromStart = (secFromStart / 60) | 0;
  field.textContent = roundTo2Decimals(stats.charCounter / (minFromStart + 1));
}

function showWPMCounter(secFromStart, field) {
  const minFromStart = (secFromStart / 60) | 0;
  field.textContent = roundTo2Decimals(stats.wordsCounter / (minFromStart + 1));
}

function showErrorsCounter(field) {
  field.textContent = stats.errorsCounter > 99 ? "99+" : stats.errorsCounter;
}

// ! type logics

function typeHandler(e) {
  e.preventDefault();
  switch (testState) {
    case "beforeStart":
      startTimer(typeTestConfig.timer, minutesField, secondsField);
      if (e.key !== "Shift") {
        checkChar(e.key);
      }
      soundInit();
      typeSoundPlay();
      testState = "testOngoing";
      break;
    case "testOngoing":
      if (e.key !== "Shift") {
        checkChar(e.key);
      }
      typeSoundPlay();
      break;
    case "testFinished":
      //handled in function
      break;
  }
}

function checkChar(char) {
  const string = document.querySelector(".string");
  let currentParagraph = document.querySelector(
    '[data-order="currentParagraph"]'
  );
  let currentChar = document.querySelector('[data-order="currentChar"]');

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
      if (stats.wordsCounter % 10 === 0) {
        createTypeText();
      }
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
    const secFromStart = ((Date.now() - start) / 1000) | 0;
    diff = duration - secFromStart;

    minutes = (diff / 60) | 0;
    seconds = diff % 60 | 0;

    showCPMCounter(secFromStart, cpmField);
    showWPMCounter(secFromStart, wpmField);

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
  showCPMCounter(TIMER_DURATION_MINUTES * 60, cpmResult);
  showWPMCounter(TIMER_DURATION_MINUTES * 60, wpmResult);
  showErrorsCounter(errorsResult);

  finishSoundPlay();
}

// ! Utils

function roundTo2Decimals(number) {
  return Math.round(number * 100) / 100;
}

// ! back/reload buttons
window.onbeforeunload = function (e) {
  if (testState == "testOngoing") {
    e.returnValue = "Your test is sill on!";
  }
};

// ! audio

let isAudioMuted = true;

const typeSound = new Audio();
typeSound.src = "../../assets/audio/type-sound.mp3";
typeSound.volume = 0.1;

const finishSound = new Audio();
finishSound.src = "../../assets/audio/finish-sound.mp3";
finishSound.volume = 0.1;

function soundInit() {
  typeSound.play();
  typeSound.pause();
  finishSound.play();
  finishSound.pause();
}

function typeSoundPlay() {
  if (!isAudioMuted) {
    typeSound.currentTime = 0;
    typeSound.play();
  }
}

function finishSoundPlay() {
  if (!isAudioMuted) {
    finishSound.currentTime = 0;
    finishSound.play();
  }
}

// ! mute button

document.querySelector(".speaker").onclick = function (e) {
  e.preventDefault();

  e.currentTarget.classList.toggle("mute");
  isAudioMuted = !isAudioMuted;
};
