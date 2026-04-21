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

// 🔥 NEUES RANKING
results.forEach(r => {
  let score = 0;

  const text = r.answer.toLowerCase();

  // kürzer = besser
  score += Math.max(0, 200 - text.length);

  // gute Wörter = besser
  if (text.includes("ist")) score += 20;
  if (text.includes("bedeutet")) score += 20;

  // schlechte Zeichen = schlechter
  if (text.includes("...")) score -= 10;

  r.score = score;
});

// sortieren
results.sort((a, b) => b.score - a.score);
