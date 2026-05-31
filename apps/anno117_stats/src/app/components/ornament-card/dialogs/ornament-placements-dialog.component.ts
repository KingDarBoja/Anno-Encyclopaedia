import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResolvedPlacement } from '../../../services/ornamental-building.service';

export interface OrnamentDialogData {
  title: string;
  placements: ResolvedPlacement[];
  placeholderImage: string;
}

@Component({
  selector: 'anno-ornament-placements-dialog',
  standalone: true,
  template: `
    <div
      class="dialog-container"
      role="dialog"
      [attr.aria-label]="data.title + ' Menu Placements'"
    >
      <header class="dialog-header">
        <h3>{{ data.title }} — Menu Placements</h3>
        <button
          class="close-btn"
          (click)="dialogRef.close()"
          aria-label="Close dialog"
        >
          ✕
        </button>
      </header>

      <div class="dialog-body">
        <p class="dialog-intro">
          This decorative asset appears across the following construction
          pathways:
        </p>
        <div class="placements-list">
          @for (p of data.placements; track p.subCategoryGuid) {
            <div class="placement-row">
              <div class="category-block">
                <img
                  [src]="p.topLevelIcon || data.placeholderImage"
                  class="menu-icon"
                  alt=""
                />
                <div class="meta">
                  <span class="type-label">Menu Category</span>
                  <strong class="name-val">{{ p.topLevelName }}</strong>
                </div>
              </div>
              <div class="hierarchy-arrow" aria-hidden="true">➔</div>
              <div class="category-block">
                <img
                  [src]="p.subCategoryIcon || data.placeholderImage"
                  class="menu-icon"
                  alt=""
                />
                <div class="meta">
                  <span class="type-label">Sub-Category Group</span>
                  <strong class="name-val">{{ p.subCategoryName }}</strong>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './ornament-placements-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrnamentPlacementsDialogComponent {
  // Inject the overlay utilities natively
  protected readonly dialogRef = inject(
    MatDialogRef<OrnamentPlacementsDialogComponent>,
  );
  protected readonly data = inject<OrnamentDialogData>(MAT_DIALOG_DATA);
}
