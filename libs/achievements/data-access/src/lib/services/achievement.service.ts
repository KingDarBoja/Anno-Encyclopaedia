import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';
import { AchievementSet } from '../models/achievement.model';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly http = inject(HttpClient);

  /**
   * State management using Angular Signals.
   */
  private readonly _sets = signal<AchievementSet[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public readonly achievementSets = this._sets.asReadonly();
  public readonly isLoading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  /**
   * Total prestige calculated across all sets.
   */
  public readonly totalPoints = computed(() =>
    this._sets().reduce(
      (acc, set) =>
        acc + set.achievements.reduce((sAcc, a) => sAcc + a.points, 0),
      0,
    ),
  );

  /**
   * Fetches the categorized achievement sets from the JSON archive.
   * Path: assets/data/achievements.json
   */
  public fetchAchievements() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<AchievementSet[]>('assets/data/achievements.json')
      .pipe(
        tap((data) => this._sets.set(data)),
        catchError((err) => {
          this._error.set('Failed to load achievements.');
          console.error('Fetching Achievements - Error: ', err);
          return of([]);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }
}
