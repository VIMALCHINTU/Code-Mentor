# 🧠 Code Mentor

An AI-powered Chrome extension that helps users solve and understand coding problems from platforms like LeetCode and other coding websites.

## 🚀 Features

* Extracts coding problems from the currently active browser tab
* Supports multiple coding platforms
* Generates direct solutions
* Step-by-step learning mode
* Problem explanation
* Algorithm approach
* Simple visualization
* Helpful hints
* Final solution code
* Supports:

  * JavaScript
  * Python
  * Java
  * C++
  * C
* Copy generated code with one click

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Chrome Extension API

### Backend

* Node.js
* Express.js
* Gemini AI API

## 📁 Project Structure

```text
Code-Mentor/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── ...
│
├── .gitignore
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create a `.env` file

```env
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the backend

```bash
node server.js
```

The backend will run on:

```text
http://localhost:5000
```

## 🖥️ Run the Extension

Go to the frontend folder:

```bash
cd frontend
npm install
npm run build
```

Then open Chrome and go to:

```text
chrome://extensions
```

1. Enable Developer Mode
2. Click Load Unpacked
3. Select the generated `dist` folder

## 🔄 How It Works

```text
User opens a coding problem
          ↓
Opens Code Mentor extension
          ↓
Selects Direct Code or Learn Mode
          ↓
Selects programming language
          ↓
Extension extracts webpage content
          ↓
Data is sent to backend
          ↓
Backend sends problem to Gemini AI
          ↓
AI analyzes the coding problem
          ↓
Response is displayed in the extension
```

## 📚 Learning Mode

Learning Mode provides:

### Screen 1

* Problem explanation
* Algorithm approach

### Screen 2

* Visualization
* Hint

### Screen 3

* Complete solution code

The AI is called once, and all learning data is returned together. The extension then switches between screens without making additional API requests.

## 🔒 Security

The Gemini API key is stored in the backend `.env` file.

Never upload your `.env` file to GitHub.

## 👨‍💻 Author

Vimal Kumar
