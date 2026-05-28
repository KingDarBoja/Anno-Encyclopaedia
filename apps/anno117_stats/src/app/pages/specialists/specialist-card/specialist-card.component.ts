import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  HydratedAsset,
  HydratedSpecialistAddedFertility,
  HydratedSpecialistAttribute,
  HydratedSpecialistEffectTarget,
  HydratedSpecialistViewModel,
  HydratedSpecialistWorkforceReplacement,
} from '../../../services/specialist.service';

interface GroupedProductNeed {
  product: HydratedAsset;
  attributes: HydratedSpecialistAttribute[];
}

interface GroupedBuff {
  readonly guid: number;
  readonly generalAttributes: HydratedSpecialistAttribute[];
  readonly productNeedGroups: GroupedProductNeed[];
  readonly additionalWorkforces: HydratedAsset[];
  readonly addedFertility: HydratedSpecialistAddedFertility | null;
  readonly workforceReplacement: HydratedSpecialistWorkforceReplacement | null;
  readonly workforceModifierInPercent: string | null;
  /** Linked targets to this buff. */
  readonly targets: HydratedSpecialistEffectTarget[];
}

@Component({
  selector: 'anno-117-specialist-card',
  standalone: true,
  imports: [MatExpansionModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './specialist-card.component.html',
  styleUrls: ['./specialist-card.component.scss'],
})
export class SpecialistCardComponent {
  specialist = input.required<HydratedSpecialistViewModel>();

  readonly keyLabels: Record<string, string> = {
    health: 'Health',
    fire_safety: 'Fire Safety',
    maintenance_factor: 'Maintenance Cost',
    workforce_maintenance_factor: 'Workforce Required',
    productivity_upgrade: 'Productivity',
    buff_base_speed_upgrade: 'Navigation Speed',
    loading_speed_upgrade: 'Cargo Loading Speed',
  };

  /**
   * Computes a localized CSS class based on the specialist's rarity,
   * enabling premium Roman-themed gradients to display behind the avatar.
   */
  readonly rarityClass = computed<string>(() => {
    const rarity = this.specialist()?.rarity;
    return rarity ? `rarity-${rarity.toLowerCase()}` : 'rarity-common';
  });

  /**
   * Computed state to segment raw attributes dynamically based on associated product requirements
   */
  groupedBuffs = computed<GroupedBuff[]>(() => {
    const spec = this.specialist();
    const allTargets = spec.effect?.targets || [];
    const buffs = spec.effect?.buffs || [];

    if (!spec || !spec.effect) return [];

    return buffs.map((buff) => {
      const generalAttributes: HydratedSpecialistAttribute[] = [];
      const productGroupsMap = new Map<
        number,
        { product: HydratedAsset; attributes: HydratedSpecialistAttribute[] }
      >();

      buff.attributes.forEach((attr) => {
        if (!attr.product_needs || attr.product_needs.length === 0) {
          generalAttributes.push(attr);
        } else {
          attr.product_needs.forEach((prod) => {
            if (!productGroupsMap.has(prod.guid)) {
              productGroupsMap.set(prod.guid, {
                product: prod,
                attributes: [],
              });
            }
            const group = productGroupsMap.get(prod.guid);
            if (group && !group.attributes.includes(attr)) {
              group.attributes.push(attr);
            }
          });
        }
      });

      return {
        guid: buff.guid,
        generalAttributes,
        targets: allTargets.filter((t) => buff.target_guids.includes(t.guid)),
        productNeedGroups: Array.from(productGroupsMap.values()),
        additionalWorkforces: buff.additional_workforces || [],
        addedFertility: buff.added_fertility,
        workforceReplacement: buff.workforce_replacement,
        workforceModifierInPercent: buff.workforce_modifier_in_percent,
      };
    });
  });

  getLabel(key: string): string {
    return this.keyLabels[key] || key.replace(/_/g, ' ');
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    // Replace with a valid path to a fallback icon in your assets folder
    element.src = 'assets/icons/placeholder_asset.webp';
  }
}
