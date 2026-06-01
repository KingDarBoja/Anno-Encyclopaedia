import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { SpecialistService, HydratedSpecialistViewModel } from './specialist.service';

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

export type ProductionChainRegistry = Record<string, ProductionChainJSON>;

export interface ProductionChainViewModel {
  readonly id: string; 
  readonly uid: number; 
  readonly slug: string; 
  readonly canonName: string;
  readonly name: string;
  readonly description: string;
  readonly outputBuilding: BuildingNodeJSON;
}

@Injectable({
  providedIn: 'root',
})
export class ProductionChainService {
  private readonly http = inject(HttpClient);
  private readonly specialistService = inject(SpecialistService);

  readonly placeholderImage = 'assets/icons/base/icon_content/buildings/building_icon_default.webp';

  private readonly _chains = signal<ProductionChainViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly chains = this._chains.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Evaluates the active specialist registry and assigns the specialists 
   * that directly affect the provided building node GUID.
   */
  public getSpecialistsForBuilding(guid: number | undefined): HydratedSpecialistViewModel[] {
    if (!guid) return [];
    
    const allSpecialists = this.specialistService.hydratedSpecialists();
    
    return allSpecialists.filter((spec) =>
      spec.effect?.targets?.some(
        (tgt) =>
          tgt.guid === guid || tgt.affected_items?.some((item) => item.guid === guid)
      )
    );
  }

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

  private mapToViewModel(rawMap: ProductionChainRegistry): ProductionChainViewModel[] {
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

    return mappedChains
      .filter((chain) => {
        const rootBuilding = chain.outputBuilding;
        if (!rootBuilding) return false;

        const tierGuids = collectTierGuids(rootBuilding).sort((a, b) => a - b);
        const signature = `${rootBuilding.guid}:${tierGuids.join(',')}`;

        if (seenSignatures.has(signature)) return false;
        
        seenSignatures.add(signature);
        return true;
      })
      .sort((a, b) => a.outputBuilding.text.localeCompare(b.outputBuilding.text));
  }

  private slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
}