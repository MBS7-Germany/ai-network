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

app.post("/search", (req, res) => {
  const { query } = req.body;

  const results = applicants.map((a, i) => ({
    model: a.model || "Model " + i,
    answer: "Antwort für: " + query,
    score: Math.random() * 100
  }));

  leaderboard = results.sort((a,b)=>b.score-a.score);

  res.json({ results: leaderboard });
});

app.listen(process.env.PORT || 5000);
