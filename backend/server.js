const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/search", async (req, res) => {
  const query = req.body.query;

  try {
    // 🔥 2 AI Antworten holen
    const r1 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: query }
        ]
      })
    });

    const d1 = await r1.json();

    const r2 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: "Kurz antworten: " + query }
        ]
      })
    });

    const d2 = await r2.json();

    // Antworten sammeln
    const results = [
  {
    model: "OpenAI Normal",
    answer: d1.choices?.[0]?.message?.content || "Keine Antwort"
  },
  {
    model: "OpenAI Fast",
    answer: d2.choices?.[0]?.message?.content || "Keine Antwort"
  }
];

// 🔥 3. Antwort hinzufügen
const r3 = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: "Erkläre einfach: " + query }
    ]
  })
});

const d3 = await r3.json();

results.push({
  model: "OpenAI Simple",
  answer: d3.choices?.[0]?.message?.content || "Keine Antwort"
});

    // 🔥 AI bewertet die Antworten
    const judge = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Welche Antwort ist die beste? Antworte nur mit 1, 2 oder 3."
      },
      {
        role: "user",
        content: `
Frage: ${query}

1:
${results[0].answer}

2:
${results[1].answer}

3:
${results[2].answer}

Welche ist am besten?
        `
      }
    ]
  })
});

const judgeData = await judge.json();
const raw = judgeData.choices?.[0]?.message?.content || "";

// Gewinner bestimmen
let winner = 0;
if (raw.includes("2")) winner = 1;
if (raw.includes("3")) winner = 2;

// Score setzen
results.forEach((r, i) => {
  r.score = i === winner ? 1 : 0;
});

// sortieren
results.sort((a, b) => b.score - a.score);
