import { Component, inject, input } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { CityStatusService, CityStatusViewModel } from '@anno/city-status-data';

@Component({
  selector: 'anno-city-status-table',
  standalone: true,
  imports: [DecimalPipe, NgTemplateOutlet],
  templateUrl: './city-status-table.component.html',
  styleUrl: './city-status-table.component.scss',
})
export class CityStatusTableComponent {
  private readonly cityStatusService = inject(CityStatusService);

  /** The set of levels to display (either Roman or Celtic) */
  levels = input.required<CityStatusViewModel[]>();

  /** Helper to identify negative values for styling */
  isNegative(value: number): boolean {
    return value < 0;
  }

  //   handleImgError(event: ErrorEvent) {
  //     const imgElement = event.target as HTMLImageElement;
  //     imgElement.src = this.cityStatusService.placeholderImage;
  //   }

  /**
   * Safely returns an icon path.
   * If the data points to a known missing asset (like index 31),
   * it returns the placeholder immediately to avoid the 404.
   */
  getSafeIconPath(imageUrl: string | undefined): string {
    if (!imageUrl) return this.cityStatusService.placeholderImage;

    // Regex to find the icon number (e.g., '31' from '...status_31_0.webp')
    const match = imageUrl.match(/status_(\d+)_/);
    if (match) {
      const iconIndex = parseInt(match[1], 10);

      // ANNO 117 DATA CHECK:
      // If the index is 31 or any other known missing file, return placeholder
      if (iconIndex > 30) {
        return this.cityStatusService.placeholderImage;
      }
    }

    return imageUrl;
  }
}
