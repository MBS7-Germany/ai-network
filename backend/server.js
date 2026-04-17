const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

let applicants = [];
let leaderboard = [];

app.post("/apply", (req, res) => {
  applicants.push(req.body);
  res.json({ success: true });
});

app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

 app.post("/search", async (req, res) => {
  const { query } = req.body;

  try {
    // OpenAI Request 1
    const r1 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: query }]
      })
    });

    const d1 = await r1.json();

    // OpenAI Request 2 (leicht anders formuliert)
    const r2 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Answer very short and clear" },
          { role: "user", content: query }
        ]
      })
    });

    const d2 = await r2.json();

    const results = [
      {
        model: "OpenAI Normal",
        answer: d1.choices?.[0]?.message?.content || "Keine Antwort",
        score: Math.random()
      },
      {
        model: "OpenAI Fast",
        answer: d2.choices?.[0]?.message?.content || "Keine Antwort",
        score: Math.random()
      }
    ];

    // Ranking
    results.sort((a, b) => b.score - a.score);

    res.json({ results });

  } catch (err) {
    res.json({ error: err.message });
  }
});


app.listen(process.env.PORT || 5000);
