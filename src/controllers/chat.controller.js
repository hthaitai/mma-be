const ChatAI = require('../models/ChatAI.model');
const ChatMessage = require('../models/ChatMessage.model');
const KnowledgeBase = require('../models/KnowledgeBase.model');
const SmokingStatus = require('../models/smokingStatus.model');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const startChat = async (req, res) => {
  const { userId } = req.body;
  try {
    const newChat = new ChatAI({ user_id: userId });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { content, userId } = req.body;

  try {
    // Save user message
    const userMessage = new ChatMessage({
      chat_id: chatId,
      sender_type: 'user',
      content,
    });
    await userMessage.save();

    // Get user's smoking status
    const smokingStatus = await SmokingStatus.findOne({ user_id: userId }).sort({ date: -1 });

    // Check if the topic is related to smoking cessation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Câu hỏi sau đây có liên quan đến việc cai thuốc lá, hút thuốc, hoặc bỏ thuốc không? Chỉ trả lời "có" hoặc "không".\n\nCâu hỏi: "${content}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const isRelated = response.text().trim().toLowerCase() === 'có';

    let aiResponseContent;

    if (isRelated) {
      // Search Knowledge Base first
      const kbEntry = await KnowledgeBase.findOne({ intent: { $regex: new RegExp(content, "i") } });

      if (kbEntry) {
        aiResponseContent = kbEntry.response_template;
      } else {
        // If not in Knowledge Base, use Gemini
        const personalizedPrompt = `Dựa vào trạng thái hút thuốc của người dùng: ${JSON.stringify(smokingStatus)}, hãy trả lời câu hỏi sau đây về việc bỏ thuốc bằng tiếng Việt: "${content}"`;
        const aiResult = await model.generateContent(personalizedPrompt);
        const aiResponse = await aiResult.response;
        aiResponseContent = aiResponse.text();
      }
    } else {
      aiResponseContent = "Tôi chỉ có thể trả lời các câu hỏi liên quan đến việc cai nghiện thuốc lá.";
    }

    // Save AI message
    const aiMessage = new ChatMessage({
      chat_id: chatId,
      sender_type: 'ai',
      content: aiResponseContent,
    });
    await aiMessage.save();

    res.status(201).json({ userMessage, aiMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatHistory = async (req, res) => {
    const { chatId } = req.params;
    try {
        const messages = await ChatMessage.find({ chat_id: chatId }).sort({ created_at: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getChatSessions = async (req, res) => {
    const { userId } = req.params;
    try {
        const sessions = await ChatAI.find({ user_id: userId }).sort({ created_at: -1 });
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  startChat,
  sendMessage,
  getChatHistory,
  getChatSessions,
};
