import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

/**
 * Localized milestone structures tracking devotion milestones
 */
export interface MilestoneJSON {
  devotion: number;
  buff_scaling: number;
}

/**
 * Details of single production assets/buildings within a chain
 */
export interface ProductionAssetInfo {
  guid: number;
  name: string;
  text: string;
}

/**
 * Details of affected production chains
 */
export interface AffectedChainInfo {
  name: string;
  text: string;
  production_assets: ProductionAssetInfo[];
}

/**
 * Localized effects linked to devotion milestones and affected chains
 */
export interface LocalEffectJSON {
  title: string;
  description: string;
  milestones: MilestoneJSON[];
  affected_chains: Record<string, AffectedChainInfo>;
}

/**
 * Global veneration effect (e.g., active at 4K devotion)
 */
export interface VenerationEffectJSON {
  title: string;
  description: string;
}

/**
 * Shrine definition detail
 */
export interface ShrineItemJSON {
  guid: number;
  title: string;
}

/**
 * Shrine effect details
 */
export interface ShrineEffectJSON {
  title: string;
  guid: number;
  shrines: ShrineItemJSON[];
}

/**
 * Top global exaltation effect (active at 7K global devotion)
 */
export interface ExaltationEffectJSON {
  title: string;
  description: string;
}

/**
 * In-game portrait paths
 */
export interface PortraitJSON {
  big: string;
  small: string;
}

/**
 * Full Patron JSON entity mirroring patrons_en.json
 */
export interface PatronJSON {
  uid: number;
  canon_name: string;
  title: string;
  description: string;
  icon_url: string;
  canon_icon_name: string;
  local_effects: LocalEffectJSON[];
  veneration_effect: VenerationEffectJSON;
  shrine_effect: ShrineEffectJSON;
  exaltation_effects: ExaltationEffectJSON[];
  portraits: PortraitJSON;
}

export type PatronRegistry = Record<string, PatronJSON>;

/**
 * Expanded UI ViewModel
 */
export interface PatronViewModel extends PatronJSON {
  id: string;
  slug: string;
}

@Injectable({
  providedIn: 'root',
})
export class PatronsService {
  private readonly http = inject(HttpClient);

  private readonly _patrons = signal<PatronViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly patrons = this._patrons.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Fetches the patron database records
   * @param language Target language localization
   */
  fetchPatrons(language = 'en') {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<PatronRegistry>(`assets/data/patrons_${language}.json`)
      .pipe(
        map((rawData) => this.mapToViewModel(rawData)),
        tap((results) => {
          this._patrons.set(results);
        }),
        catchError((err) => {
          this._error.set('Could not retrieve deities database.');
          console.error('Patrons Service Error: ', err);
          return of([]);
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe();
  }

  private mapToViewModel(rawMap: PatronRegistry): PatronViewModel[] {
    return Object.entries(rawMap).map(([id, rawRow]) => ({
      ...rawRow,
      id,
      slug: rawRow.title.toLowerCase().replace(/\s+/g, '-'),
    }));
  }
}