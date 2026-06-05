import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';

import {
  FertilitySetRegionGroup,
  FertilitySetService,
  FertilitySetViewModel,
} from '../../../services/fertility-set.service';
import { FertilitySetTableComponent } from './fertility-set-table/fertility-set-table.component';
import { FertilitySetCardComponent } from './fertility-set-card/fertility-set-card.component';
import { RegionValue } from '../../../models/enums';
import { RegionIconRegistry } from '../../../models/icon_registry';
import { TRANSLATIONS_EN } from '../../../models/translations_mapping';

@Component({
  selector: 'anno-fertility-sets-page',
  standalone: true,
  imports: [FertilitySetTableComponent, FertilitySetCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fertility-sets-page.component.html',
  styleUrl: './fertility-sets-page.component.scss',
})
export class FertilitySetsPageComponent implements OnInit {
  readonly service = inject(FertilitySetService);

  readonly groupedSets = computed<FertilitySetRegionGroup[]>(() => {
    const sets = this.service.sets();
    const regionMap = new Map<string, FertilitySetViewModel[]>();

    for (const set of sets) {
      const assignedRegions: (RegionValue | string)[] =
        set.rawRegions && set.rawRegions.length > 0
          ? set.rawRegions
          : ['Unknown'];
      for (const region of assignedRegions) {
        if (!regionMap.has(region)) regionMap.set(region, []);
        regionMap.get(region)?.push(set);
      }
    }

    return Array.from(regionMap.entries()).map(([regionKey, regionSets]) => {
      const maxSlots =
        regionSets.length > 0
          ? Math.max(...regionSets.map((s) => s.slots.length))
          : 0;
      const dynamicSlotColumns = Array.from({ length: maxSlots }, (_, i) => i);
      const displayedColumns = [
        'set_info',
        ...dynamicSlotColumns.map((idx) => `slot_${idx}`),
      ];

      const registryEntry =
        RegionIconRegistry[regionKey as RegionValue];
      const regionIcon =
        registryEntry?.icon ||
        'assets/icons/base/icon_content/generic/icon_2d_generic_item_0.webp';
      const regionName =
        registryEntry?.label || TRANSLATIONS_EN.Region[regionKey] || regionKey;

      return {
        regionKey,
        regionName,
        regionIcon,
        sets: regionSets,
        dynamicSlotColumns,
        displayedColumns,
      };
    });
  });

  ngOnInit() {
    this.service.fetchFertilitySets();
  }
}
