import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FertilitySetRegionGroup,
  FertilitySetService,
  FertilitySetViewModel,
} from '../../../services/fertility-set.service';
import { TRANSLATIONS_EN } from '../../../models/translations_mapping';
import {
  PlaceholderIconRegistry,
  RegionIconRegistry,
} from '../../../models/icon_registry';
import { RegionValue } from '../../../models/enums';

@Component({
  selector: 'anno-fertility-sets-page',
  standalone: true,
  imports: [MatTableModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fertility-sets-page.component.html',
  styleUrl: './fertility-sets-page.component.scss',
})
export class FertilitySetsPageComponent implements OnInit {
  readonly service = inject(FertilitySetService);

  // Group the sets by their assigned regions
  readonly groupedSets = computed<FertilitySetRegionGroup[]>(() => {
    const sets = this.service.sets();
    const regionMap = new Map<string, FertilitySetViewModel[]>();

    // Sort sets into region buckets
    for (const set of sets) {
      // Fallback if a set has no regions explicitly defined
      const assignedRegions: (RegionValue | string)[] =
        set.rawRegions && set.rawRegions.length > 0
          ? set.rawRegions
          : ['Unknown'];

      for (const region of assignedRegions) {
        if (!regionMap.has(region)) {
          regionMap.set(region, []);
        }
        const regionItem = regionMap.get(region);
        if (regionItem) regionItem.push(set);
      }
    }

    // Convert map to view-friendly array, mapping dynamic slots per region
    return Array.from(regionMap.entries()).map(([regionKey, regionSets]) => {
      // Calculate max slots specific to this region to avoid empty trailing columns
      const maxSlots =
        regionSets.length > 0
          ? Math.max(...regionSets.map((s) => s.slots.length))
          : 0;
      const dynamicSlotColumns = Array.from({ length: maxSlots }, (_, i) => i);
      const displayedColumns = [
        'set_info',
        ...dynamicSlotColumns.map((idx) => `slot_${idx}`),
      ];

      // Fetch the icon data, falling back to an empty string or default icon if the region isn't registered
      const registryEntry = RegionIconRegistry[regionKey as RegionValue];
      const regionIcon = registryEntry?.icon || PlaceholderIconRegistry.GENERIC;

      // Prioritize the registry's narrative label (e.g., 'Latium'), then standard translation, then the raw key
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

  // Dynamically calculate the maximum number of slots among all sets to generate the table columns
  readonly dynamicSlotColumns = computed(() => {
    const sets = this.service.sets();
    if (!sets || sets.length === 0) return [];

    const maxSlots = Math.max(...sets.map((s) => s.slots.length));
    return Array.from({ length: maxSlots }, (_, i) => i);
  });

  // Calculate the total set of columns to display: base info + N slot columns
  readonly displayedColumns = computed(() => {
    const baseColumns = ['set_info'];
    const slotColumns = this.dynamicSlotColumns().map((idx) => `slot_${idx}`);
    return [...baseColumns, ...slotColumns];
  });

  ngOnInit() {
    this.service.fetchFertilitySets();
  }
}
