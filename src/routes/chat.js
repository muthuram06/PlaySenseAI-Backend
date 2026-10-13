const express = require("express");
const { answerQuestion } = require("../services/aiService");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { question } = req.body || {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a cricket question.",
      });
    }

    if (question.trim().length > 500) {
      return res.status(400).json({
        success: false,
        error: "Your question must be 500 characters or fewer.",
      });
    }

    const result = await answerQuestion(question.trim());

    return res.json({
      success: true,
      question: question.trim(),
      answer: result.answer,
      source: result.source,
      isDemoData: result.isDemoData,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;