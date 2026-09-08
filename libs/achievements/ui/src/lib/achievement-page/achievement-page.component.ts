import { Component, inject, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { AchievementService } from '@anno/achievements-data';
import { AchievementCardComponent } from '../achievement-card/achievement-card.component';

@Component({
  selector: 'anno-achievement-page',
  standalone: true,
  imports: [AchievementCardComponent],
  templateUrl: './achievement-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './achievement-page.component.scss',
})
export class AchievementPageComponent {
  private readonly achievementService = inject(AchievementService);

  readonly achievementSets = this.achievementService.achievementSets;

  readonly tocEntries = computed(() =>
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
