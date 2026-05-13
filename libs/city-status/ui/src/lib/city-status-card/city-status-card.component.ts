import { DecimalPipe } from '@angular/common';
import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';

import {
  CityAttributeEffects,
  CityStatusService,
  CityStatusViewModel,
} from '@anno/city-status-data';

@Component({
  selector: 'anno-city-status-card',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './city-status-card.component.html',
  styleUrl: './city-status-card.component.scss',
})
export class CityStatusCardComponent {
  private readonly cityStatusService = inject(CityStatusService);

  readonly iconBase = 'assets/icons/main/attributes/';
  readonly data = input.required<CityStatusViewModel>();

  // Cast the array so 'key' matches the keys of CityAttributeEffects
  readonly attributes = [
    { key: 'belief', label: 'Belief', icon: 'icon_religion_belief_0.webp' },
    {
      key: 'knowledge',
      label: 'Knowledge',
      icon: 'icon_techtree_knowledge_0.webp',
    },
    { key: 'prestige', label: 'Prestige', icon: 'icon_prestige_0.webp' },
    { key: 'health', label: 'Health', icon: 'icon_health_0.webp' },
    {
      key: 'fire_safety',
      label: 'Fire Safety',
      icon: 'icon_fire_safety_0.webp',
    },
    { key: 'happiness', label: 'Happiness', icon: 'icon_happiness_0.webp' },
  ] as const satisfies {
    key: keyof CityAttributeEffects;
    label: string;
    icon: string;
  }[];

  readonly placeholderImage =
    'assets/icons/base/icon_content/city_status/icon_2d_city_status_01_0.webp';

  /** Prevents 404s for missing game assets */
  getSafeIconPath(imageUrl: string | undefined): string {
    if (!imageUrl) return this.cityStatusService.placeholderImage;

    // // Regex to find the icon number (e.g., '31' from '...status_31_0.webp')
    // const match = imageUrl.match(/status_(\d+)_/);
    // if (match) {
    //   const iconIndex = parseInt(match[1], 10);

    //   // ANNO 117 DATA CHECK:
    //   // If the index is 31 or any other known missing file, return placeholder
    //   if (iconIndex > 30) {
    //     return this.cityStatusService.placeholderImage;
    //   }
    // }

    return imageUrl;
  }

  /** Formats 0 values as a dash */
  formatValue(value: number): string {
    return value === 0 ? '—' : value.toString();
  }
}
