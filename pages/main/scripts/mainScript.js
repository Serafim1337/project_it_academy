let typeTestConfig = {
  timer: 0,
  records: [],
};

//! falling letters

const container = document.getElementsByClassName("letters-container")[0];

function randLetters() {
  const spawnLettersLimit = 40;
  const widthAdjust = 85;

  var alphabet = "abcdefghijklmnopqrstuvwxyz";

  var randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

  var posX = randLoc();

  let span = document.createElement("span");
  span.textContent = randomLetter;
  span.classList.add("falling-letter");
  span.style.left = posX + "px";

  container.append(span);

  if (container.children.length > spawnLettersLimit) {
    container.firstChild.remove();
  }

  function randLoc() {
    var randomLocation = Math.floor(Math.random() * window.innerWidth);
    if (randomLocation > window.innerWidth - widthAdjust) {
      return window.innerWidth - widthAdjust;
    } else {
      return randomLocation;
    }
  }
}

setInterval(function () {
  randLetters();
}, 200);

// ! gesture

document.addEventListener(
  "touchstart",
  function (event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
  },
  false
);

document.addEventListener(
  "touchend",
  function (event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
  },
  false
);

function handleGesture() {
  if (touchendX + 100 < touchstartX) {
    // console.log("Swiped Left");
    recordsLinkHandler();
  }
}

//! block desc
const menuContainer = document.querySelector(".menu-container");
const wordsContainer = document.querySelector(".words-container");
const wordsBlock = document.querySelector(".words-block");
const pageContainer = document.querySelector(".page-container");
const pageBlock = document.querySelector(".page-block");

wordsContainer.addEventListener("click", openTestPageHandler);
pageContainer.addEventListener("click", openTestPageHandler);

let touchCounter = 0;

function openTestPageHandler(e) {
  if (isTouchDevice() && touchCounter < 1) {
    touchCounter++;
    return;
  }
  touchCounter = 0;
  let currentElem;
  if (localStorage.typeTestConfig) {
    typeTestConfig = JSON.parse(localStorage.typeTestConfig);
  }
  if (e.target.hasAttribute("data-timer")) {
    currentElem = e.target;
  } else {
    currentElem = e.target.parentElement;
  }
  typeTestConfig.timer = currentElem.dataset.timer;
  localStorage.typeTestConfig = JSON.stringify(typeTestConfig);
  switch (currentElem.dataset.testType) {
    case "word":
      window.open("../word/word.html", "_self");
      break;
    case "text":
      window.open("../text/text.html", "_self");
      break;
  }
}

for (let i = 1; i <= 2; i++) {
  const wordsDesc = document.createElement("div");
  wordsDesc.classList.add("block-description");
  wordsDesc.style.width = wordsBlock.offsetWidth + "px";
  wordsDesc.style.height = wordsBlock.offsetHeight + "px";
  wordsDesc.style.top = 0 + "px";
  wordsDesc.style.left = 0 + "px";
  wordsDesc.dataset.testType = "word";
  wordsDesc.dataset.timer = 60 * (i + 1);
  wordsDesc.textContent = `${i + 1} minutes`;

  wordsContainer.append(wordsDesc);

  wordsContainer.addEventListener("mouseenter", function (e) {
    wordsDesc.style.top = wordsDesc.offsetHeight * i + "px";
  });
  wordsContainer.addEventListener("mouseleave", function (e) {
    wordsDesc.style.top = 0 + "px";
  });

  const pageDesc = document.createElement("div");
  pageDesc.classList.add("block-description");
  pageDesc.style.width = wordsBlock.offsetWidth + "px";
  pageDesc.style.height = wordsBlock.offsetHeight + "px";
  pageDesc.style.top = 0 + "px";
  pageDesc.style.left = 0 + "px";
  pageDesc.dataset.testType = "text";
  pageDesc.dataset.timer = 60 * (i + 1);
  pageDesc.textContent = `${i + 1} minutes`;

  pageContainer.append(pageDesc);

  pageContainer.addEventListener("mouseenter", function (e) {
    pageDesc.style.top = pageDesc.offsetHeight * i + "px";
  });
  pageContainer.addEventListener("mouseleave", function (e) {
    pageDesc.style.top = 0 + "px";
  });
}

function blockDescOpen(e) {}

function blockDescClose(e) {}

//! records

const recordsLink = document.querySelector(".records-link");

recordsLink.addEventListener("click", recordsLinkHandler);

function recordsLinkHandler(e) {
  document.body.classList.toggle("body-lock");
  const recordsOverlay = document.querySelector(".records-overlay");
  recordsOverlay.style.display = "flex";
  getRecords();
}

const closeButton = document.querySelector(".close-container");

closeButton.addEventListener("click", closeButtonHandler);

function closeButtonHandler(e) {
  document.body.classList.toggle("body-lock");
  const recordsOverlay = document.querySelector(".records-overlay");
  recordsOverlay.style.display = "none";
}

const recordsOverlay = document.querySelector(".records-overlay");

recordsOverlay.addEventListener("click", overlayHandler);

function overlayHandler(e) {
  const recordsOverlay = document.querySelector(".records-overlay");
  if (e.target == recordsOverlay) {
    document.body.classList.toggle("body-lock");
    recordsOverlay.style.display = "none";
  }
}

function getRecords() {
  const tBody = document.querySelector(".tbody-content");
  if (localStorage.typeTestConfig) {
    typeTestConfig = JSON.parse(localStorage.typeTestConfig);
  }
  if (typeTestConfig.records.length == 0) {
    let tr = document.createElement("tr");
    tr.style.textAlign = "center";
    let img = document.createElement("img");
    img.src = "../../assets/images/not_found.png";
    tr.append(img);
    tBody.append(tr);
  }

  for (let record of typeTestConfig.records) {
    let tr = document.createElement("tr");
    let tdName = document.createElement("td");
    tdName.textContent = record.name;
    let tdType = document.createElement("td");
    tdType.textContent = record.type;
    let tdTime = document.createElement("td");
    tdTime.textContent = record.time;
    let tdCpm = document.createElement("td");
    tdCpm.textContent = record.cpm;
    let tdWpm = document.createElement("td");
    tdWpm.textContent = record.wpm;
    let tdErr = document.createElement("td");
    tdErr.textContent = record.errors;
    tr.append(tdName, tdType, tdTime, tdCpm, tdWpm, tdErr);
    tBody.append(tr);
  }
}

// !utils

function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}
