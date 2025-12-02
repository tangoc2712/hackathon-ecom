import { NextFunction, Request, Response } from 'express';
import admin from 'firebase-admin';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestWithUser } from '../types/types';

// Login 
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { idToken } = req.body;
    console.log("Login request body:", req.body);
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check if user exists in DB
        const user = await prisma.user.findUnique({ where: { uid } });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        res.cookie('token', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });

        return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const { idToken, name, gender, dob } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, picture } = decodedToken;

        // Check if user exists in DB
        let user = await prisma.user.findUnique({ where: { uid } });

        if (!user) {
            // If user doesn't exist, create a new user
            user = await prisma.user.create({
                data: {
                    uid,
                    email: email || "",
                    full_name: name,
                    photo_url: picture,
                    provider: decodedToken.firebase.sign_in_provider,
                    gender,
                    date_of_birth: new Date(dob)
                }
            });
        }

        res.cookie('token', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });

        return res.status(200).json({ message: 'Signup successful', user });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const getMe = asyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {

    if (req.user) {
        return res.status(200).json({ user: req.user });
    } else {
        return res.status(404).json({ message: 'User not found' });
    }
});

export const logoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('token');
    return res.status(200).json({
        message: 'Logout successful'
    });
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany();
    if (!users) {
        return res.status(404).json({
            success: false,
            message: 'No users found',
        });
    }
    return res.status(200).json({
        success: true,
        users,
    });
});

export const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { user_id: id } });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: `No user found with id: ${id}`,
        });
    }
    return res.status(200).json({
        success: true,
        user,
    });
});