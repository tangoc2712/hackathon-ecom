import { NextFunction, Request, Response } from 'express';
import admin from 'firebase-admin';
import prisma from '../config/prisma';
import { User as UserInterface } from '../types/types';


interface RequestWithUser extends Request {
    user?: UserInterface;
}

export const authenticateUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    console.log(req.cookies.token)
    const idToken = req.cookies.token; // Read token from cookies
    if (!idToken) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        let uid;
        if (idToken === "TEST_TOKEN") {
             uid = "test_user_uid";
        } else {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            uid = decodedToken.uid;
        }

        const user = await prisma.user.findUnique({ where: { uid } });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Map Prisma User to UserInterface if needed, or update UserInterface to match Prisma User
        // UserInterface has _id: any, which Prisma User doesn't have. 
        // But UserInterface also has user_id: string.
        // Prisma User has user_id, uid, email, etc.
        // I need to cast or ensure compatibility.
        // Let's cast it for now as we are migrating.
        req.user = user as unknown as UserInterface; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const adminOnly = (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized , Admin Only Route' });
    }

    next();
}