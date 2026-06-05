import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { translateArray, TRANSLATIONS_EN } from '../models/translations_mapping';
import { RegionValue } from '../models/enums';

// --- EXPORT JSON INTERFACES ---

export interface ResourceSetConditionJSON {
  region: RegionValue[];
  island_type: string[];
  island_diff: string[];
  res_amounts: string[];
  island_size: string[];
}

export interface FertilityOptionJSON {
  guid: string;
  name: string;
  title?: string;
  icon_url: string;
}

export interface FertilitySlotJSON {
  index: number;
  name: string;
  is_pool: boolean;
  options: FertilityOptionJSON[];
}

export interface FertilitySetJSON {
  guid: string;
  name: string;
  condition: ResourceSetConditionJSON;
  slots: FertilitySlotJSON[];
}

export type FertilitySetRegistry = Record<string, FertilitySetJSON>;

// --- VIEW MODEL ---

export interface FertilitySetViewModel {
  readonly id: string;
  readonly name: string;
  readonly rawRegions: RegionValue[]; // Kept for logic/grouping
  readonly regions: string;      // Translated display string
  readonly difficulties: string; // Translated display string
  readonly islandTypes: string;  // Translated display string
  readonly slots: FertilitySlotJSON[];
}

export interface FertilitySetRegionGroup {
  regionKey: string;
  regionName: string;
  regionIcon: string;
  sets: FertilitySetViewModel[];
  dynamicSlotColumns: number[];
  displayedColumns: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FertilitySetService {
  private readonly http = inject(HttpClient);

  private readonly _sets = signal<FertilitySetViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly sets = this._sets.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  fetchFertilitySets(language = 'en') {
    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<FertilitySetRegistry>(`assets/data/fertility_sets_${language}.json`)
      .pipe(
        map((registry) => this.mapToViewModel(registry)),
        tap((results) => {
          this._sets.set(results);
        }),
        catchError((err) => {
          console.warn(
            'Failed to load fertility sets database. Using mock preview data.',
            err,
          );
          this._error.set('Failed to load fertility sets database.');
          // Fallback to mock data for layout demonstration purposes
          this._sets.set(this.mapToViewModel(this.getMockRegistry()));
          return of([]);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  private mapToViewModel(
    rawRegistry: FertilitySetRegistry,
  ): FertilitySetViewModel[] {
    return Object.values(rawRegistry).map((rawRow) => ({
      id: rawRow.guid,
      name: rawRow.name,
      rawRegions: rawRow.condition.region,
      regions: translateArray(rawRow.condition.region, TRANSLATIONS_EN.Region),
      difficulties: translateArray(rawRow.condition.island_diff, TRANSLATIONS_EN.IslandDifficulty),
      islandTypes: translateArray(rawRow.condition.island_type, TRANSLATIONS_EN.IslandType),
      slots: rawRow.slots.sort((a, b) => a.index - b.index),
    }));
  }

  private getMockRegistry(): FertilitySetRegistry {
    const defaultIcon =
      'assets/icons/base/icon_content/generic/icon_2d_generic_item_0.webp';
    return {
      '31312': {
        guid: '31312',
        name: 'Fertility Set Roman 1st Island Easy',
        condition: {
          region: ['Roman'],
          island_type: ['Starter'],
          island_diff: ['Normal', 'Hard'],
          res_amounts: ['High'],
          island_size: ['Small', 'Medium', 'Large', 'XL'],
        },
        slots: [
          {
            index: 0,
            name: 'Fertility Pool Roman Mackerel Lavender',
            is_pool: true,
            options: [
              { guid: '101', name: 'Mackerel', icon_url: defaultIcon },
              { guid: '102', name: 'Lavender', icon_url: defaultIcon },
            ],
          },
          {
            index: 1,
            name: 'Iron Deposit',
            is_pool: false,
            options: [
              { guid: '103', name: 'Iron Deposit', icon_url: defaultIcon },
            ],
          },
          {
            index: 2,
            name: 'Fertility Pool Roman Grapes Flax Sea Snails Oysters Sturgeon Gold',
            is_pool: true,
            options: [
              { guid: '104', name: 'Grapes', icon_url: defaultIcon },
              { guid: '105', name: 'Flax', icon_url: defaultIcon },
              { guid: '106', name: 'Sea Snails', icon_url: defaultIcon },
              { guid: '107', name: 'Oysters', icon_url: defaultIcon },
              { guid: '108', name: 'Sturgeon', icon_url: defaultIcon },
              { guid: '109', name: 'Gold', icon_url: defaultIcon },
            ],
          },
          {
            index: 3,
            name: 'Fertility Pool Roman Grapes Flax Sea Snails Oysters Sturgeon Gold',
            is_pool: true,
            options: [
              { guid: '104', name: 'Grapes', icon_url: defaultIcon },
              { guid: '105', name: 'Flax', icon_url: defaultIcon },
              { guid: '106', name: 'Sea Snails', icon_url: defaultIcon },
            ],
          },
        ],
      },
    };
  }
}
