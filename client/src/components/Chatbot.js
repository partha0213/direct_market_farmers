import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { from: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const { data } = await axios.post("/api/v1/chatbot/message", {
        message: userMessage.text,
      });
      const botMessage = { from: "bot", text: data.reply || "Sorry, I didn't understand that." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { from: "bot", text: "Error: Unable to get response." };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        {isOpen && (
          <div
            style={{
              width: "300px",
              height: "400px",
              backgroundColor: "white",
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                fontWeight: "bold",
              }}
            >
              Chatbot
            </div>
            <div
              style={{
                flex: 1,
                padding: "10px",
                overflowY: "auto",
                fontSize: "14px",
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "10px",
                    textAlign: msg.from === "user" ? "right" : "left",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: "15px",
                      backgroundColor: msg.from === "user" ? "#007bff" : "#e5e5ea",
                      color: msg.from === "user" ? "white" : "black",
                      maxWidth: "80%",
                      wordWrap: "break-word",
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div
              style={{
                padding: "10px",
                borderTop: "1px solid #ddd",
                display: "flex",
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "15px",
                  border: "1px solid #ccc",
                  outline: "none",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  marginLeft: "8px",
                  padding: "8px 12px",
                  borderRadius: "15px",
                  border: "none",
                  backgroundColor: "#007bff",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
        <button
          onClick={toggleChat}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
          aria-label="Toggle Chatbot"
          title="Chatbot"
        >
          {isOpen ? "×" : "💬"}
        </button>
      </div>
    </>
  );
};

export default Chatbot;
