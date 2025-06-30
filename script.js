let currentLevel = "";
let currentQuestionIndex = 0;
let reviewData = [];
let score = 0;
let questions = [];
let selectedAnswer = null;
let answered = false;

function showLevelSelection() {
  document.getElementById("start-page").style.display = "none";
  document.getElementById("level-selection").style.display = "block";
  document.getElementById("quiz-container").style.display = "none";
}

function showStartPage() {
  document.getElementById("start-page").style.display = "block";
  document.getElementById("level-selection").style.display = "none";
  document.getElementById("quiz-container").style.display = "none";
}

function startQuiz(level) {
  reviewData = [];
  currentLevel = level;
  currentQuestionIndex = 0;
  score = 0;

  document.getElementById("start-page").style.display = "none";
  document.getElementById("level-selection").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  document.getElementById("quiz-content").style.display = "block";
  document.getElementById("quiz-complete").style.display = "none";

  document.getElementById("quiz-title").textContent = `🈴 ${level} Kanji Quiz`;
  document.getElementById("score").textContent = score;

  generateQuestions();
  displayQuestion();
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions() {
  questions = [];
  const levelData = kanjiData[currentLevel];
  const shuffledKanji = shuffleArray(levelData);

  const questionCount = Math.min(20, levelData.length);

  for (let i = 0; i < questionCount; i++) {
    const questionType = Math.random() > 0.5 ? "reading" : "meaning";
    const correctAnswer = shuffledKanji[i];

    if (questionType === "reading") {
      const wrongAnswers = shuffleArray(
        levelData.filter((k) => k !== correctAnswer)
      )
        .slice(0, Math.min(3, levelData.length - 1))
        .map((k) => k.reading);

      questions.push({
        type: "reading",
        kanji: correctAnswer.kanji,
        correct: correctAnswer.reading,
        options: shuffleArray([correctAnswer.reading, ...wrongAnswers]),
      });
    } else {
      const wrongAnswers = shuffleArray(
        levelData.filter((k) => k !== correctAnswer)
      )
        .slice(0, Math.min(3, levelData.length - 1))
        .map((k) => k.kanji);

      questions.push({
        type: "meaning",
        english: correctAnswer.english,
        correct: correctAnswer.kanji,
        options: shuffleArray([correctAnswer.kanji, ...wrongAnswers]),
      });
    }
  }
}

function displayQuestion() {
  const question = questions[currentQuestionIndex];
  const questionDisplay = document.getElementById("question-display");
  const questionType = document.getElementById("question-type");
  const optionsContainer = document.getElementById("options");

  selectedAnswer = null;
  answered = false;
  document.getElementById("next-btn").disabled = true;
  const feedback = document.getElementById("feedback");
  feedback.style.display = "none";
  // Remove the classList.remove line

  document.getElementById("current").textContent = currentQuestionIndex + 1;
  document.getElementById("total").textContent = questions.length;

  if (question.type === "reading") {
    questionType.textContent = "Select the correct reading";
    questionDisplay.innerHTML = `<div class="kanji-display">${question.kanji}</div>`;
  } else {
    questionType.textContent = "Select the correct kanji";
    questionDisplay.innerHTML = `<div class="english-word">${question.english}</div>`;
  }

  optionsContainer.innerHTML = "";
  question.options.forEach((option, index) => {
    const optionElement = document.createElement("div");
    optionElement.className = "option";
    optionElement.textContent = option;
    optionElement.onclick = () => selectAnswer(option, optionElement);
    optionsContainer.appendChild(optionElement);
  });
}

function selectAnswer(answer, element) {
  if (answered) return;

  selectedAnswer = answer;
  answered = true;

  const question = questions[currentQuestionIndex];
  const isCorrect = answer === question.correct;
  const feedback = document.getElementById("feedback");

  const correctKanjiData = kanjiData[currentLevel].find(
    (k) =>
      (question.type === "reading" && k.kanji === question.kanji) ||
      (question.type === "meaning" && k.kanji === question.correct)
  );

  // Store data for review
  reviewData.push({
    question: question,
    selectedAnswer: answer,
    isCorrect: isCorrect,
    correctData: correctKanjiData,
  });

  element.classList.add(isCorrect ? "correct" : "incorrect");

  if (!isCorrect) {
    document.querySelectorAll(".option").forEach((opt) => {
      if (opt.textContent === question.correct) {
        opt.classList.add("correct");
      }
    });
  }

  let explanationHTML = "";

  if (isCorrect) {
    explanationHTML = `<div class="main-feedback correct-main">正解！ (Correct!)<br>${correctKanjiData.kanji}（${correctKanjiData.reading}）- ${correctKanjiData.english}<br><strong>Example:</strong> ${correctKanjiData.example}</div>`;
  } else {
    explanationHTML = `<div class="main-feedback incorrect-main">間違い (Incorrect)<br>Correct answer: ${correctKanjiData.kanji}（${correctKanjiData.reading}）- ${correctKanjiData.english}<br><strong>Example:</strong> ${correctKanjiData.example}</div>`;
  }

  explanationHTML += '<div class="options-explanation"><h4>All Options:</h4>';

  question.options.forEach((option) => {
    let optionData;

    if (question.type === "reading") {
      optionData = kanjiData[currentLevel].find((k) => k.reading === option);
      if (optionData) {
        const isCorrectOption = option === question.correct;
        explanationHTML += `<div class="option-detail ${
          isCorrectOption ? "correct-option" : ""
        }">
                    ${optionData.kanji}（${optionData.reading}）- ${
          optionData.english
        }<br>
                    <span class="example-text">Example: ${
                      optionData.example
                    }</span>
                </div>`;
      }
    } else {
      optionData = kanjiData[currentLevel].find((k) => k.kanji === option);
      if (optionData) {
        const isCorrectOption = option === question.correct;
        explanationHTML += `<div class="option-detail ${
          isCorrectOption ? "correct-option" : ""
        }">
                    ${optionData.kanji}（${optionData.reading}）- ${
          optionData.english
        }<br>
                    <span class="example-text">Example: ${
                      optionData.example
                    }</span>
                </div>`;
      }
    }
  });

  explanationHTML += "</div>";

  if (isCorrect) {
    score++;
    document.getElementById("score").textContent = score;
    feedback.className = "feedback correct";
  } else {
    feedback.className = "feedback incorrect";
  }

  feedback.innerHTML = explanationHTML;
  feedback.style.display = "block";
  //feedback.classList.add("show-desktop");
  document.getElementById("next-btn").disabled = false;
}

function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex >= questions.length) {
    showResults();
  } else {
    displayQuestion();
  }
}

