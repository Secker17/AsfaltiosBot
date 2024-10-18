require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Placeholder for storing chats in memory (replace with database)
const chats = [];

// Ensure the API key is present
if (!OPENAI_API_KEY) {
  console.error('Error: OpenAI API key is not set in environment variables.');
  process.exit(1);
}

// POST endpoint for sending messages to ChatGPT with extra context
app.post('/api/chatbot/send', async (req, res) => {
  const { message, context } = req.body;

  // Define a detailed context for Asfaltios
  const detailedContext = `
  ### Company Overview:
  Asfaltios is a leading Minecraft security company specializing in developing advanced plugins that enhance server security and player experience. We work with server administrators to help protect and optimize Minecraft servers globally.
  
  ### Mission:
  Our mission is to provide advanced, easy-to-use plugins that secure Minecraft servers and improve player experience. Our tools help servers operate efficiently and prevent malicious threats.

  ### Key Plugins:
  1. **AsfaltShield**: Our flagship security plugin that offers real-time threat detection, prevention against unauthorized access, and anti-cheat features.
  2. **GameBoost**: A performance-enhancing plugin that reduces lag and improves server performance, ensuring smoother gameplay for users.
  3. **AdminSuite**: A complete server management tool, providing chat moderation, permission management, and automated backups.

  ### FAQs:
  - **How do I install Asfaltios plugins?**
    You can download our plugins from the official Asfaltios website and follow the provided installation guides.
  
  - **Do you offer customer support?**
    Yes, Asfaltios provides 24/7 support to server administrators via email and live chat.

  - **Are the plugins compatible with all Minecraft versions?**
    Our plugins support most major Minecraft versions. Check each plugin page for specific version compatibility.

  ### Contact Information:
  - **Website**: https://www.asfaltios.com
  - **Email**: support@asfaltios.com
  - **Discord**: Join our community for plugin support and discussions.
  `;

  try {
    // Construct the messages array with the detailed context and user message
    const messages = [
      { role: 'system', content: 'You are an AI assistant for Asfaltios.com. Your role is to answer questions and provide assistance about Asfaltios products, services, and general inquiries.' },
      { role: 'system', content: detailedContext },  // Pass the detailed context
      { role: 'user', content: message },  // The user's message
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error communicating with AI' });
  }
});

// Endpoint to store chat messages
app.post('/api/chat/store', (req, res) => {
  const { chatId, messages } = req.body;

  // Store the chat in the "database" (in-memory for now)
  chats.push({ chatId, messages });

  res.status(200).send({ message: 'Chat saved successfully!' });
});

// Endpoint to fetch active chats
app.get('/api/chat/active', (req, res) => {
  res.status(200).send(chats); // Return all stored chats
});

// Endpoint to fetch chat messages by chatId
app.get('/api/chat/messages/:chatId', (req, res) => {
  const { chatId } = req.params;
  const chat = chats.find(c => c.chatId === chatId);

  if (chat) {
    res.status(200).send(chat.messages);
  } else {
    res.status(404).send({ message: 'Chat not found' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
