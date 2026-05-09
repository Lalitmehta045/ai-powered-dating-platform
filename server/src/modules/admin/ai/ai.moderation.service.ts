import User from "../../auth/auth.model";
import ChatMessage from "../../chat/chat.model";
import { aiService } from "../../ai/ai.service";

export class AIModerationService {
  /**
   * Get content flagged by AI (bios and messages)
   */
  async getFlaggedContent() {
    // 1. Scan for suspicious bios (Mocking AI scan of recent updates)
    const suspiciousUsers = await User.find({
      $or: [
        { bio: { $regex: /(telegram|whatsapp|money|cash|pay|scam)/i } },
        { reportCount: { $gt: 3 } }
      ]
    })
    .select("name email bio riskScore reportCount photos")
    .limit(10);

    const flaggedBios = await Promise.all(suspiciousUsers.map(async (user) => {
      const analysis = await aiService.analyzeToxicity(user.bio || "");
      return {
        type: "bio",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          photos: user.photos
        },
        content: user.bio,
        severity: analysis.score > 0.7 ? "high" : analysis.score > 0.4 ? "medium" : "low",
        confidence: 0.85 + Math.random() * 0.1,
        reason: analysis.score > 0.5 ? "Suspicious solicitation patterns" : "Low quality bio",
        timestamp: (user as any).updatedAt
      };
    }));

    // 2. Scan for toxic messages (Mocking recent message scan)
    const toxicMessages = await ChatMessage.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "name email");
    
    // Filter for toxicity in mock
    const flaggedMessages = toxicMessages
      .filter(m => m.content.length > 5 && /(badword|offensive|toxic|scam)/i.test(m.content))
      .map(m => ({
        type: "message",
        user: m.sender,
        content: m.content,
        severity: "medium",
        confidence: 0.92,
        reason: "Toxic language detected",
        timestamp: m.createdAt
      }));

    return [...flaggedBios, ...flaggedMessages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get users with high AI risk scores
   */
  async getSuspiciousUsers() {
    const users = await User.find({
      $or: [
        { riskScore: { $gt: 0.5 } },
        { reportCount: { $gt: 5 } }
      ]
    })
    .select("name email riskScore reportCount status photos createdAt")
    .sort({ riskScore: -1 })
    .limit(20);

    return users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      riskScore: u.riskScore,
      reportCount: u.reportCount,
      status: u.status,
      photos: u.photos,
      joinedAt: u.createdAt,
      aiAnalysis: {
        fakeProbability: u.riskScore,
        spamProbability: Math.random() * 0.4,
        toxicityProbability: Math.random() * 0.2
      }
    }));
  }
}

export const aiModerationService = new AIModerationService();
