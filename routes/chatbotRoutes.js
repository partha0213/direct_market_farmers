import express from "express";
const router = express.Router();
import { chatbotMessage } from "../controllers/chatbotController.js";

router.post("/message", chatbotMessage);

export default router;
