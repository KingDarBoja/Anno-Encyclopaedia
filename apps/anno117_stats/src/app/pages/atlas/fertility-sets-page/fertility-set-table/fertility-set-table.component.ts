import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import {  } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FertilitySetRegionGroup } from '../../../../services/fertility-set.service';

@Component({
  selector: 'anno-fertility-set-table',
  standalone: true,
  imports: [MatTableModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fertility-set-table.component.html',
  styleUrl: './fertility-set-table.component.scss',
})
export class FertilitySetTableComponent {
  readonly group = input.required<FertilitySetRegionGroup>();
}