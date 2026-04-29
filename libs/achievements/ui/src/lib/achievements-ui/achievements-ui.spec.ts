import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementsUi } from './achievements-ui';

describe('AchievementsUi', () => {
  let component: AchievementsUi;
  let fixture: ComponentFixture<AchievementsUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementsUi],
    }).compileComponents();

    fixture = TestBed.createComponent(AchievementsUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
