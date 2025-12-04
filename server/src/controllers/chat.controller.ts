import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ragService } from "../services/rag.service";

/**
 * Chat API Controller
 * 
 * Follows the API_GUIDE.md specification:
 * - POST /chat/message - Send message to RAG service
 * - GET /chat/history/:sessionId - Get session history
 * - GET /chat/history/customer/:customerId - Get customer history
 * - DELETE /chat/history/:sessionId - Delete session history
 * 
 * Role Logic (for calls from home page):
 * - If user is logged in (admin or user role): send customer_id to RAG service
 *   RAG service will look up the role from database and apply appropriate access
 * - If visitor (no user): don't send customer_id, RAG uses visitor mode
 *   (products + reviews only)
 */

interface RequestWithUser extends Request {
    user?: {
        user_id: string;
        role: string;
    };
}

/**
 * Process a chat message
 * Endpoint: POST /api/v1/chat/message
 * 
 * Request body:
 * - message: string (required) - User's question
 * - session_id?: string (optional) - Session ID for conversation tracking
 * - customer_id?: string (optional) - User ID (if logged in)
 * 
 * For home page usage:
 * - Logged in user (admin/user): pass customer_id, RAG determines role from DB
 * - Visitor: don't pass customer_id, uses visitor mode (products/reviews only)
 */
export const processMessage = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { message, session_id, customer_id } = req.body;

    if (!message) {
        return next(new ApiError(400, "Message is required"));
    }

    try {
        // Build payload following API_GUIDE.md format
        const payload: {
            message: string;
            session_id?: string;
            customer_id?: string;
        } = {
            message
        };

        // Add session_id if provided
        if (session_id) {
            payload.session_id = session_id;
        }

        // Add customer_id if provided (allows RAG to determine role from DB)
        // For home page: logged in users (admin/user) should pass customer_id
        // Visitors don't pass customer_id and get visitor mode (products/reviews only)
        if (customer_id) {
            payload.customer_id = customer_id;
        }

        // Call RAG service
        const ragResponse = await ragService.sendMessage(payload);

        // Return response in the format expected by frontend
        return res.status(200).json({
            success: true,
            response: ragResponse.response,
            session_id: ragResponse.session_id,
            timestamp: ragResponse.timestamp,
            debug_info: ragResponse.debug_info
        });
    } catch (error: any) {
        console.error("Chat API error:", error.message);
        
        // Handle specific error cases
        if (error.response) {
            const status = error.response.status;
            const errorDetail = error.response.data?.detail || "RAG service error";
            
            if (status === 503) {
                return next(new ApiError(503, "Chat service is temporarily unavailable. Please try again later."));
            }
            
            return next(new ApiError(status, errorDetail));
        }
        
        // Network or timeout error
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return next(new ApiError(503, "Chat service is not available. Please try again later."));
        }
        
        if (error.code === 'ECONNABORTED') {
            return next(new ApiError(504, "Chat service request timed out. Please try again."));
        }

        return next(new ApiError(500, "An error occurred while processing your message."));
    }
});

/**
 * Get chat history for a session
 * Endpoint: GET /api/v1/chat/history/:sessionId
 */
export const getSessionHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const limit = Number(req.query.limit) || 50;

    if (!sessionId) {
        return next(new ApiError(400, "Session ID is required"));
    }

    try {
        const historyResponse = await ragService.getSessionHistory(sessionId, limit);
        
        return res.status(200).json({
            success: true,
            history: historyResponse.history
        });
    } catch (error: any) {
        console.error("Get session history error:", error.message);
        return next(new ApiError(500, "Failed to retrieve chat history"));
    }
});

/**
 * Get chat history for a customer across all sessions
 * Endpoint: GET /api/v1/chat/history/customer/:customerId
 */
export const getCustomerHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.params;
    const limit = Number(req.query.limit) || 100;

    if (!customerId) {
        return next(new ApiError(400, "Customer ID is required"));
    }

    try {
        const historyResponse = await ragService.getCustomerHistory(customerId, limit);
        
        return res.status(200).json({
            success: true,
            history: historyResponse.history
        });
    } catch (error: any) {
        console.error("Get customer history error:", error.message);
        return next(new ApiError(500, "Failed to retrieve customer chat history"));
    }
});

/**
 * Delete chat history for a session
 * Endpoint: DELETE /api/v1/chat/history/:sessionId
 */
export const deleteSessionHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        return next(new ApiError(400, "Session ID is required"));
    }

    try {
        const deleteResponse = await ragService.deleteSessionHistory(sessionId);
        
        return res.status(200).json({
            success: true,
            message: deleteResponse.message
        });
    } catch (error: any) {
        console.error("Delete session history error:", error.message);
        return next(new ApiError(500, "Failed to delete chat history"));
    }
});

/**
 * Check RAG service health
 * Endpoint: GET /api/v1/chat/health
 */
export const checkHealth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const healthResponse = await ragService.checkHealth();
        
        return res.status(200).json({
            success: true,
            status: healthResponse.status
        });
    } catch (error: any) {
        console.error("RAG service health check failed:", error.message);
        return res.status(503).json({
            success: false,
            status: "unhealthy",
            message: "RAG service is not available"
        });
    }
});
