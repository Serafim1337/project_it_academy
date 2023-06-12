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

//! block desc
const menuContainer = document.querySelector(".menu-container");
const wordsBlock = document.querySelector(".words-block");
const pageBlock = document.querySelector(".page-block");

wordsBlock.addEventListener("click", openTestPageHandler);
pageBlock.addEventListener("click", openTestPageHandler);

function openTestPageHandler(e) {
  if (localStorage.typeTestConfig) {
    typeTestConfig = JSON.parse(localStorage.typeTestConfig);
  }
  typeTestConfig.timer = e.currentTarget.dataset.timer;
  localStorage.typeTestConfig = JSON.stringify(typeTestConfig);
  switch (e.currentTarget.dataset.testType) {
    case "word":
      window.open("../word/word.html", "_self");
      break;
    case "text":
      window.open("../text/text.html", "_self");
      break;
  }
}

const wordsDesc = document.createElement("div");
wordsDesc.classList.add("block-description");
wordsDesc.style.width = wordsBlock.offsetWidth + "px";
wordsDesc.style.height = wordsBlock.offsetHeight + "px";
wordsDesc.style.top = wordsBlock.offsetTop + "px";
wordsDesc.style.left = wordsBlock.offsetLeft + "px";

menuContainer.append(wordsDesc);

wordsBlock.addEventListener("mouseenter", blockDescOpen);
wordsBlock.addEventListener("mouseleave", blockDescClose);

function blockDescOpen(e) {
  wordsDesc.style.top = wordsBlock.offsetTop + wordsDesc.offsetHeight + "px";
}

function blockDescClose(e) {
  wordsDesc.style.top = wordsBlock.offsetTop + "px";
}

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
    let tdTime = document.createElement("td");
    tdTime.textContent = record.time;
    let tdCpm = document.createElement("td");
    tdCpm.textContent = record.cpm;
    let tdWpm = document.createElement("td");
    tdWpm.textContent = record.wpm;
    let tdErr = document.createElement("td");
    tdErr.textContent = record.errors;
    tr.append(tdName, tdTime, tdCpm, tdWpm, tdErr);
    tBody.append(tr);
  }
}
