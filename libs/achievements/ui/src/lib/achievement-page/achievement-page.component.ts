import { Component, inject, computed, effect } from '@angular/core';
import { AchievementService } from '@anno/achievements-data';
import { AchievementCardComponent } from '../achievement-card/achievement-card.component';

@Component({
  selector: 'anno-achievement-page',
  standalone: true,
  imports: [AchievementCardComponent],
  templateUrl: './achievement-page.component.html',
  styleUrl: './achievement-page.component.scss',
})
export class AchievementPageComponent {
  private readonly achievementService = inject(AchievementService);

  achievementSets = this.achievementService.achievementSets;

  tocEntries = computed(() =>
    this.achievementSets().map((set) => ({
      slug: this.slugify(set.title),
      title: set.title,
    })),
  );

  slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  constructor() {
    effect(
      () => {
        this.achievementService.fetchAchievements();
      },
      { allowSignalWrites: true },
    );
  }
}
