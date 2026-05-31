import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

export interface ConstructionGroupJSON {
  guid: string;
  name: string;
  localized_name: string;
  icon_url: string;
}

export interface OrnamentGroupPlacementJSON {
  top_level_guid: string;
  construction_group_guid: string;
}

export interface OrnamentItemJSON {
  uid: number;
  name: string;
  title: string;
  description: string;
  icon_url: string;
  origin: string;
  prestige: number;
  cost: number;
  construction_groups: OrnamentGroupPlacementJSON[];
}

export type OrnamentRegistry = Record<string, OrnamentItemJSON>;
export type CategoryRegistry = Record<string, ConstructionGroupJSON>;

export interface ResolvedPlacement {
  topLevelGuid: string;
  topLevelName: string;
  topLevelIcon: string;
  subCategoryGuid: string;
  subCategoryName: string;
  subCategoryIcon: string;
}

export interface OrnamentalBuildingViewModel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly image_url: string;
  readonly cost: number;
  readonly prestige: number;
  readonly origin: string;
  readonly placements: ResolvedPlacement[];
}

@Injectable({
  providedIn: 'root',
})
export class OrnamentalBuildingService {
  private readonly http = inject(HttpClient);

  readonly placeholderImage =
    'assets/icons/base/icon_content/ornaments/icon_3d_ground_romanpavement_0.webp';

  private readonly _buildings = signal<OrnamentalBuildingViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly buildings = this._buildings.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  fetchOrnaments(language = 'en') {
    this._loading.set(true);
    this._error.set(null);

    // Concurrently fetch both decoupled JSON exports from the asset engine
    return forkJoin({
      ornaments: this.http.get<OrnamentRegistry>(`assets/data/ornaments_${language}.json`),
      categories: this.http.get<CategoryRegistry>(`assets/data/categories_ornaments_${language}.json`),
    })
      .pipe(
        map(({ ornaments, categories }) => this.mapToViewModel(ornaments, categories)),
        tap((results) => {
          this._buildings.set(results);
        }),
        catchError((err) => {
          this._error.set('Failed to load ornamental buildings database.');
          console.error('Fetching Ornamental Data Error: ', err);
          return of([]);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  private mapToViewModel(
    rawOrnaments: OrnamentRegistry,
    rawCategories: CategoryRegistry,
  ): OrnamentalBuildingViewModel[] {
    return Object.entries(rawOrnaments).map(([id, rawRow]) => {
      // Resolve every placement identifier cleanly against the category register
      const resolvedPlacements: ResolvedPlacement[] = rawRow.construction_groups.map((group) => {
        const topGroup = rawCategories[group.top_level_guid];
        const subGroup = rawCategories[group.construction_group_guid];

        return {
          topLevelGuid: group.top_level_guid,
          topLevelName: topGroup?.localized_name || 'General',
          topLevelIcon: topGroup?.icon_url || '',
          subCategoryGuid: group.construction_group_guid,
          subCategoryName: subGroup?.localized_name || 'Miscellaneous',
          subCategoryIcon: subGroup?.icon_url || '',
        };
      });

      return {
        id,
        slug: this.slugify(rawRow.title),
        name: rawRow.title,
        description: rawRow.description,
        image_url: rawRow.icon_url || this.placeholderImage,
        prestige: rawRow.prestige,
        cost: rawRow.cost,
        origin: rawRow.origin || 'Base Game',
        placements: resolvedPlacements,
      };
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}