import { useState } from "react";
import "./index.css"
function App() {
const [mode, setMode] = useState(null);
const [pageData, setPageData] = useState(null);
const [language, setLanguage] = useState("JavaScript");
const [isLoading, setIsLoading] = useState(false);
const [learnStep, setLearnStep] = useState(0);

const languages = [
"JavaScript",
"Python",
"Java",
"C++",
"C",
];

const copyCode = async (code) => {
try {
await navigator.clipboard.writeText(code);
alert("Code copied!");
} catch (error) {
console.error("Copy failed:", error);
}
};

const cleanPageContent = (text) => {
return text
.replace(/\n{3,}/g, "\n\n")
.replace(/[ \t]+/g, " ")
.trim()
.slice(0, 20000);
};

const analyzeCurrentPage = async (selectedMode) => {
try {
setIsLoading(true);
setPageData(null);


  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const results = await chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
    },
    func: () => {
      return {
        url: window.location.href,
        title: document.title,
        content: document.body.innerText,
      };
    },
  });

  const data = results[0].result;

  const cleanedData = {
    ...data,
    content: cleanPageContent(data.content),
  };

  const response = await fetch(
    "http://localhost:5000/analyze",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        mode: selectedMode,
        language,
        ...cleanedData,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.error || "Failed to connect to backend"
    );
  }

  const backendData = await response.json();

  console.log("Backend response:", backendData);

  setPageData(backendData);

  if (selectedMode === "learn") {
    setLearnStep(0);
  }

} catch (error) {
  console.error("Error:", error);

  setPageData({
    error: error.message,
  });

} finally {
  setIsLoading(false);
}


};

const goBack = () => {
setMode(null);
setPageData(null);
setIsLoading(false);
setLearnStep(0);
};

// =========================
// LEARN MODE
// =========================

const renderLearnMode = () => {
const answer = pageData?.answer;


// SCREEN 1
if (learnStep === 0) {
  return (
    <div className="result card">

      <div className="progress-info">
        Step 1 of 3
      </div>

      <h3>📖 Understand the Problem</h3>

      <div className="answer">
        {answer?.explanation}
      </div>

      <h3 className="section-title">
        💡 Approach
      </h3>

      <div className="answer">
        {answer?.approach}
      </div>

      <button
        className="next-button"
        onClick={() => setLearnStep(1)}
      >
        Continue →
      </button>

    </div>
  );
}

// SCREEN 2
if (learnStep === 1) {
  return (
    <div className="result card">

      <div className="progress-info">
        Step 2 of 3
      </div>

      <h3>👀 See How It Works</h3>

      <div className="visual-box">
        {answer?.visualization}
      </div>

      <h3 className="section-title">
        💡 Hint
      </h3>

      <div className="hint-box">
        {answer?.hint}
      </div>

      <div className="step-buttons">

        <button
          className="previous-button"
          onClick={() => setLearnStep(0)}
        >
          ← Back
        </button>

        <button
          className="next-button"
          onClick={() => setLearnStep(2)}
        >
          Show Code 💻
        </button>

      </div>

    </div>
  );
}

// SCREEN 3
return (
  <div className="result card">

    <div className="progress-info">
      Step 3 of 3
    </div>

    <div className="code-header">

      <div>
        <h3>💻 Solution Code</h3>

        <span className="language-tag">
          {language}
        </span>
      </div>

      <button
        className="copy-button"
        onClick={() =>
          copyCode(answer?.code)
        }
      >
        📋 Copy
      </button>

    </div>

    <pre className="code-box">
      <code>
        {answer?.code}
      </code>
    </pre>

    <button
      className="previous-button full-button"
      onClick={() => setLearnStep(1)}
    >
      ← Back to Hint
    </button>

  </div>
);


};

// =========================
// MODE SCREEN
// =========================

