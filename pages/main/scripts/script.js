// (async () => {
//     const url = 'http://metaphorpsum.com/paragraphs/1/1';
// const options = {
// 	method: 'GET',
// 	headers: {
// 	}
// };

// try {
// 	const response = await fetch(url, options);
// 	const result = await response.text();
// 	console.log(result);
// } catch (error) {
// 	console.error(error);
// }
// })();

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

const wordsDesc = document.createElement("div");
wordsDesc.classList.add("block-description");
wordsDesc.style.width = wordsBlock.offsetWidth + "px";
wordsDesc.style.height = wordsBlock.offsetHeight + "px";
wordsDesc.style.top = wordsBlock.offsetTop + "px";
wordsDesc.style.left = wordsBlock.offsetLeft + "px";

menuContainer.append(wordsDesc);

wordsDesc.addEventListener("mouseenter", blockDescHandler);

function blockDescHandler(e) {
  console.log("mouse");
  console.log(e.target);
  e.target.style.top = 600 + "px";
}

const pageDesc = document.createElement("div");
