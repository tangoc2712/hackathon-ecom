import express from 'express';
import { processMessage } from '../controllers/chat.controller';

const app = express.Router();

app.post('/message', processMessage);

export default app;
