import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiesPage } from './cookies.page';

describe('CookiesPage', () => {
  let component: CookiesPage;
  let fixture: ComponentFixture<CookiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CookiesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
