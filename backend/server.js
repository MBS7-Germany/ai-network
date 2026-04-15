import express from "express";
import cors from "cors";

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

  const fakeResults = [
    {
      model: "GPT-like",
      answer: "Antwort auf: " + query,
      score: Math.random()
    },
    {
      model: "DeepSearch",
      answer: "Ich denke das bedeutet: " + query,
      score: Math.random()
    },
    {
      model: "FastAI",
      answer: "Kurze Antwort: " + query,
      score: Math.random()
    }
  ];

  // Ranking
  fakeResults.sort((a, b) => b.score - a.score);

  res.json({
    results: fakeResults
  });
});

app.listen(process.env.PORT || 5000);
