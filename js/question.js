//^ Create Class For Question

export default class Question {
  //? Create Constructor for Question
  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    this.questionData = quiz.getCurrentQuestion();
    this.index = quiz.currentQuestionIndex;

    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);

    this.wrongAnswers = this.questionData.incorrect_answers.map((ans) =>
      this.decodeHtml(ans),
    );
    this.allAnswers = this.shuffleAnswers();

    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 30;

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  //? Turn the answers into the readable strings
  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent || "";
  }

  //? Randomly re-ordered array of potential solutions.
  shuffleAnswers() {
    const array = [this.correctAnswer, ...this.wrongAnswers];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  //? Check The Progress during playing
  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }

  //? Show Question
  displayQuestion() {
    const progressPercent = this.getProgress();
    const difficultyLabel =
      this.quiz.difficulty.charAt(0).toUpperCase() +
      this.quiz.difficulty.slice(1);
    const buttonsHtml = this.allAnswers
      .map(
        (answer, idx) => `
      <button class="answer-btn" data-answer="${answer.replace(/"/g, "&quot;")}">
        <span class="answer-key">${idx + 1}</span>
        <span class="answer-text">${answer}</span>
      </button>
    `,
      )
      .join("");

    const questionCardHtml = `
      <div class="game-card question-card">
        <div class="xp-bar-container">
          <div class="xp-bar-header">
            <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
            <span class="xp-value">Question ${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-badge category">
            <i class="fa-solid fa-bookmark"></i>
            <span>${this.category}</span>
          </div>
          <div class="stat-badge difficulty ${this.quiz.difficulty.toLowerCase()}">
            <i class="fa-solid fa-face-smile"></i>
            <span>${difficultyLabel}</span>
          </div>
          <div class="stat-badge timer" id="timerBadge">
            <i class="fa-solid fa-stopwatch"></i>
            <span class="timer-value" id="timerText">${this.timeRemaining}</span>s
          </div>
          <div class="stat-badge counter">
            <i class="fa-solid fa-gamepad"></i>
            <span>${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
        </div>

        <h2 class="question-text">${this.question}</h2>

        <div class="answers-grid" id="answersGrid">
          ${buttonsHtml}
        </div>

        <p class="keyboard-hint">
          <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
        </p>

        <div class="score-panel">
          <div class="score-item">
            <div class="score-item-label">Score</div>
            <div class="score-item-value">${this.quiz.score}</div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = questionCardHtml;

    this.addEventListeners();
    this.startTimer();
  }

  //? Organise Buttons' Event
  addEventListeners() {
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", () => this.checkAnswer(button));
    });

    document.addEventListener("keydown", this.handleKeyDown);
  }

  //? Organise the Button of keyboard Event
  handleKeyDown(event) {
    const validKeys = ["1", "2", "3", "4"];
    if (validKeys.includes(event.key)) {
      const index = parseInt(event.key) - 1;
      const buttons = this.container.querySelectorAll(".answer-btn");
      if (buttons[index]) {
        this.checkAnswer(buttons[index]);
      }
    }
  }

  //? Remove Keyboard Event Listener
  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  //? Initiates the 1-second interval round timer countdown logic
  startTimer() {
    const timerText = this.container.querySelector("#timerText");
    const timerBadge = this.container.querySelector("#timerBadge");

    //? Show Time OF The Qustion
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;

      if (timerText) {
        timerText.textContent = this.timeRemaining;
      }

      //? Add warning style when Time is Lower Than 10s
      if (this.timeRemaining <= 10 && timerBadge) {
        timerBadge.classList.add("warning");
      }

      //? when finishing Time
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  //? Stop Timer When The Time Finished.
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  //? Evaluates the timeout fallback response when the clock hits zero.
  handleTimeUp() {
    this.answered = true;
    this.removeEventListeners();

    //? Disable all choice options instantly
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => btn.classList.add("disabled"));

    this.highlightCorrectAnswer();

    //? Dynamically insert "TIME'S UP!" feedback banner layout directly above the answers grid
    const answersGrid = this.container.querySelector("#answersGrid");
    if (answersGrid) {
      const timeUpDiv = document.createElement("div");
      timeUpDiv.className = "time-up-message";
      timeUpDiv.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;
      answersGrid.parentNode.insertBefore(timeUpDiv, answersGrid);
    }

    this.animateQuestion(500);
  }

  //? Processes chosen solution vectors against validated values.
  checkAnswer(choiceElement) {
    if (this.answered) return;
    this.answered = true;
    this.stopTimer();
    this.removeEventListeners();

    const selectedAnswer = choiceElement.dataset.answer;
    const isCorrect =
      selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase();

    const buttons = this.container.querySelectorAll(".answer-btn");

    if (isCorrect) {
      choiceElement.classList.add("correct");
      this.quiz.incrementScore();
    } else {
      choiceElement.classList.add("wrong");
      this.highlightCorrectAnswer();
    }

    //? Set other items into 'disabled' state views explicitly
    buttons.forEach((btn) => {
      if (btn !== choiceElement && !btn.classList.contains("correct-reveal")) {
        btn.classList.add("disabled");
      }
    });

    this.animateQuestion(500);
  }

  //? Flags correct answer selectors hidden among existing buttons.
  highlightCorrectAnswer() {
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      if (
        btn.dataset.answer.toLowerCase() === this.correctAnswer.toLowerCase()
      ) {
        //? If the user selected it correctly, it already has the 'correct' class, If they missed it or timed out, add the 'correct-reveal' class.
        if (!btn.classList.contains("correct")) {
          btn.classList.add("correct-reveal");
        }
      }
    });
  }

  //? Decides whether to continue delivering questions or close out calculations entirely.
  getNextQuestion() {
    const hasMore = this.quiz.nextQuestion();

    if (hasMore) {
      const nextQuestionInstance = new Question(
        this.quiz,
        this.container,
        this.onQuizEnd,
      );
      nextQuestionInstance.displayQuestion();
    } else {
      //? End game phase: inject scoreboard template metrics view block completely
      this.container.innerHTML = this.quiz.endQuiz();

      //? Wire up target event binding onto the newborn "Play Again" layout restart button handle
      const restartBtn = this.container.querySelector("#btnPlayAgain");
      if (restartBtn) {
        restartBtn.addEventListener("click", () => {
          this.onQuizEnd();
        });
      }
    }
  }

  //? Animation For Question
  animateQuestion(duration) {
    setTimeout(() => {
      const card = this.container.querySelector(".question-card");
      if (card) {
        card.classList.add("exit");
      }

      setTimeout(() => {
        this.getNextQuestion();
      }, duration);
    }, 1500);
  }
}