function showResults() {
  document.getElementById("quiz-content").style.display = "none";
  document.getElementById("quiz-complete").style.display = "block";

  const finalScore = document.getElementById("final-score");
  const performanceText = document.getElementById("performance-text");

  finalScore.textContent = `${score}/${questions.length}`;

  const percentage = (score / questions.length) * 100;
  if (percentage >= 90) {
    performanceText.textContent = "素晴らしい！(Excellent!)";
  } else if (percentage >= 70) {
    performanceText.textContent = "よくできました！(Well done!)";
  } else if (percentage >= 50) {
    performanceText.textContent = "がんばって！(Keep trying!)";
  } else {
    performanceText.textContent =
      "もっと練習しましょう！(More practice needed!)";
  }
}

function restartQuiz() {
  startQuiz(currentLevel);
}

function showReview() {
  document.getElementById("quiz-complete").style.display = "none";
  document.getElementById("review-section").style.display = "block";
  displayReview();
}

function displayReview() {
  const reviewContainer = document.getElementById("review-container");
  let reviewHTML = "";

  reviewData.forEach((item, index) => {
    const question = item.question;
    const statusClass = item.isCorrect ? "review-correct" : "review-incorrect";
    const statusText = item.isCorrect ? "✓ Correct" : "✗ Incorrect";

    reviewHTML += `
        <div class="review-item ${statusClass}">
            <div class="review-header">
                <span class="question-number">Question ${index + 1}</span>
                <span class="review-status">${statusText}</span>
            </div>
            <div class="review-content">
                <div class="review-question">
                    ${
                      question.type === "reading"
                        ? `<strong>Reading for:</strong> <span class="kanji-large">${question.kanji}</span>`
                        : `<strong>Kanji for:</strong> ${question.english}`
                    }
                </div>
                <div class="review-answer">
                    <strong>Your answer:</strong> ${item.selectedAnswer}
                </div>
                <div class="review-correct">
                    <strong>Correct answer:</strong> ${
                      item.correctData.kanji
                    }（${item.correctData.reading}）- ${
      item.correctData.english
    }<br>
                    <strong>Example:</strong> ${item.correctData.example}
                </div>
            </div>
        </div>`;
  });

  reviewContainer.innerHTML = reviewHTML;
}

function backToResults() {
  document.getElementById("review-section").style.display = "none";
  document.getElementById("quiz-complete").style.display = "block";
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const nextBtn = document.getElementById("next-btn");
    if (!nextBtn.disabled) {
      nextQuestion();
    }
  }
});
