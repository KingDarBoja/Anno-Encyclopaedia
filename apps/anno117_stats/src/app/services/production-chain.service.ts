import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

/**
 * Represents a single building node inside the production hierarchy tree.
 */
export interface BuildingNodeJSON {
  guid: number;
  std_name: string;
  text: string;
  icon_url: string;
  canon_name: string;
  tier: BuildingNodeJSON[];
}

/**
 * Represents the raw JSON payload format for a production chain.
 */
export interface ProductionChainJSON {
  uid: number;
  canon_name: string;
  name: string;
  description: string;
  output_building: BuildingNodeJSON;
}

/**
 * Map dictionary representing the overall JSON archive structure.
 */
export type ProductionChainRegistry = Record<string, ProductionChainJSON>;

/**
 * Frontend ViewModel for selecting and displaying production chains.
 */
export interface ProductionChainViewModel {
  readonly id: string; // The GUID key from the object map
  readonly uid: number; // The unique integer ID
  readonly slug: string; // URL-safe identifier
  readonly canonName: string;
  readonly name: string;
  readonly description: string;
  readonly outputBuilding: BuildingNodeJSON; // Tree-structure mapping directly
}

@Injectable({
  providedIn: 'root',
})
export class ProductionChainService {
  private readonly http = inject(HttpClient);

  // Path to the placeholder image used when an asset fails to load
  readonly placeholderImage =
    'assets/icons/base/icon_content/buildings/building_icon_default.webp';

  /**
   * State management using reactive Angular Signals.
   */
  private readonly _chains = signal<ProductionChainViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly chains = this._chains.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Fetches the production chains from the JSON data asset archive.
   *
   * @param language The target localization key (e.g., 'en', 'ger')
   */
  fetchChains(language = 'en') {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ProductionChainRegistry>(`assets/data/chains_${language}.json`)
      .pipe(
        map((rawData) => this.mapToViewModel(rawData)),
        tap((results) => {
          this._chains.set(results);
        }),
        catchError((err) => {
          this._error.set('Failed to load production chains.');
          console.error('Fetching Production Chains - Error: ', err);
          return of([]);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  /**
   * Converts the raw JSON payload map into a formatted array of production chains.
   */
  private mapToViewModel(
    rawMap: ProductionChainRegistry,
  ): ProductionChainViewModel[] {
    return Object.entries(rawMap).map(([id, rawRow]) => {
      return {
        id,
        uid: rawRow.uid,
        slug: this.slugify(rawRow.name),
        canonName: rawRow.canon_name,
        name: rawRow.name,
        description: rawRow.description,
        outputBuilding: rawRow.output_building, // Assigned directly since paths are pre-resolved
      };
    });
  }

  /**
   * Helper to slugify text string keys.
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}