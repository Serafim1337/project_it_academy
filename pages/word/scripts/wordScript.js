// ! api
async function getAPIWords(wordsNumber) {
  const url = `https://random-word-api.vercel.app/api?words=${wordsNumber}`;
  const options = {
    method: "GET",
    headers: {},
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
}

// ! logics

let testState = "beforeStart";
// beforeStart - before user started typing
// testOngoing - user is typing test
// testFinished - timer is out, user receives results

let typeTestConfig = JSON.parse(localStorage.typeTestConfig);

const TIMER_DURATION_MINUTES = typeTestConfig.timer / 60;

const cpmField = document.querySelector(".cpm-data");
const wpmField = document.querySelector(".wpm-data");
const errorsField = document.querySelector(".errors-data");
const minutesField = document.querySelector(".minutes");
const secondsField = document.querySelector(".seconds");

const modalMainButton = document.querySelector(".modal-button-main");
const modalRetryButton = document.querySelector(".modal-button-retry");

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

document.addEventListener("keypress", typeHandler);

modalMainButton.addEventListener("click", function (e) {
  window.open("../../pages/main/main.html", "_self");
});

modalRetryButton.addEventListener("click", function (e) {
  location.reload();
});

createTypeWords();

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

function addWordsToString(string) {
  return getAPIWords(10).then((wordsList) => {
    for (let word of wordsList) {
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
  });
}

function createTypeWords() {
  const wordsBlock = document.querySelector(".words-block");
  const string = document.querySelector(".string");

  switch (testState) {
    case "beforeStart":
      string.style.left = wordsBlock.offsetWidth / 2 + "px";
      addWordsToString(string).then(() => {
        string.firstElementChild.dataset.order = "current";
        string.style.visibility = "visible";
      });
      break;
    case "testOngoing":
      addWordsToString(string);
      break;
  }
}

function typeHandler(e) {
  e.preventDefault();
  switch (testState) {
    case "beforeStart":
      if (e.code.startsWith("Key")) {
        startTimer(typeTestConfig.timer, minutesField, secondsField);
        const char = e.code.slice(-1).toLowerCase();
        checkChar(char);
      } else if (e.code === "Space") {
        checkChar(" ");
      }
      soundInit();
      typeSoundPlay();
      testState = "testOngoing";
      break;
    case "testOngoing":
      if (e.code.startsWith("Key")) {
        const char = e.code.slice(-1).toLowerCase();
        checkChar(char);
      } else if (e.code === "Space") {
        checkChar(" ");
      }
      typeSoundPlay();
      break;
    case "testFinished":
      // state handled in endOfTestHandler
      break;
  }
}

function checkChar(char) {
  const string = document.querySelector(".string");
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
      if (stats.wordsCounter % 5 == 0) {
        createTypeWords();
      }
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
    type: "Word",
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
