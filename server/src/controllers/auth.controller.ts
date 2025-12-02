import { NextFunction, Request, Response } from 'express';
import admin from 'firebase-admin';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { RequestWithUser } from '../types/types';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Login 
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.password_hash) {
             return res.status(401).json({ message: 'Invalid email or password' }); // User might have signed up via other method if we had any
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'default_secret_key_change_me',
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });

        // Remove password_hash from response
        const { password_hash, ...userWithoutPassword } = user;

        return res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name, gender, dob } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                full_name: name,
                gender,
                date_of_birth: dob ? new Date(dob) : undefined,
                role: 'user',
                uid: email, // Using email as uid for now to satisfy unique constraint if needed, or we can generate a UUID
                provider: 'local'
            }
        });

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET || 'default_secret_key_change_me',
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });

         // Remove password_hash from response
         const { password_hash, ...userWithoutPassword } = user;

        return res.status(200).json({ message: 'Signup successful', user: userWithoutPassword });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: 'Internal server error' });
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