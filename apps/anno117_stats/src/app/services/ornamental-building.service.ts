import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

/**
 * @TODO move to shared data-access library.
 */
export interface LocalizedString {
  english: string;
  german?: string;
  spanish?: string;
  french?: string;
  italian?: string;
  japanese?: string;
  korean?: string;
  polish?: string;
  brazilian?: string;
  russian?: string;
  simplified_chinese?: string;
  traditional_chinese?: string;
}

/**
 * @TODO move to shared data-access library.
 */
interface OrnamentalBuildingRawEntry {
  title: LocalizedString;
  description: LocalizedString;
  prestige: number;
  cost: number;
  image_url: string;
}

/**
 * Raw ornamental building data from JSON.
 *
 * @TODO move to shared data-access library.
 */
export interface OrnamentalBuildingRawData {
  [uid: string]: OrnamentalBuildingRawEntry;
}

export interface OrnamentalBuildingViewModel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly image_url: string;
  readonly cost: number;
  readonly prestige: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrnamentalBuildingService {
  private readonly http = inject(HttpClient);

  // Path to the placeholder image used when an asset fails to load
  readonly placeholderImage = 'assets/icons/base/icon_content/ornaments/icon_3d_ground_romanpavement_0.webp';

  /**
   * State management using Angular Signals.
   */
  private readonly _buildings = signal<OrnamentalBuildingViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly buildings = this._buildings.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Fetches the ornamental buildings from the JSON archive.
   */
  fetchOrnaments() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<OrnamentalBuildingRawData>('assets/data/ornaments.json')
      .pipe(
        map((rawData) => this.mapToViewModel(rawData)),
        tap((results) => {
          this._buildings.set(results);
        }),
        catchError((err) => {
          this._error.set('Failed to load ornamental buildings.');
          console.error('Fetching Ornamental Buildings - Error: ', err);
          return of({ roman: [], celtic: [] });
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  /**
   * Converts the JSON object map into a formatted array of ornamental buildings.
   */
  private mapToViewModel(
    rawMap: OrnamentalBuildingRawData,
  ): OrnamentalBuildingViewModel[] {
    return Object.entries(rawMap).map(([id, rawRow]) => {
      return {
        slug: this.slugify(rawRow.title.english),
        id, // Set the ID from the object key
        image_url: this.transformImageUrl(rawRow.image_url),
        name: rawRow.title.english,
        description: rawRow.description.english,
        prestige: rawRow.prestige,
        cost: rawRow.cost,
      };
    });
  }

  /**
   * Transforms internal path structure to public asset path.
   * From: \\data\\ui\\4k\\base\\icon_content\\ornaments\\icon_3d_wall_celtic_0
   * To: assets\icons\base\icon_content\ornaments\icon_3d_wall_celtic_0
   */
  transformImageUrl(rawPath: string): string {
    if (!rawPath) return '';

    // 1. Normalize slashes
    const path = rawPath.replace(/\\/g, '/');

    // 2. Identify the DLC/CDLC marker (base, dlc01, cdlc01)
    const dlcMatch = path.match(/c?dlc\d+/i);
    const subFolder = dlcMatch ? dlcMatch[0].toLowerCase() : 'base';

    // 3. Define the specific "anchors" for each path type
    const iconContentMarker = 'icon_content/';
    const dlcAnchor = `/${subFolder}/`;

    let relativePath = '';

    if (path.includes(iconContentMarker)) {
      /**
       * BASE & DLC CASE:
       * We keep the 'icon_content/' folder name and everything after it.
       * From: .../base/icon_content/ornaments/hall_of_fame/icon
       * To: icon_content/ornaments/hall_of_fame/icon
       */
      relativePath = path.substring(path.indexOf(iconContentMarker));
    } else {
      /**
       * CDLC CASE:
       * We take everything strictly AFTER the dlc folder name.
       * From: .../cdlc01/ornaments/some_folder/icon
       * To: ornaments/some_folder/icon
       */
      const anchorIndex = path.indexOf(dlcAnchor);
      if (anchorIndex !== -1) {
        relativePath = path.substring(anchorIndex + dlcAnchor.length);
      } else {
        // Fallback for unexpected paths: just get the filename
        relativePath = path.split('/').pop() || '';
      }
    }

    // 4. Construct final path
    let finalPath = `assets/icons/${subFolder}/${relativePath}`;

    // 5. Ensure .webp extension[cite: 1]
    if (!finalPath.toLowerCase().endsWith('.webp')) {
      finalPath += '.webp';
    }

    // 6. Clean up double slashes[cite: 1]
    return finalPath.replace(/([^:]\/)\/+/g, '$1');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
