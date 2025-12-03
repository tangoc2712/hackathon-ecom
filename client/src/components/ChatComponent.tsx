import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

interface Message {
    sender: 'user' | 'bot';
    text: string;
    data?: any[];
}

const ChatComponent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Hello! How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_SERVER}/api/v1/chat/message`, {
                message: userMessage,
                role: role
            });

            const botResponse = response.data;
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: botResponse.message,
                data: botResponse.data
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, something went wrong." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 mb-12 border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white flex flex-col" style={{ maxHeight: '50vh', height: '500px' }}>
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <FaRobot /> Assistant
                </h3>
                <div className="flex items-center gap-2 text-sm">
                    <span>Role:</span>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                        className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 focus:outline-none"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                            <p>{msg.text}</p>
                            {/* Render Data if available */}
                            {msg.data && msg.data.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {msg.data.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-gray-100 p-2 rounded text-xs text-gray-700">
                                            {/* Heuristic to display product or order info */}
                                            {item.name && <div className="font-bold">{item.name}</div>}
                                            {item.order_id && <div className="font-bold">Order #{item.order_id.slice(0, 8)}...</div>}
                                            {item.price && <div>Price: ${item.price}</div>}
                                            {item.order_total && <div>Total: ${item.order_total}</div>}
                                            {item.status && <div>Status: {item.status}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-500 rounded-lg p-3 text-sm animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;
