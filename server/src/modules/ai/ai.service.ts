export const aiService = {
  async generateBio(tone: string, currentBio?: string): Promise<string> {
    // In a real app, this would call OpenAI:
    // const response = await openai.chat.completions.create({ ... })
    
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const bios: Record<string, string[]> = {
      funny: [
        "I'm here for two reasons: love and pizza. Mostly pizza.",
        "Swipe right if you have a dog I can pet. I don't care about you.",
        "My mom says I'm a catch."
      ],
      romantic: [
        "Looking for someone to share sunsets and deep conversations with.",
        "Hopeless romantic hoping to find my missing puzzle piece.",
        "Let's write a beautiful story together."
      ],
      confident: [
        "I know what I want, and I'm not afraid to go get it.",
        "CEO by day, amazing chef by night. Your turn.",
        "I set the bar high, but I'll help you reach it."
      ],
      casual: [
        "Just a chill person looking for good vibes.",
        "Coffee enthusiast. Let's see where things go.",
        "Here to meet new people and have fun."
      ]
    };

    const toneBios = bios[tone.toLowerCase()] || bios['casual'];
    return toneBios[Math.floor(Math.random() * toneBios.length)];
  },

  async getChatSuggestions(matchData: any): Promise<string[]> {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple mocked logic based on matchData (if any)
    return [
      "What's the best trip you've ever been on?",
      "If you could only eat one meal for the rest of your life, what would it be?",
      "I see we both like hiking. Do you have a favorite trail?"
    ];
  },

  async analyzeToxicity(text: string): Promise<{ isFlagged: boolean; score: number }> {
    // In production, this would call OpenAI Moderation API or Perspective API
    const toxicKeywords = ['spam', 'offensive', 'scam', 'badword'];
    const lowerText = text.toLowerCase();
    const matches = toxicKeywords.filter(word => lowerText.includes(word));
    
    const score = matches.length * 0.3;
    return {
      isFlagged: score > 0.5,
      score: Math.min(score, 1)
    };
  },

  async calculateRiskScore(user: any): Promise<number> {
    let risk = 0;
    if (!user.bio || user.bio.length < 10) risk += 0.3;
    if (user.photos && user.photos.length === 0) risk += 0.4;
    // Add logic for repetitive swipes / suspicious patterns
    return Math.min(risk, 1);
  }
};
