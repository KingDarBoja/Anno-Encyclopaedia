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
      slug: set.slug,
      title: set.categoryLabel,
    })),
  );

  constructor() {
    effect(() => {
      this.achievementService.fetchAchievements();
    });
  }
}
