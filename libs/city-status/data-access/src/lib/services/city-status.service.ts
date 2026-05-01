import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, forkJoin, map, of, tap } from 'rxjs';
import {
  CityAttributeEffects,
  CityAttributeEffectsViewModel,
  CityStatusRawData,
  CityStatusViewModel,
} from '../models/city-status.model';

interface CityStatusSetViewModel {
  roman: CityStatusViewModel[];
  celtic: CityStatusViewModel[];
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
   * Fetches both the roman and celtic city status levels from the JSON archive.
   *
   * Paths:
   * - assets/data/city_status_roman.json
   * - assets/data/city_status_celtic.json
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

    return forkJoin([roman$, celtic$])
      .pipe(
        map(([rawRoman, rawCeltic]) => ({
          roman: this.mapToViewModel(rawRoman),
          celtic: this.mapToViewModel(rawCeltic),
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
        image_url: this.transformImageUrl(rawCityStatus.Icon),
        name: rawCityStatus.Name,
        required_pop: rawCityStatus.RequiredPopulation,
        attributes: {
          roman: this.mapAttributes(rawCityStatus.AttributeEffectsRoman),
          regional: this.mapAttributes(rawCityStatus.AttributeEffectsRegional),
          mixed: this.mapAttributes(rawCityStatus.AttributeEffectsMixed),
        },
      };
    });
  }

  /**
   * Maps PascalCase raw attributes to snake_case view model attributes.
   */
  private mapAttributes(
    raw: CityAttributeEffects,
  ): CityAttributeEffectsViewModel {
    return {
      belief: raw.Belief,
      knowledge: raw.Knowledge,
      prestige: raw.Prestige,
      happiness: raw.Happiness,
      fire_safety: raw.FireSafety,
      health: raw.Health,
    };
  }

  /**
   * Transforms internal path structure to public asset path.
   * From: \\data\\ui\\4k\\base\\icon_content\\city_status\\icon_2d_city_status_01_0
   * To: assets\icons\base\icon_content\city_status\icon_2d_city_status_01_0
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
