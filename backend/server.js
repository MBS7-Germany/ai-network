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
        content: "Bewerte welche Antwort besser ist. Antworte nur mit 1 oder 2."
      },
      {
        role: "user",
        content: `
Frage: ${query}

Antwort 1:
${results[0].answer}

Antwort 2:
${results[1].answer}

Welche ist besser? (nur 1 oder 2)
        `
      }
    ]
  })
});

const judgeData = await judge.json();
const decision = judgeData.choices?.[0]?.message?.content?.trim();

// Scores setzen
results[0].score = decision === "1" ? 1 : 0;
results[1].score = decision === "2" ? 1 : 0;

// sortieren
results.sort((a, b) => b.score - a.score);
