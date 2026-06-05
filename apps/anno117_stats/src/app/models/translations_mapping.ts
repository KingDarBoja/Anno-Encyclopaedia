import {
  Region,
  IslandType,
  IslandSize,
  IslandGameType,
  IslandDifficulty,
} from './enums';

export const TRANSLATIONS_EN = {
  Region: {
    [Region.META]: 'Meta',
    [Region.ROMAN]: 'Roman',
    [Region.CELTIC]: 'Celtic',
    [Region.EGYPTIAN]: 'Egyptian',
  } as Record<string, string>,

  IslandType: {
    [IslandType.NORMAL]: 'Normal',
    [IslandType.STARTER]: 'Starter',
    [IslandType.DECORATION]: 'Decoration',
    [IslandType.THIRD_PARTY]: 'Third Party',
    [IslandType.PIRATE_ISLAND]: 'Pirate Island',
    [IslandType.CLIFF_ISLAND]: 'Cliff Island',
    [IslandType.RESERVED_FOR_PLAYER]: 'Reserved For Player',
    [IslandType.VOLCANIC_ISLAND]: 'Volcanic Island',
  } as Record<string, string>,

  IslandSize: {
    [IslandSize.SMALL]: 'Small',
    [IslandSize.MEDIUM]: 'Medium',
    [IslandSize.LARGE]: 'Large',
    [IslandSize.XL]: 'XL',
    [IslandSize.CONTINENTAL]: 'Continental',
  } as Record<string, string>,

  IslandGameType: {
    [IslandGameType.SANDBOX_SINGLEPLAYER]: 'Sandbox Singleplayer',
    [IslandGameType.SANDBOX_MULTIPLAYER]: 'Sandbox Multiplayer',
    [IslandGameType.CAMPAIGN_MODE]: 'Campaign Mode',
  } as Record<string, string>,

  IslandDifficulty: {
    [IslandDifficulty.NORMAL]: 'Normal',
    [IslandDifficulty.HARD]: 'Hard',
  } as Record<string, string>,
};

/** Helper to translate string arrays */
export function translateArray(
  values: string[],
  dictionary: Record<string, string>,
): string {
  if (!values || values.length === 0) return 'Any';
  return values.map((val) => dictionary[val] || val).join(', ');
}