if (mode) {
return ( <div className="container">


    <div className="top-bar">

      <button
        className="back-button"
        onClick={goBack}
      >
        ← Back
      </button>

      <div className="brand-small">
        🧠 Code Mentor
      </div>

    </div>

    <div className="page-header">

      <h2>
        {mode === "direct"
          ? "🚀 Direct Code"
          : "🧠 Learn"}
      </h2>

      <p>
        {mode === "direct"
          ? "Get the solution instantly"
          : "Learn the problem in 3 simple steps"}
      </p>

    </div>

    {/* DIRECT MODE */}

    {mode === "direct" &&
      !isLoading &&
      !pageData && (
        <div className="card">

          <h3>Select Language</h3>

          <div className="language-buttons">

            {languages.map((lang) => (
              <button
                key={lang}
                className={`language-button ${
                  language === lang
                    ? "active"
                    : ""
                }`}
                onClick={() => setLanguage(lang)}
              >
                {lang}
              </button>
            ))}

          </div>

          <button
            className="generate-button"
            onClick={() =>
              analyzeCurrentPage("direct")
            }
          >
            🚀 Generate {language} Code
          </button>

        </div>
      )}

    {/* LEARN START */}

    {mode === "learn" &&
!isLoading &&
!pageData && ( <div className="card learn-start">


  <div className="learn-icon">🧠</div>

  <h3>Let's Understand This Problem</h3>

  <p>Select the language for the final solution.</p>

  <div className="language-buttons">
    {languages.map((lang) => (
      <button
        key={lang}
        className={`language-button ${
          language === lang ? "active" : ""
        }`}
        onClick={() => setLanguage(lang)}
      >
        {lang}
      </button>
    ))}
  </div>

  <button
    className="generate-button"
    onClick={() => analyzeCurrentPage("learn")}
  >
    Start Learning →
  </button>

</div>


)}


    {/* LOADING */}

    {isLoading && (
      <div className="loading card">

        <div className="loader"></div>

        <h3>Analyzing Problem...</h3>

        <p>
          AI is understanding the question.
        </p>

      </div>
    )}

    {/* ERROR */}

    {pageData?.error && (
      <div className="error card">

        <h3>⚠️ Something went wrong</h3>

        <p>{pageData.error}</p>

        <button
          className="retry-button"
          onClick={() => setPageData(null)}
        >
          Try Again
        </button>

      </div>
    )}

    {/* DIRECT CODE RESULT */}

    {pageData &&
      !pageData.error &&
      mode === "direct" && (
        <div className="result card">

          <div className="code-header">

            <div>
              <h3>💻 Solution Code</h3>

              <span className="language-tag">
                {language}
              </span>
            </div>

            <button
              className="copy-button"
              onClick={() =>
                copyCode(pageData.answer)
              }
            >
              📋 Copy
            </button>

          </div>

          <pre className="code-box">
            <code>
              {pageData.answer}
            </code>
          </pre>

          <button
            className="secondary-button"
            onClick={() => setPageData(null)}
          >
            Change Language
          </button>

        </div>
      )}

    {/* LEARN RESULT */}

    {pageData &&
      !pageData.error &&
      mode === "learn" &&
      renderLearnMode()}

  </div>
);

}

// =========================
// HOME SCREEN
// =========================

return ( <div className="container home">


  <div className="hero">

    <div className="logo">
      🧠
    </div>

    <h1>Code Mentor</h1>

    <p>
      Your AI coding assistant
    </p>

  </div>

  <div className="home-buttons">

    <button
      className="mode-button"
      onClick={() => setMode("direct")}
    >
      <span className="button-icon">
        🚀
      </span>

      <div>
        <strong>Direct Code</strong>

        <small>
          Get the solution instantly
        </small>
      </div>

      <span className="arrow">
        →
      </span>

    </button>

    <button
      className="mode-button"
      onClick={() => setMode("learn")}
    >
      <span className="button-icon">
        🧠
      </span>

      <div>
        <strong>Learn Step by Step</strong>

        <small>
          Understand before coding
        </small>
      </div>

      <span className="arrow">
        →
      </span>

    </button>

  </div>

  <p className="footer-text">
    Open a coding problem and start learning.
  </p>

</div>


);
}

export default App;
