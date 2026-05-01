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
      const categoryLabel = this.formatCategory(rawSet.category);
      const processedAchievements = Object.entries(rawSet.achievements)
        .map(([uid, ach]) => ({
          ...ach,
          id: uid, // Set the ID from the object key
          image_url: this.transformImageUrl(ach.image_url),
        }))
        .sort((a, b) => b.points - a.points);

      return {
        slug: this.slugify(categoryLabel),
        categoryLabel,
        reward: rawSet.reward.english,
        // TRANSFORM: Object Record -> Sorted List
        achievements: processedAchievements,
      };
    });
  }

  /**
   * Transforms internal path structure to public asset path.
   * From: \\data\\ui\\4k\\base\\icon_content\\achievements\\achievement_set01_01_0
   * To: assets\icons\base\icon_content\achievements\achievement_set01_01_0
   */
  public transformImageUrl(rawPath: string): string {
    if (!rawPath) return '';

    // 1. Normalize slashes
    let path = rawPath.replace(/\\/g, '/');

    // 2. Identify the core marker
    const marker = 'icon_content/';
    const markerIndex = path.indexOf(marker);

    if (markerIndex !== -1) {
      // Extract everything from 'icon_content/' onwards
      const relativePath = path.substring(markerIndex);

      // 3. Check for DLC markers in the original path
      // We look for 'dlc' followed by numbers, or specific folder names
      const dlcMatch = path.match(/dlc\d+/i);
      const subFolder = dlcMatch ? dlcMatch[0].toLowerCase() : 'base';

      // 4. Construct the path: assets/icons/[base|dlc01]/icon_content/...
      path = `assets/icons/${subFolder}/${relativePath}`;
    } else {
      // Fallback for simple filenames
      if (path.startsWith('/')) path = path.substring(1);
      path = `assets/icons/base/icon_content/${path}`;
    }

    // 5. Ensure .webp extension
    if (!path.toLowerCase().endsWith('.webp')) {
      path += '.webp';
    }

    // 6. Final sanitization (remove double slashes except after protocol)
    return path.replace(/([^:]\/)\/+/g, '$1');
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
