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

export enum Region {
  META = 'Meta',
  ROMAN = 'Roman',
  CELTIC = 'Celtic',
  EGYPTIAN = 'Egyptian',
}

export type RegionValue = `${Region}`;

export enum IslandType {
  NORMAL = 'Normal',
  STARTER = 'Starter',
  DECORATION = 'Decoration',
  THIRD_PARTY = 'ThirdParty',
  PIRATE_ISLAND = 'PirateIsland',
  CLIFF_ISLAND = 'CliffIsland',
  RESERVED_FOR_PLAYER = 'ReservedForPlayer',
  VOLCANIC_ISLAND = 'VolcanicIsland',
}

export enum IslandSize {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  XL = 'XL',
  CONTINENTAL = 'Continental',
}

export enum IslandGameType {
  SANDBOX_SINGLEPLAYER = 'SandboxSingleplayer',
  SANDBOX_MULTIPLAYER = 'SandboxMultilayer',
  CAMPAIGN_MODE = 'CampaignMode',
}

export enum IslandDifficulty {
  NORMAL = 'Normal',
  HARD = 'Hard',
}