import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// --- Enums ---
export enum ItemAllocation {
  // NONE = 'None',
  SHIP = 'Ship',
  VILLA = 'Villa',
}

export enum RarityVisualization {
  // NARRATIVE = 'Narrative',
  COMMON = 'Common',
  // UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  // QUEST = 'Quest',
  UNIQUE = 'Unique',
}

export enum NicheVisualization {
  NONE = 'None',
  FINANCE = 'Finance',
  RELIGION = 'Religion',
  RESEARCH = 'Research',
  CULTURE = 'Culture',
  ECONOMY = 'Economy',
  AGRICULTURE = 'Agriculture',
  DIPLOMACY = 'Diplomacy',
  MILITARY = 'Military',
  NAUTICS = 'Nautics',
}

export enum ScopeVisualization {
  LOCAL = 'Local',
  MODULE_OWNER = 'ModuleOwner',
  STREET_DISTANCE = 'StreetDistance',
  RADIUS = 'Radius',
  OBJECTS_IN_AREA = 'ObjectsInArea',
  AREA = 'Area',
  OBJECTS_IN_SESSION = 'ObjectsInSession',
  SESSION = 'Session',
  OBJECTS_IN_META = 'ObjectsInMeta',
  META = 'Meta',
  AREAS_IN_META = 'AreasInMeta',
  AREAS_IN_SESSION = 'AreasInSession',
}

// --- Raw Specialist Interfaces (Incoming JSON) ---
interface SpecialistAddedFertility {
  readonly guid: number;
  readonly name: string;
  readonly title: string;
  readonly percent: number;
}

interface SpecialistWorkforceReplacement {
  readonly old_workforce_guid: number;
  readonly old_workforce_title: string;
  readonly new_workforce_guid: number;
  readonly new_workforce_title: string;
}

interface SpecialistAttribute {
  readonly key: string;
  readonly value: string;
  readonly product_needs: number[];
}

interface SpecialistBuff {
  /** The buff GUID. */
  readonly guid: number;
  /** List of "targets" GUIDs this buff applies. */
  readonly target_guids: number[];
  readonly attributes: SpecialistAttribute[];
  readonly additional_workforces: number[];
  readonly added_fertility: SpecialistAddedFertility | null;
  readonly workforce_replacement: SpecialistWorkforceReplacement | null;
  /** Formatted workforce modifier (e.g: "25%"). */
  readonly workforce_modifier_in_percent: string | null;
}

interface SpecialistEffectTarget {
  /** Target GUID. Used to link the applied buffs to this target. */
  readonly guid: number;
  /** GUID of the target if it's an "AssetPoolNamed". This is the same as the
   * guid but used to differentiate from raw production items. */
  readonly asset_pool_guid: number | null;
  /** Localized title of the target if it's an "AssetPoolNamed". */
  readonly asset_pool_title: string | null;
  readonly affected_items: number[];
}

interface SpecialistEffect {
  readonly scope: ScopeVisualization;
  readonly category: string;
  readonly targets: SpecialistEffectTarget[];
  readonly buffs: SpecialistBuff[];
}

interface SpecialistBoost {
  /** Localized description of the boost condition trigger. */
  condition: string;
  /** Localized hint to unlock this boost. */
  hint: string;
  /** The buffs applied after unlocking this boost. */
  buffs: SpecialistBuff[];
}

interface SpecialistJSON {
  readonly title: string;
  readonly description: string;
  readonly icon_url: string;
  readonly rarity: RarityVisualization;
  readonly niche: NicheVisualization;
  readonly allocation: ItemAllocation;
  readonly has_boost: boolean;
  readonly boost_details: SpecialistBoost;
  readonly effect: SpecialistEffect;
}

export interface SpecialistViewModel extends SpecialistJSON {
  readonly id: string;
  readonly slug: string;
}

type SpecialistRegistry = Record<string, SpecialistJSON>;

// --- Referentials Lookup Lookup Definition ---
export interface AssetRefRecord {
  readonly name: string;
  readonly icon_url: string;
}

export type AssetsIndexRegistry = Record<string, AssetRefRecord>;

// --- Hydrated UI ViewModels (Joined State) ---

/** --- Referential Asset Interface --- */
export interface HydratedAsset {
  readonly guid: number;
  readonly name: string;
  readonly icon_url: string;
}

export interface HydratedSpecialistAttribute {
  readonly key: string;
  readonly value: string;
  readonly product_needs: HydratedAsset[];
}

export interface HydratedSpecialistAddedFertility
  extends SpecialistAddedFertility {
  readonly icon_url: string;
}

export interface HydratedSpecialistWorkforceReplacement
  extends SpecialistWorkforceReplacement {
  readonly old_workforce_icon_url: string;
  readonly new_workforce_icon_url: string;
}

export interface HydratedSpecialistBuff {
  readonly guid: number;
  readonly target_guids: number[];
  readonly attributes: HydratedSpecialistAttribute[];
  readonly additional_workforces: HydratedAsset[];
  readonly added_fertility: HydratedSpecialistAddedFertility | null;
  readonly workforce_replacement: HydratedSpecialistWorkforceReplacement | null;
  readonly workforce_modifier_in_percent: string | null;
}

export interface HydratedSpecialistEffectTarget {
  readonly guid: number;
  /** GUID of the target if it's an "AssetPoolNamed". This is the same as the
   * guid but used to differentiate from raw production items. */
  readonly asset_pool_guid: number | null;
  /** Localized title of the target if it's an "AssetPoolNamed". */
  readonly asset_pool_title: string | null;
  readonly affected_items: HydratedAsset[];
}

export interface HydratedSpecialistEffect {
  readonly scope: string;
  readonly category: string;
  readonly targets: HydratedSpecialistEffectTarget[];
  readonly buffs: HydratedSpecialistBuff[];
}

