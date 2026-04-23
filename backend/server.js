const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/search", async (req, res) => {
  const query = req.body.query;

  try {
    // 🔥 1. Antwort
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

    // 🔥 2. Antwort
    const r2 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Kurz antworten: " + query }]
      })
    });
    const d2 = await r2.json();

    // 🔥 3. Antwort
    const r3 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Erkläre einfach: " + query }]
      })
    });
    const d3 = await r3.json();

    // 🔥 Antworten sammeln
    const results = [
      {
        model: "OpenAI Normal",
        answer: d1.choices?.[0]?.message?.content || "Keine Antwort"
      },
      {
        model: "OpenAI Fast",
        answer: d2.choices?.[0]?.message?.content || "Keine Antwort"
      },
      {
        model: "OpenAI Simple",
        answer: d3.choices?.[0]?.message?.content || "Keine Antwort"
      }
    ];

    // 🔥 AI Ranking (beste Antwort bestimmen)
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
            content: "Bewerte welche Antwort am besten ist. Antworte nur mit 1, 2 oder 3."
          },
          {
            role: "user",
            content: `
Frage: ${query}

Antwort 1:
${results[0].answer}

Antwort 2:
${results[1].answer}

Antwort 3:
${results[2].answer}

Welche ist die beste? (nur 1, 2 oder 3)
            `
          }
        ]
      })
    });

    const judgeData = await judge.json();
    const raw = judgeData.choices?.[0]?.message?.content || "";

    let bestIndex = 0;
    if (raw.includes("2")) bestIndex = 1;
    if (raw.includes("3")) bestIndex = 2;

    // 🔥 Beste Antwort nach oben
    const bestAnswerObj = results.splice(bestIndex, 1)[0];
    results.unshift(bestAnswerObj);

    // 🔥 Zusammenfassung
    const bestAnswer = results[0].answer;

    const summaryRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "Fasse die Antwort kurz und einfach in 1-2 Sätzen zusammen."
          },
          {
            role: "user",
            content: bestAnswer
          }
        ]
      })
    });

    const summaryData = await summaryRes.json();
    const summary =
      summaryData.choices?.[0]?.message?.content ||
      "Keine Zusammenfassung verfügbar";

    // 🔥 Antwort senden
    res.json({ results, summary });

  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(10000, () => console.log("Server läuft"));
