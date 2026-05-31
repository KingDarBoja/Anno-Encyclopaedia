import {
  Component,
  input,
  inject,
  computed,
  effect,
  untracked,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResolvedPlacement } from '../../services/ornamental-building.service';
import {
  OrnamentDialogData,
  OrnamentPlacementsDialogComponent,
} from './dialogs/ornament-placements-dialog.component';

@Component({
  selector: 'anno-ornament-card',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block; width: 100%;',
  },
  template: `
    <div class="generic-card ornament-card">
      <header>
        <h3>{{ title() }}</h3>
      </header>

      <div class="card-body-row">
        <div class="card-image">
          <img
            [src]="resolvedImage()"
            (error)="handleImgError()"
            [alt]="title()"
          />
        </div>
        <div class="card-content">
          <p [innerHTML]="description()"></p>
        </div>
      </div>

      <footer class="card-footer main-stats">
        <div class="footer-col">
          <span class="label">Prestige</span>
          <span class="value">
            <span
              class="inline-block w-4 h-4 icon-brand"
              [style.mask-image]="
                'url(assets/icons/main/attributes/icon_prestige_0.webp)'
              "
              [style.-webkit-mask-image]="
                'url(assets/icons/main/attributes/icon_prestige_0.webp)'
              "
              role="img"
              [attr.aria-label]="'Prestige Icon'"
            ></span>
            {{ prestige() }}
          </span>
        </div>
        <div class="footer-col">
          <span class="label">Cost</span>
          <span class="value">
            <img
              class="w-4 h-4"
              src="assets/icons/main/attributes/icon_income_0.webp"
              alt="prestige icon"
            />
            {{ cost() > 0 ? (cost() | number) : 'Free' }}
          </span>
        </div>
      </footer>

      <footer class="card-footer sub-meta">
        <div class="origin-tag">
          <span class="label">Source:</span>
          <span class="origin-value">{{ origin() }}</span>
        </div>
        <button
          class="placement-btn"
          (click)="openDialog()"
          title="View Construction Menu Placements"
        >
          𐎎 Placements ({{ placements().length }})
        </button>
      </footer>
    </div>
  `,
  styleUrl: './ornament-card.component.scss',
})
export class OrnamentCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly imageUrl = input.required<string>();
  readonly placeholderImage = input.required<string>();
  readonly prestige = input.required<number>();
  readonly cost = input.required<number>();
  readonly origin = input.required<string>();
  readonly placements = input.required<ResolvedPlacement[]>();

  private readonly dialog = inject(MatDialog);
  hasError = signal(false);

  resolvedImage = computed(() =>
    this.hasError() ? this.placeholderImage() : this.imageUrl(),
  );

  constructor() {
    effect(() => {
      this.imageUrl();
      untracked(() => this.hasError.set(false));
    });
  }

  handleImgError() {
    if (!this.hasError()) this.hasError.set(true);
  }

  openDialog(): void {
    this.dialog.open<OrnamentPlacementsDialogComponent, OrnamentDialogData>(
      OrnamentPlacementsDialogComponent,
      {
        data: {
          title: this.title(),
          placements: this.placements(),
          placeholderImage: this.placeholderImage(),
        },
        // Optional: Custom configurations to hook into your Roman theme panels
        panelClass: 'roman-dialog-panel',
        backdropClass: 'roman-dialog-backdrop',
        autoFocus: 'first-tabbable',
      },
    );
  }
}
