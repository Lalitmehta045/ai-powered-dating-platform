import { Router } from 'express';
import protect from '../../middleware/auth.middleware';
import { generateBio, getChatSuggestions } from './ai.controller';
import { apiLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Apply auth to all AI routes
router.use(protect);

// We can also apply strict rate limiters here
router.post('/generate-bio', apiLimiter, generateBio);
router.get('/chat-suggestions/:matchId', apiLimiter, getChatSuggestions);

export default router;
