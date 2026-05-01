import { JsonPipe } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { CityStatusService } from '@anno/city-status-data';

@Component({
  selector: 'anno-city-status-page',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './city-status-page.component.html',
  styleUrl: './city-status-page.component.scss',
})
export class CityStatusPageComponent {
  private readonly cityStatusService = inject(CityStatusService);

  levelSetsRoman = computed(
    () => this.cityStatusService.cityStatusSets().roman,
  );
  levelSetsCeltic = computed(
    () => this.cityStatusService.cityStatusSets().celtic,
  );

  tocEntries = computed(() =>
    this.levelSetsRoman().map((level) => ({
      slug: level.slug,
      title: level.name,
    })),
  );

  constructor() {
    effect(() => {
      this.cityStatusService.fetchCityStatuses();
    });
  }
}
