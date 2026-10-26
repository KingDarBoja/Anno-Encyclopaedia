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

    specialistsRequest.flush({ '1': { title: 'Test Specialist' } });
    assetIndexRequest.flush({});

    expect(service.specialists()).toHaveLength(1);
    expect(service.specialists()[0].title).toBe('Test Specialist');

    service.fetchSpecialists();
    httpTestingController.expectNone('assets/data/specialists_en.json');
    httpTestingController.expectNone('assets/data/specialist_asset_ref.json');
  });
});
