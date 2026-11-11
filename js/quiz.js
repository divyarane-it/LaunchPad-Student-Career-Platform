
// ==========================================
// LAUNCHPAD - INTERACTIVE SKILL QUIZ
// ==========================================

let currentQuizUser = null;
let currentQuestion = 0;
let userAnswers = [];
let quizTime = 600;
let quizTimerInterval = null;
let quizSubmitted = false;

const quizQuestions = [
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Transfer Machine Language",
            "Hyper Tool Multi Language",
            "Home Text Making Language"
        ],
        answer: 0
    },
    {
        question: "Which language is used to style web pages?",
        options: ["Python", "CSS", "Java", "SQL"],
        answer: 1
    },
    {
        question: "Which keyword declares a constant in JavaScript?",
        options: ["var", "let", "const", "static"],
        answer: 2
    },
    {
        question: "Which database language is used to retrieve data?",
        options: ["HTML", "CSS", "SQL", "XML"],
        answer: 2
    },
    {
        question: "What does API stand for?",
        options: [
            "Application Programming Interface",
            "Advanced Program Internet",
            "Applied Programming Input",
            "Application Process Integration"
        ],
        answer: 0
    },
    {
        question: "Which Git command saves changes to the local repository?",
        options: ["git push", "git commit", "git pull", "git clone"],
        answer: 1
    },
    {
        question: "Which HTML tag creates a hyperlink?",
        options: ["<link>", "<href>", "<a>", "<url>"],
        answer: 2
    },
    {
        question: "Which method converts JSON text into a JavaScript object?",
        options: [
            "JSON.stringify()",
            "JSON.parse()",
            "JSON.convert()",
            "JSON.object()"
        ],
        answer: 1
    },
    {
        question: "What does responsive web design mean?",
        options: [
            "A website loads only on computers",
            "A website adapts to different screen sizes",
            "A website has only animations",
            "A website uses only JavaScript"
        ],
        answer: 1
    },
    {
        question: "Which of these is a version control system?",
        options: ["Git", "MySQL", "Figma", "Chrome"],
        answer: 0
    }
];

// ==========================================
// INITIALIZE QUIZ
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const client = window.supabaseClient;

    if (!client) {
        alert("Supabase connection failed.");
        return;
    }

    const { data: { session }, error } =
        await client.auth.getSession();

    if (error || !session) {
        window.location.href = "login.html";
        return;
    }

    currentQuizUser = session.user;

    const fullName =
        currentQuizUser.user_metadata?.full_name ||
        currentQuizUser.email?.split("@")[0] ||
        "Student";

    const initial = fullName.charAt(0).toUpperCase();

    document.getElementById("sidebarUserName").textContent = fullName;
    document.getElementById("userAvatar").textContent = initial;
    document.getElementById("topbarAvatar").textContent = initial;

    document.getElementById("startQuizBtn")
        .addEventListener("click", startQuiz);

    document.getElementById("previousBtn")
        .addEventListener("click", previousQuestion);

    document.getElementById("nextBtn")
        .addEventListener("click", nextQuestion);

    document.getElementById("submitQuizBtn")
        .addEventListener("click", () => finishQuiz(false));

    document.getElementById("retryQuizBtn")
        .addEventListener("click", resetQuiz);

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    menuBtn?.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

});

// ==========================================
// START QUIZ
// ==========================================

function startQuiz() {

    currentQuestion = 0;
    userAnswers = Array(quizQuestions.length).fill(null);
    quizTime = 600;
    quizSubmitted = false;

    document.getElementById("quizIntro").hidden = true;
    document.getElementById("quizResult").hidden = true;
    document.getElementById("quizContainer").hidden = false;

    renderQuestion();
    startTimer();

}

// ==========================================
// DISPLAY QUESTION
// ==========================================

