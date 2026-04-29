export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'Bronze' | 'Silver' | 'Gold';
  image_url: string;
}

/**
 * Represents a grouped collection of achievements with a specific category title and reward.
 * Mirrored from the Dart AchievementSet class.
 */
export interface AchievementSet {
  title: string;
  reward: string;
  achievements: Achievement[];
}
