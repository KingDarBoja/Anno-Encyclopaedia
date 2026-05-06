import {
  Component,
  input,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  untracked,
} from '@angular/core';

export interface CardFooterItem {
  label: string;
  value: string | number;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'anno-generic-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="generic-card">
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

      <footer class="card-footer">
        @for (item of footerItems(); track item.label) {
          <div class="footer-col">
            <span class="label">{{ item.label }}</span>
            <span class="value">{{ item.value }}</span>
          </div>
        }
      </footer>
    </div>
  `,
  styleUrl: './generic-card.component.scss',
})
export class GenericCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly imageUrl = input.required<string>();
  readonly placeholderImage = input.required<string>();
  readonly footerItems = input<CardFooterItem[]>([]);

  // Internal signal to handle image swaps on error
  hasError = signal(false);

  // Derived image path based on the error state
  resolvedImage = computed(() => {
    return this.hasError() ? this.placeholderImage() : this.imageUrl();
  });

  constructor() {
    // Effect runs whenever imageUrl() changes
    effect(() => {
      this.imageUrl(); // Track the input

      // We wrap the write in untracked to prevent
      // the effect from re-triggering itself
      untracked(() => {
        this.hasError.set(false);
      });
    });
  }

  handleImgError() {
    if (!this.hasError()) {
      this.hasError.set(true);
    }
  }
}
