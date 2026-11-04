import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SpecialistService } from './specialist.service';

describe('SpecialistService', () => {
  let service: SpecialistService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SpecialistService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('shares concurrent requests and caches successfully loaded specialists', () => {
    service.fetchSpecialists();
    service.fetchSpecialists();

    const specialistsRequest = httpTestingController.expectOne(
      'assets/data/specialists_en.json',
    );
    const assetIndexRequest = httpTestingController.expectOne(
      'assets/data/specialist_asset_ref.json',
    );
    const racerPresetRequest = httpTestingController.expectOne(
      'assets/data/racer_preset_en.json',
    );

    specialistsRequest.flush({
      '1': {
        title: 'Test Specialist',
        description: 'Test description',
        icon_url: 'icon.webp',
        rarity: 'Common',
        niche: 'Research',
        allocation: 'Villa',
        has_boost: false,
        boost_details: null,
        racer: '42',
        effect: {
          scope: 'Radius',
          category: 'Item',
          targets: [],
          buffs: [],
        },
      },
    });
    assetIndexRequest.flush({});
    racerPresetRequest.flush({
      '42': {
        guid: 42,
        name: 'Test Racer Preset',
        title: 'Test Racer Preset',
        min_additional_training_levels: 1,
        max_additional_training_levels: 3,
        additional_training_increase_chances: [25, 5, 1],
        attribute_overwrites: {
          speed: {
            min_initial_value: 1,
            max_initial_value: 2,
            min_added_potential: 1,
            max_added_potential: 2,
          },
        },
        is_hero_racer: false,
      },
    });

    expect(service.specialists()).toHaveLength(1);
    expect(service.specialists()[0].title).toBe('Test Specialist');
    expect(service.specialists()[0].racer_preset?.title).toBe(
      'Test Racer Preset',
    );

    service.fetchSpecialists();
    httpTestingController.expectNone('assets/data/specialists_en.json');
    httpTestingController.expectNone('assets/data/specialist_asset_ref.json');
    httpTestingController.expectNone('assets/data/racer_preset_en.json');
  });
});