export interface HydratedSpecialistViewModel
  extends Omit<SpecialistViewModel, 'effect'> {
  readonly effect: HydratedSpecialistEffect;
}

@Injectable({
  providedIn: 'root',
})
export class SpecialistService {
  private readonly http = inject(HttpClient);

  private readonly _placeholder = 'assets/icons/placeholder_asset.webp';

  // Raw states
  private readonly _specialists = signal<SpecialistViewModel[]>([]);
  private readonly _assetsIndex = signal<AssetsIndexRegistry>({});

  // Loading & error trackers
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Read-only signals exposure
  readonly specialists = this._specialists.asReadonly();
  readonly assetsIndex = this._assetsIndex.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /**
   * Reactive computed state which automatically hydrases (joins) all loaded
   * specialists with their linked asset names and icons whenever either source changes.
   */
  readonly hydratedSpecialists = computed<HydratedSpecialistViewModel[]>(() => {
    const specs = this.specialists();
    const index = this.assetsIndex();

    // If index or specialists are empty, return non-hydrated fallback state structure
    if (specs.length === 0 || Object.keys(index).length === 0) {
      return [];
    }

    return specs.map((spec) => this.hydrateSpecialist(spec, index));
  });

  /**
   * Fetches the raw specialists data and referenced icons/names concurrently,
   * then updates raw state values.
   */
  fetchSpecialists() {
    this._loading.set(true);
    this._error.set(null);

    return forkJoin({
      specs: this.http.get<SpecialistRegistry>(
        'assets/data/specialists_en.json',
      ),
      index: this.http.get<AssetsIndexRegistry>(
        'assets/data/specialist_asset_ref.json',
      ),
    })
      .pipe(
        tap(({ specs, index }) => {
          this._assetsIndex.set(index);
          this._specialists.set(this.mapToViewModel(specs));
        }),
        catchError((err) => {
          this._error.set('Could not retrieve specialist archives.');
          console.error('Specialist Hydration Service Error: ', err);
          return of({ specs: {}, index: {} });
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  private mapToViewModel(rawMap: SpecialistRegistry): SpecialistViewModel[] {
    return Object.entries(rawMap).map(([id, rawRow]) => ({
      ...rawRow,
      id,
      slug: rawRow.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }

  /**
   * Helper algorithm to structurally map individual raw view model objects
   * into clean, fully-hydrated items using the assets lookup table.
   */
  private hydrateSpecialist(
    spec: SpecialistViewModel,
    index: AssetsIndexRegistry,
  ): HydratedSpecialistViewModel {
    // Internal helper to look up a GUID in our mapping index
    const resolveAsset = (guid: number): HydratedAsset => {
      const match = index[guid.toString()];
      return {
        guid,
        name: match ? match.name : `Unknown Asset (${guid})`,
        icon_url: match ? match.icon_url : this._placeholder,
      };
    };

    const hydratedEffect: HydratedSpecialistEffect = {
      scope: spec.effect.scope,
      category: spec.effect.category,
      // Map targets list
      targets: spec.effect.targets.map((tgt) => {
        // 1. Resolve all assets to HydratedAsset objects
        const allAssets = tgt.affected_items.map((guid) => resolveAsset(guid));

        // 2. Filter by unique name using a Map
        const uniqueAssetsMap = new Map<string, HydratedAsset>();
        allAssets.forEach((asset) => {
          if (!uniqueAssetsMap.has(asset.name)) {
            uniqueAssetsMap.set(asset.name, asset);
          }
        });

        return {
          guid: tgt.guid,
          asset_pool_guid: tgt.asset_pool_guid,
          asset_pool_title: tgt.asset_pool_title,
          affected_items: Array.from(uniqueAssetsMap.values()),
        };
      }),
      // Map buffs list
      buffs: spec.effect.buffs.map((buff) => {
        // Hydrate product requirements inside this buff's attributes
        const hydratedAttributes = buff.attributes.map((attr) => ({
          key: attr.key,
          value: attr.value,
          product_needs: attr.product_needs.map((guid) => resolveAsset(guid)),
        }));

        // Hydrate additional workforces
        const hydratedWorkforces = buff.additional_workforces.map((guid) =>
          resolveAsset(guid),
        );

        // Hydrate added fertility seeder metadata
        let hydratedFertility: HydratedSpecialistAddedFertility | null = null;
        if (buff.added_fertility) {
          const match = index[buff.added_fertility.guid.toString()];
          hydratedFertility = {
            ...buff.added_fertility,
            icon_url: match ? match.icon_url : this._placeholder,
          };
        }

        // Hydrate comparative workforce replacements
        let hydratedReplacement: HydratedSpecialistWorkforceReplacement | null =
          null;
        if (buff.workforce_replacement) {
          const oldMatch =
            index[buff.workforce_replacement.old_workforce_guid.toString()];
          const newMatch =
            index[buff.workforce_replacement.new_workforce_guid.toString()];
          hydratedReplacement = {
            ...buff.workforce_replacement,
            old_workforce_icon_url: oldMatch
              ? oldMatch.icon_url
              : this._placeholder,
            new_workforce_icon_url: newMatch
              ? newMatch.icon_url
              : this._placeholder,
          };
        }

        return {
          guid: buff.guid,
          target_guids: buff.target_guids,
          attributes: hydratedAttributes,
          additional_workforces: hydratedWorkforces,
          added_fertility: hydratedFertility,
          workforce_replacement: hydratedReplacement,
          workforce_modifier_in_percent: buff.workforce_modifier_in_percent,
        };
      }),
    };

    return {
      ...spec,
      effect: hydratedEffect,
    };
  }
}
