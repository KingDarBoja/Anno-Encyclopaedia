import { Component, inject, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FertilitySetService } from '../../../services/fertility-set.service';

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

  // Dynamically calculate the maximum number of slots among all sets to generate the table columns
  readonly dynamicSlotColumns = computed(() => {
    const sets = this.service.sets();
    if (!sets || sets.length === 0) return [];
    
    const maxSlots = Math.max(...sets.map(s => s.slots.length));
    return Array.from({ length: maxSlots }, (_, i) => i);
  });

  // Calculate the total set of columns to display: base info + N slot columns
  readonly displayedColumns = computed(() => {
    const baseColumns = ['set_info'];
    const slotColumns = this.dynamicSlotColumns().map(idx => `slot_${idx}`);
    return [...baseColumns, ...slotColumns];
  });

  ngOnInit() {
    this.service.fetchFertilitySets();
  }
}