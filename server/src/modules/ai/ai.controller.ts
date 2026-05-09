import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const generateBio = asyncHandler(async (req: Request, res: Response) => {
  const { tone, currentBio } = req.body;

  if (!tone) {
    return res.status(400).json({ success: false, message: 'Tone is required' });
  }

  const generatedBio = await aiService.generateBio(tone, currentBio);

  res.status(200).json({
    success: true,
    data: { bio: generatedBio },
  });
});

export const getChatSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const { matchId } = req.params;

  // Ideally, fetch match context from DB here.
  const suggestions = await aiService.getChatSuggestions({ matchId });

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});
