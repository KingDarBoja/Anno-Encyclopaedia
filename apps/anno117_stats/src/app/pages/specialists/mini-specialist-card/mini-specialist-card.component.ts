import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { HydratedSpecialistViewModel } from '../../../services/specialist.service';

@Component({
  selector: 'anno-mini-specialist-card',
  standalone: true,
  imports: [],
  templateUrl: './mini-specialist-card.component.html',
  styleUrl: './mini-specialist-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniSpecialistCardComponent {
  readonly specialist = input.required<HydratedSpecialistViewModel>();

  // Accept the selected building's GUID to filter the buffs
  readonly targetGuid = input<number | undefined>();

  readonly keyLabels: Record<string, string> = {
    health: 'Health',
    fire_safety: 'Fire Safety',
    population: 'Population',
    money: 'Money',
    happiness: 'Happiness',
    belief: 'Belief',
    knowledge: 'Knowledge',
    prestige: 'Prestige',
    maintenance_factor: 'Maintenance Cost',
    workforce_maintenance_factor: 'Workforce Required',
    productivity_upgrade: 'Productivity',
    buff_base_speed_upgrade: 'Navigation Speed',
    loading_speed_upgrade: 'Cargo Loading Speed',
  };

  readonly keyIcons: Record<string, string> = {
    population: 'icon_population_0.webp',
    money: 'icon_income_0.webp',
    happiness: 'icon_happiness_0.webp',
    health: 'icon_health_0.webp',
    fire_safety: 'icon_fire_safety_0.webp',
    belief: 'icon_religion_belief_0.webp',
    knowledge: 'icon_techtree_knowledge_0.webp',
    prestige: 'icon_prestige_0.webp',
  };

  /**
   * Isolates the specific buffs that apply to the currently targeted building node.
   */
  readonly filteredBuffs = computed(() => {
    const spec = this.specialist();
    const guid = this.targetGuid();

    if (!spec.effect?.buffs) return [];
    if (!guid) return spec.effect.buffs; // Fallback if no target is provided

    // 1. Identify which effect targets map to the clicked node
    const matchingTargets = spec.effect.targets.filter((tgt) =>
      tgt.guid === guid || tgt.affected_items?.some((item) => item.guid === guid)
    );

    const matchingTargetGuids = matchingTargets.map((t) => t.guid);

    // 2. Return only the buffs assigned to those matched targets
    return spec.effect.buffs.filter((buff) =>
      buff.target_guids?.some((id) => matchingTargetGuids.includes(id))
    );
  });
  
  /**
   * Computes a localized CSS class based on the specialist's rarity,
   * enabling premium Roman-themed gradients to display behind the avatar.
   */
  readonly rarityClass = computed<string>(() => {
    const rarity = this.specialist()?.rarity;
    return rarity ? `rarity-${rarity.toLowerCase()}` : 'rarity-common';
  });

  socketMaskUrl = computed(() => {
    const allocation = this.specialist()?.allocation?.toLowerCase();
    const fileName =
      allocation === 'ship'
        ? 'item_ship_socket.webp'
        : 'item_villa_socket.webp';

    return `url(assets/icons/${fileName})`;
  });

  /**
   * Transforms raw backend keys into readable UI labels.
   */
  getLabel(key: string): string {
    return this.keyLabels[key] || key.replace(/_/g, ' ');
  }

  /**
   * Fallback for missing icon assets.
   */
  handleIconFallback(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/icons/placeholder-specialist.png';
  }
}
