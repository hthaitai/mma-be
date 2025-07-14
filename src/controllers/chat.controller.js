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

    // Check if this is the first message in the chat
    const messageCount = await ChatMessage.countDocuments({ chat_id: chatId });
    if (messageCount === 1) {
      const chat = await ChatAI.findById(chatId);
      if (chat) {
        chat.title = content.split(' ').slice(0, 5).join(' ');
        await chat.save();
      }
    }

    // Get user's smoking status
    const smokingStatus = await SmokingStatus.findOne({ user_id: userId }).sort({ date: -1 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Get all intents from KnowledgeBase
    const allIntents = await KnowledgeBase.find().select('intent -_id');
    const intentList = allIntents.map(item => item.intent);

    // Use Gemini to classify intent
    const intentPrompt = `Dựa vào câu hỏi của người dùng, hãy xác định ý định (intent) của họ. Chỉ trả về một trong các ý định sau: ${intentList.join(', ')}, hoặc "khac" nếu không có ý định nào phù hợp.\n\nCâu hỏi: "${content}"`;
    
    const intentResult = await model.generateContent(intentPrompt);
    const intentResponse = await intentResult.response;
    const recognizedIntent = intentResponse.text().trim();
    let aiResponseContent;
    let promptForGeneration;

    if (recognizedIntent && recognizedIntent !== 'khac') {
      const kbEntry = await KnowledgeBase.findOne({ intent: recognizedIntent });
      if (kbEntry && kbEntry.responses && kbEntry.responses.length > 0) {
        // Get a random response from the array
        const randomIndex = Math.floor(Math.random() * kbEntry.responses.length);
        const contextFromKB = kbEntry.responses[randomIndex];

        promptForGeneration = `Bạn là một trợ lý AI đồng cảm chuyên về cai thuốc lá. Dựa vào thông tin chính xác sau đây: "${contextFromKB}", hãy trả lời câu hỏi của người dùng một cách ngắn gọn, tự nhiên và thân thiện.
        
        Câu hỏi của người dùng: "${content}"`;
      }
    }

    if (!promptForGeneration) {
      promptForGeneration = `Bạn là một trợ lý AI chuyên về cai nghiện thuốc lá. Chỉ trả lời các câu hỏi liên quan đến việc cai thuốc, bỏ thuốc, hoặc các chủ đề sức khỏe liên quan một cách ngắn gọn. Nếu người dùng hỏi về chủ đề khác, hãy từ chối một cách lịch sự.
  
      Dựa vào trạng thái hút thuốc của người dùng: ${JSON.stringify(smokingStatus)}, hãy trả lời câu hỏi sau đây bằng tiếng Việt: "${content}"`;
    } 

    const aiResult = await model.generateContent(promptForGeneration);
    const aiResponse = await aiResult.response;
    aiResponseContent = aiResponse.text();

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
