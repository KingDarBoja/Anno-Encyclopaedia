interface LocalizationLang {
  readonly english: string;
  readonly german: string;
  readonly spanish: string;
  readonly french: string;
  readonly italian: string;
  readonly japanese: string;
  readonly korean: string;
  readonly polish: string;
  readonly brazilian: string;
  readonly russian: string;
  readonly simplified_chinese: string;
  readonly traditional_chinese: string;
}

/** Raw Achievement from JSON */
export interface Achievement {
  readonly id: string;
  readonly title: LocalizationLang;
  readonly description: LocalizationLang;
  readonly points: number;
  readonly difficulty: 'Bronze' | 'Silver' | 'Gold';
  readonly image_url: string;
}

/**
 * Raw Set from JSON.
 * 
 * Represents a grouped collection of achievements with a specific category title and reward.
 */
export interface AchievementSet {
  readonly category: string;
  readonly reward: LocalizationLang;
  readonly achievements: { [uid: string]: Achievement };
}

/** ViewModel for the UI */
export interface AchievementSetViewModel {
  readonly slug: string;
  readonly categoryLabel: string;
  readonly reward: string;
  readonly achievements: Achievement[];
}