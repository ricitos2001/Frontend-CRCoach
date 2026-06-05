import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportingSpinnerComponent } from './importing-spinner.component';

describe('ImportingSpinnerComponent', () => {
  let component: ImportingSpinnerComponent;
  let fixture: ComponentFixture<ImportingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportingSpinnerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
