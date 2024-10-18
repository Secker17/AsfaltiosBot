import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiSend, FiX } from 'react-icons/fi';
import axios from 'axios';

// Keyframe animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const openChat = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const closeChat = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
`;

const typingDots = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;

// Chatbot container
const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
`;

const ChatButton = styled.button`
  background: #6c48ff;
  color: #fff;
  border: none;
  border-radius: 50%;
  padding: 18px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(108, 72, 255, 0.7);
  transition: background 0.3s, transform 0.3s;

  &:hover {
    background: #a97cff;
    transform: scale(1.1);
  }
`;

const ChatWindow = styled.div`
  width: 350px;
  height: 600px;
  background: linear-gradient(180deg, #3b3b78, #222243);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  animation: ${({ isOpen }) => (isOpen ? openChat : closeChat)} 0.4s ease forwards;
`;

const ChatHeader = styled.div`
  background: #6c48ff;
  color: #fff;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
`;

const AvatarIcon = styled.img`
  background: #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 10px;
`;

const OnlineStatus = styled.span`
  background: #4caf50;
  border-radius: 50%;
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 8px;
`;

const ChatTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 22px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #222243;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  display: flex;
  align-items: flex-end;
  ${({ isUser }) => (isUser ? 'justify-content: flex-end;' : 'justify-content: flex-start;')}
`;

const Bubble = styled.div`
  max-width: 70%;
  background-color: ${({ isUser }) => (isUser ? '#6c48ff' : '#444465')};
  color: #fff;
  padding: 12px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 15px;
`;

const TypingIndicator = styled.div`
  font-size: 16px;
  color: #fff;
  background-color: #444465;
  padding: 10px 14px;
  border-radius: 20px;
  display: inline-block;
  &:after {
    content: '';
    animation: ${typingDots} 1.5s infinite;
  }
`;

const ChatInputContainer = styled.div`
  padding: 14px 20px;
  background-color: #2b2b4b;
  border-top: 1px solid #444465;
  display: flex;
  align-items: center;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #444465;
  border-radius: 20px;
  outline: none;
  font-size: 15px;
  background-color: #2e2e56;
  color: #ccc;
  margin-right: 10px;

  &:focus {
    border-color: #6c48ff;
    background-color: #fff;
    color: #333;
  }
`;

const SendButton = styled.button`
  background: #6c48ff;
  border: none;
  color: #fff;
  font-size: 20px;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(108, 72, 255, 0.5);

  &:hover {
    background: #a97cff;
  }

  &:disabled {
    background: #4a427e;
    cursor: not-allowed;
  }
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: 'Hi there! 👋 How can I help you? 😊', isUser: false }]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const [chatId] = useState(Date.now().toString());

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { text: newMessage, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true); // Show typing indicator

    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/send', {
        message: newMessage,
        context: `About Asfaltios:...`, // Your context or any additional info
      });

      const botMessage = { text: response.data.reply, isUser: false };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false); // Hide typing indicator

      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      await axios.post('http://localhost:5000/api/chat/store', {
        chatId,
        messages: [...messages, userMessage, botMessage],
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: 'Sorry, there was an error processing your request.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false); // Hide typing indicator in case of error
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ChatbotContainer>
      {isOpen && (
        <ChatWindow isOpen={isOpen}>
          <ChatHeader>
            <HeaderTitle>
              {/* Add your image here */}
              <AvatarIcon src="https://i.ibb.co/DfTZXdQ/image-removebg-preview-2-3-2.png" alt="Chatbot Avatar" />
              <div>
                <ChatTitle>ASFALTIOS AI</ChatTitle>
                <OnlineStatus />
              </div>
            </HeaderTitle>
            <CloseButton onClick={handleToggleChat}>
              <FiX />
            </CloseButton>
          </ChatHeader>
          <ChatBody>
            <MessageContainer>
              {messages.map((msg, index) => (
                <MessageBubble key={index} isUser={msg.isUser}>
                  <Bubble isUser={msg.isUser}>{msg.text}</Bubble>
                </MessageBubble>
              ))}
              {isTyping && (
                <MessageBubble isUser={false}>
                  <TypingIndicator>Typing</TypingIndicator>
                </MessageBubble>
              )}
              <div ref={messageEndRef} />
            </MessageContainer>
          </ChatBody>
          <ChatInputContainer>
            <ChatInput
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <SendButton onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <FiSend />
            </SendButton>
          </ChatInputContainer>
        </ChatWindow>
      )}
      {!isOpen && (
        <ChatButton onClick={handleToggleChat}>
          <FiSend />
        </ChatButton>
      )}
    </ChatbotContainer>
  );
};

export default Chatbot;
