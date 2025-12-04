import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaTrash, FaRobot, FaUser, FaHistory, FaPlus, FaBars, FaChevronLeft } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useSelector } from 'react-redux';
import ProductCard from '../../components/chat/ProductCard';
import OrderCard from '../../components/chat/OrderCard';
import { RootState } from '../../redux/store';

interface Product {
    type: 'product';
    name: string;
    price: number;
    sale_price: number | null;
    image: string;
    url: string;
    stock: number;
    colors: string[];
    sizes: string[];
}

interface Order {
    type: 'order';
    order_id: string;
    status: string;
    total: number;
    currency: string;
    placed_date: string;
    url: string;
    items_count: number;
    item_names: string[];
}

interface Message {
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    content?: (string | Product[] | Order[])[];
}

interface ChatSession {
    session_id: string;
    last_message: string;
    timestamp: Date;
    message_count: number;
}

const AdminChat: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const API_BASE_URL = '/api/v1';
    const [sessionId, setSessionId] = useState<string>('');

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        // Initialize session
        let storedSessionId = localStorage.getItem('sessionId');
        if (!storedSessionId) {
            createNewSession();
        } else {
            setSessionId(storedSessionId);
            loadChatHistory(storedSessionId);
        }

        // Load all sessions for the user
        if (user?.user_id) {
            loadCustomerHistory(user.user_id);
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const createNewSession = () => {
        const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', newSessionId);
        setSessionId(newSessionId);
        setMessages([]);
        if (user?.user_id) {
            loadCustomerHistory(user.user_id);
        }
    };

    const parseResponse = (response: string): (string | Product[] | Order[])[] => {
        const content: (string | Product[] | Order[])[] = [];
        let remaining = response;

        while (remaining.length > 0) {
            // Find the first occurrence of {"type":"product" or {"type":"order"
            // We allow for whitespace around keys/values
            const matchIndex = remaining.search(/\{\s*"type"\s*:\s*"(product|order)"/);

            if (matchIndex === -1) {
                // No more JSON objects, the rest is text
                if (remaining.trim()) {
                    content.push(remaining.trim());
                }
                break;
            }

            // Push text before the JSON
            if (matchIndex > 0) {
                const textBefore = remaining.substring(0, matchIndex).trim();
                if (textBefore) {
                    content.push(textBefore);
                }
            }

            // Now try to extract the JSON object starting at matchIndex
            const jsonStart = remaining.substring(matchIndex);
            let braceCount = 0;
            let jsonEndIndex = -1;
            let inString = false;
            let escape = false;

            for (let i = 0; i < jsonStart.length; i++) {
                const char = jsonStart[i];

                if (escape) {
                    escape = false;
                    continue;
                }

                if (char === '\\') {
                    escape = true;
                    continue;
                }

                if (char === '"') {
                    inString = !inString;
                    continue;
                }

                if (!inString) {
                    if (char === '{') {
                        braceCount++;
                    } else if (char === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            jsonEndIndex = i + 1;
                            break;
                        }
                    }
                }
            }

            if (jsonEndIndex !== -1) {
                const jsonString = jsonStart.substring(0, jsonEndIndex);
                try {
                    const parsed = JSON.parse(jsonString);

                    // Check if the last item in content is an array of the same type
                    // If so, add to it, otherwise create new array
                    const lastItem = content[content.length - 1];
                    if (Array.isArray(lastItem) && lastItem.length > 0 && (lastItem[0] as any).type === parsed.type) {
                        (lastItem as any[]).push(parsed);
                    } else {
                        content.push([parsed]);
                    }

                    remaining = jsonStart.substring(jsonEndIndex);
                } catch (e) {
                    console.error("Failed to parse extracted JSON:", e);
                    // If parsing fails, treat the start as text and move on
                    // To avoid infinite loop, we move past the opening brace
                    content.push(jsonStart.substring(0, 1));
                    remaining = jsonStart.substring(1);
                }
            } else {
                // Could not find closing brace, treat rest as text
                content.push(jsonStart);
                break;
            }
        }

        return content;
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

                        // Parse bot response for history as well
                        const parsedContent = parseResponse(item.bot_response);
                        loadedMessages.push({
                            text: item.bot_response,
                            sender: 'bot',
                            timestamp: new Date(item.timestamp),
                            content: parsedContent
                        });
                    });
                    setMessages(loadedMessages);
                } else {
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const loadCustomerHistory = async (customerId: string) => {
        setIsLoadingHistory(true);
        try {
            const response = await fetch(`${API_BASE_URL}/chat/history/customer/${customerId}?limit=200`);
            if (response.ok) {
                const data = await response.json();
                if (data.history) {
                    // Group by session_id
                    const sessionMap = new Map<string, ChatSession>();

                    data.history.forEach((item: any) => {
                        if (!sessionMap.has(item.session_id)) {
                            sessionMap.set(item.session_id, {
                                session_id: item.session_id,
                                last_message: item.user_message, // Use first found message as "last" for now, will sort later
                                timestamp: new Date(item.timestamp),
                                message_count: 1
                            });
                        } else {
                            const session = sessionMap.get(item.session_id)!;
                            session.message_count++;
                            // Update timestamp if this message is newer
                            if (new Date(item.timestamp) > session.timestamp) {
                                session.timestamp = new Date(item.timestamp);
                                session.last_message = item.user_message;
                            }
                        }
                    });

                    const sortedSessions = Array.from(sessionMap.values()).sort((a, b) =>
                        b.timestamp.getTime() - a.timestamp.getTime()
                    );
                    setSessions(sortedSessions);
                }
            }
        } catch (error) {
            console.error('Error loading customer history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSessionClick = (sid: string) => {
        setSessionId(sid);
        localStorage.setItem('sessionId', sid);
        loadChatHistory(sid);
        // On mobile, close sidebar after selection
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
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
                    session_id: sessionId,
                    customer_id: user?.user_id
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            // Parse response content
            const parsedContent = parseResponse(data.response);

            // Add bot response
            const botMessage: Message = {
                text: data.response,
                sender: 'bot',
                timestamp: new Date(),
                content: parsedContent
            };
            setMessages(prev => [...prev, botMessage]);

            // Refresh history list to show updated timestamp/message
            if (user?.user_id) {
                loadCustomerHistory(user.user_id);
            }
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
        if (!window.confirm('Are you sure you want to clear this chat session?')) return;

        try {
            await fetch(`${API_BASE_URL}/chat/history/${sessionId}`, {
                method: 'DELETE'
            });

            setMessages([]);
            if (user?.user_id) {
                loadCustomerHistory(user.user_id);
            }
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    };

    const handleExampleClick = (query: string) => {
        setInputValue(query);
        inputRef.current?.focus();
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 relative">
            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? 'w-80' : 'w-0'
                    } bg-gray-50 border-r border-gray-200 transition-all duration-300 flex flex-col absolute md:relative z-10 h-full`}
            >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">
                        <FaHistory className="text-blue-600" />
                        History
                    </h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                    >
                        <FaChevronLeft />
                    </button>
                </div>

                <div className="p-3">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <FaPlus size={14} />
                        New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {isLoadingHistory ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Loading history...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No chat history found</div>
                    ) : (
                        sessions.map((session) => (
                            <div
                                key={session.session_id}
                                onClick={() => handleSessionClick(session.session_id)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors border ${sessionId === session.session_id
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-white border-transparent hover:bg-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="text-sm font-medium text-gray-800 truncate mb-1">
                                    {session.last_message || "New Conversation"}
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                                    <span>{session.message_count} msgs</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full w-full">
                {/* Header */}


                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-6">
                            <div className="bg-blue-100 p-6 rounded-full">
                                <FaRobot size={48} className="text-blue-600" />
                            </div>
                            <div className="text-center max-w-md">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">👋 Welcome, Admin</h2>
                                <p className="text-gray-600">I have full access to your database. Ask me anything about your e-commerce data!</p>
                            </div>
                            <div className="w-full max-w-lg">
                                <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider text-center">Try asking</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        "Show me the top 5 selling products",
                                        "How many pending orders do we have?",
                                        "List recent customer reviews",
                                        "What's our total revenue this month?"
                                    ].map((query, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleExampleClick(query)}
                                            className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-left hover:border-blue-400 hover:shadow-md transition-all duration-200 text-gray-700"
                                        >
                                            "{query}"
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                                        {msg.sender === 'user' ? <FaUser size={14} /> : <FaRobot size={16} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                        }`}>
                                        <div className={`prose max-w-none ${msg.sender === 'user' ? 'prose-invert' : ''}`}>
                                            {msg.content ? (
                                                msg.content.map((item, idx) => {
                                                    if (typeof item === 'string') {
                                                        return <ReactMarkdown key={idx}>{item}</ReactMarkdown>;
                                                    } else if (Array.isArray(item) && item.length > 0) {
                                                        const firstItem = item[0] as any;
                                                        if (firstItem.type === 'product') {
                                                            return (
                                                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                                                                    {(item as Product[]).map((product, pIdx) => (
                                                                        <ProductCard key={pIdx} product={product} />
                                                                    ))}
                                                                </div>
                                                            );
                                                        } else if (firstItem.type === 'order') {
                                                            return (
                                                                <div key={idx} className="grid grid-cols-1 gap-2 my-2">
                                                                    {(item as Order[]).map((order, oIdx) => (
                                                                        <OrderCard key={oIdx} order={order} />
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                    return null;
                                                })
                                            ) : (
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            )}
                                        </div>
                                        <div className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                                    <FaRobot size={16} />
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <form className="flex gap-3 max-w-4xl mx-auto" onSubmit={handleSendMessage}>
                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Message E-Commerce Assistant..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button
                            type="submit"
                            className={`p-3 rounded-lg flex items-center justify-center transition-all duration-200 ${inputValue.trim()
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            disabled={!inputValue.trim()}
                        >
                            <FaPaperPlane size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
