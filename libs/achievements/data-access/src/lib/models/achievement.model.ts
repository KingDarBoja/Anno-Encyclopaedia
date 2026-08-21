/** Raw Achievement from JSON */
export interface Achievement {
  readonly guid: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly icon_url: string;
  readonly difficulty: 'Bronze' | 'Silver' | 'Gold';
  readonly points: number;
}

/**
 * Raw Set from JSON.
 * 
 * Represents a grouped collection of achievements with a specific category title and reward.
 */
export interface AchievementSet {
  readonly guid: string;
  readonly name: string;
  readonly reward: string;
  readonly achievements: { [guid: string]: Achievement };
}

/** ViewModel for the UI */
export interface AchievementSetViewModel {
  readonly slug: string;
  readonly categoryLabel: string;
  readonly reward: string;
  readonly achievements: Achievement[];
}