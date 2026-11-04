import {
  Component,
  computed,
  inject,
  linkedSignal,
  model,
  OnInit,
} from '@angular/core';
import { SpecialistCardComponent } from './specialist-card/specialist-card.component';
import {
  SpecialistService,
  HydratedSpecialistViewModel,
} from '../../services/specialist.service';
import { NicheVisualization, RarityVisualization, ItemAllocation } from '../../models/enums';

const ATTRIBUTE_FILTERS = [
  { value: 'population', label: 'Population' },
  { value: 'money', label: 'Money & Maintenance' },
  { value: 'happiness', label: 'Happiness' },
  { value: 'health', label: 'Health' },
  { value: 'fire_safety', label: 'Fire Safety' },
  { value: 'belief', label: 'Belief' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'prestige', label: 'Prestige' },
] as const;

const UPGRADE_FILTERS = [
  { value: 'fertility', label: 'Fertility Seeders' },
  { value: 'workforce', label: 'Workforce Upgrades' },
  // { value: 'none', label: 'No Upgrade' },
] as const;

type AttributeFilterValue = (typeof ATTRIBUTE_FILTERS)[number]['value'];
type UpgradeFilterValue = (typeof UPGRADE_FILTERS)[number]['value'];

@Component({
  selector: 'anno-specialists-page',
  imports: [SpecialistCardComponent],
  templateUrl: './specialists.component.html',
  styleUrl: './specialists.component.scss',
})
export class SpecialistsPageComponent implements OnInit {
  readonly service = inject(SpecialistService);

  // Core filter parameters mapped to Angular signal models
  readonly searchQuery = model<string>('');
  readonly targetItemQuery = model<string>('');
  readonly selectedAllocation = model<string>('');
  readonly selectedRarity = model<string>('');
  readonly selectedAttribute = model<AttributeFilterValue | ''>('');
  readonly selectedNiche = model<string>('');
  readonly selectedUpgrade = model<UpgradeFilterValue | ''>('');

  // Static list of attribute categories mapping keys for filters
  readonly attributeFilters = ATTRIBUTE_FILTERS;

  /**
   * Mappings of niche, allocation & rarities according to game data.
   *
   * @TODO Support translation labels.
   */
  readonly nichesList = Object.values(NicheVisualization).filter(x => x === 'None' ? false : true);
  readonly raritiesList = Object.values(RarityVisualization);
  readonly allocationList = Object.values(ItemAllocation);

  // Specific modifier updates mapped to separate selector category
  readonly upgradeFilters = UPGRADE_FILTERS;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.fetchSpecialists();
  }

  // Dynamic filter matching logic mapped in computed signal for performance
  filteredSpecialists = computed<HydratedSpecialistViewModel[]>(() => {
    let list = this.service.hydratedSpecialists();
    const search = this.searchQuery().trim().toLowerCase();
    const itemSearch = this.targetItemQuery().trim().toLowerCase();
    const allocation = this.selectedAllocation();
    const rarity = this.selectedRarity();
    const niche = this.selectedNiche();
    const attribute = this.selectedAttribute();
    const upgrade = this.selectedUpgrade();

    // Text Search Filter evaluating both flat strings and localized structures
    if (search) {
      list = list.filter((s) => {
        return (s.title || '').toLowerCase().includes(search);
      });
    }

    // Target Item Text Search
    if (itemSearch) {
      list = list.filter((s) => {
        return s.effect.targets.some((tgt) =>
          tgt.affected_items.some((item) =>
            (item.name || '').toLowerCase().includes(itemSearch)
          )
        );
      });
    }

    if (allocation) {
      list = list.filter(
        (s) => s.allocation.toLowerCase() === allocation.toLowerCase(),
      );
    }

    if (rarity) {
      list = list.filter(
        (s) => s.rarity.toLowerCase() === rarity.toLowerCase(),
      );
    }

    if (niche) {
      list = list.filter((s) => s.niche.toLowerCase() === niche.toLowerCase());
    }

    if (attribute) {
      list = list.filter((s) => {
        return s.effect.buffs.some((buff) => {
          return buff.attributes.some((a) => {
            const key = a.key.toLowerCase();
            // Upkeep, trade prices, and maintenance are consolidated under money
            if (attribute === 'money') {
              return (
                key.includes('money') ||
                key.includes('maintenance_factor') ||
                key.includes('upkeep') ||
                key.includes('price')
              );
            }
            // All health upgrades and passive regeneration rates are consolidated under health
            if (attribute === 'health') {
              return key.includes('health') || key.includes('heal');
            }
            return key.includes(attribute.toLowerCase());
          });
        });
      });
    }

    if (upgrade) {
      list = list.filter((s) => {
        return s.effect.buffs.some((buff) => {
          switch (upgrade) {
            case 'fertility':
              return buff.added_fertility !== null;
            case 'workforce':
              return (
              buff.workforce_replacement !== null ||
              (buff.workforce_modifier_in_percent !== null &&
                buff.workforce_modifier_in_percent !== '0' &&
                buff.workforce_modifier_in_percent !== '0%') ||
              (buff.additional_workforces &&
                buff.additional_workforces.length > 0)
            );
            default:
              return false;
          }
        });
      });
    }

    return list;
  });

  readonly pageSize = 24;
  readonly pageIndex = linkedSignal({
    source: this.filteredSpecialists,
    computation: () => 0,
  });
  readonly pageCount = computed(() =>
    Math.ceil(this.filteredSpecialists().length / this.pageSize),
  );
  readonly visibleSpecialists = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredSpecialists().slice(start, start + this.pageSize);
  });

  resetFilters() {
    this.searchQuery.set('');
    this.targetItemQuery.set('');
    this.selectedAllocation.set('');
    this.selectedRarity.set('');
    this.selectedAttribute.set('');
    this.selectedNiche.set('');
    this.selectedUpgrade.set('');
  }
}
