import { Competition } from '../types';

export const COMPETITIONS: Competition[] = [
  {
    id: 'bot-arena',
    number: '01',
    name: 'BOT - ARENA',
    category: 'Conversational AI & Solutions',
    shortDesc: 'Build / present an AI chatbot solution for a real-world problem.',
    detailedDesc: 'Architect and showcase an intelligent generative AI conversational bot or agent tailored to solve real-world problems. Judged on prompt system design, accuracy, NLP integration, and UI/UX presentation.',
    icon: 'Bot',
    rules: [
      'Present live demo or interactive prototype of the AI Bot',
      'Explain the underlying architecture and prompt engineering',
      'Max presentation time: 6 minutes followed by Q&A',
      'Individual or team participation (max 2 members)'
    ],
    teamFormat: 'Individual or Team of 2',
    coordinator: 'Department of Computer Science',
    eligibleYears: ['2nd Year', '3rd Year']
  },
  {
    id: 'ai-cineverse',
    number: '02',
    name: 'AI CINEVERSE',
    category: 'Generative Media & Storytelling',
    shortDesc: 'AI-supported short film using creativity, story and video production.',
    detailedDesc: 'Craft an awe-inspiring, AI-generated short film (1 to 3 minutes) utilizing cutting-edge video synthesis, voice generation, and cinematic prompts. Showcase how artificial intelligence fuels creative digital narratives.',
    icon: 'Film',
    rules: [
      'Video duration: 60 to 180 seconds',
      'AI tools used for generation must be credited in the title card',
      'Must contain an original plot, narrative, or thought-provoking theme',
      'Judged on visual coherence, narrative depth, and prompt mastery'
    ],
    teamFormat: 'Individual or Team of 2',
    coordinator: 'Media & Creative AI Club',
    eligibleYears: ['2nd Year', '3rd Year']
  },
  {
    id: 'neura-quest',
    number: '03',
    name: 'NEURA QUEST',
    category: 'AI & General Knowledge Quiz',
    shortDesc: 'AI / general knowledge quiz with multiple competitive rounds.',
    detailedDesc: 'Test your acumen in Artificial Intelligence, Machine Learning breakthroughs, history of computing, and general technology knowledge through fast-paced buzzer, visual, and rapid-fire quiz rounds.',
    icon: 'Brain',
    rules: [
      'Multiple elimination rounds: Prelims, Audio-Visual, and Rapid Fire',
      'Covering AI concepts, foundational tech figures, and recent tech trends',
      'Negative marking applicable in advanced buzzer rounds',
      'Decisions of the Quizmaster are final'
    ],
    teamFormat: 'Individual or Team of 2',
    coordinator: 'Department of Computer Science & Quiz Forum',
    eligibleYears: ['1st Year', '2nd Year']
  },
  {
    id: 'vision-x',
    number: '04',
    name: 'VISION-X',
    category: 'AI & Robotics Presentation',
    shortDesc: 'Generate a PPT on given topic which is based on AI and robotics.',
    detailedDesc: 'Research, prepare, and deliver an engaging presentation deck on AI and robotics innovations, computer vision advancements, or autonomous machines shaping the upcoming decade.',
    icon: 'Presentation',
    rules: [
      'Presentation deck limited to 8-10 slides',
      'Oral presentation time: 5 minutes + 2 minutes Q&A by judges',
      'Focus on technical clarity, originality, and practical feasibility',
      'Submit slides prior to the commencement of the session'
    ],
    teamFormat: 'Individual or Team of 2',
    coordinator: 'AI Research Forum',
    eligibleYears: ['1st Year', '2nd Year']
  },
  {
    id: 'ai-crossfire',
    number: '05',
    name: 'AI CROSSFIRE',
    category: 'Structured Tech Debate',
    shortDesc: 'Structured debate on AI-related topics.',
    detailedDesc: 'Clash of perspectives! Debate critical contemporary AI questions such as ethics, generative AI copyright, autonomous weaponry, AGI timelines, and human employment in structured parliamentary debate format.',
    icon: 'MessageSquare',
    rules: [
      'Topics assigned 15 minutes prior to debate rounds',
      'Structured rounds: Opening statement, rebuttal, cross-questioning, conclusion',
      'Judged on factual depth, logical rigor, eloquence, and rebuttal agility',
      'Decorum and parliamentary language strictly enforced'
    ],
    teamFormat: 'Team of 2 members (For & Against)',
    coordinator: 'Literary & Debating Society',
    eligibleYears: ['1st Year', '2nd Year']
  },
  {
    id: 'prompt-wars',
    number: '06',
    name: 'PROMPT WARS',
    category: 'Prompt Engineering Challenge',
    shortDesc: 'Create the most effective prompt for a given task.',
    detailedDesc: 'Live challenge under time pressure! Competitors are given real-time complex goals (code generation, problem-solving, structured extraction, image prompt fidelity) to craft the most precise and optimized system prompts.',
    icon: 'Terminal',
    rules: [
      'On-the-spot secret prompt challenges across 3 progressive tiers',
      'Evaluated on output accuracy, zero-shot/few-shot constraint adherence, and token efficiency',
      'Live execution on standardized LLM benchmarks',
      'Solo competition'
    ],
    teamFormat: 'Solo Participant',
    coordinator: 'Robotics & AI Guild',
    eligibleYears: ['1st Year', '2nd Year']
  }
];

export const VALID_COMPETITION_NAMES = COMPETITIONS.map(c => c.name);

// Eligibility helper
export function isEligibleForCompetition(year: string, competitionName: string): boolean {
  const comp = COMPETITIONS.find(c => c.name.toLowerCase() === competitionName.trim().toLowerCase());
  if (!comp) return false;

  const normalizedYear = year.trim();
  if (normalizedYear.includes('2nd') || normalizedYear.includes('2') || normalizedYear.toLowerCase().includes('second')) {
    return true; // 2nd years can participate in all 6
  }
  if (normalizedYear.includes('3rd') || normalizedYear.includes('3') || normalizedYear.toLowerCase().includes('third')) {
    return comp.name === 'BOT - ARENA' || comp.name === 'AI CINEVERSE';
  }
  if (normalizedYear.includes('1st') || normalizedYear.includes('1') || normalizedYear.toLowerCase().includes('first')) {
    return ['NEURA QUEST', 'VISION-X', 'AI CROSSFIRE', 'PROMPT WARS'].includes(comp.name);
  }
  return false;
}
