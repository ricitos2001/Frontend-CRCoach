import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeaknessesPage } from './weaknesses.page';

describe('WeaknessesPage', () => {
  let component: WeaknessesPage;
  let fixture: ComponentFixture<WeaknessesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeaknessesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(WeaknessesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
