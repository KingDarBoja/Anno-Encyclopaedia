import { Component, inject, effect, computed } from '@angular/core';
import { GenericCardComponent } from '../../components/generic-card/generic-card.component';
import {
  OrnamentalBuildingService,
  OrnamentalBuildingViewModel,
} from '../../services/ornamental-building.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'anno-ornaments-page',
  standalone: true,
  imports: [GenericCardComponent],
  templateUrl: './ornaments.component.html',
  styleUrl: './ornaments.component.scss',
})
export class OrnamentsPageComponent {
  // Inject the new service
  public readonly ornamentalService = inject(OrnamentalBuildingService);

  // Expose signals for template consumption
  buildings = this.ornamentalService.buildings;
  isLoading = this.ornamentalService.isLoading;

  constructor() {
    // Automatically trigger fetch when component initializes
    effect(() => {
      this.ornamentalService.fetchOrnaments();
    });
  }

  readonly groupedBuildings = computed(() => {
    const data = this.buildings();

    // Use a Map where the key is the GUID (string)
    const groupsMap = new Map<
      string,
      { title: string; subtitle: string; slug: string; items: OrnamentalBuildingViewModel[] }
    >();

    data.forEach((building) => {
      const id = building.groupId;

      if (!groupsMap.has(id)) {
        groupsMap.set(id, {
          title: building.groupName, // Store the display name once for the header.
          subtitle: building.groupDisplayName,
          slug: building.groupSlug, // Capture the slug.
          items: [],
        });
      }

      const group = groupsMap.get(id);
      if (group) {
        group.items.push(building);
      }
    });

    // Convert to an array for the template @for loop
    return Array.from(groupsMap.entries()).map(([guid, group]) => ({
      guid,
      title: group.title,
      subtitle: group.subtitle,
      slug: group.slug,
      items: group.items,
    }));
  });
}
