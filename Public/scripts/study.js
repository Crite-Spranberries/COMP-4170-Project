(function () {
  const data = window.STUDY_DATA;
  if (!data || !data.flashcards || data.flashcards.length === 0) return;

  const mode = data.mode;
  const cards = data.flashcards;
  let index = 0;
  let flipped = false;
  let answered = false; // study mode: has user checked this card
  let score = 0;
  const countedCorrectById = new Set();
  const FLIP_DURATION_MS = 500;
  const POST_FLIP_ANIM_BUFFER_MS = 5;
  const COUNTDOWN_STEP_MS = 1000;
  let resultAnimTimer = null;

  const cardEl = document.getElementById("flashcard");
  const frontEl = document.getElementById("cardFront");
  const backEl = document.getElementById("cardBack");
  const resultEl = document.getElementById("cardResult");
  const counterEl = document.getElementById("cardCounter");
  const progressFillEl = document.getElementById("progressFill");
  const scoreTextEl = document.getElementById("scoreText");
  const resultsScreenEl = document.getElementById("resultsScreen");
  const resultsScoreTextEl = document.getElementById("resultsScoreText");
  const resultsPercentTextEl = document.getElementById("resultsPercentText");
  const introScreenEl = document.getElementById("introScreen");
  const studyHeaderEl = document.getElementById("studyHeader");
  const introDeckNameEl = document.getElementById("introDeckName");
  const introSubtextEl = document.getElementById("introSubtext");
  const studyAreaEl = document.getElementById("studyArea");
  const countdownTextEl = document.getElementById("countdownText");
  const btnRestartStudyEl = document.getElementById("btnRestartStudy");
  const btnPrev = document.getElementById("btnPrev");
  const btnNextCard = document.getElementById("btnNextCard");

  const answerInput = document.getElementById("answerInput");
  const btnCheck = document.getElementById("btnCheck");
  const btnFlip = document.getElementById("btnFlip");

  function normalize(s) {
    return (s || "").trim().toLowerCase();
  }

  function renderCard() {
    const card = cards[index];
    if (!card) return;
    frontEl.textContent = card.front;
    backEl.textContent = card.back;
    resultEl.textContent = "";
    resultEl.className = "flashcard-result";
    updateCounter();
  }

  function updateCounter() {
    if (counterEl) counterEl.textContent = index + 1 + " / " + cards.length;
    if (progressFillEl) {
      const progressPct = ((index + 1) / cards.length) * 100;
      progressFillEl.style.width = progressPct + "%";
    }
  }

  function updateScore() {
    if (scoreTextEl) scoreTextEl.textContent = "Score: " + score + " / " + cards.length;
  }

  function showResults() {
    if (!resultsScreenEl) return;
    const percent = Math.round((score / cards.length) * 100);
    if (resultsScoreTextEl) {
      resultsScoreTextEl.textContent = "You scored " + score + " / " + cards.length;
    }
    if (resultsPercentTextEl) {
      resultsPercentTextEl.textContent = percent + "%";
    }
    if (studyAreaEl) studyAreaEl.classList.add("is-hidden");
    resultsScreenEl.classList.remove("is-hidden");
  }

  function resetSession() {
    score = 0;
    countedCorrectById.clear();
    updateScore();
    if (resultsScreenEl) resultsScreenEl.classList.add("is-hidden");
    if (studyAreaEl) studyAreaEl.classList.remove("is-hidden");
    goToCard(0);
    if (answerInput) answerInput.focus();
  }

  function setFlipped(value) {
    flipped = value;
    if (cardEl) cardEl.setAttribute("data-flipped", value ? "true" : "false");
  }

  function playResultAnimation(isCorrect) {
    if (!cardEl) return;
    cardEl.classList.remove("anim-correct", "anim-wrong");
    // Force reflow so repeated answers re-trigger animation.
    void cardEl.offsetWidth;
    cardEl.classList.add(isCorrect ? "anim-correct" : "anim-wrong");
    setTimeout(function () {
      if (cardEl) cardEl.classList.remove("anim-correct", "anim-wrong");
    }, 520);
  }

  function scheduleResultAnimationAfterFlip(isCorrect) {
    if (resultAnimTimer) clearTimeout(resultAnimTimer);
    resultAnimTimer = setTimeout(function () {
      playResultAnimation(isCorrect);
      resultAnimTimer = null;
    }, FLIP_DURATION_MS + POST_FLIP_ANIM_BUFFER_MS);
  }

  function goToCard(i) {
    if (i < 0 || i >= cards.length) return;
    index = i;
    flipped = false;
    answered = false;
    setFlipped(false);
    renderCard();
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNextCard) {
      if (mode === "study") {
        btnNextCard.disabled = true;
      } else {
        btnNextCard.disabled = index === cards.length - 1;
      }
    }
    if (mode === "study") {
      if (answerInput) answerInput.value = "";
      if (btnCheck) btnCheck.disabled = false;
    }
  }

  function flipCard() {
    setFlipped(!flipped);
  }

  // Study: check answer and show result on back
  function checkAnswer() {
    if (mode !== "study" || answered) return;
    const card = cards[index];
    const userAnswer = answerInput ? normalize(answerInput.value) : "";
    const correctAnswer = normalize(card.back);
    const isCorrect = userAnswer === correctAnswer;

    resultEl.textContent = isCorrect ? "Correct!" : "Wrong";
    resultEl.className = "flashcard-result " + (isCorrect ? "correct" : "wrong");
    if (isCorrect && !countedCorrectById.has(card.id)) {
      countedCorrectById.add(card.id);
      score += 1;
      updateScore();
    }
    answered = true;
    if (btnCheck) btnCheck.disabled = true;
    if (btnNextCard) btnNextCard.disabled = false;
    setFlipped(true);
    scheduleResultAnimationAfterFlip(isCorrect);
  }

  // Study: move to next card after checking
  function studyNext() {
    if (!answered) return;
    if (index < cards.length - 1) {
      goToCard(index + 1);
    } else {
      showResults();
    }
  }

  // Preview: flip
  if (btnFlip) btnFlip.addEventListener("click", flipCard);

  // Study: check and next
  if (btnCheck) btnCheck.addEventListener("click", checkAnswer);

  // Prev / Next card
  if (btnPrev) btnPrev.addEventListener("click", function () { goToCard(index - 1); });
  if (btnNextCard) {
    btnNextCard.addEventListener("click", function () {
      if (mode === "study") {
        studyNext();
      } else {
        goToCard(index + 1);
      }
    });
  }

  // Study: Enter to check
  if (mode === "study" && answerInput) {
    answerInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!answered) checkAnswer();
        else if (index < cards.length - 1) studyNext();
      }
    });
  }

  function startStudy() {
    if (!introScreenEl || !studyAreaEl) return goToCard(0);
    if (introSubtextEl) introSubtextEl.textContent = "Get Ready";
    if (countdownTextEl) countdownTextEl.textContent = "";

    // Sequence: Deck name fade in -> Get Ready fade in -> countdown appears.
    if (introDeckNameEl) introDeckNameEl.classList.remove("is-visible");
    if (introSubtextEl) introSubtextEl.classList.remove("is-visible");
    if (countdownTextEl) countdownTextEl.classList.remove("is-visible");

    setTimeout(function () {
      if (introDeckNameEl) introDeckNameEl.classList.add("is-visible");
    }, 120);

    setTimeout(function () {
      if (introSubtextEl) introSubtextEl.classList.add("is-visible");
    }, 560);

    setTimeout(function () {
      if (countdownTextEl) countdownTextEl.classList.add("is-visible");
      let count = 3;
      if (countdownTextEl) countdownTextEl.textContent = String(count);
      const timer = setInterval(function () {
        count -= 1;
        if (count > 0) {
          if (countdownTextEl) countdownTextEl.textContent = String(count);
        } else if (count === 0) {
          if (countdownTextEl) countdownTextEl.textContent = "Start!";
        } else {
          clearInterval(timer);
          introScreenEl.classList.add("is-hidden");
          if (studyHeaderEl) studyHeaderEl.classList.remove("is-hidden");
          studyAreaEl.classList.remove("is-hidden");
          goToCard(0);
          if (answerInput) answerInput.focus();
        }
      }, COUNTDOWN_STEP_MS);
    }, 1000);
  }

  updateScore();
  if (mode === "study") {
    startStudy();
    if (btnRestartStudyEl) {
      btnRestartStudyEl.addEventListener("click", resetSession);
    }
  } else {
    goToCard(0);
  }
})();
