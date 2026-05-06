import { Component, inject, effect } from '@angular/core';
import { GenericCardComponent } from '../../components/generic-card/generic-card.component';
import { OrnamentalBuildingService } from '../../services/ornamental-building.service';

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
    // Automatically trigger fetch when component initializes[cite: 2]
    effect(() => {
      this.ornamentalService.fetchOrnaments();
    });
  }
}