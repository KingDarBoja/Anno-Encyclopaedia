import { Component, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrnamentCardComponent } from '../../components/ornament-card/ornament-card.component';
import {
  OrnamentalBuildingService,
  OrnamentalBuildingViewModel,
} from '../../services/ornamental-building.service';

@Component({
  selector: 'anno-ornaments-page',
  standalone: true,
  imports: [CommonModule, OrnamentCardComponent],
  templateUrl: './ornaments.component.html',
})
export class OrnamentsPageComponent {
  public readonly ornamentalService = inject(OrnamentalBuildingService);

  buildings = this.ornamentalService.buildings;
  isLoading = this.ornamentalService.isLoading;

  constructor() {
    effect(() => {
      this.ornamentalService.fetchOrnaments();
    });
  }

  readonly groupedBuildings = computed(() => {
    const data = this.buildings();
    const groupsMap = new Map<string, OrnamentalBuildingViewModel[]>();

    // Shift operational anchor to grouping directly by asset origin
    data.forEach((building) => {
      const sourceGroup = building.origin;

      if (!groupsMap.has(sourceGroup)) {
        groupsMap.set(sourceGroup, []);
      }
      const sourceGroupItem = groupsMap.get(sourceGroup);
      if (sourceGroupItem) {
        sourceGroupItem.push(building);
      }
    });

    return Array.from(groupsMap.entries()).map(([originName, items]) => ({
      title: originName,
      slug: this.slugify(originName),
      items: items,
    }));
  });

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
