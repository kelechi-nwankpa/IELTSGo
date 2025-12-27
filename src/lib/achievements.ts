/**
 * Achievement Definitions
 *
 * Defines all available achievements/badges for gamification.
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'practice' | 'progress' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first practice session',
    icon: '👣',
    category: 'streak',
    rarity: 'common',
  },
  {
    id: '3_day_streak',
    name: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    icon: '✨',
    category: 'streak',
    rarity: 'common',
  },
  {
    id: '7_day_streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
  },
  {
    id: '14_day_streak',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day study streak',
    icon: '⚡',
    category: 'streak',
    rarity: 'rare',
  },
  {
    id: '30_day_streak',
    name: 'Dedicated Learner',
    description: 'Maintain a 30-day study streak',
    icon: '💎',
    category: 'streak',
    rarity: 'epic',
  },
  {
    id: '100_day_streak',
    name: 'Century Champion',
    description: 'Maintain a 100-day study streak',
    icon: '🏆',
    category: 'streak',
    rarity: 'legendary',
  },

  // Practice achievements
  {
    id: '10_tasks',
    name: 'Task Tamer',
    description: 'Complete 10 study tasks',
    icon: '📋',
    category: 'practice',
    rarity: 'common',
  },
  {
    id: '50_tasks',
    name: 'Task Master',
    description: 'Complete 50 study tasks',
    icon: '📚',
    category: 'practice',
    rarity: 'rare',
  },
  {
    id: '100_tasks',
    name: 'Task Legend',
    description: 'Complete 100 study tasks',
    icon: '🎯',
    category: 'practice',
    rarity: 'epic',
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete all tasks in a week',
    icon: '✅',
    category: 'practice',
    rarity: 'rare',
  },
  {
    id: 'all_modules',
    name: 'Well Rounded',
    description: 'Practice all four IELTS modules in one day',
    icon: '🌟',
    category: 'practice',
    rarity: 'rare',
  },

  // Progress achievements
  {
    id: 'band_improver',
    name: 'Band Improver',
    description: 'Improve 0.5 bands in any module',
    icon: '📈',
    category: 'progress',
    rarity: 'rare',
  },
  {
    id: 'target_crusher',
    name: 'Target Crusher',
    description: 'Reach your target band score',
    icon: '🎯',
    category: 'progress',
    rarity: 'legendary',
  },
  {
    id: 'band_7',
    name: 'Band 7 Club',
    description: 'Achieve Band 7 or higher',
    icon: '🌟',
    category: 'progress',
    rarity: 'epic',
  },
  {
    id: 'band_8',
    name: 'Band 8 Elite',
    description: 'Achieve Band 8 or higher',
    icon: '👑',
    category: 'progress',
    rarity: 'legendary',
  },

  // Special achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Study before 8am',
    icon: '🌅',
    category: 'special',
    rarity: 'common',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after 10pm',
    icon: '🦉',
    category: 'special',
    rarity: 'common',
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete tasks on both Saturday and Sunday',
    icon: '💪',
    category: 'special',
    rarity: 'rare',
  },
  {
    id: 'marathon',
    name: 'Marathon Session',
    description: 'Study for 3+ hours in one day',
    icon: '🏃',
    category: 'special',
    rarity: 'rare',
  },
];

// Helper to get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// Get achievements by category
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

// Get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-slate-600 bg-slate-100 border-slate-200';
    case 'rare':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'epic':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'legendary':
      return 'text-amber-600 bg-amber-50 border-amber-200';
  }
}

// Get rarity label
export function getRarityLabel(rarity: Achievement['rarity']): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}
