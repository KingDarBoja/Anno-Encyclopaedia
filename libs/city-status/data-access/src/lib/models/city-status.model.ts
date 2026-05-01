export interface CityAttributeEffects {
  readonly Belief: number;
  readonly Knowledge: number;
  readonly Prestige: number;
  readonly Happiness: number;
  readonly FireSafety: number;
  readonly Health: number;
}

/**
 * Raw city status item from JSON.
 */
interface CityStatus {
  readonly UID: number;
  readonly Name: string;
  readonly Icon: string;
  readonly RequiredPopulation: number;
  readonly AttributeEffectsRoman: CityAttributeEffects;
  readonly AttributeEffectsRegional: CityAttributeEffects;
  readonly AttributeEffectsMixed: CityAttributeEffects;
}

/**
 * Raw city status data from JSON.
 */
export interface CityStatusRawData {
  [uid: string]: CityStatus;
}

export interface CityAttributeEffectsViewModel {
  readonly belief: number;
  readonly knowledge: number;
  readonly prestige: number;
  readonly happiness: number;
  readonly fire_safety: number;
  readonly health: number;
}

export interface CityStatusViewModel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  /** Comes from "Icon". Already formatted with the extension. */
  readonly image_url: string;
  readonly required_pop: number;
  readonly attributes: {
    roman: CityAttributeEffectsViewModel;
    regional: CityAttributeEffectsViewModel;
    mixed: CityAttributeEffectsViewModel;
  };
}
