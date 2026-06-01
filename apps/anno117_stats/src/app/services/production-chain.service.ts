import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

/**
 * Define the dataset 'Region' that must contain 4 values.
 */
export const Region = {
  META: 'Meta',
  ROMAN: 'Roman',
  CELTIC: 'Celtic',
  EGYPTIAN: 'Egyptian',
} as const;
export type RegionType = (typeof Region)[keyof typeof Region];

/**
 * Represents a single building node inside the production hierarchy tree.
 */
export interface BuildingNodeJSON {
  guid: number;
  std_name: string;
  text: string;
  icon_url: string;
  canon_name: string;
  region: RegionType[]
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
   * Converts, strictly deduplicates by structure, and sorts raw data into the ViewModel format.
   */
  private mapToViewModel(
    rawMap: ProductionChainRegistry,
  ): ProductionChainViewModel[] {
    // 1. Map raw key/value entries into basic view model shapes
    const mappedChains = Object.entries(rawMap).map(([id, rawRow]) => {
      return {
        id,
        uid: rawRow.uid,
        slug: this.slugify(rawRow.name),
        canonName: rawRow.canon_name,
        name: rawRow.name,
        description: rawRow.description,
        outputBuilding: rawRow.output_building,
      };
    });

    const seenSignatures = new Set<string>();

    // Helper to recursively gather all dependency tree building GUIDs
    const collectTierGuids = (node: BuildingNodeJSON): number[] => {
      const guids: number[] = [];
      const traverse = (current: BuildingNodeJSON) => {
        if (current.tier) {
          current.tier.forEach((child) => {
            guids.push(child.guid);
            traverse(child);
          });
        }
      };
      traverse(node);
      return guids;
    };

    // 2. Filter out structural duplicates and sort alphabetically by outputBuilding.text
    return mappedChains
      .filter((chain) => {
        const rootBuilding = chain.outputBuilding;
        if (!rootBuilding) return false;

        // Gather and sort child tiers to generate an order-independent signature
        const tierGuids = collectTierGuids(rootBuilding).sort((a, b) => a - b);
        
        // Structural unique fingerprint hash format: "rootGuid:childGuid1,childGuid2..."
        const signature = `${rootBuilding.guid}:${tierGuids.join(',')}`;

        if (seenSignatures.has(signature)) {
          return false; // Skip exact structural duplicate
        }

        seenSignatures.add(signature);
        return true;
      })
      .sort((a, b) =>
        a.outputBuilding.text.localeCompare(b.outputBuilding.text),
      );
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