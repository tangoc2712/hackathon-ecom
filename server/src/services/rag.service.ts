import axios from 'axios';

// RAG Service URL - use environment variable with fallback
// In production (Cloud Run), the RAG service is internal
// For local development, you can set RAG_SERVICE_URL in your .env file
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'https://rag-service-359180589188.asia-southeast1.run.app';

interface ChatMessagePayload {
    message: string;
    session_id?: string;
    customer_id?: string;
}

interface ChatMessageResponse {
    response: string;
    session_id: string;
    timestamp: string;
    debug_info?: {
        user_role: string;
        [key: string]: any;
    };
}

interface ChatHistoryItem {
    id: number;
    session_id: string;
    customer_id: string | null;
    user_message: string;
    bot_response: string;
    timestamp: string;
    metadata?: {
        source?: string;
        role?: string;
    };
}

interface ChatHistoryResponse {
    history: ChatHistoryItem[];
}

export class RagService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = RAG_SERVICE_URL;
        console.log(`RAG Service initialized with URL: ${this.baseUrl}`);
    }

    /**
     * Send a chat message to the RAG service
     * The RAG service automatically determines user role based on customer_id:
     * - No customer_id → Visitor mode (products + reviews only)
     * - customer_id with role='user' in DB → User mode (own orders + products/reviews)
     * - customer_id with role='admin' in DB → Admin mode (full access)
     */
    async sendMessage(payload: ChatMessagePayload): Promise<ChatMessageResponse> {
        try {
            const response = await axios.post<ChatMessageResponse>(
                `${this.baseUrl}/chat/message`,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 60000, // 60 seconds timeout for AI responses
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('RAG Service error:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    /**
     * Get chat history for a specific session
     */
    async getSessionHistory(sessionId: string, limit: number = 50): Promise<ChatHistoryResponse> {
        try {
            const response = await axios.get<ChatHistoryResponse>(
                `${this.baseUrl}/chat/history/${sessionId}`,
                {
                    params: { limit },
                    timeout: 30000,
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('RAG Service error (getSessionHistory):', error.message);
            throw error;
        }
    }

    /**
     * Get chat history for a specific customer across all sessions
     */
    async getCustomerHistory(customerId: string, limit: number = 100): Promise<ChatHistoryResponse> {
        try {
            const response = await axios.get<ChatHistoryResponse>(
                `${this.baseUrl}/chat/history/customer/${customerId}`,
                {
                    params: { limit },
                    timeout: 30000,
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('RAG Service error (getCustomerHistory):', error.message);
            throw error;
        }
    }

    /**
     * Delete chat history for a specific session
     */
    async deleteSessionHistory(sessionId: string): Promise<{ message: string }> {
        try {
            const response = await axios.delete<{ message: string }>(
                `${this.baseUrl}/chat/history/${sessionId}`,
                {
                    timeout: 30000,
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('RAG Service error (deleteSessionHistory):', error.message);
            throw error;
        }
    }

    /**
     * Check RAG service health
     */
    async checkHealth(): Promise<{ status: string }> {
        try {
            const response = await axios.get<{ status: string }>(
                `${this.baseUrl}/health`,
                {
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('RAG Service health check failed:', error.message);
            throw error;
        }
    }
}

// Export a singleton instance
export const ragService = new RagService();
