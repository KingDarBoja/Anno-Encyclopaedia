import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecialistCardComponent } from './specialist-card/specialist-card.component';
import {
  SpecialistService,
  HydratedSpecialistViewModel,
} from '../../services/specialist.service';

@Component({
  selector: 'anno-specialists-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SpecialistCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './specialists.component.html',
  styleUrl: './specialists.component.scss',
})
export class SpecialistsPageComponent implements OnInit {
  readonly service = inject(SpecialistService);

  // Core filter parameters mapped to Angular Signals
  selectedRarity = signal<string>('');
  selectedAttribute = signal<string>('');
  selectedNiche = signal<string>('');
  selectedUpgrade = signal<string>('');

  // Static list of attribute categories mapping keys for filters
  readonly attributeFilters = [
    { value: 'population', label: 'Population' },
    { value: 'money', label: 'Money & Maintenance' },
    { value: 'happiness', label: 'Happiness' },
    { value: 'health', label: 'Health' },
    { value: 'fire_safety', label: 'Fire Safety' },
    { value: 'belief', label: 'Belief' },
    { value: 'knowledge', label: 'Knowledge' },
    { value: 'prestige', label: 'Prestige' },
  ];

  // Designated category Niches mapping exactly to the game's dataset
  readonly nichesList = [
    'Finance',
    'Religion',
    'Research',
    'Culture',
    'Economy',
    'Agriculture',
    'Diplomacy',
    'Military',
    'Nautics',
  ];

  // Specific modifier updates mapped to separate selector category
  readonly upgradeFilters = [
    { value: 'fertility', label: 'Fertility Seeders' },
    { value: 'workforce', label: 'Workforce Upgrades' },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.fetchSpecialists();
  }

  // Unique lists computed dynamically for selector values
  raritiesList = computed<string[]>(() => {
    const list = this.service.hydratedSpecialists().map((s) => s.rarity);
    return Array.from(new Set(list)).sort();
  });

  // Dynamic filter matching logic mapped in computed signal for performance
  filteredSpecialists = computed<HydratedSpecialistViewModel[]>(() => {
    let list = this.service.hydratedSpecialists();
    const rarity = this.selectedRarity();
    const niche = this.selectedNiche();
    const attribute = this.selectedAttribute();
    const upgrade = this.selectedUpgrade();

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
          if (upgrade === 'fertility') {
            return buff.added_fertility !== null;
          }
          if (upgrade === 'workforce') {
            return (
              buff.workforce_replacement !== null ||
              (buff.workforce_modifier_in_percent !== null &&
                buff.workforce_modifier_in_percent !== '0' &&
                buff.workforce_modifier_in_percent !== '0%') ||
              (buff.additional_workforces &&
                buff.additional_workforces.length > 0)
            );
          }
          return false;
        });
      });
    }

    return list;
  });

  resetFilters() {
    this.selectedRarity.set('');
    this.selectedAttribute.set('');
    this.selectedNiche.set('');
    this.selectedUpgrade.set('');
  }
}
