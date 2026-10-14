
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Fictional demo match data for PlaySense AI.
const match = {
  battingTeam: "Metro Falcons",
  bowlingTeam: "Coastal Titans",
  score: 126,
  wickets: 3,
  overs: 13,
  currentRunRate: 9.69,
};

const players = [
  {
    name: "Arjun Mehta",
    role: "Opening batter",
    runs: 58,
    balls: 34,
    strikeRate: 170.59,
  },
  {
    name: "Dev Kapoor",
    role: "Middle-order batter",
    runs: 32,
    balls: 21,
    strikeRate: 152.38,
  },
  {
    name: "Rohan Iyer",
    role: "All-rounder",
    runs: 14,
    balls: 9,
    strikeRate: 155.56,
  },
];

// Local responses keep chat functional when Gemini is unavailable.
function localAnswer(question) {
  const q = question.toLowerCase();

  if (q.includes("strike rate")) {
    return (
      "Strike rate measures runs scored per 100 balls. " +
      "A strike rate of 170.59 means approximately 171 runs per " +
      "100 balls faced. In T20 cricket, that is an aggressive scoring " +
      "rate. Arjun Mehta's 58 runs from 34 balls in our fictional " +
      "demo match gives him a strike rate of about 170.59."
    );
  }

  if (q.includes("run rate") || q.includes("current rate")) {
    return (
      `The current run rate is ${match.currentRunRate} runs per over. ` +
      `${match.battingTeam} have scored ${match.score}/${match.wickets} ` +
      `after ${match.overs} overs in this fictional demo match.`
    );
  }

  if (
    q.includes("top scorer") ||
    q.includes("most runs") ||
    q.includes("highest scorer")
  ) {
    return (
      "Arjun Mehta is the leading scorer in our fictional demo data, " +
      "with 58 runs from 34 balls."
    );
  }

  if (
    q.includes("strategy") ||
    q.includes("what should") ||
    q.includes("batting plan")
  ) {
    return (
      "At 126/3 after 13 overs, the fictional Metro Falcons have " +
      "7 overs remaining. A possible strategy is to preserve wickets " +
      "while targeting scoring opportunities against weaker deliveries. " +
      "The ideal approach depends on the batters at the crease, pitch " +
      "conditions and bowling matchups."
    );
  }

  if (
    q.includes("score") ||
    q.includes("match situation") ||
    q.includes("match summary")
  ) {
    return (
      `In the fictional demo match, ${match.battingTeam} are ` +
      `${match.score}/${match.wickets} after ${match.overs} overs. ` +
      `Their current run rate is ${match.currentRunRate}. ` +
      "The final total depends on the remaining overs, wickets and " +
      "batting conditions."
    );
  }

  if (q.includes("t20") || q.includes("twenty20")) {
    return (
      "T20 cricket gives each team a maximum of 20 overs. Batters " +
      "often aim to score quickly, while bowlers try to limit runs " +
      "and take wickets. Strategy depends on the score, wickets " +
      "remaining, pitch conditions and overs left."
    );
  }

  return (
    "I can explain cricket rules, strike rates, run rates, player " +
    "statistics and match situations. Try asking about the demo score, " +
    "the top scorer or a possible batting strategy."
  );
}

async function answerQuestion(question) {
  // Use local answers if no API key is configured.
  if (!ai) {
    return {
      answer: localAnswer(question),
      source: "local-fallback",
      isDemoData: true,
    };
  }

  const prompt = `
You are PlaySense AI, a friendly and knowledgeable cricket companion.

Answer the user's cricket question in simple, concise language.

Rules:
- The match and players below are fictional demo data, not live information.
- Never claim the demo data is real.
- Do not invent live scores, player biographies or statistics.
- Clearly distinguish facts from tactical possibilities.
- If information is missing, say so.
- Keep answers useful and usually under 120 words.

Fictional demo match:
${JSON.stringify(match, null, 2)}

Fictional demo players:
${JSON.stringify(players, null, 2)}

User question:
${question}
`;

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          maxOutputTokens: 350,
        },
      });

      const answer = response.text?.trim();

      if (!answer) {
        throw new Error("Gemini returned an empty response.");
      }

      return {
        answer,
        source: "gemini",
        isDemoData: true,
      };
    } catch (error) {
      console.error("Gemini API error details:", {
        message: error.message,
        status: error.status,
        code: error.code,
        attempt,
      });

      const status = Number(error.status || error.code);

      const isTemporary =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      // Retry temporary service errors once after a short delay.
      if (isTemporary && attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }

      // Don't retry indefinitely; keep the chat usable.
      return {
        answer:
          localAnswer(question) +
          "\n\nNote: Gemini is temporarily unavailable, " +
          "so this answer uses local demo logic.",
        source: "local-fallback",
        isDemoData: true,
      };
    }
  }

  // Safety fallback if both attempts fail unexpectedly.
  return {
    answer: localAnswer(question),
    source: "local-fallback",
    isDemoData: true,
  };
}

module.exports = { answerQuestion };
