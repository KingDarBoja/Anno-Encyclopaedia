import { Component, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FertilitySetViewModel } from '../../../../services/fertility-set.service';

@Component({
  selector: 'anno-fertility-set-card',
  imports: [MatTooltipModule],
  host: { style: 'display: block; width: 100%; height: 100%;' },
  templateUrl: './fertility-set-card.component.html',
  styleUrl: './fertility-set-card.component.scss',
})
export class FertilitySetCardComponent {
  readonly set = input.required<FertilitySetViewModel>();
}