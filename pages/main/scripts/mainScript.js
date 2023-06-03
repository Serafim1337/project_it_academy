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
