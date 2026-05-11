import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

/**
 * @TODO move to shared data-access library.
 */
// export interface LocalizedString {
//   english: string;
//   german?: string;
//   spanish?: string;
//   french?: string;
//   italian?: string;
//   japanese?: string;
//   korean?: string;
//   polish?: string;
//   brazilian?: string;
//   russian?: string;
//   simplified_chinese?: string;
//   traditional_chinese?: string;
// }

/**
 * Represents the metadata for a construction category/tab.
 */
export interface ConstructionCategoryMeta {
  guid: string; // The unique ID of the category
  name: string; // Internal technical name (e.g., "ConstructionCategory_Classic")
  localized_name: string; // The translated title displayed in the UI (e.g., "Classic")
}

/**
 * The main interface for an ornament entry exported from the Anno 117 assets.
 */
export interface OrnamentalBuildingRawEntry {
  /** The unique GUID of the asset */
  uid: number;

  /** Technical name of the asset */
  name: string;

  /** Localized display title */
  title: string;

  /** Localized in-game description */
  description: string;

  /** * Path to the processed .webp icon.
   * Usually matches: .cache/data/ui/.../icon.webp
   */
  image_url: string;

  /** Prestige points granted (0 for PolygonObjects) */
  prestige: number;

  /** Construction cost in Denarii (0 for PolygonObjects) */
  cost: number;

  /** * The immediate sub-menu category the ornament sits in.
   * Example: "Trees" or "Benches"
   */
  construction_group: ConstructionCategoryMeta;

  /** * The root-level menu tab the ornament belongs to.
   * Example: "Classic" or "Social"
   */
  top_level_group: ConstructionCategoryMeta;
}

/**
 * Type helper for the overall JSON file structure (Map of GUID -> Entry)
 *
 * @TODO move to shared data-access library.
 */
export type OrnamentRegistry = Record<string, OrnamentalBuildingRawEntry>;

export interface OrnamentalBuildingViewModel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly image_url: string;
  readonly cost: number;
  readonly prestige: number;
  readonly groupName: string; // The technical name (e.g., Roman Infrastructure Harbor)
  readonly groupDisplayName: string; // The localized name (e.g., Harbour Buildings)
  readonly groupSlug: string; // group-level identification
  readonly groupId: string; // construction_group.guid
  readonly topGroupName: string; // top_level_group.localized_name
}

@Injectable({
  providedIn: 'root',
})
export class OrnamentalBuildingService {
  private readonly http = inject(HttpClient);

  // Path to the placeholder image used when an asset fails to load
  readonly placeholderImage =
    'assets/icons/base/icon_content/ornaments/icon_3d_ground_romanpavement_0.webp';

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
  fetchOrnaments(language = 'en') {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<OrnamentRegistry>(`assets/data/ornaments_${language}.json`)
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
    rawMap: OrnamentRegistry,
  ): OrnamentalBuildingViewModel[] {
    return Object.entries(rawMap).map(([id, rawRow]) => {
      // console.groupCollapsed(`${rawRow.title}`);
      // console.log(`Image URL: ${rawRow.image_url}`);
      // console.log(
      //   `Transformed Image URL: ${this.transformImageUrl(rawRow.image_url)}`,
      // );
      // console.groupEnd();

      return {
        slug: this.slugify(rawRow.title),
        id, // Set the ID from the object key
        image_url: this.transformImageUrl(rawRow.image_url),
        name: rawRow.title,
        description: rawRow.description,
        prestige: rawRow.prestige,
        cost: rawRow.cost,
        groupId: rawRow.construction_group.guid,
        groupSlug: this.slugify(rawRow.construction_group.name),
        groupName: rawRow.construction_group.name, // Technical Name
        groupDisplayName: rawRow.construction_group.localized_name, // Localized Name
        topGroupName: rawRow.top_level_group.localized_name,
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

    // 5. Ensure .webp extension
    if (!finalPath.toLowerCase().endsWith('.webp')) {
      finalPath += '.webp';
    }

    // 6. Clean up double slashes
    return finalPath.replace(/([^:]\/)\/+/g, '$1');
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
