import { NextFunction, Request, Response } from 'express';
import admin from 'firebase-admin';
import prisma from '../config/prisma';
import { User as UserInterface } from '../types/types';


interface RequestWithUser extends Request {
    user?: UserInterface;
}

import jwt from 'jsonwebtoken';

export const authenticateUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token = req.cookies.token; // Read token from cookies
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_change_me') as { user_id: string, role: string };
        
        const user = await prisma.user.findUnique({ where: { user_id: decoded.user_id } });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user as unknown as UserInterface; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const adminOnly = (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.user?.role_id !== 1) {
        return res.status(403).json({ message: 'Unauthorized , Admin Only Route' });
    }

    next();
}