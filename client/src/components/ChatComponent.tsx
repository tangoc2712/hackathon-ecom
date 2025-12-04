import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import ReactMarkdown from 'react-markdown';

interface Message {
    sender: 'user' | 'bot';
    text: string;
    data?: any[];
}

const ChatComponent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const { user } = useSelector((state: RootState) => state.user);
    const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('chat_session_id'));
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.parentElement?.scrollTo({
            top: messagesEndRef.current.parentElement.scrollHeight,
            behavior: 'smooth'
        });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        if (!isExpanded) {
            setIsExpanded(true);
        }

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const customerId = user ? user.user_id : undefined;

            const payload: any = {
                message: userMessage,
                session_id: sessionId
            };

            if (customerId) {
                payload.customer_id = customerId;
            }

            // Use the backend API endpoint
            const response = await axios.post('/api/v1/chat/message', payload);

            const data = response.data;

            // Update session ID if returned and not already set
            if (data.session_id) {
                setSessionId(data.session_id);
                localStorage.setItem('chat_session_id', data.session_id);
            }

            setMessages(prev => [...prev, {
                sender: 'bot',
                text: data.response,
                data: data.debug_info?.data_accessed ? [] : undefined // The API returns debug_info, we might want to parse it or just show the text response
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

    if (!isExpanded) {
        return (
            <div className="container mx-auto px-4 mb-12">
                <div className="w-full">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Let's me help you to find best items"
                            className="w-full border border-gray-300 rounded-full px-6 py-4 pr-12 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                        <button
                            onClick={handleSend}
                            className="absolute right-2 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 mb-12">
            <style>
                {`
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .fancy-border {
                    background: linear-gradient(270deg, #fafafaff, #8b5cf6, #ec4899, #1f4480ff);
                    background-size: 300% 300%;
                    animation: border-flow 4s ease infinite;
                }
                `}
            </style>
            {/* Gradient Border Wrapper */}
            <div className="w-full rounded-lg p-[3px] fancy-border shadow-xl">
                <div className="relative z-10 w-full border border-gray-100 rounded-lg overflow-hidden bg-white flex flex-col" style={{ height: '50vh' }}>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                                    {msg.sender === 'user' ? (
                                        <p>{msg.text}</p>
                                    ) : (
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    )}
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
                            placeholder="Let's me help you to find best items"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
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
            </div>
        </div>
    );
};

export default ChatComponent;
