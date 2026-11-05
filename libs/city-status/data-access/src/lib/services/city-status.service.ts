import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, forkJoin, map, of, tap } from 'rxjs';
import {
  CityStatusRawData,
  CityStatusViewModel,
} from '../models/city-status.model';

interface CityStatusSetViewModel {
  roman: CityStatusViewModel[];
  celtic: CityStatusViewModel[];
  egyptian: CityStatusViewModel[];
}

@Injectable({ providedIn: 'root' })
export class CityStatusService {
  private readonly http = inject(HttpClient);

  /**
   * State management using Angular Signals.
   */
  private readonly _sets = signal<CityStatusSetViewModel>({
    roman: [],
    celtic: [],
    egyptian: [],
  });
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly cityStatusSets = this._sets.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** Placeholder icon for achievements. */
  readonly placeholderImage =
    'assets/icons/base/icon_content/city_status/icon_2d_city_status_01_0.webp';

  /**
   * Fetches the roman, celtic, and egyptian city status levels from the JSON archive.
   *
   * Paths:
   * - assets/data/city_status_roman.json
   * - assets/data/city_status_celtic.json
   * - assets/data/city_status_egyptian.json
   */
  fetchCityStatuses() {
    this._loading.set(true);
    this._error.set(null);

    const roman$ = this.http.get<CityStatusRawData>(
      'assets/data/city_status_roman.json',
    );
    const celtic$ = this.http.get<CityStatusRawData>(
      'assets/data/city_status_celtic.json',
    );
    const egyptian$ = this.http.get<CityStatusRawData>(
      'assets/data/city_status_egyptian.json',
    );

    return forkJoin([roman$, celtic$, egyptian$])
      .pipe(
        map(([rawRoman, rawCeltic, rawEgyptian]) => ({
          roman: this.mapToViewModel(rawRoman),
          celtic: this.mapToViewModel(rawCeltic),
          egyptian: this.mapToViewModel(rawEgyptian),
        })),
        tap((results) => {
          this._sets.set(results);
        }),
        catchError((err) => {
          this._error.set('Failed to load city status levels.');
          console.error('Fetching City Status Levels - Error: ', err);
          return of({ roman: [], celtic: [] });
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  /**
   * Converts the JSON object map into a formatted array of sets.
   */
  private mapToViewModel(rawMap: CityStatusRawData): CityStatusViewModel[] {
    return Object.entries(rawMap).map(([id, rawCityStatus]) => {
      const label = this.formatCityStatus(id);

      return {
        slug: this.slugify(label),
        id, // Set the ID from the object key
        icon_url: rawCityStatus.icon_url,
        name: rawCityStatus.name,
        required_pop: rawCityStatus.required_population,
        attributes: {
          roman: rawCityStatus.attribute_effects_roman,
          regional: rawCityStatus.attribute_effects_regional,
          mixed: rawCityStatus.attribute_effects_mixed,
        },
        incident_interval: rawCityStatus.incident_interval,
      };
    });
  }

  /**
   * Converts a string format from "roman_XX" to "Roman XX"
   * @param input - The raw string (e.g., "roman_03")
   * @returns The formatted string (e.g., "Roman 03")
   */
  private formatCityStatus(input: string): string {
    if (!input) return '';
    return input
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
