import {
  Component,
  input,
  signal,
  computed,
  ChangeDetectionStrategy,
  // inject,
  // OnInit,
} from '@angular/core';
import {
  DecimalPipe,
  KeyValuePipe,
  NgTemplateOutlet,
  // ViewportScroller,
} from '@angular/common';
// import { ActivatedRoute } from '@angular/router';

import {
  AffectedChainInfo,
  MilestoneJSON,
  PatronViewModel,
} from '../../../services/patron.service';

@Component({
  selector: 'anno-deity-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, KeyValuePipe, NgTemplateOutlet],
  templateUrl: './deity-card.component.html',
  styleUrl: './deity-card.component.scss',
})
export class DeityCardComponent {
  readonly keyIcons: Record<string, string> = {
    population:
      'assets/icons/base/icon_content/attributes/icon_population_0.webp',
    money: 'assets/icons/base/icon_content/attributes/icon_income_0.webp',
    happiness:
      'assets/icons/base/icon_content/attributes/icon_happiness_0.webp',
    health: 'assets/icons/base/icon_content/attributes/icon_health_0.webp',
    fire_safety:
      'assets/icons/base/icon_content/attributes/icon_fire_safety_0.webp',
    belief:
      'assets/icons/base/icon_content/attributes/icon_religion_belief_0.webp',
    knowledge:
      'assets/icons/base/icon_content/attributes/icon_techtree_knowledge_0.webp',
    prestige: 'assets/icons/base/icon_content/attributes/icon_prestige_0.webp',
  };

  patron = input.required<PatronViewModel>();

  activeTab = signal<'local' | 'global'>('local');
  selectedDevotion = signal<number>(2500);

  isLightMode = signal(false);

  // Computes the maximum milestone devotion assigned to simulated range inputs
  maxDevotion = computed(() => {
    const localEffect = this.patron().local_effects[0];
    if (!localEffect || !localEffect.milestones.length) return 300000;
    return localEffect.milestones[localEffect.milestones.length - 1].devotion;
  });

  // Determines current scaling percent dynamically matching simulated devotion
  activeLocalValue = computed(() => {
    const localEffect = this.patron().local_effects[0];
    if (!localEffect || !localEffect.milestones.length) return 0;

    const devotion = this.selectedDevotion();
    const milestones = localEffect.milestones;

    // Find closest lower or equal milestone
    let activeBonus = 0;
    for (const step of milestones) {
      if (devotion >= step.devotion) {
        activeBonus = step.buff_scaling;
      } else {
        break;
      }
    }
    return activeBonus;
  });

  activeSecondaryLocalValue = computed(() => {
    const secondaryEffect = this.patron().local_effects[1];
    if (!secondaryEffect || !secondaryEffect.milestones.length) return 0;

    const devotion = this.selectedDevotion();
    const milestones = secondaryEffect.milestones;

    // Find closest lower or equal milestone
    let activeBonus = 0;
    for (const step of milestones) {
      if (devotion >= step.devotion) {
        activeBonus = step.buff_scaling;
      } else {
        break;
      }
    }
    return activeBonus;
  });

  // Find the active or closest completed milestone index based on current devotion
  currentMilestoneIndex = computed(() => {
    const milestones = this.patron().local_effects[0]?.milestones || [];
    const devotion = this.selectedDevotion();
    let activeIdx = 0;

    for (let i = 0; i < milestones.length; i++) {
      if (devotion >= milestones[i].devotion) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  });

  // Fix: Progress line width now matches the physical node positions perfectly
  progressPercentage = computed(() => {
    const milestones = this.patron().local_effects[0]?.milestones || [];
    if (!milestones.length) return 0;
    return (this.currentMilestoneIndex() / (milestones.length - 1)) * 100;
  });

  hasChains(chains: Record<string, AffectedChainInfo>): boolean {
    return Object.keys(chains).length > 0;
  }

  selectMilestone(m: MilestoneJSON) {
    this.selectedDevotion.set(m.devotion);
  }

  // Handle snapping via discrete slider increments
  updateMilestoneByStep(event: Event) {
    const input = event.target as HTMLInputElement;
    const idx = Number(input.value);
    const milestones = this.patron().local_effects[0]?.milestones || [];

    if (milestones[idx]) {
      this.selectedDevotion.set(milestones[idx].devotion);
    }
  }

  updateSimulatedDevotion(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = Number(input.value);

    // Clamp values
    if (val > this.maxDevotion()) val = this.maxDevotion();
    if (val < 0) val = 0;

    this.selectedDevotion.set(val);
  }
}
