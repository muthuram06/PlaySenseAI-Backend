require("dotenv").config();

const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://play-sense-ai.vercel.app",
    ],
  })
);


app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "PlaySense AI",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.get("/api/match", (req, res) => {
  res.json({
    success: true,
    match: {
      battingTeam: "Metro Falcons",
      bowlingTeam: "Coastal Titans",
      score: 126,
      wickets: 3,
      overs: 13,
      currentRunRate: 9.69,
      isDemo: true,
    },
  });
});

app.get("/api/players", (req, res) => {
  res.json({
    success: true,
    players: [
      {
        name: "Arjun Mehta",
        role: "Opening batter",
        runs: 58,
        balls: 34,
        fours: 6,
        sixes: 2,
        strikeRate: 170.59,
      },
      {
        name: "Dev Kapoor",
        role: "Middle-order batter",
        runs: 32,
        balls: 21,
        fours: 3,
        sixes: 1,
        strikeRate: 152.38,
      },
      {
        name: "Rohan Iyer",
        role: "All-rounder",
        runs: 14,
        balls: 9,
        fours: 1,
        sixes: 1,
        strikeRate: 155.56,
      },
    ],
  });
});

app.use("/api/chat", chatRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`PlaySense AI API running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `AI mode: ${process.env.GEMINI_API_KEY ? "Gemini configured" : "Local fallback"}`
  );
});