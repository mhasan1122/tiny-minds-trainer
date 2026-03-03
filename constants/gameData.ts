export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    color: '#22C55E',
    itemCount: 4,
    timeLimit: 0,
    starThreshold: [2, 4, 6],
  },
  medium: {
    label: 'Medium',
    color: '#F97316',
    itemCount: 6,
    timeLimit: 0,
    starThreshold: [3, 5, 8],
  },
  hard: {
    label: 'Hard',
    color: '#EF4444',
    itemCount: 8,
    timeLimit: 30,
    starThreshold: [4, 6, 10],
  },
};

export const SHAPES = [
  { id: 'circle', name: 'Circle' },
  { id: 'square', name: 'Square' },
  { id: 'triangle', name: 'Triangle' },
  { id: 'star', name: 'Star' },
  { id: 'heart', name: 'Heart' },
  { id: 'diamond', name: 'Diamond' },
];

export const ANIMALS = [
  { id: 'dog', name: 'Dog', emoji: '🐕', soundUrl: 'https://www.soundjay.com/animal/dog-barking-01.wav' },
  { id: 'cat', name: 'Cat', emoji: '🐱', soundUrl: 'https://www.soundjay.com/animal/cat-meow-01.wav' },
  { id: 'cow', name: 'Cow', emoji: '🐄', soundUrl: 'https://www.soundjay.com/animal/cow-moo-01.wav' },
  { id: 'duck', name: 'Duck', emoji: '🦆', soundUrl: 'https://www.soundjay.com/animal/duck-quack-01.wav' },
  { id: 'lion', name: 'Lion', emoji: '🦁', soundUrl: 'https://www.soundjay.com/animal/lion-roar-01.wav' },
  { id: 'bird', name: 'Bird', emoji: '🐦', soundUrl: 'https://www.soundjay.com/animal/bird-chirp-01.wav' },
];

export const MEMORY_ICONS = [
  'Star',
  'Heart',
  'Moon',
  'Sun',
  'Cloud',
  'Flower2',
  'Apple',
  'Cherry',
];

export const FEEDBACK_MESSAGES = {
  correct: ['Great Job!', 'Awesome!', 'Super!', 'Fantastic!', 'Amazing!', 'Perfect!'],
  incorrect: ['Try Again!', 'Almost!', 'Keep Trying!', 'You Can Do It!'],
  complete: ['You Did It!', 'Champion!', 'Well Done!', 'Superstar!'],
};

export const GAME_TYPES = [
  {
    id: 'colors',
    title: 'Color Match',
    description: 'Match the colors!',
    icon: 'Palette',
    color: '#FF6B6B',
    route: '/game/colors',
  },
  {
    id: 'counting',
    title: 'Counting Fun',
    description: 'Count to 10!',
    icon: 'Hash',
    color: '#4ECDC4',
    route: '/game/counting',
  },
  {
    id: 'shapes',
    title: 'Shape Match',
    description: 'Find the shapes!',
    icon: 'Shapes',
    color: '#A855F7',
    route: '/game/shapes',
  },
  {
    id: 'memory',
    title: 'Memory Cards',
    description: 'Find the pairs!',
    icon: 'Brain',
    color: '#F97316',
    route: '/game/memory',
  },
  {
    id: 'animals',
    title: 'Animal Sounds',
    description: 'Guess the animal!',
    icon: 'Cat',
    color: '#22C55E',
    route: '/game/animals',
  },
];
