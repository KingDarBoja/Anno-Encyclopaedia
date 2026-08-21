import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, of, tap } from 'rxjs';
import {
  AchievementSet,
  AchievementSetViewModel,
} from '../models/achievement.model';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly http = inject(HttpClient);

  /**
   * State management using Angular Signals.
   */
  private readonly _sets = signal<AchievementSetViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly achievementSets = this._sets.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** Placeholder icon for achievements. */
  readonly placeholderImage =
    'assets/icons/base/icon_content/achievements/achievement_set00_01_0.webp';

  /**
   * Total prestige calculated across all sets.
   */
  readonly totalPoints = computed(() =>
    this._sets().reduce(
      (acc, set) =>
        acc +
        Object.values(set.achievements).reduce((sAcc, a) => sAcc + a.points, 0),
      0,
    ),
  );

  /**
   * Fetches the categorized achievement sets from the JSON archive.
   * Path: assets/data/achievements.json
   */
  fetchAchievements() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<Record<string, AchievementSet>>('assets/data/achievements.json')
      .pipe(
        map((rawMap) => this.mapToViewModel(rawMap)),
        tap((data) => this._sets.set(data)),
        catchError((err) => {
          this._error.set('Failed to load achievement sets.');
          console.error('Fetching Achievements - Error: ', err);
          return of([]);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  /**
   * Converts the JSON object map into a formatted array of sets.
   */
  private mapToViewModel(
    rawMap: Record<string, AchievementSet>,
  ): AchievementSetViewModel[] {
    return Object.entries(rawMap).map(([, rawSet]) => {
      const categoryLabel = this.formatCategory(rawSet.name);
      const processedAchievements = Object.values(rawSet.achievements)
        .sort((a, b) => b.points - a.points);

      return {
        slug: this.slugify(categoryLabel),
        categoryLabel,
        reward: rawSet.reward,
        // TRANSFORM: Object Record -> Sorted List
        achievements: processedAchievements,
      };
    });
  }

  /**
   * Converts a string format from "SetXX (Category)" to "Set XX - Category"
   * @param input - The raw string (e.g., "Set01 (Construction)")
   * @returns The formatted string (e.g., "Set 01 - Construction")
   */
  private formatCategory(input: string): string {
    // Regex breakdown:
    // ^(Set)         -> Matches "Set" at the start
    // (\d+)          -> Matches one or more digits
    // \s*            -> Matches optional whitespace
    // \(([^)]+)\)    -> Matches text inside parentheses
    const regex = /^(Set)(\d+)\s*\(([^)]+)\)/;
    const match = input.match(regex);
    if (!match) return input; // Return original if format doesn't match
    const [, prefix, number, label] = match;
    return `${prefix} ${number} - ${label}`;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
