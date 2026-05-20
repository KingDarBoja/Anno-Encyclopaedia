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
  // private route = inject(ActivatedRoute);
  // private scroller = inject(ViewportScroller);

  patron = input.required<PatronViewModel>();

  activeTab = signal<'local' | 'global'>('local');
  selectedDevotion = signal<number>(2500);

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

  // ngOnInit() {
  //   this.route.fragment.subscribe(fragment => {
  //     // Check if this card's ID matches the fragment
  //     if (fragment === `patron-${this.patron().uid}`) {
  //       setTimeout(() => {
  //         this.scroller.scrollToAnchor(fragment);
  //       }, 100); // Small delay to ensure DOM is rendered
  //     }
  //   });
  // }

  // Timeline bar filled calculated ratio representation
  progressPercentage = computed(() => {
    const dev = this.selectedDevotion();
    const maxDev = this.maxDevotion();
    return Math.min((dev / maxDev) * 100, 100);
  });

  hasChains(chains: Record<string, AffectedChainInfo>): boolean {
    return Object.keys(chains).length > 0;
  }

  selectMilestone(m: MilestoneJSON) {
    this.selectedDevotion.set(m.devotion);
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