function renderQuestion() {

    const question = quizQuestions[currentQuestion];

    document.getElementById("questionCounter").textContent =
        `Question ${currentQuestion + 1} of ${quizQuestions.length}`;

    document.getElementById("questionText").textContent =
        question.question;

    document.getElementById("quizProgressBar").style.width =
        `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;

    const optionsList = document.getElementById("optionsList");

    optionsList.innerHTML = question.options.map((option, index) => `
        <label class="quiz-option ${userAnswers[currentQuestion] === index ? "selected" : ""}">
            <input
                type="radio"
                name="quizAnswer"
                value="${index}"
                ${userAnswers[currentQuestion] === index ? "checked" : ""}
            >
            <span>${escapeQuizHTML(option)}</span>
        </label>
    `).join("");

    optionsList.querySelectorAll("input").forEach(input => {

        input.addEventListener("change", () => {

            userAnswers[currentQuestion] = Number(input.value);

            renderQuestion();

        });

    });

    document.getElementById("previousBtn").disabled =
        currentQuestion === 0;

    const isLastQuestion =
        currentQuestion === quizQuestions.length - 1;

    document.getElementById("nextBtn").hidden = isLastQuestion;

    document.getElementById("submitQuizBtn").hidden = !isLastQuestion;

}

// ==========================================
// PREVIOUS QUESTION
// ==========================================

function previousQuestion() {

    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }

}

// ==========================================
// NEXT QUESTION
// ==========================================

function nextQuestion() {

    if (currentQuestion < quizQuestions.length - 1) {
        currentQuestion++;
        renderQuestion();
    }

}

// ==========================================
// QUIZ TIMER
// ==========================================

function startTimer() {

    clearInterval(quizTimerInterval);

    updateTimerDisplay();

    quizTimerInterval = setInterval(() => {

        quizTime--;

        updateTimerDisplay();

        if (quizTime <= 0) {
            finishQuiz(true);
        }

    }, 1000);

}

function updateTimerDisplay() {

    const minutes = Math.floor(quizTime / 60);
    const seconds = quizTime % 60;

    document.getElementById("quizTimer").textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}

// ==========================================
// FINISH QUIZ
// ==========================================

async function finishQuiz(timeUp) {

    if (quizSubmitted) return;

    quizSubmitted = true;

    clearInterval(quizTimerInterval);

    const score = quizQuestions.reduce((total, question, index) => {
        return total + (userAnswers[index] === question.answer ? 1 : 0);
    }, 0);

    const timeTaken = 600 - quizTime;

    document.getElementById("quizContainer").hidden = true;
    document.getElementById("quizResult").hidden = false;

    document.getElementById("finalScore").textContent =
        `${score}/${quizQuestions.length}`;

    let message;
    let description;

    if (score >= 9) {
        message = "Outstanding Performance! 🌟";
        description = "Excellent work! You have demonstrated strong technology knowledge.";
    } else if (score >= 7) {
        message = "Great Job! 🎉";
        description = "You have a good understanding of technology. Keep learning!";
    } else if (score >= 5) {
        message = "Good Effort! 💪";
        description = "You are making progress. Practice regularly to improve.";
    } else {
        message = "Keep Practicing! 📚";
        description = "Every attempt helps you learn. Review the basics and try again.";
    }

    if (timeUp) {
        description += " The timer ran out, so the quiz was submitted automatically.";
    }

    document.getElementById("resultMessage").textContent = message;
    document.getElementById("resultDescription").textContent = description;

    await saveQuizResult(score, timeTaken);

}

// ==========================================
// SAVE RESULT TO SUPABASE
// ==========================================

async function saveQuizResult(score, timeTaken) {

    const { error } = await window.supabaseClient
        .from("quiz_results")
        .insert([{
            user_id: currentQuizUser.id,
            quiz_title: "Technology Knowledge Quiz",
            score: score,
            total_questions: quizQuestions.length,
            time_taken_seconds: timeTaken
        }]);

    if (error) {
        console.error("Quiz result saving failed:", error);
        document.getElementById("resultDescription").textContent +=
            " Your result could not be saved to your account.";
    }

}

// ==========================================
// RETRY QUIZ
// ==========================================

function resetQuiz() {

    clearInterval(quizTimerInterval);

    document.getElementById("quizResult").hidden = true;
    document.getElementById("quizIntro").hidden = false;

}

// ==========================================
// HTML SECURITY HELPER
// ==========================================

function escapeQuizHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}
