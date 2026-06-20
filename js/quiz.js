//^ Create Class For Quiz

export default class Quiz {
  //? Create Constructor for Quiz
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = Number(numberOfQuestions);
    this.playerName = playerName.trim() || "Player One";
    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }

  //? Create The API Link To Call Server For Getting Questions
  buildApiUrl() {
    const baseUrl = "https://opentdb.com/api.php";

    let queryString = `amount=${this.numberOfQuestions}&type=multiple`;
    queryString += this.category ? `&category=${this.category}` : "";
    queryString += this.difficulty ? `&difficulty=${this.difficulty}` : "";
    return `${baseUrl}?${queryString}`;
  }

  //? Calling Server For Getting Questions
  async getQuestions() {
    const url = this.buildApiUrl();
    const response = await fetch(url);

    //? check if the calling success to server
    if (!response.ok) {
      throw new Error(
        `Network failure responding with code: ${response.status}`,
      );
    }

    const data = await response.json();

    //? when response_code 0 is successful execution
    if (data.response_code !== 0) {
      throw new Error(
        "Could not find enough questions for this combination. Try reducing the limit!",
      );
    }

    this.questions = data.results;
    return this.questions;
  }

  //? Increase The Score of the player
  incrementScore() {
    this.score++;
  }

  //? Get The Current Qustion
  getCurrentQuestion() {
    if (
      this.currentQuestionIndex >= 0 &&
      this.currentQuestionIndex < this.questions.length
    )
      return this.questions[this.currentQuestionIndex];
    return null;
  }

  //? Move To The Next Qustion
  nextQuestion() {
    this.currentQuestionIndex++;
    return !this.isComplete();
  }

  //? Check IF All Questions are Ending
  isComplete() {
    return this.currentQuestionIndex >= this.questions.length;
  }

  //? Calculate The Current Score Percentage
  getScorePercentage() {
    if (this.numberOfQuestions === 0) return 0;
    return Math.round((this.score / this.numberOfQuestions) * 100);
  }

  //? Get The High Score
  getHighScores() {
    try {
      const storedScores = localStorage.getItem("quizHighScores");
      return storedScores ? JSON.parse(storedScores) : [];
    } catch (e) {
      console.error("Failed accessing localStorage tracking partitions:", e);
      return [];
    }
  }

  //? CHeck IF The Current Score IF The High Score
  isHighScore() {
    const currentPercentage = this.getScorePercentage();
    const records = this.getHighScores();

    if (records.length < 10) return true;

    //? Check against the lowest score in the sorted list
    const baselineMin = records[records.length - 1].percentage;
    return currentPercentage > baselineMin;
  }

  //? Recording the Scores To The Local Storage
  saveHighScore() {
    const records = this.getHighScores();
    const newRecord = {
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toLocaleDateString(),
    };

    records.push(newRecord);
    //? Sort highest percentage first
    records.sort((a, b) => b.percentage - a.percentage);

    // Cap ranking listing sizes strictly to Top 10 items
    const trimmedRecords = records.slice(0, 10);
    localStorage.setItem("quizHighScores", JSON.stringify(trimmedRecords));
  }

  //? Results Card
  endQuiz() {
    const finalPercentage = this.getScorePercentage();
    const qualifiesAsHighScore = this.isHighScore();

    if (qualifiesAsHighScore) {
      this.saveHighScore();
    }

    const highScoresList = this.getHighScores();

    //? Map array values dynamically into HTML string entries
    const medals = ["gold", "silver", "bronze"];
    const rankingsHtml = highScoresList
      .map((entry, index) => {
        const rankClass = index < 3 ? ` ${medals[index]}` : "";
        return `
        <li class="leaderboard-item${rankClass}">
          <span class="leaderboard-rank">#${index + 1}</span>
          <span class="leaderboard-name">${entry.name}</span>
          <span class="leaderboard-score">${entry.percentage}%</span>
        </li>
      `;
      })
      .join("");

    const newRecordBadge = qualifiesAsHighScore
      ? `<div class="new-record-badge"><i class="fa-solid fa-star"></i> New High Score!</div>`
      : "";

    return `
      <div class="game-card results-card">
        <h2 class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
        <p class="results-percentage">${finalPercentage}% Accuracy</p>
        
        ${newRecordBadge}
        
        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>
          <ul class="leaderboard-list">
            ${rankingsHtml}
          </ul>
        </div>
        
        <div class="action-buttons">
          <button class="btn-restart" id="btnPlayAgain">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }
}
