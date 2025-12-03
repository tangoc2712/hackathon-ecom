import React, { useState, useRef, useEffect } from 'react';
import { FaComment, FaTimes, FaTrash, FaPaperPlane } from 'react-icons/fa';
import './ChatWidget.css';

interface Message {
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const API_BASE_URL = '/api/v1';
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        // Initialize session
        let storedSessionId = localStorage.getItem('sessionId');
        if (!storedSessionId) {
            storedSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionId', storedSessionId);
        }
        setSessionId(storedSessionId);
        loadChatHistory(storedSessionId);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatHistory = async (sid: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/history/${sid}`);
            if (response.ok) {
                const data = await response.json();
                if (data.history && data.history.length > 0) {
                    const loadedMessages: Message[] = [];
                    data.history.forEach((item: any) => {
                        loadedMessages.push({
                            text: item.user_message,
                            sender: 'user',
                            timestamp: new Date(item.timestamp)
                        });
                        loadedMessages.push({
                            text: item.bot_response,
                            sender: 'bot',
                            timestamp: new Date(item.timestamp)
                        });
                    });
                    setMessages(loadedMessages);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        const newMessage: Message = {
            text: userMessage,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    session_id: sessionId
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            // Add bot response
            const botMessage: Message = {
                text: data.response,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleClearChat = async () => {
        if (!window.confirm('Are you sure you want to clear the chat history?')) return;

        try {
            await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
                method: 'DELETE'
            });

            // Generate new session
            const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionId', newSessionId);
            setSessionId(newSessionId);
            setMessages([]);
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    };

    const handleExampleClick = (query: string) => {
        setInputValue(query);
        inputRef.current?.focus();
    };

    // Helper to render message content with HTML (for bold, links etc)
    const renderMessageContent = (text: string) => {
        // Basic formatting replacement (similar to the static js version)
        let formatted = text.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/^[•\-]\s/gm, '&bull; ');
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-green-400 underline">$1</a>');
        formatted = formatted.replace(/^(\d+)\./gm, '<strong>$1.</strong>');

        return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
    };

    return (
        <>
            <div className={`chat-widget ${isOpen ? 'active' : ''}`}>
                <div className="chat-container">
                    <div className="chat-header">
                        <h1>Admin Assistant</h1>
                        <div className="header-info">
                            <button onClick={handleClearChat} className="icon-btn" title="Clear conversation">
                                <FaTrash size={14} />
                            </button>
                            <button onClick={toggleChat} className="icon-btn" title="Close chat">
                                <FaTimes size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="welcome-message">
                                <h2>👋 Welcome, Admin</h2>
                                <p>I have full access to your database. Ask me anything about your e-commerce data!</p>
                                <div className="example-queries">
                                    <p><strong>Try asking:</strong></p>
                                    <ul>
                                        <li onClick={() => handleExampleClick("Show me the top 5 selling products")}>"Show me the top 5 selling products"</li>
                                        <li onClick={() => handleExampleClick("How many pending orders do we have?")}>"How many pending orders do we have?"</li>
                                        <li onClick={() => handleExampleClick("List recent customer reviews")}>"List recent customer reviews"</li>
                                        <li onClick={() => handleExampleClick("What's our total revenue this month?")}>"What's our total revenue this month?"</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.sender}`}>
                                    <div className="message-content">
                                        {renderMessageContent(msg.text)}
                                    </div>
                                </div>
                            ))
                        )}
                        {isTyping && (
                            <div className="typing-indicator active">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-container">
                        <form className="chat-form" onSubmit={handleSendMessage}>
                            <input
                                ref={inputRef}
                                type="text"
                                className="message-input"
                                placeholder="Message E-Commerce Assistant"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button type="submit" className="send-btn">
                                <FaPaperPlane size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <button className="chat-toggle-btn" onClick={toggleChat}>
                {isOpen ? <FaTimes size={24} /> : <FaComment size={24} />}
            </button>
        </>
    );
};

export default ChatWidget;
