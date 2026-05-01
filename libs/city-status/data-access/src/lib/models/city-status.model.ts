export interface CityAttributeEffects {
  readonly belief: number;
  readonly knowledge: number;
  readonly prestige: number;
  readonly happiness: number;
  readonly fire_safety: number;
  readonly health: number;
}

/**
 * Raw city status item from JSON.
 */
interface CityStatusEntry {
  readonly uid: number;
  readonly name: string;
  readonly image_url: string;
  readonly required_population: number;
  readonly attribute_effects_roman: CityAttributeEffects;
  readonly attribute_effects_regional: CityAttributeEffects;
  readonly attribute_effects_mixed: CityAttributeEffects;
}

/**
 * Raw city status data from JSON.
 */
export interface CityStatusRawData {
  [uid: string]: CityStatusEntry;
}

export type CityAttributeEffectsViewModel = CityAttributeEffects;

export interface CityStatusViewModel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly image_url: string;
  readonly required_pop: number;
  readonly attributes: {
    roman: CityAttributeEffectsViewModel;
    regional: CityAttributeEffectsViewModel;
    mixed: CityAttributeEffectsViewModel;
  };
}
