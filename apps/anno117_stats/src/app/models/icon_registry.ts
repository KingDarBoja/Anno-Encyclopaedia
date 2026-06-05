import { RegionValue } from "./enums";

export const RegionIconRegistry: Record<RegionValue, { label: string; icon: string }> = {
  Roman: {
    label: 'Latium',
    icon: 'assets/icons/base/icon_content/generic/icon_2d_region_heartlands_0.webp',
  },
  Celtic: {
    label: 'Albion',
    icon: 'assets/icons/base/icon_content/generic/icon_2d_region_wetlands_0.webp',
  },
  Meta: {
    label: "",
    icon: ""
  },
  Egyptian: {
    label: "",
    icon: ""
  }
};

export const PlaceholderIconRegistry = {
  GENERIC: 'assets/icons/base/icon_content/generic/icon_2d_generic_item_0.webp',
} as const;