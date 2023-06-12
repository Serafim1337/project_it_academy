// ! api

async function getApiText(numberOfParagraphs, numberOfSentences) {
  const url = `http://metaphorpsum.com/paragraphs/${numberOfParagraphs}/${numberOfSentences}`;
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

let mockText =
  "The archaeology of a workshop becomes an untouched linen. Some uptown ravens are thought of simply as crabs. A centimeter is a buffer's Santa. The first speedless billboard is, in its own way, a dahlia.";

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
  const string = document.querySelector(".string");
  let sentencesCounter = 0;
  switch (testState) {
    case "beforeStart":
      let textBatch = mockText;
      for (let char of textBatch) {
        const charSpan = document.createElement("span");
        charSpan.classList.add("character");
        charSpan.dataset.order = "next";
        charSpan.textContent = char;
        string.append(charSpan);
        if (char == ".") {
          sentencesCounter++;
        }
        if (sentencesCounter >= NUMBER_OF_SENTENCES) {
          let br = document.createElement("span");
          br.innerHTML = "\n";
          string.append(br);
        }
      }

      string.firstElementChild.dataset.order = "current";
      string.style.visibility = "visible";

      break;
    case "testOngoing":
      textBatch = mockText;

      for (let char of textBatch) {
        const charSpan = document.createElement("span");
        charSpan.classList.add("character");
        charSpan.dataset.order = "next";
        charSpan.textContent = char;
        string.append(charSpan);
      }

      break;
  }
}

createTypeText();
