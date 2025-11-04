
// A collection of thoughtful daily reflection prompts
const prompts = [
  "What moment today made you feel most alive or present?",
  "What are you grateful for today, and why?",
  "What was challenging today, and what did you learn from it?",
  "How did you care for your physical health today?",
  "What emotions were strongest for you today, and what triggered them?",
  "If you could change one thing about today, what would it be?",
  "What did you do today that aligned with your values?",
  "How did you connect with others today?",
  "What brought you joy or peace today?",
  "What's something new you learned or realized today?",
  "How did you practice self-compassion today?",
  "What did your body need today that you did or didn't provide?",
  "What's something you're looking forward to tomorrow?",
  "Who or what are you grateful for today?",
  "What's something you wish you had done differently today?",
  "How did you respond to a difficult situation today?",
  "What small win or victory did you experience today?",
  "How did you nurture your mental health today?",
  "What boundary did you set or maintain today?",
  "How did you show up for yourself today?",
  "What habit or pattern did you notice in yourself today?",
  "How did you use your time today? Did it align with your priorities?",
  "What's something that surprised you today?",
  "In what ways did you grow or stretch yourself today?",
  "What are you holding onto that you could release?",
  "How did you nourish your body today?",
  "What made you laugh or smile today?",
  "How did you connect with your purpose today?",
  "What's one thing you appreciated about yourself today?",
  "How did you balance work and rest today?"
];

// Get a consistent prompt for a specific date
export const getDailyPrompt = (date: Date): string => {
  // Use the day of the year to select a prompt
  const dayOfYear = getDayOfYear(date);
  const promptIndex = dayOfYear % prompts.length;
  return prompts[promptIndex];
};

// Helper to get the day of the year (1-366)
const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};
