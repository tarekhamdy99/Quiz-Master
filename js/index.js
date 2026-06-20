//^ Import Neccessary Classes From Them Files

import Quiz from "./quiz.js";
import Question from "./question.js";
import showErrorPopup from "./popup.js";

//^ Declaration Global Variables
const setupForm = document.getElementById("quizOptions");
const startBtn = document.getElementById("startQuiz");
const questionsContainer = document.getElementById("questionsContainer");

//^ When Starting The Game
startBtn.addEventListener("click", async () => {
  //? Get The Values From Form
  const name = document.getElementById("playerName").value;
  const category = document.getElementById("categoryMenu").value;
  const difficulty = document.getElementById("difficultyOptions").value;
  const count = document.getElementById("questionsNumber").value;

  //? Form Validation
  if (!count || count < 1 || count > 50) {
    showErrorPopup(
      "Please supply a valid question count value between 1 and 50",
    );
    return;
  }

  if (!name) {
    showErrorPopup("Please Enter Your Name");
    return;
  }

  //? Hide the landing setup panel layout screen view block completely
  setupForm.style.display = "none";

  //? Inject the Loading Spinner HTML
  questionsContainer.innerHTML = `
    <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading Questions...</p>
    </div>
  `;

  try {
    //? Start Game And Get Questions
    const activeQuiz = new Quiz(category, difficulty, count, name);
    await activeQuiz.getQuestions();

    //? The Current Question
    const gameQuestionRound = new Question(
      activeQuiz,
      questionsContainer,
      () => {
        questionsContainer.innerHTML = "";
        setupForm.removeAttribute("style");
      },
    );

    //? Show The Current Question
    gameQuestionRound.displayQuestion();
  } catch (error) {
    //? On Error Condition
    console.error(error);
    questionsContainer.innerHTML = `
        <div class="game-card error-card">
          <div class="error-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h3 class="error-title">Oops! Something went wrong</h3>
          <p class="error-message">${error.message}</p>
          <button class="btn-play retry-btn" id="btnErrRetry"><i class="fa-solid fa-rotate-right"></i> Try Again</button>
        </div>
     `;

    //? Restart The Game On Error Condition
    document.getElementById("btnErrRetry").addEventListener("click", () => {
      questionsContainer.innerHTML = "";
      setupForm.removeAttribute("style");
    });
  }
});
